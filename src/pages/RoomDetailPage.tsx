import React, { useState, useEffect } from 'react';
import { Room } from '../types/index.ts';
import { api } from '../services/api.ts';
import {
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Wifi,
  Tv,
  Coffee,
  Wind,
  ShieldCheck,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

interface RoomDetailPageProps {
  room: Room;
  onNavigate: (view: string, params?: any) => void;
  initialDates?: { checkIn?: string; checkOut?: string; guests?: number };
}

export const RoomDetailPage: React.FC<RoomDetailPageProps> = ({
  room,
  onNavigate,
  initialDates
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [checkIn, setCheckIn] = useState(initialDates?.checkIn || today);
  const [checkOut, setCheckOut] = useState(initialDates?.checkOut || tomorrow);
  const [guestCount, setGuestCount] = useState(initialDates?.guests || 1);

  const [isChecking, setIsChecking] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<{
    isAvailable: boolean;
    numberOfNights: number;
    totalAmount: number;
  } | null>(null);

  const images = room.images && room.images.length > 0 ? room.images : [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
  ];

  useEffect(() => {
    async function check() {
      if (!checkIn || !checkOut || checkIn >= checkOut) {
        setAvailabilityResult(null);
        return;
      }
      setIsChecking(true);
      try {
        const res = await api.checkAvailability(room._id, checkIn, checkOut);
        if (res.success) {
          setAvailabilityResult({
            isAvailable: res.isAvailable,
            numberOfNights: res.numberOfNights,
            totalAmount: res.totalAmount
          });
        }
      } catch (err) {
        console.error('Error verifying dates:', err);
      } finally {
        setIsChecking(false);
      }
    }
    check();
  }, [checkIn, checkOut, room._id]);

  const handleBookNow = () => {
    onNavigate('book-room', {
      room,
      checkIn,
      checkOut,
      guests: guestCount
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <button
          onClick={() => onNavigate('rooms')}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to All Rooms</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative h-[380px] sm:h-[450px] w-full rounded-2xl overflow-hidden bg-gray-900 shadow-md">
              <img
                src={images[activeImageIndex]}
                alt={`Room ${room.roomNumber}`}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-4 left-4 flex space-x-2">
                <span
                  className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-white ${
                    room.type === 'Delux' ? 'bg-emerald-600' : 'bg-blue-600'
                  }`}
                >
                  {room.type} Room
                </span>
                <span className="bg-black/60 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded-md">
                  Room #{room.roomNumber}
                </span>
              </div>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-24 rounded-lg overflow-hidden border-2 transition ${
                      activeImageIndex === idx ? 'border-blue-600 shadow-md scale-[1.02]' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {room.type} Suite — Room {room.roomNumber}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  RoomsForUse Hospitality Standard Certified
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-gray-100 text-sm">
                <div>
                  <span className="text-xs text-gray-500 block uppercase font-medium">Max Capacity</span>
                  <span className="text-gray-900 font-semibold">{room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block uppercase font-medium">Nightly Rate</span>
                  <span className="text-gray-900 font-semibold">₹{room.pricePerNight} / night</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block uppercase font-medium">Room Type</span>
                  <span className="text-gray-900 font-semibold">{room.type}</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Room Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {room.description}
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3">Complimentary Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-700">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4 text-blue-600" />
                    <span>High-Speed Wi-Fi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-blue-600" />
                    <span>Air Conditioning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tv className="w-4 h-4 text-blue-600" />
                    <span>Smart HD Television</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Coffee className="w-4 h-4 text-blue-600" />
                    <span>Tea & Coffee Kit</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Sanitized Bathware</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md sticky top-24 space-y-5">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-xs text-gray-500 uppercase font-semibold">Daily Rate</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-gray-900">₹{room.pricePerNight}</span>
                  <span className="text-xs text-gray-500 font-medium">/ night</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Number of Guests (Max {room.capacity})
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    {Array.from({ length: room.capacity }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {availabilityResult && (
                <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-xs border border-slate-200">
                  <div className="flex justify-between text-gray-600">
                    <span>
                      ₹{room.pricePerNight} × {availabilityResult.numberOfNights} night{availabilityResult.numberOfNights > 1 ? 's' : ''}
                    </span>
                    <span>₹{availabilityResult.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes & Service fees</span>
                    <span className="text-emerald-600 font-semibold">Included</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-gray-900">
                    <span>Total Amount:</span>
                    <span className="text-blue-700">₹{availabilityResult.totalAmount}</span>
                  </div>

                  <div className="pt-1">
                    {availabilityResult.isAvailable ? (
                      <span className="inline-flex items-center text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Available for these dates
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-semibold text-rose-600">
                        <XCircle className="w-4 h-4 mr-1 text-rose-600" /> Booked for selected dates
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={handleBookNow}
                disabled={isChecking || availabilityResult?.isAvailable === false}
                className={`w-full py-3 px-4 rounded-lg text-sm font-bold uppercase tracking-wider transition shadow-sm flex items-center justify-center space-x-2 ${
                  availabilityResult?.isAvailable === false
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <span>Book This Room</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-gray-400 text-center">
                Instant confirmation • Free cancellation eligible
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
