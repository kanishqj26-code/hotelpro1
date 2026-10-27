import React, { useState } from 'react';
import { Booking, Room } from '../types/index.ts';
import { api } from '../services/api.ts';
import {
  CreditCard,
  QrCode,
  Building,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface PaymentPageProps {
  booking: Booking;
  room?: Room;
  onNavigate: (view: string, params?: any) => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({
  booking,
  room,
  onNavigate
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardHolder, setCardHolder] = useState(booking.userName || 'Sunil Kumar');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      // Simulate gateway authorization latency
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const methodLabel =
        paymentMethod === 'upi'
          ? `UPI (${upiId})`
          : paymentMethod === 'card'
          ? `Card (ending in ${cardNumber.slice(-4)})`
          : `NetBanking (${selectedBank})`;

      const res = await api.verifyPayment(booking._id, methodLabel);
      if (res.success && res.booking) {
        onNavigate('confirmation', { booking: res.booking, payment: res.payment });
      } else {
        throw new Error(res.message || 'Payment could not be verified');
      }
    } catch (err: any) {
      setError(err?.message || 'Payment simulation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => onNavigate('my-bookings')}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Cancel & Back</span>
        </button>

        {/* Demo Mode Notice */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-blue-900">
              Razorpay / Test Payment Gateway (Simulation Mode)
            </h4>
            <p className="mt-0.5 text-blue-700 leading-relaxed">
              This checkout operates in Indian College Project test mode. No actual money will be charged from your account or card. Pre-filled dummy values are provided for instant demonstration.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Payment Method Selector & Inputs (2 Cols) */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Select Payment Method</h3>
              <span className="text-xs text-gray-400 flex items-center">
                <Lock className="w-3.5 h-3.5 mr-1 text-emerald-600" /> 256-bit Encrypted
              </span>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`py-3 px-2 flex items-center justify-center space-x-1.5 transition ${
                  paymentMethod === 'upi' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-3 px-2 flex items-center justify-center space-x-1.5 transition ${
                  paymentMethod === 'card' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Debit / Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`py-3 px-2 flex items-center justify-center space-x-1.5 transition ${
                  paymentMethod === 'netbanking' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Net Banking</span>
              </button>
            </div>

            <form onSubmit={handlePay} className="p-6 space-y-4">
              {paymentMethod === 'upi' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-2">
                    <p className="font-semibold text-gray-700">Supported UPI Handles</p>
                    <div className="flex justify-center space-x-3 text-[11px] font-bold text-gray-600">
                      <span className="bg-white px-2 py-1 rounded shadow-2xs">Google Pay</span>
                      <span className="bg-white px-2 py-1 rounded shadow-2xs">PhonePe</span>
                      <span className="bg-white px-2 py-1 rounded shadow-2xs">Paytm</span>
                      <span className="bg-white px-2 py-1 rounded shadow-2xs">BHIM</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Enter Virtual Payment Address (VPA / UPI ID)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      required
                      placeholder="e.g. mobile@upi or username@okaxis"
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Card Number (Test Mode)
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2 font-mono text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      required
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        required
                        className="w-full text-sm border border-gray-300 rounded px-3 py-2 font-mono text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        required
                        className="w-full text-sm border border-gray-300 rounded px-3 py-2 font-mono text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="space-y-3 text-xs">
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Select Indian Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-wider rounded-lg transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>{isProcessing ? 'Verifying Test Payment...' : `Confirm & Pay ₹${booking.totalAmount}`}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Summary Card (1 Col) */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 space-y-4 text-xs">
            <h4 className="font-bold text-gray-900 text-sm">Order Summary</h4>

            <div className="space-y-2 border-y border-gray-100 py-3 text-gray-600">
              <div className="flex justify-between">
                <span>Room</span>
                <span className="font-semibold text-gray-900">#{booking.roomNumber} ({booking.roomType})</span>
              </div>
              <div className="flex justify-between">
                <span>Check-In</span>
                <span className="font-semibold text-gray-900">{booking.checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-Out</span>
                <span className="font-semibold text-gray-900">{booking.checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span>Nights</span>
                <span className="font-semibold text-gray-900">{booking.numberOfNights}</span>
              </div>
              <div className="flex justify-between">
                <span>Guests</span>
                <span className="font-semibold text-gray-900">{booking.guestCount} Person(s)</span>
              </div>
            </div>

            <div className="flex justify-between text-base font-bold text-gray-900">
              <span>Amount Due:</span>
              <span className="text-blue-700">₹{booking.totalAmount}</span>
            </div>

            <div className="text-[11px] text-gray-400 text-center pt-2">
              Booking Ref: <span className="font-mono text-gray-600">{booking._id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
