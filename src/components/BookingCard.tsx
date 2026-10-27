import React, { useState } from 'react';
import { Booking } from '../types/index.ts';
import { Calendar, Phone, DollarSign, AlertCircle, FileText, CheckCircle } from 'lucide-react';

interface BookingCardProps {
  booking: Booking;
  onCancelBooking?: (bookingId: string) => Promise<void>;
  onViewInvoice?: (booking: Booking) => void;
  showAdminControls?: boolean;
  onUpdateStatus?: (bookingId: string, status: { bookingStatus: string; paymentStatus: string }) => Promise<void>;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onCancelBooking,
  onViewInvoice,
  showAdminControls,
  onUpdateStatus
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const isBooked = booking.bookingStatus === 'Booked';
  const isCancelled = booking.bookingStatus === 'Cancelled';

  // Format date DD-MM-YYYY as displayed in the screenshot
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      if (y && m && d) return `${d}-${m}-${y}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleConfirmCancel = async () => {
    if (!onCancelBooking) return;
    setIsCancelling(true);
    try {
      await onCancelBooking(booking._id);
      setShowConfirmModal(false);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition">
        <div>
          {/* Header: Room Name and Status Badge */}
          <div className="flex items-center space-x-3 mb-4">
            <h3 className="text-xl font-medium text-gray-800 tracking-tight">
              {booking.roomType} Room
            </h3>
            {isCancelled ? (
              <span className="px-3 py-0.5 text-xs font-bold tracking-wider text-white bg-[#dc2626] rounded-md uppercase">
                CANCELLED
              </span>
            ) : isBooked ? (
              <span className="px-3 py-0.5 text-xs font-bold tracking-wider text-white bg-[#16a34a] rounded-md uppercase">
                BOOKED
              </span>
            ) : (
              <span className="px-3 py-0.5 text-xs font-bold tracking-wider text-white bg-amber-500 rounded-md uppercase">
                {booking.bookingStatus.toUpperCase()}
              </span>
            )}
          </div>

          {/* Details list matching screenshot 4 typography */}
          <div className="space-y-2 text-sm text-gray-700">
            <p className="font-mono text-xs text-gray-600">
              <span className="font-bold font-sans text-gray-800 text-sm">Booking ID: </span>
              {booking._id}
            </p>
            <p>
              <span className="font-bold text-gray-800">From: </span>
              {formatDate(booking.checkIn)} <span className="mx-2 text-gray-400">|</span> <span className="font-bold text-gray-800">To: </span>
              {formatDate(booking.checkOut)}
              <span className="text-xs text-gray-500 ml-2">({booking.numberOfNights} night{booking.numberOfNights > 1 ? 's' : ''})</span>
            </p>
            <p>
              <span className="font-bold text-gray-800">Total Amount: </span>
              <span className="text-gray-900 font-semibold">₹{booking.totalAmount}</span>
              <span className="text-xs text-gray-500 ml-2">({booking.paymentStatus})</span>
            </p>
            <p>
              <span className="font-bold text-gray-800">Customer Phone: </span>
              <span>{booking.userPhone}</span>
            </p>
            {showAdminControls && (
              <p className="text-xs text-gray-500 pt-1">
                <span className="font-semibold text-gray-700">Guest:</span> {booking.userName} ({booking.userEmail})
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
          {onViewInvoice && (
            <button
              onClick={() => onViewInvoice(booking)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              View Invoice
            </button>
          )}

          {isBooked && onCancelBooking && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full py-2 px-4 rounded-full border border-red-500 text-red-500 hover:bg-red-50 text-xs font-semibold uppercase tracking-wider transition text-center"
            >
              CANCEL BOOKING
            </button>
          )}

          {showAdminControls && onUpdateStatus && isCancelled && (
            <button
              onClick={() => onUpdateStatus(booking._id, { bookingStatus: 'Booked', paymentStatus: 'Paid' })}
              className="text-xs text-emerald-600 hover:underline font-medium"
            >
              Re-activate
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h4 className="text-lg font-bold text-gray-900">Cancel Reservation?</h4>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to cancel booking <strong className="font-mono text-gray-800">{booking._id}</strong>?
              This will release room <strong className="text-gray-800">#{booking.roomNumber}</strong> for other guests to reserve.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Reason for Cancellation (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Schedule change, emergency"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isCancelling}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 font-semibold"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
