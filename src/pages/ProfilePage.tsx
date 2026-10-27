import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { User, Phone, Mail, Lock, Shield, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (view: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password && password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name,
        phone,
        password: password || undefined
      });
      setMessage('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        <button
          onClick={() => onNavigate(user?.role === 'admin' ? 'admin' : 'my-bookings')}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 space-y-6">
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{user?.email}</span>
                <span>•</span>
                <span className="capitalize font-semibold text-blue-600">{user?.role} Account</span>
              </div>
            </div>
          </div>

          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-md flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-md flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Email Address (Read Only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full text-sm border border-gray-200 bg-gray-50 rounded px-3 py-2 text-gray-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-2">Change Password (Optional)</h3>
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded transition shadow-xs disabled:opacity-50"
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
