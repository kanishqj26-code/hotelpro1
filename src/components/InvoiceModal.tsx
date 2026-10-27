import React from 'react';
import { Booking } from '../types/index.ts';
import { Hotel, Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';

interface InvoiceModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ booking, onClose }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-gray-700 font-semibold text-sm">
            <Hotel className="w-5 h-5 text-blue-600" />
            <span>Official Hotel Invoice & Receipt</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Print Invoice
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6 print:p-0">
          <div className="flex justify-between items-start border-b border-gray-200 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">RoomsForUse</h2>
              <p className="text-xs text-gray-500 mt-1">Hospitality Grand Hotel & Suites</p>
              <p className="text-xs text-gray-500">MG Road, Hospitality Hub, India</p>
              <p className="text-xs text-gray-500">GSTIN: 36AAECR1234F1Z8</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                TAX INVOICE
              </span>
              <p className="font-mono text-xs text-gray-600 mt-2">
                <strong>Invoice #:</strong> INV-{booking.bookingNumber || booking._id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-gray-500">
                <strong>Date:</strong> {new Date(booking.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg text-xs">
            <div>
              <p className="text-gray-500 font-semibold uppercase mb-1">Billed To (Guest):</p>
              <p className="font-bold text-gray-900 text-sm">{booking.userName}</p>
              <p className="text-gray-600">{booking.userEmail}</p>
              <p className="text-gray-600">Phone: {booking.userPhone}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold uppercase mb-1">Reservation Info:</p>
              <p className="text-gray-700"><strong>Booking ID:</strong> <span className="font-mono">{booking._id}</span></p>
              <p className="text-gray-700"><strong>Stay:</strong> {booking.checkIn} to {booking.checkOut}</p>
              <p className="text-gray-700"><strong>Guests:</strong> {booking.guestCount} person(s)</p>
              <p className="text-gray-700">
                <strong>Status:</strong>{' '}
                <span className={`font-semibold ${booking.bookingStatus === 'Booked' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {booking.bookingStatus}
                </span>
              </p>
            </div>
          </div>

          <table className="w-full text-left text-xs border border-gray-200">
            <thead className="bg-gray-100 text-gray-700 font-semibold uppercase">
              <tr>
                <th className="p-3">Description</th>
                <th className="p-3 text-center">Nights</th>
                <th className="p-3 text-right">Rate / Night</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="p-3">
                  <div className="font-bold text-gray-900">Room {booking.roomNumber} ({booking.roomType})</div>
                  <div className="text-gray-500">Includes complimentary Wi-Fi and amenities</div>
                </td>
                <td className="p-3 text-center font-medium">{booking.numberOfNights}</td>
                <td className="p-3 text-right">₹{booking.pricePerNight}</td>
                <td className="p-3 text-right font-semibold">₹{booking.numberOfNights * booking.pricePerNight}</td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="p-3 text-gray-500">Taxes & Hospitality Surcharge (Included)</td>
                <td className="p-3 text-center">-</td>
                <td className="p-3 text-right">₹0</td>
                <td className="p-3 text-right">₹0</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 font-bold text-sm bg-gray-50">
                <td colSpan={3} className="p-3 text-right">Total Paid (INR):</td>
                <td className="p-3 text-right text-blue-700">₹{booking.totalAmount}</td>
              </tr>
            </tfoot>
          </table>

          <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-xs text-gray-500">
            <div className="flex items-center space-x-2 text-emerald-700">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-bold">Payment Verified</p>
                <p className="text-[11px] text-gray-500">
                  Transaction: {booking.paymentId || 'pay_verified_razorpay_gateway'} ({booking.paymentMethod || 'Online'})
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400">Authorized Signatory</p>
              <p className="font-serif italic font-bold text-gray-700">RoomsForUse Desk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
