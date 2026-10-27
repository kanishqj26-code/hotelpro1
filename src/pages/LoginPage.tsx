import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { AuthIllustration } from '../components/AuthIllustration.tsx';
import { Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (view: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, quickLoginAs } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        onNavigate('admin');
      } else {
        onNavigate('my-bookings');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'customer') => {
    setError(null);
    setIsLoading(true);
    try {
      const user = await quickLoginAs(role);
      if (user.role === 'admin') {
        onNavigate('admin');
      } else {
        onNavigate('my-bookings');
      }
    } catch (err: any) {
      setError(err?.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="hidden lg:flex items-center justify-center">
          <AuthIllustration />
        </div>

        <div className="max-w-md w-full mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Login for the Account
            </h2>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-sm border border-gray-300 rounded px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-sm border border-gray-300 rounded px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs tracking-wider uppercase rounded transition shadow-sm disabled:opacity-50"
              >
                {isLoading ? 'LOGGING IN...' : 'LOGIN'}
              </button>
            </div>

            <div className="pt-2 text-sm text-gray-700">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="text-[#dc2626] font-semibold hover:underline"
              >
                Register
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Quick Viva Demo Logins</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-left transition"
              >
                <div className="text-xs font-bold text-purple-900">Admin Account</div>
                <div className="text-[11px] text-purple-700">s@gmail.com (sun)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-left transition"
              >
                <div className="text-xs font-bold text-blue-900">Customer Account</div>
                <div className="text-[11px] text-blue-700">sid@gmail.com (sid)</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
