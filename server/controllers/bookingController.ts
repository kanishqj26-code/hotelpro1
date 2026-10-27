import { Response } from 'express';
import { Bookings, Rooms, BookingDoc, generateObjectId } from '../db.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { datesOverlap } from './roomController.ts';

export function calculateNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Check availability for specific room and dates
export function checkAvailability(req: AuthRequest, res: Response): void {
  try {
    const { roomId, checkIn, checkOut } = req.query;

    if (!roomId || !checkIn || !checkOut) {
      res.status(400).json({ success: false, message: 'Room ID, check-in, and check-out dates are required.' });
      return;
    }

    const room = Rooms.findById(roomId as string);
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found.' });
      return;
    }

    const inDate = checkIn as string;
    const outDate = checkOut as string;

    if (inDate >= outDate) {
      res.status(400).json({ success: false, message: 'Check-out date must be later than check-in date.' });
      return;
    }

    const activeBookings = Bookings.find({ roomId: room._id }).filter(
      b => b.bookingStatus !== 'Cancelled'
    );

    const isAvailable = !activeBookings.some(b =>
      datesOverlap(inDate, outDate, b.checkIn, b.checkOut)
    );

    const nights = calculateNights(inDate, outDate);
    const estimatedTotal = nights * room.pricePerNight;

    res.status(200).json({
      success: true,
      isAvailable,
      numberOfNights: nights,
      pricePerNight: room.pricePerNight,
      totalAmount: estimatedTotal,
      roomNumber: room.roomNumber,
      roomType: room.type
    });
  } catch (err: any) {
    console.error('Error checking availability:', err);
    res.status(500).json({ success: false, message: 'Failed to verify availability.' });
  }
}

// Create a new booking
export function createBooking(req: AuthRequest, res: Response): void {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required to book a room.' });
      return;
    }

    const { roomId, checkIn, checkOut, guestCount, userPhone } = req.body;

    if (!roomId || !checkIn || !checkOut || !guestCount) {
      res.status(400).json({ success: false, message: 'All booking fields are required.' });
      return;
    }

    const room = Rooms.findById(roomId);
    if (!room) {
      res.status(404).json({ success: false, message: 'Selected room was not found.' });
      return;
    }

    if (room.operationalStatus !== 'available') {
      res.status(400).json({ success: false, message: 'Room is currently under maintenance or unavailable.' });
      return;
    }

    const inDate = String(checkIn);
    const outDate = String(checkOut);

    if (inDate >= outDate) {
      res.status(400).json({ success: false, message: 'Check-out date must be at least one day after check-in.' });
      return;
    }

    const guests = Number(guestCount);
    if (isNaN(guests) || guests < 1) {
      res.status(400).json({ success: false, message: 'Guest count must be at least 1 person.' });
      return;
    }

    if (guests > room.capacity) {
      res.status(400).json({
        success: false,
        message: `This room accommodates up to ${room.capacity} guest(s). You selected ${guests} guests.`
      });
      return;
    }

    // Authoritative overlap check
    const activeBookings = Bookings.find({ roomId: room._id }).filter(
      b => b.bookingStatus !== 'Cancelled'
    );

    const hasConflict = activeBookings.some(b =>
      datesOverlap(inDate, outDate, b.checkIn, b.checkOut)
    );

    if (hasConflict) {
      res.status(409).json({
        success: false,
        message: 'Sorry, this room is already reserved for the selected dates. Please choose different dates or another room.'
      });
      return;
    }

    const nights = calculateNights(inDate, outDate);
    const totalAmount = nights * room.pricePerNight;
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `RFU-${year}-${randomSeq}`;

    const newBooking = Bookings.create({
      bookingNumber,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      userPhone: userPhone || req.user.phone || '9704927807',
      roomId: room._id,
      roomNumber: room.roomNumber,
      roomType: room.type,
      checkIn: inDate,
      checkOut: outDate,
      guestCount: guests,
      numberOfNights: nights,
      pricePerNight: room.pricePerNight,
      totalAmount,
      bookingStatus: 'Booked', // Ready with instant confirmation upon payment
      paymentStatus: 'Paid'
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully!',
      booking: newBooking
    });
  } catch (err: any) {
    console.error('Error creating booking:', err);
    res.status(500).json({ success: false, message: 'Server error while creating booking.' });
  }
}

// Get customer's own bookings
export function getMyBookings(req: AuthRequest, res: Response): void {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    // Query bookings by user ID, sorted by most recent
    const bookings = Bookings.find({ userId: req.user._id }).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err: any) {
    console.error('Error fetching my bookings:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve bookings.' });
  }
}

// Get booking by ID (customer or admin)
export function getBookingById(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    const booking = Bookings.findById(id);

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    // Customer can only view their own booking
    if (req.user?.role !== 'admin' && booking.userId !== req.user?._id) {
      res.status(403).json({ success: false, message: 'Unauthorized to view this booking.' });
      return;
    }

    const room = Rooms.findById(booking.roomId);

    res.status(200).json({
      success: true,
      booking,
      room
    });
  } catch (err: any) {
    console.error('Error fetching booking:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve booking.' });
  }
}

// Cancel booking
export function cancelBooking(req: AuthRequest, res: Response): void {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const { reason } = req.body;
    const booking = Bookings.findById(id);

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    // Permission check
    if (req.user.role !== 'admin' && booking.userId !== req.user._id) {
      res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking.' });
      return;
    }

    if (booking.bookingStatus === 'Cancelled') {
      res.status(400).json({ success: false, message: 'This booking is already cancelled.' });
      return;
    }

    if (booking.bookingStatus === 'Completed') {
      res.status(400).json({ success: false, message: 'Completed past stays cannot be cancelled.' });
      return;
    }

    const updatedBooking = Bookings.findByIdAndUpdate(id, {
      bookingStatus: 'Cancelled',
      paymentStatus: 'Refunded',
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason || 'Customer requested cancellation'
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. The room is now available for those dates.',
      booking: updatedBooking
    });
  } catch (err: any) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ success: false, message: 'Failed to cancel booking.' });
  }
}

// Admin: Get all bookings
export function getAllBookings(req: AuthRequest, res: Response): void {
  try {
    const { status, search } = req.query;
    let bookings = Bookings.find();

    if (status && status !== 'All') {
      bookings = bookings.filter(b => b.bookingStatus.toLowerCase() === (status as string).toLowerCase());
    }

    if (search) {
      const q = (search as string).toLowerCase();
      bookings = bookings.filter(
        b =>
          b._id.toLowerCase().includes(q) ||
          b.userName.toLowerCase().includes(q) ||
          b.userEmail.toLowerCase().includes(q) ||
          b.roomNumber.toLowerCase().includes(q) ||
          b.userPhone.toLowerCase().includes(q)
      );
    }

    bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err: any) {
    console.error('Error fetching all bookings:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve bookings list.' });
  }
}

// Admin: Update booking status
export function updateBookingStatus(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    const { bookingStatus, paymentStatus } = req.body;

    const booking = Bookings.findById(id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    const updates: Partial<BookingDoc> = {};
    if (bookingStatus) updates.bookingStatus = bookingStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const updated = Bookings.findByIdAndUpdate(id, updates);
    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      booking: updated
    });
  } catch (err: any) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ success: false, message: 'Failed to update booking.' });
  }
}
