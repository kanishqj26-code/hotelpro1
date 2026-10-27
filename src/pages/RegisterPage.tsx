import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { AuthIllustration } from '../components/AuthIllustration.tsx';
import { AlertCircle, ChevronDown, CheckCircle2 } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (view: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'admin'>('customer');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await register({
        name,
        email,
        password,
        phone,
        role: selectedRole
      });

      setSuccess(`Account registered successfully as ${selectedRole}! Redirecting...`);
      setTimeout(() => {
        if (user.role === 'admin') {
          onNavigate('admin');
        } else {
          onNavigate('my-bookings');
        }
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Stylized Vector Illustration from Screenshot 1 */}
        <div className="hidden lg:flex items-center justify-center">
          <AuthIllustration />
        </div>

        {/* Right Column: Exact Form from Screenshot 1 */}
        <div className="max-w-md w-full mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Register for the Account
            </h2>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-sm border border-gray-300 rounded px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email Address"
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
              <input
                type="tel"
                placeholder="Enter Mobile no."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full text-sm border border-gray-300 rounded px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            {/* SELECT USER dropdown - faithful to Screenshot 1 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold tracking-wider uppercase rounded flex items-center space-x-2 transition shadow-xs"
              >
                <span>
                  {selectedRole === 'admin' ? 'USER: ADMIN' : 'SELECT USER ▾'}
                </span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('customer');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50 font-medium ${
                      selectedRole === 'customer' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'
                    }`}
                  >
                    Ordinary Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('admin');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50 font-medium ${
                      selectedRole === 'admin' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'
                    }`}
                  >
                    Hotel Administrator
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs tracking-wider uppercase rounded transition shadow-sm disabled:opacity-50"
              >
                {isLoading ? 'REGISTERING...' : 'REGISTER'}
              </button>
            </div>

            <div className="pt-2 text-sm text-gray-700">
              Had an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-[#dc2626] font-semibold hover:underline"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
