'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
  _id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
  preferences?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Save token to localStorage
  const saveToken = (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  };

  // Remove token from localStorage
  const removeToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Verify token by fetching user profile
        const response = await fetch(`${API_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Token is invalid, remove it
          removeToken();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user data
      saveToken(data.token);
      setUser({
        _id: data._id,
        email: data.email,
        name: data.name,
        isAdmin: data.isAdmin,
        preferences: data.preferences,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Save token and user data
      saveToken(data.token);
      setUser({
        _id: data._id,
        email: data.email,
        name: data.name,
        isAdmin: data.isAdmin,
        preferences: data.preferences,
      });
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 