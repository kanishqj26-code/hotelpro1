export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  isActive: boolean;
  createdAt: string;
}

export interface Room {
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
  isAvailable?: boolean;
}

export interface Booking {
  _id: string;
  bookingNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  roomId: string;
  roomNumber: string;
  roomType: 'Delux' | 'Non-Delux';
  checkIn: string;
  checkOut: string;
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

export interface Payment {
  _id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  provider: string;
  transactionId: string;
  paymentStatus: 'Success' | 'Failed' | 'Refunded';
  paymentMethod: string;
  paidAt: string;
  createdAt: string;
}

export interface AdminStats {
  totalRooms: number;
  totalUsers: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  deluxCount: number;
  nonDeluxCount: number;
  monthlyRevenue: { month: string; revenue: number; bookings: number }[];
}
