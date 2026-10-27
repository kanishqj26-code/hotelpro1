import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Hotel, User as UserIcon, LogOut, Calendar, Shield, BedDouble, Menu, X, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  adminTab?: string;
  onAdminTabChange?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  adminTab = 'ALL BOOKINGS',
  onAdminTabChange
}) => {
  const { user, isAuthenticated, isAdmin, logout, quickLoginAs } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const isDashboardView = isAuthenticated && (currentView.startsWith('admin') || currentView === 'my-bookings' || currentView === 'customer-dashboard');

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  const navClass = isDashboardView
    ? 'bg-gradient-to-r from-[#4f28b4] via-[#5b21b6] to-[#4338ca] text-white shadow-md'
    : 'bg-white text-gray-800 border-b border-gray-200 shadow-xs';

  const logoColor = isDashboardView ? 'text-white' : 'text-gray-900';

  return (
    <header className="sticky top-0 z-40 w-full transition-colors duration-200">
      <div className={navClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => onNavigate('home')}>
              <div className={`p-2 rounded-lg ${isDashboardView ? 'bg-white/10' : 'bg-blue-50 text-blue-600'}`}>
                <Hotel className="w-6 h-6" />
              </div>
              <span className={`text-2xl font-bold tracking-tight ${logoColor}`}>
                RoomsForUse
              </span>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => onNavigate('home')}
                    className={`text-sm font-medium transition-colors hover:text-blue-500 ${
                      currentView === 'home' ? 'text-blue-600 font-semibold' : 'text-gray-600'
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => onNavigate('rooms')}
                    className={`text-sm font-medium transition-colors hover:text-blue-500 ${
                      currentView === 'rooms' ? 'text-blue-600 font-semibold' : 'text-gray-600'
                    }`}
                  >
                    Rooms
                  </button>
                  <button
                    onClick={() => onNavigate('login')}
                    className={`text-sm font-medium transition-colors hover:text-blue-500 ${
                      currentView === 'login' ? 'text-blue-600 font-semibold' : 'text-gray-600'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => onNavigate('register')}
                    className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition shadow-xs"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('rooms')}
                    className={`text-sm font-medium transition-colors hover:opacity-80 ${
                      isDashboardView ? 'text-white/90' : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    Browse Rooms
                  </button>

                  {!isAdmin && (
                    <button
                      onClick={() => onNavigate('my-bookings')}
                      className={`text-sm font-medium transition-colors hover:opacity-80 flex items-center space-x-1 ${
                        isDashboardView ? 'text-white' : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      <Calendar className="w-4 h-4 mr-1 inline" />
                      <span>My Bookings</span>
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => onNavigate('admin')}
                      className={`text-sm font-medium transition-colors hover:opacity-80 flex items-center space-x-1 ${
                        isDashboardView ? 'text-white font-semibold' : 'text-indigo-600 font-semibold'
                      }`}
                    >
                      <Shield className="w-4 h-4 mr-1 inline" />
                      <span>Admin Portal</span>
                    </button>
                  )}

                  <div
                    onClick={() => onNavigate('profile')}
                    className={`text-sm font-medium flex items-center space-x-2 cursor-pointer transition-opacity hover:opacity-90 ${
                      isDashboardView ? 'text-white' : 'text-gray-700'
                    }`}
                    title="Edit Profile"
                  >
                    <span className="opacity-90">Hi,</span>
                    <span className="font-semibold">{user?.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                        isAdmin
                          ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                          : 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                      }`}
                    >
                      {user?.role}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className={`text-sm font-medium transition-opacity hover:opacity-80 flex items-center ${
                      isDashboardView ? 'text-white/90 hover:text-white' : 'text-red-600 hover:text-red-700'
                    }`}
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </button>
                </>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowDemoMenu(!showDemoMenu)}
                  className={`text-xs px-2.5 py-1 rounded-md flex items-center space-x-1 border transition ${
                    isDashboardView
                      ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                      : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                  title="Switch test accounts for demo"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Demo Switcher</span>
                </button>

                {showDemoMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black/5 py-1 z-50 text-gray-800 text-sm">
                    <div className="px-3 py-2 border-b border-gray-100 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                      Quick Viva Accounts
                    </div>
                    <button
                      onClick={async () => {
                        await quickLoginAs('admin');
                        setShowDemoMenu(false);
                        onNavigate('admin');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-gray-700">Admin (sun)</span>
                      <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded">s@gmail.com</span>
                    </button>
                    <button
                      onClick={async () => {
                        await quickLoginAs('customer');
                        setShowDemoMenu(false);
                        onNavigate('my-bookings');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-gray-700">Customer (sid)</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">sid@gmail.com</span>
                    </button>
                    <div className="px-3 py-1.5 border-t border-gray-100 text-[11px] text-gray-400">
                      Password: <span className="font-mono text-gray-600">admin123 / customer123</span>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-md ${isDashboardView ? 'text-white' : 'text-gray-700'}`}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 space-y-2 border-t border-white/10 bg-inherit">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2 font-medium"
                >
                  Home
                </button>
                <button
                  onClick={() => { onNavigate('rooms'); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2 font-medium"
                >
                  Rooms
                </button>
                <button
                  onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2 font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => { onNavigate('register'); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2 font-medium text-blue-600 font-semibold"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <div className="py-2 border-b border-white/20 font-semibold">
                  Hi, {user?.name} ({user?.role})
                </div>
                <button
                  onClick={() => { onNavigate('rooms'); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2"
                >
                  Browse Rooms
                </button>
                {!isAdmin ? (
                  <button
                    onClick={() => { onNavigate('my-bookings'); setMobileMenuOpen(false); }}
                    className="block w-full text-left py-2"
                  >
                    My Bookings
                  </button>
                ) : (
                  <button
                    onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
                    className="block w-full text-left py-2"
                  >
                    Admin Dashboard
                  </button>
                )}
                <button
                  onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2"
                >
                  Profile
                </button>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2 text-red-300 font-semibold"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {isAdmin && currentView === 'admin' && onAdminTabChange && (
        <div className="bg-white border-b border-gray-200 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto no-scrollbar">
              {[
                { id: 'ALL BOOKINGS', label: 'ALL BOOKINGS' },
                { id: 'ALL ROOMS', label: 'ALL ROOMS' },
                { id: 'ADD ROOM', label: 'ADD ROOM' },
                { id: 'ALL USER', label: 'ALL USER' },
                { id: 'REPORTS', label: 'ANALYTICS & STATS' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => onAdminTabChange(tab.id)}
                  className={`py-3.5 px-2 border-b-2 text-xs md:text-sm font-semibold tracking-wider whitespace-nowrap transition-colors uppercase ${
                    adminTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
