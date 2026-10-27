import React from 'react';
import { Hotel, Phone, Mail, MapPin, ShieldCheck, Clock, Award } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-xl">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Hotel className="w-5 h-5" />
              </div>
              <span>RoomsForUse</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Premium hotel room booking and reservation management system. Providing comfortable, verified stays with guaranteed lowest rates and instant confirmations.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <span className="flex items-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mr-1" /> Safe & Secure
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 text-blue-400 mr-1" /> 24/7 Front Desk
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition">Home</button>
              </li>
              <li>
                <button onClick={() => onNavigate('rooms')} className="hover:text-white transition">Available Rooms</button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-white transition">Customer Login</button>
              </li>
              <li>
                <button onClick={() => onNavigate('register')} className="hover:text-white transition">Register Account</button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-white transition">Admin Portal</button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Room Categories</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Delux Luxury Suites</li>
              <li>Executive King Rooms</li>
              <li>Non-Delux Standard Rooms</li>
              <li>Family Quad Rooms</li>
              <li>Solo Traveler Express</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact & Support</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>MG Road, Hospitality Hub, Hyderabad & Bengaluru, India</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+91 97049 27807 (Toll-Free Helpline)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>support@roomsforuse.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} RoomsForUse Inc. All rights reserved. Full-Stack College Project.</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cancellation & Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
