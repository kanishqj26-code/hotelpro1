import React, { useState } from 'react';
import { Room } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { ArrowLeft, ShieldCheck, AlertCircle, CreditCard, Calendar, Users, Hotel } from 'lucide-react';

interface BookRoomPageProps {
  room: Room;
  onNavigate: (view: string, params?: any) => void;
  bookingParams?: { checkIn?: string; checkOut?: string; guests?: number };
}

export const BookRoomPage: React.FC<BookRoomPageProps> = ({
  room,
  onNavigate,
  bookingParams
}) => {
  const { user, isAuthenticated } = useAuth();

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [checkIn, setCheckIn] = useState(bookingParams?.checkIn || today);
  const [checkOut, setCheckOut] = useState(bookingParams?.checkOut || tomorrow);
  const [guestCount, setGuestCount] = useState(bookingParams?.guests || 1);
  const [guestPhone, setGuestPhone] = useState(user?.phone || '9704927807');
  const [specialRequests, setSpecialRequests] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nights calculation
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
  const totalAmount = nights * room.pricePerNight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }

    if (checkIn >= checkOut) {
      setError('Check-out date must be later than check-in date.');
      return;
    }

    if (guestCount > room.capacity) {
      setError(`Room capacity is ${room.capacity} guest(s). Please reduce guest count.`);
      return;
    }

    setIsSubmitting(true);
    try {
      // First verify availability on backend
      const checkRes = await api.checkAvailability(room._id, checkIn, checkOut);
      if (!checkRes.isAvailable) {
        setError('Room is already reserved for these dates. Please choose different dates.');
        setIsSubmitting(false);
        return;
      }

      // Create booking record
      const res = await api.createBooking({
        roomId: room._id,
        checkIn,
        checkOut,
        guestCount,
        userPhone: guestPhone
      });

      if (res.success && res.booking) {
        // Navigate to payment page for payment processing
        onNavigate('payment', { booking: res.booking, room });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => onNavigate('rooms')}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Room Selection</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Booking Form (2 Cols) */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-xs border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Complete Your Reservation</h2>
              <p className="text-sm text-gray-500 mt-1">
                Please review your stay dates and contact information.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isAuthenticated && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center justify-between">
                <span>You must be logged in to reserve this room.</span>
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="px-3 py-1 bg-amber-600 text-white font-semibold rounded text-xs hover:bg-amber-700"
                >
                  Log In Now
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Guest Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Guest Full Name
                  </label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    placeholder="Guest Name"
                    className="w-full text-sm border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    required
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Stay Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Guest Count */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Number of Guests (Max {room.capacity})
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  {Array.from({ length: room.capacity }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Special Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Quiet room, late check-in, extra pillows"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting || !isAuthenticated}
                  className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-wider rounded-lg transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isSubmitting ? 'Verifying Stay...' : 'Proceed to Payment (₹' + totalAmount + ')'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Stay Summary (1 Col) */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
              <div className="h-36 w-full overflow-hidden bg-gray-100">
                <img
                  src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'}
                  alt={`Room ${room.roomNumber}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {room.type}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-1">Room #{room.roomNumber}</h3>
                  <p className="text-gray-500">RoomsForUse Hotel</p>
                </div>

                <div className="space-y-2 border-y border-gray-100 py-3 text-gray-600">
                  <div className="flex justify-between">
                    <span>Rate per night</span>
                    <span className="font-semibold text-gray-900">₹{room.pricePerNight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stay Duration</span>
                    <span className="font-semibold text-gray-900">{nights} Night{nights > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guests</span>
                    <span className="font-semibold text-gray-900">{guestCount} Person(s)</span>
                  </div>
                </div>

                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1">
                  <span>Total Payable</span>
                  <span className="text-blue-700">₹{totalAmount}</span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg text-emerald-800 flex items-start space-x-2 text-[11px]">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>Free cancellation permitted prior to check-in date.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
