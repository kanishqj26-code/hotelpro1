import { Response } from 'express';
import { Payments, Bookings, PaymentDoc, generateObjectId } from '../db.ts';
import { AuthRequest } from '../middleware/auth.ts';

// Create a simulated Razorpay / Stripe payment order
export function createPaymentOrder(req: AuthRequest, res: Response): void {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { bookingId, amount, provider = 'Razorpay (Test Mode)' } = req.body;

    if (!bookingId || !amount) {
      res.status(400).json({ success: false, message: 'Booking ID and amount are required.' });
      return;
    }

    const booking = Bookings.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    // Generate simulated order ID (Razorpay format: order_rcptid_xxx)
    const orderId = `order_test_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    res.status(200).json({
      success: true,
      order: {
        orderId,
        amount: booking.totalAmount,
        currency: 'INR',
        bookingId: booking._id,
        roomNumber: booking.roomNumber,
        provider,
        key: 'rzp_test_college_demo_key' // Clearly labeled demo key
      }
    });
  } catch (err: any) {
    console.error('Error creating payment order:', err);
    res.status(500).json({ success: false, message: 'Failed to create payment order.' });
  }
}

// Verify payment and update booking status
export function verifyPayment(req: AuthRequest, res: Response): void {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { bookingId, paymentMethod = 'UPI', transactionId } = req.body;

    const booking = Bookings.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    const txId = transactionId || `pay_test_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const paymentRecord = Payments.create({
      bookingId: booking._id,
      userId: req.user._id,
      amount: booking.totalAmount,
      currency: 'INR',
      provider: 'Razorpay (Test Mode)',
      transactionId: txId,
      paymentStatus: 'Success',
      paymentMethod,
      paidAt: now
    });

    const updatedBooking = Bookings.findByIdAndUpdate(booking._id, {
      bookingStatus: 'Booked',
      paymentStatus: 'Paid',
      paymentId: txId,
      paymentMethod
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed successfully!',
      payment: paymentRecord,
      booking: updatedBooking
    });
  } catch (err: any) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ success: false, message: 'Payment verification failed.' });
  }
}

// Get customer payments
export function getMyPayments(req: AuthRequest, res: Response): void {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const userPayments = Payments.find({ userId: req.user._id }).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.status(200).json({
      success: true,
      count: userPayments.length,
      payments: userPayments
    });
  } catch (err: any) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve payments.' });
  }
}

// Admin: Get all payment transactions
export function getAllPayments(req: AuthRequest, res: Response): void {
  try {
    const allPayments = Payments.find().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.status(200).json({
      success: true,
      count: allPayments.length,
      payments: allPayments
    });
  } catch (err: any) {
    console.error('Error fetching all payments:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve payments log.' });
  }
}
