import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { RoomsPage } from './pages/RoomsPage.tsx';
import { RoomDetailPage } from './pages/RoomDetailPage.tsx';
import { BookRoomPage } from './pages/BookRoomPage.tsx';
import { PaymentPage } from './pages/PaymentPage.tsx';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage.tsx';
import { MyBookingsPage } from './pages/MyBookingsPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { Room, Booking, Payment } from './types/index.ts';

function AppContent() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  // Navigation state
  const [currentView, setCurrentView] = useState<string>('home');
  const [adminTab, setAdminTab] = useState<string>('ALL BOOKINGS');

  // Page parameter state
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchParams, setSearchParams] = useState<any>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [activePayment, setActivePayment] = useState<Payment | null>(null);

  // Sync browser back/forward or hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '') || 'home';
      setCurrentView(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (view: string, params?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (params) {
      if (params.room) setSelectedRoom(params.room);
      if (params.booking) setActiveBooking(params.booking);
      if (params.payment) setActivePayment(params.payment);
      setSearchParams(params);
    }

    setCurrentView(view);
    window.location.hash = `#/${view}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-600">Loading RoomsForUse...</p>
        </div>
      </div>
    );
  }

  // Route protection
  if ((currentView === 'my-bookings' || currentView === 'profile' || currentView === 'book-room') && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar currentView={currentView} onNavigate={navigate} />
        <div className="flex-1">
          <LoginPage onNavigate={navigate} />
        </div>
        <Footer onNavigate={navigate} />
      </div>
    );
  }

  if (currentView.startsWith('admin') && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar currentView={currentView} onNavigate={navigate} />
        <div className="flex-1 max-w-lg mx-auto py-16 px-4 text-center space-y-4">
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
            <h2 className="text-lg font-bold">Administrator Access Required</h2>
            <p className="text-xs mt-1">You must be logged in as an administrator to view this portal.</p>
          </div>
          <button
            onClick={() => navigate('login')}
            className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold"
          >
            Go to Login
          </button>
        </div>
        <Footer onNavigate={navigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-gray-800 antialiased">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={navigate}
        adminTab={adminTab}
        onAdminTabChange={setAdminTab}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onNavigate={navigate}
            onSelectRoom={(r) => {
              setSelectedRoom(r);
              navigate('room-detail');
            }}
          />
        )}

        {currentView === 'login' && <LoginPage onNavigate={navigate} />}

        {currentView === 'register' && <RegisterPage onNavigate={navigate} />}

        {currentView === 'rooms' && (
          <RoomsPage
            onNavigate={navigate}
            onSelectRoom={(r) => {
              setSelectedRoom(r);
              navigate('room-detail');
            }}
            initialFilters={searchParams}
          />
        )}

        {currentView === 'room-detail' && selectedRoom && (
          <RoomDetailPage
            room={selectedRoom}
            onNavigate={navigate}
            initialDates={searchParams}
          />
        )}

        {currentView === 'book-room' && selectedRoom && (
          <BookRoomPage
            room={selectedRoom}
            onNavigate={navigate}
            bookingParams={searchParams}
          />
        )}

        {currentView === 'payment' && activeBooking && (
          <PaymentPage
            booking={activeBooking}
            room={selectedRoom || undefined}
            onNavigate={navigate}
          />
        )}

        {currentView === 'confirmation' && activeBooking && (
          <BookingConfirmationPage
            booking={activeBooking}
            payment={activePayment || undefined}
            onNavigate={navigate}
          />
        )}

        {currentView === 'my-bookings' && <MyBookingsPage onNavigate={navigate} />}

        {currentView === 'profile' && <ProfilePage onNavigate={navigate} />}

        {currentView === 'admin' && (
          <AdminDashboard
            currentTab={adminTab}
            onTabChange={setAdminTab}
            onNavigate={navigate}
          />
        )}

        {/* 404 Fallback */}
        {![
          'home',
          'login',
          'register',
          'rooms',
          'room-detail',
          'book-room',
          'payment',
          'confirmation',
          'my-bookings',
          'profile',
          'admin'
        ].includes(currentView) && (
          <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
            <h2 className="text-3xl font-extrabold text-gray-900">Page Not Found</h2>
            <p className="text-sm text-gray-500">The requested page or route does not exist.</p>
            <button
              onClick={() => navigate('home')}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-md text-xs font-semibold uppercase tracking-wider"
            >
              Return Home
            </button>
          </div>
        )}
      </main>

      {/* Footer (Hidden on admin dashboards to match clean admin app format) */}
      {currentView !== 'admin' && <Footer onNavigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
