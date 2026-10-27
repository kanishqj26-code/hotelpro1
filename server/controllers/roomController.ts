import { Request, Response } from 'express';
import { Rooms, Bookings, RoomDoc } from '../db.ts';

// Helper: Check if two date ranges overlap [start1, end1) and [start2, end2)
export function datesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  return start1 < end2 && end1 > start2;
}

export function getAllRooms(req: Request, res: Response): void {
  try {
    const { checkIn, checkOut, capacity, type, minPrice, maxPrice, search } = req.query;

    let rooms = Rooms.find();

    // Filter by type
    if (type && type !== 'All') {
      rooms = rooms.filter(r => r.type.toLowerCase() === (type as string).toLowerCase());
    }

    // Filter by guest capacity
    if (capacity) {
      const capNum = parseInt(capacity as string, 10);
      if (!isNaN(capNum)) {
        rooms = rooms.filter(r => r.capacity >= capNum);
      }
    }

    // Filter by price range
    if (minPrice) {
      const min = parseFloat(minPrice as string);
      if (!isNaN(min)) rooms = rooms.filter(r => r.pricePerNight >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice as string);
      if (!isNaN(max)) rooms = rooms.filter(r => r.pricePerNight <= max);
    }

    // Search query in description or roomNumber
    if (search) {
      const term = (search as string).toLowerCase();
      rooms = rooms.filter(
        r => r.roomNumber.toLowerCase().includes(term) || r.description.toLowerCase().includes(term)
      );
    }

    // Check availability against dates if provided
    let roomsWithAvailability = rooms.map(room => {
      let isAvailable = room.operationalStatus === 'available';

      if (isAvailable && checkIn && checkOut) {
        const inDate = checkIn as string;
        const outDate = checkOut as string;

        // Find active (non-cancelled) bookings for this room that overlap
        const activeBookings = Bookings.find({ roomId: room._id }).filter(
          b => b.bookingStatus !== 'Cancelled'
        );

        const hasConflict = activeBookings.some(b =>
          datesOverlap(inDate, outDate, b.checkIn, b.checkOut)
        );

        if (hasConflict) {
          isAvailable = false;
        }
      }

      return {
        ...room,
        isAvailable
      };
    });

    res.status(200).json({
      success: true,
      count: roomsWithAvailability.length,
      rooms: roomsWithAvailability
    });
  } catch (err: any) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch rooms' });
  }
}

export function getRoomById(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const room = Rooms.findById(id);

    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    // Get active booked date intervals for interactive calendar
    const activeBookings = Bookings.find({ roomId: room._id })
      .filter(b => b.bookingStatus !== 'Cancelled')
      .map(b => ({
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        bookingId: b._id
      }));

    res.status(200).json({
      success: true,
      room,
      bookedRanges: activeBookings
    });
  } catch (err: any) {
    console.error('Error fetching room details:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch room details' });
  }
}

export function createRoom(req: Request, res: Response): void {
  try {
    const { roomNumber, capacity, pricePerNight, images, type, description } = req.body;

    if (!roomNumber || !capacity || !pricePerNight || !description) {
      res.status(400).json({ success: false, message: 'Room number, capacity, price, and description are required.' });
      return;
    }

    // Check unique room number
    const existing = Rooms.findOne({ roomNumber: String(roomNumber).trim() });
    if (existing) {
      res.status(409).json({ success: false, message: `Room number ${roomNumber} already exists.` });
      return;
    }

    // Format images list, ensuring at least one valid fallback photo
    let imageList: string[] = [];
    if (Array.isArray(images) && images.length > 0) {
      imageList = images.filter((url: string) => url && typeof url === 'string' && url.trim().length > 0);
    }
    if (imageList.length === 0) {
      imageList = [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
      ];
    }

    const newRoom = Rooms.create({
      roomNumber: String(roomNumber).trim(),
      capacity: Number(capacity),
      pricePerNight: Number(pricePerNight),
      images: imageList,
      type: type === 'Non-Delux' ? 'Non-Delux' : 'Delux',
      description: description.trim(),
      operationalStatus: 'available'
    });

    res.status(201).json({
      success: true,
      message: 'Room added successfully!',
      room: newRoom
    });
  } catch (err: any) {
    console.error('Error creating room:', err);
    res.status(500).json({ success: false, message: 'Failed to create room.' });
  }
}

export function updateRoom(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const { roomNumber, capacity, pricePerNight, images, type, description, operationalStatus } = req.body;

    const existing = Rooms.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Room not found.' });
      return;
    }

    if (roomNumber && roomNumber !== existing.roomNumber) {
      const duplicate = Rooms.findOne({ roomNumber: String(roomNumber).trim() });
      if (duplicate && duplicate._id !== id) {
        res.status(409).json({ success: false, message: `Room number ${roomNumber} is already taken.` });
        return;
      }
    }

    const updates: Partial<RoomDoc> = {};
    if (roomNumber) updates.roomNumber = String(roomNumber).trim();
    if (capacity !== undefined) updates.capacity = Number(capacity);
    if (pricePerNight !== undefined) updates.pricePerNight = Number(pricePerNight);
    if (images && Array.isArray(images)) updates.images = images.filter((img: string) => img && img.trim().length > 0);
    if (type) updates.type = type;
    if (description) updates.description = description.trim();
    if (operationalStatus) updates.operationalStatus = operationalStatus;

    const updated = Rooms.findByIdAndUpdate(id, updates);
    res.status(200).json({
      success: true,
      message: 'Room updated successfully!',
      room: updated
    });
  } catch (err: any) {
    console.error('Error updating room:', err);
    res.status(500).json({ success: false, message: 'Failed to update room.' });
  }
}

export function deleteRoom(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const room = Rooms.findById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found.' });
      return;
    }

    // Check if room has active bookings scheduled for future or currently booked
    const today = new Date().toISOString().slice(0, 10);
    const hasActiveBookings = Bookings.find({ roomId: id }).some(
      b => b.bookingStatus === 'Booked' && b.checkOut >= today
    );

    if (hasActiveBookings) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete room with active upcoming reservations. Please cancel or reassign bookings first.'
      });
      return;
    }

    Rooms.deleteOne(id);
    res.status(200).json({
      success: true,
      message: `Room ${room.roomNumber} deleted successfully.`
    });
  } catch (err: any) {
    console.error('Error deleting room:', err);
    res.status(500).json({ success: false, message: 'Failed to delete room.' });
  }
}
