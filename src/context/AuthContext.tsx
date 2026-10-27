import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; phone: string; role?: string }) => Promise<User>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string; password?: string }) => Promise<void>;
  quickLoginAs: (role: 'admin' | 'customer') => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('roomsforuse_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session from token
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('roomsforuse_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          logout();
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      localStorage.setItem('roomsforuse_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
  }): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('roomsforuse_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('roomsforuse_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: { name?: string; phone?: string; password?: string }) => {
    const res = await api.updateProfile(data);
    if (res.user) {
      setUser(res.user);
    }
  };

  // One-click quick login helper for college viva / testing
  const quickLoginAs = async (role: 'admin' | 'customer'): Promise<User> => {
    if (role === 'admin') {
      // Matches screenshot 7 & 4 admin: sun (s@gmail.com / admin123)
      return login('s@gmail.com', 'admin123');
    } else {
      // Matches screenshot 7 & 4 customer: sid (sid@gmail.com / customer123)
      return login('sid@gmail.com', 'customer123');
    }
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = !!user && user.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        quickLoginAs
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
