import { Router } from 'express';
import { register, login, getMe, updateProfile } from './controllers/authController.ts';
import { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom } from './controllers/roomController.ts';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  checkAvailability
} from './controllers/bookingController.ts';
import {
  createPaymentOrder,
  verifyPayment,
  getMyPayments,
  getAllPayments
} from './controllers/paymentController.ts';
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  toggleUserStatus
} from './controllers/adminController.ts';
import { authMiddleware, adminOnly } from './middleware/auth.ts';

const router = Router();

// ==================== AUTH ROUTES ====================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authMiddleware, getMe);
router.put('/auth/profile', authMiddleware, updateProfile);

// ==================== ROOM ROUTES ====================
router.get('/rooms/availability', checkAvailability);
router.get('/rooms', getAllRooms);
router.get('/rooms/:id', getRoomById);
router.post('/rooms', authMiddleware, adminOnly, createRoom);
router.put('/rooms/:id', authMiddleware, adminOnly, updateRoom);
router.delete('/rooms/:id', authMiddleware, adminOnly, deleteRoom);

// ==================== BOOKING ROUTES ====================
router.post('/bookings', authMiddleware, createBooking);
router.get('/bookings/my', authMiddleware, getMyBookings);
router.get('/bookings/:id', authMiddleware, getBookingById);
router.patch('/bookings/:id/cancel', authMiddleware, cancelBooking);

// ==================== PAYMENT ROUTES ====================
router.post('/payments/create-order', authMiddleware, createPaymentOrder);
router.post('/payments/verify', authMiddleware, verifyPayment);
router.get('/payments/my', authMiddleware, getMyPayments);

// ==================== ADMIN ROUTES ====================
router.get('/admin/stats', authMiddleware, adminOnly, getAdminStats);
router.get('/admin/bookings', authMiddleware, adminOnly, getAllBookings);
router.patch('/admin/bookings/:id/status', authMiddleware, adminOnly, updateBookingStatus);
router.get('/admin/rooms', authMiddleware, adminOnly, getAllRooms);
router.get('/admin/users', authMiddleware, adminOnly, getAllUsers);
router.patch('/admin/users/:id/role', authMiddleware, adminOnly, updateUserRole);
router.patch('/admin/users/:id/status', authMiddleware, adminOnly, toggleUserStatus);
router.get('/admin/payments', authMiddleware, adminOnly, getAllPayments);

export default router;
