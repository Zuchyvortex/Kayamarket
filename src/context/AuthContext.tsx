"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'RIDER';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role?: 'CUSTOMER' | 'ADMIN') => Promise<boolean>;
  register: (name: string, email: string, phone: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('kayamarket_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, role: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER') => {
    setLoading(true);
    // Mock network request delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let mockUser: User;
    if (email.toLowerCase().includes('admin') || role === 'ADMIN') {
      mockUser = {
        id: "u-admin",
        name: "Kaya Admin",
        email: email || "admin@kayamarket.com",
        role: "ADMIN",
        phone: "+234 812 345 6789"
      };
    } else {
      mockUser = {
        id: "u-cust",
        name: "Chinedu Okafor",
        email: email || "chinedu@example.com",
        role: "CUSTOMER",
        phone: "+234 803 123 4567"
      };
    }

    setUser(mockUser);
    localStorage.setItem('kayamarket_user', JSON.stringify(mockUser));
    setLoading(false);
    return true;
  };

  const register = async (name: string, email: string, phone: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockUser: User = {
      id: `u-${Date.now()}`,
      name,
      email,
      role: 'CUSTOMER',
      phone
    };

    setUser(mockUser);
    localStorage.setItem('kayamarket_user', JSON.stringify(mockUser));
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kayamarket_user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
