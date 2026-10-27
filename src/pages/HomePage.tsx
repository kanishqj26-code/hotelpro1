import React, { useState, useEffect } from 'react';
import { Room } from '../types/index.ts';
import { api } from '../services/api.ts';
import { RoomCard } from '../components/RoomCard.tsx';
import {
  Calendar,
  Users,
  Search,
  Sparkles,
  ShieldCheck,
  Clock,
  Award,
  ChevronRight,
  Wifi,
  Coffee,
  Tv,
  Car
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string, params?: any) => void;
  onSelectRoom: (room: Room) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectRoom }) => {
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState('2');
  const [roomType, setRoomType] = useState('All');

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await api.getRooms();
        if (res.success && res.rooms) {
          setFeaturedRooms(res.rooms.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load featured rooms:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('rooms', { checkIn, checkOut, capacity: Number(guests), type: roomType });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <section className="relative bg-slate-900 text-white py-20 lg:py-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-purple-950/70" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Welcome to RoomsForUse Hospitality</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Perfect Stay</span>
            </h1>

            <p className="text-lg text-slate-300 font-light leading-relaxed max-w-2xl">
              Experience unparalleled comfort and affordability with verified Deluxe and Non-Deluxe hotel rooms. Instant reservations, transparent rates, and seamless management.
            </p>
          </div>

          <div className="mt-10 bg-white rounded-xl shadow-xl p-6 text-gray-800 border border-gray-100">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Check-In Date
                </label>
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Check-Out Date
                </label>
                <input
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3">3 People</option>
                    <option value="4">4 People</option>
                    <option value="5">5+ People</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Type
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="All">All Types</option>
                    <option value="Delux">Delux</option>
                    <option value="Non-Delux">Non-Delux</option>
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition shadow-md flex items-center justify-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Rooms</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Featured Accommodations</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">Our Popular Rooms</h2>
            <p className="text-sm text-gray-500 mt-1">Handpicked comfortable suites curated for leisure and business trips.</p>
          </div>
          <button
            onClick={() => onNavigate('rooms')}
            className="mt-4 md:mt-0 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            <span>View All Available Rooms</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-lg h-96 animate-pulse border border-gray-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredRooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                onLearnMore={() => {
                  onSelectRoom(room);
                  onNavigate('room-detail');
                }}
                onBookNow={() => {
                  onSelectRoom(room);
                  onNavigate('book-room');
                }}
                selectedDates={{ checkIn, checkOut }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Why Choose RoomsForUse?</h2>
            <p className="text-sm text-gray-500 mt-2">
              Designed to make every booking effortless with reliable customer satisfaction and live management.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Clean & Verified Rooms</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                All rooms are rigorously inspected and sanitized prior to check-in for peace of mind.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Best Price Guarantee</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Guaranteed competitive daily rates with no hidden fees or surge pricing.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Instant Confirmation</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Automated booking verification with downloadable digital tax invoices immediately upon booking.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Easy Cancellation</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Cancel eligible reservations anytime from your My Bookings dashboard with automated room release.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-100 py-10 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex items-center justify-center space-x-3 text-gray-700 font-medium text-sm">
              <Wifi className="w-5 h-5 text-blue-600" />
              <span>High-Speed Wi-Fi</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-gray-700 font-medium text-sm">
              <Coffee className="w-5 h-5 text-blue-600" />
              <span>Complimentary Breakfast</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-gray-700 font-medium text-sm">
              <Tv className="w-5 h-5 text-blue-600" />
              <span>Smart TV & Entertainment</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-gray-700 font-medium text-sm">
              <Car className="w-5 h-5 text-blue-600" />
              <span>Free Valet Parking</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
