import React, { useState, useEffect } from 'react';
import { Room } from '../types/index.ts';
import { api } from '../services/api.ts';
import { RoomCard } from '../components/RoomCard.tsx';
import { Search, Filter, Calendar, Users, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface RoomsPageProps {
  onNavigate: (view: string, params?: any) => void;
  onSelectRoom: (room: Room) => void;
  initialFilters?: {
    checkIn?: string;
    checkOut?: string;
    capacity?: number;
    type?: string;
  };
}

export const RoomsPage: React.FC<RoomsPageProps> = ({
  onNavigate,
  onSelectRoom,
  initialFilters
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [checkIn, setCheckIn] = useState(initialFilters?.checkIn || today);
  const [checkOut, setCheckOut] = useState(initialFilters?.checkOut || tomorrow);
  const [capacity, setCapacity] = useState(initialFilters?.capacity ? String(initialFilters.capacity) : '');
  const [type, setType] = useState(initialFilters?.type || 'All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'capacity'>('price-asc');

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const res = await api.getRooms({
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        capacity: capacity ? Number(capacity) : undefined,
        type: type !== 'All' ? type : undefined,
        search: search.trim() || undefined
      });

      if (res.success && res.rooms) {
        let sorted = [...res.rooms];
        if (sortBy === 'price-asc') sorted.sort((a, b) => a.pricePerNight - b.pricePerNight);
        if (sortBy === 'price-desc') sorted.sort((a, b) => b.pricePerNight - a.pricePerNight);
        if (sortBy === 'capacity') sorted.sort((a, b) => b.capacity - a.capacity);
        setRooms(sorted);
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [checkIn, checkOut, capacity, type, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRooms();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Title & Breadcrumb */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Available Hotel Rooms
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Choose your preferred room, select stay dates, and book instantly with verified price guarantee.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Check-In */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Check-In Date
              </label>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full text-xs sm:text-sm border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Check-Out */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Check-Out Date
              </label>
              <input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full text-xs sm:text-sm border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Guests
              </label>
              <select
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full text-xs sm:text-sm border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="">Any Capacity</option>
                <option value="1">1 Person</option>
                <option value="2">2 People</option>
                <option value="3">3 People</option>
                <option value="4">4 People</option>
                <option value="5">5+ People</option>
              </select>
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Room Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full text-xs sm:text-sm border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="All">All Types</option>
                <option value="Delux">Delux</option>
                <option value="Non-Delux">Non-Delux</option>
              </select>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Keyword / Room #
              </label>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs sm:text-sm border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Sort Price
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full text-xs sm:text-sm border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="capacity">Capacity: Max First</option>
              </select>
            </div>
          </form>
        </div>

        {/* Rooms Listing Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Showing {rooms.length} room{rooms.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={fetchRooms}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Refresh Availability
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-lg h-96 animate-pulse border border-gray-200" />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-lg mx-auto space-y-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No rooms match your search</h3>
              <p className="text-sm text-gray-500">
                Try adjusting your check-in/out dates, lowering capacity requirement, or removing keyword filters.
              </p>
              <button
                onClick={() => {
                  setCapacity('');
                  setType('All');
                  setSearch('');
                  setCheckIn(today);
                  setCheckOut(tomorrow);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  onLearnMore={() => {
                    onSelectRoom(room);
                    onNavigate('room-detail', { checkIn, checkOut, guests: capacity || 1 });
                  }}
                  onBookNow={() => {
                    onSelectRoom(room);
                    onNavigate('book-room', { checkIn, checkOut, guests: capacity || 1 });
                  }}
                  selectedDates={{ checkIn, checkOut }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
