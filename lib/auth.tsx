'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from './types';
import apiClient from './api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Only check auth once on initial load and only if there's a token
    if (!hasCheckedAuth) {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        checkAuth().then(() => {
          if (isMounted) {
            setIsLoading(false);
            setHasCheckedAuth(true);
          }
        });
      } else {
        // No token, user is not authenticated
        if (isMounted) {
          setIsLoading(false);
          setHasCheckedAuth(true);
        }
      }
    }

    return () => {
      isMounted = false;
    };
  }, [hasCheckedAuth]);

  const checkAuth = async () => {
    try {
      // Double-check if token still exists before making the request
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        console.log('No token found, skipping auth check');
        setUser(null);
        return;
      }

      console.log('Checking authentication status...');
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        console.log('User authenticated:', response.data.email);
        setUser(response.data.user);
      } else {
        console.log('No authenticated user found');
        setUser(null);
      }
    } catch (error) {
      console.log('Authentication check failed:', error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      const response = await apiClient.login({ email, password });
      if (response.success && response.data) {
        console.log('Login successful for:', email);
        setUser(response.data.user);
        return true;
      }
      console.log('Login failed for:', email);
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      console.log('Attempting registration for:', data.email);
      const response = await apiClient.register(data);
      if (response.success && response.data) {
        console.log('Registration successful for:', data.email);
        setUser(response.data.user);
        return true;
      }
      console.log('Registration failed for:', data.email);
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user:', user?.email);
      await apiClient.logout();
      setUser(null);
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      setUser(null);
      window.location.href = '/login';
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};