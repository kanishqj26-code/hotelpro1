import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: 'admin' | 'customer';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoomDoc {
  _id: string;
  roomNumber: string;
  capacity: number;
  pricePerNight: number;
  images: string[];
  type: 'Delux' | 'Non-Delux';
  description: string;
  operationalStatus: 'available' | 'maintenance' | 'reserved';
  createdAt: string;
  updatedAt: string;
}

export interface BookingDoc {
  _id: string;
  bookingNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  roomId: string;
  roomNumber: string;
  roomType: 'Delux' | 'Non-Delux';
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guestCount: number;
  numberOfNights: number;
  pricePerNight: number;
  totalAmount: number;
  bookingStatus: 'Booked' | 'Cancelled' | 'Completed' | 'Pending';
  paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';
  paymentId?: string;
  paymentMethod?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDoc {
  _id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  provider: 'Razorpay (Test Mode)' | 'Stripe (Test Mode)' | 'Simulated Gateway';
  transactionId: string;
  paymentStatus: 'Success' | 'Failed' | 'Refunded';
  paymentMethod: string;
  paidAt: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: UserDoc[];
  rooms: RoomDoc[];
  bookings: BookingDoc[];
  payments: PaymentDoc[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'roomsforuse_db.json');

// Generate 24-character hex ID matching MongoDB ObjectId format (e.g. 68d230b8e24b51e6c5a22ad5)
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return (timestamp + random).slice(0, 24);
}

// In-memory cache synced with disk
let db: DatabaseSchema = {
  users: [],
  rooms: [],
  bookings: [],
  payments: []
};

// Seed rooms data with real high quality hotel photography
const SEED_ROOMS: Omit<RoomDoc, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    roomNumber: '101',
    capacity: 1,
    pricePerNight: 1200,
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
    ],
    type: 'Delux',
    description: 'luxury rooms with private balcony, premium bedding, smart TV, high-speed Wi-Fi, and panoramic views.',
    operationalStatus: 'available'
  },
  {
    roomNumber: '102',
    capacity: 2,
    pricePerNight: 1500,
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    type: 'Delux',
    description: 'luxury rooms featuring plush king-size bed, workstation, complimentary tea/coffee maker, and room service.',
    operationalStatus: 'available'
  },
  {
    roomNumber: '103',
    capacity: 2,
    pricePerNight: 1000,
    images: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    ],
    type: 'Non-Delux',
    description: 'Comfortable and affordable standard room with double bed, attached bathroom, air conditioning, and 24/7 hot water.',
    operationalStatus: 'available'
  },
  {
    roomNumber: '104',
    capacity: 5,
    pricePerNight: 2400,
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490359854-dfba19688d70?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    type: 'Delux',
    description: 'Spacious Family Executive Delux Suite accommodating up to 5 guests with separate living lounge, 2 washrooms, and luxury amenities.',
    operationalStatus: 'available'
  },
  {
    roomNumber: '105',
    capacity: 1,
    pricePerNight: 900,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
    ],
    type: 'Non-Delux',
    description: 'Compact, clean and budget-friendly single room ideal for solo travelers and business stopovers. High-speed Wi-Fi included.',
    operationalStatus: 'available'
  },
  {
    roomNumber: '106',
    capacity: 3,
    pricePerNight: 1800,
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    type: 'Delux',
    description: 'Deluxe Triple Bed Room equipped with 1 king & 1 single bed, mini-fridge, tea/coffee station, and rainfall shower.',
    operationalStatus: 'available'
  }
];

export function initDB(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(fileContent);
      db.users = db.users || [];
      db.rooms = db.rooms || [];
      db.bookings = db.bookings || [];
      db.payments = db.payments || [];
    } else {
      seedInitialData();
    }
  } catch (err) {
    console.error('Error initializing database, falling back to seed:', err);
    seedInitialData();
  }
}

function saveDB(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB to disk:', err);
  }
}

function seedInitialData(): void {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);
  const userPasswordHash = bcrypt.hashSync('customer123', salt);
  const now = new Date().toISOString();

  const users: UserDoc[] = [
    {
      _id: '68d224f1506b7d3f0b866aed',
      name: 'tousif',
      email: 'tousif@gmail.com',
      passwordHash: adminPasswordHash,
      phone: '9704927891',
      role: 'admin',
      isActive: true,
      createdAt: '2025-08-10T10:15:00.000Z',
      updatedAt: now
    },
    {
      _id: '68d2345d5686a24fada0994e',
      name: 'rohan',
      email: 'rohan3@gmail.com',
      passwordHash: userPasswordHash,
      phone: '9704927800',
      role: 'customer',
      isActive: true,
      createdAt: '2025-08-12T11:20:00.000Z',
      updatedAt: now
    },
    {
      _id: '68d2356a5686a24fada09960',
      name: 'sid',
      email: 'sid@gmail.com',
      passwordHash: userPasswordHash,
      phone: '9704927807',
      role: 'customer',
      isActive: true,
      createdAt: '2025-08-15T14:40:00.000Z',
      updatedAt: now
    },
    {
      _id: '68d235b05686a24fada09969',
      name: 'saisunny',
      email: 'sai@gmail.com',
      passwordHash: userPasswordHash,
      phone: '9704927807',
      role: 'customer',
      isActive: true,
      createdAt: '2025-08-16T09:30:00.000Z',
      updatedAt: now
    },
    {
      _id: '68d3818579255d604fe9724c',
      name: 'sun',
      email: 's@gmail.com',
      passwordHash: adminPasswordHash,
      phone: '9704927807',
      role: 'admin',
      isActive: true,
      createdAt: '2025-08-18T16:00:00.000Z',
      updatedAt: now
    }
  ];

  const roomIds = [
    '68d230b8e24b51e6c5a22ad5',
    '68d23257e24b51e6c5a22ad7',
    '68d248bce5da9b6fb84ba237',
    '68d381b179255d604fe97255',
    generateObjectId(),
    generateObjectId()
  ];

  const rooms: RoomDoc[] = SEED_ROOMS.map((r, i) => ({
    ...r,
    _id: roomIds[i] || generateObjectId(),
    createdAt: new Date(Date.now() - (10 - i) * 86400000).toISOString(),
    updatedAt: now
  }));

  const bookings: BookingDoc[] = [
    {
      _id: '68d259fb3cb3cc7831c89406',
      bookingNumber: 'RFU-2025-0901',
      userId: '68d2356a5686a24fada09960',
      userName: 'sid',
      userEmail: 'sid@gmail.com',
      userPhone: '9704927807',
      roomId: rooms[0]._id,
      roomNumber: '101',
      roomType: 'Delux',
      checkIn: '2025-09-23',
      checkOut: '2025-09-24',
      guestCount: 1,
      numberOfNights: 1,
      pricePerNight: 2400,
      totalAmount: 2400,
      bookingStatus: 'Cancelled',
      paymentStatus: 'Refunded',
      cancelledAt: '2025-09-20T10:00:00.000Z',
      cancellationReason: 'Change of schedule',
      createdAt: '2025-09-18T08:30:00.000Z',
      updatedAt: '2025-09-20T10:00:00.000Z'
    },
    {
      _id: '68d2609d3cb3cc7831c8943f',
      bookingNumber: 'RFU-2025-0902',
      userId: '68d2356a5686a24fada09960',
      userName: 'sid',
      userEmail: 'sid@gmail.com',
      userPhone: '9704927807',
      roomId: rooms[1]._id,
      roomNumber: '102',
      roomType: 'Delux',
      checkIn: '2025-09-23',
      checkOut: '2025-09-24',
      guestCount: 2,
      numberOfNights: 1,
      pricePerNight: 2400,
      totalAmount: 2400,
      bookingStatus: 'Booked',
      paymentStatus: 'Paid',
      paymentId: 'pay_test_9834198273',
      paymentMethod: 'UPI / NetBanking',
      createdAt: '2025-09-19T09:15:00.000Z',
      updatedAt: '2025-09-19T09:16:00.000Z'
    },
    {
      _id: '68d381e679255d604fe97265',
      bookingNumber: 'RFU-2025-0903',
      userId: '68d2345d5686a24fada0994e',
      userName: 'rohan',
      userEmail: 'rohan3@gmail.com',
      userPhone: '9704927800',
      roomId: rooms[3]._id,
      roomNumber: '104',
      roomType: 'Delux',
      checkIn: '2025-09-25',
      checkOut: '2025-09-27',
      guestCount: 3,
      numberOfNights: 2,
      pricePerNight: 1350,
      totalAmount: 2700,
      bookingStatus: 'Cancelled',
      paymentStatus: 'Refunded',
      cancelledAt: '2025-09-22T14:20:00.000Z',
      cancellationReason: 'Emergency trip cancelled',
      createdAt: '2025-09-20T11:00:00.000Z',
      updatedAt: '2025-09-22T14:20:00.000Z'
    }
  ];

  const payments: PaymentDoc[] = [
    {
      _id: generateObjectId(),
      bookingId: '68d2609d3cb3cc7831c8943f',
      userId: '68d2356a5686a24fada09960',
      amount: 2400,
      currency: 'INR',
      provider: 'Razorpay (Test Mode)',
      transactionId: 'pay_test_9834198273',
      paymentStatus: 'Success',
      paymentMethod: 'UPI',
      paidAt: '2025-09-19T09:16:00.000Z',
      createdAt: '2025-09-19T09:16:00.000Z'
    }
  ];

  db = { users, rooms, bookings, payments };
  saveDB();
}

export const Users = {
  find: (query?: Partial<UserDoc>) => {
    if (!query) return [...db.users];
    return db.users.filter(u => Object.entries(query).every(([k, v]) => (u as any)[k] === v));
  },
  findById: (id: string) => db.users.find(u => u._id === id) || null,
  findOne: (query: Partial<UserDoc>) => {
    return db.users.find(u => Object.entries(query).every(([k, v]) => (u as any)[k] === v)) || null;
  },
  create: (userData: Omit<UserDoc, '_id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newUser: UserDoc = {
      ...userData,
      _id: generateObjectId(),
      createdAt: now,
      updatedAt: now
    };
    db.users.push(newUser);
    saveDB();
    return newUser;
  },
  findByIdAndUpdate: (id: string, updates: Partial<UserDoc>) => {
    const idx = db.users.findIndex(u => u._id === id);
    if (idx === -1) return null;
    db.users[idx] = {
      ...db.users[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDB();
    return db.users[idx];
  },
  deleteOne: (id: string) => {
    const idx = db.users.findIndex(u => u._id === id);
    if (idx === -1) return false;
    db.users.splice(idx, 1);
    saveDB();
    return true;
  },
  countDocuments: () => db.users.length
};

export const Rooms = {
  find: (query?: Partial<RoomDoc>) => {
    if (!query) return [...db.rooms];
    return db.rooms.filter(r => Object.entries(query).every(([k, v]) => (r as any)[k] === v));
  },
  findById: (id: string) => db.rooms.find(r => r._id === id) || null,
  findOne: (query: Partial<RoomDoc>) => {
    return db.rooms.find(r => Object.entries(query).every(([k, v]) => (r as any)[k] === v)) || null;
  },
  create: (roomData: Omit<RoomDoc, '_id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRoom: RoomDoc = {
      ...roomData,
      _id: generateObjectId(),
      createdAt: now,
      updatedAt: now
    };
    db.rooms.push(newRoom);
    saveDB();
    return newRoom;
  },
  findByIdAndUpdate: (id: string, updates: Partial<RoomDoc>) => {
    const idx = db.rooms.findIndex(r => r._id === id);
    if (idx === -1) return null;
    db.rooms[idx] = {
      ...db.rooms[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDB();
    return db.rooms[idx];
  },
  deleteOne: (id: string) => {
    const idx = db.rooms.findIndex(r => r._id === id);
    if (idx === -1) return false;
    db.rooms.splice(idx, 1);
    saveDB();
    return true;
  },
  countDocuments: () => db.rooms.length
};

export const Bookings = {
  find: (query?: Partial<BookingDoc>) => {
    if (!query) return [...db.bookings];
    return db.bookings.filter(b => Object.entries(query).every(([k, v]) => (b as any)[k] === v));
  },
  findById: (id: string) => db.bookings.find(b => b._id === id) || null,
  findOne: (query: Partial<BookingDoc>) => {
    return db.bookings.find(b => Object.entries(query).every(([k, v]) => (b as any)[k] === v)) || null;
  },
  create: (bookingData: Omit<BookingDoc, '_id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newBooking: BookingDoc = {
      ...bookingData,
      _id: generateObjectId(),
      createdAt: now,
      updatedAt: now
    };
    db.bookings.push(newBooking);
    saveDB();
    return newBooking;
  },
  findByIdAndUpdate: (id: string, updates: Partial<BookingDoc>) => {
    const idx = db.bookings.findIndex(b => b._id === id);
    if (idx === -1) return null;
    db.bookings[idx] = {
      ...db.bookings[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDB();
    return db.bookings[idx];
  },
  deleteOne: (id: string) => {
    const idx = db.bookings.findIndex(b => b._id === id);
    if (idx === -1) return false;
    db.bookings.splice(idx, 1);
    saveDB();
    return true;
  },
  countDocuments: (query?: Partial<BookingDoc>) => {
    if (!query) return db.bookings.length;
    return db.bookings.filter(b => Object.entries(query).every(([k, v]) => (b as any)[k] === v)).length;
  }
};

export const Payments = {
  find: (query?: Partial<PaymentDoc>) => {
    if (!query) return [...db.payments];
    return db.payments.filter(p => Object.entries(query).every(([k, v]) => (p as any)[k] === v));
  },
  findById: (id: string) => db.payments.find(p => p._id === id) || null,
  create: (paymentData: Omit<PaymentDoc, '_id' | 'createdAt'>) => {
    const now = new Date().toISOString();
    const newPayment: PaymentDoc = {
      ...paymentData,
      _id: generateObjectId(),
      createdAt: now
    };
    db.payments.push(newPayment);
    saveDB();
    return newPayment;
  },
  countDocuments: () => db.payments.length
};
