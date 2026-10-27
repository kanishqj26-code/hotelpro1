import React, { useState, useEffect } from 'react';
import { Booking } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { BookingCard } from '../components/BookingCard.tsx';
import { InvoiceModal } from '../components/InvoiceModal.tsx';
import { Calendar, RefreshCw, PlusCircle, Search } from 'lucide-react';

interface MyBookingsPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Booking | null>(null);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMyBookings();
      if (res.success && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      console.error('Failed to load my bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await api.cancelBooking(bookingId);
      if (res.success) {
        // Refresh local bookings state
        await loadBookings();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel booking.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Heading - Styled like Screenshot 4 */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-medium text-gray-700 tracking-tight">
            My Bookings
          </h1>
          <p className="text-xs text-gray-500">
            View your active and past reservations, invoice receipts, and cancellation controls.
          </p>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('rooms')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold uppercase tracking-wider transition shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            <span>Book New Room</span>
          </button>

          <button
            onClick={loadBookings}
            className="text-xs text-gray-500 hover:text-gray-800 flex items-center"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Bookings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-lg h-56 animate-pulse border border-gray-200" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Reservations Yet</h3>
            <p className="text-xs text-gray-500">
              You haven't reserved any hotel rooms yet. Explore our Deluxe and Standard suites to book your first stay!
            </p>
            <button
              onClick={() => onNavigate('rooms')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold uppercase tracking-wider transition"
            >
              Browse Available Rooms
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onCancelBooking={handleCancelBooking}
                onViewInvoice={(b) => setSelectedInvoice(b)}
              />
            ))}
          </div>
        )}

        {/* Total Bookings Count matching Screenshot 4 footer */}
        <div className="text-center pt-4">
          <p className="text-sm font-semibold text-gray-700">
            Total Bookings: {bookings.length}
          </p>
        </div>
      </div>

      {/* Invoice modal */}
      {selectedInvoice && (
        <InvoiceModal
          booking={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};
