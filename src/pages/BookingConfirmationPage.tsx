import React, { useState } from 'react';
import { Booking, Payment } from '../types/index.ts';
import { InvoiceModal } from '../components/InvoiceModal.tsx';
import { CheckCircle, Calendar, FileText, ArrowRight, ShieldCheck, Download, Home } from 'lucide-react';

interface BookingConfirmationPageProps {
  booking: Booking;
  payment?: Payment;
  onNavigate: (view: string) => void;
}

export const BookingConfirmationPage: React.FC<BookingConfirmationPageProps> = ({
  booking,
  payment,
  onNavigate
}) => {
  const [showInvoice, setShowInvoice] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Reservation Confirmed & Paid
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-3">
              Thank You, {booking.userName}!
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Your room reservation has been successfully confirmed. A receipt and confirmation details have been recorded.
            </p>
          </div>

          {/* Quick Summary Box */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-left space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <span className="text-gray-400 uppercase text-[10px] font-semibold">Booking ID</span>
                <p className="font-mono font-bold text-gray-900 text-sm">{booking._id}</p>
              </div>
              <div className="text-right">
                <span className="text-gray-400 uppercase text-[10px] font-semibold">Total Paid</span>
                <p className="font-bold text-blue-700 text-sm">₹{booking.totalAmount}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <div>
                <span className="text-gray-400 block">Room Allocated:</span>
                <span className="font-semibold text-gray-900">Room #{booking.roomNumber} ({booking.roomType})</span>
              </div>
              <div>
                <span className="text-gray-400 block">Guests:</span>
                <span className="font-semibold text-gray-900">{booking.guestCount} Person(s)</span>
              </div>
              <div>
                <span className="text-gray-400 block">Check-In:</span>
                <span className="font-semibold text-gray-900">{booking.checkIn} (12:00 PM)</span>
              </div>
              <div>
                <span className="text-gray-400 block">Check-Out:</span>
                <span className="font-semibold text-gray-900">{booking.checkOut} (11:00 AM)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => setShowInvoice(true)}
              className="flex-1 py-2.5 px-4 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition"
            >
              <FileText className="w-4 h-4" />
              <span>View & Print Invoice</span>
            </button>
            <button
              onClick={() => onNavigate('my-bookings')}
              className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition shadow-xs"
            >
              <span>View My Bookings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => onNavigate('rooms')}
            className="text-xs text-gray-500 hover:text-gray-800 transition inline-flex items-center"
          >
            <Home className="w-3.5 h-3.5 mr-1" />
            <span>Return to Rooms Catalogue</span>
          </button>
        </div>
      </div>

      {showInvoice && (
        <InvoiceModal
          booking={booking}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
};
