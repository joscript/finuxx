import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService, User } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<{ success: boolean; message?: string }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Check for existing auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // First check if we have tokens stored
      const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (accessToken) {
        // Try to get stored user first for faster UI update
        const storedUser = await authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        }

        // Then verify with server and get fresh data
        const response = await authService.getCurrentUser();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear everything
          await authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authService.login({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      return { success: false, message: response.message || 'Login failed' };
    } catch (error: any) {
      return { success: false, message: error.message || 'An error occurred' };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authService.register({ name, email, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error: any) {
      return { success: false, message: error.message || 'An error occurred' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const updateProfile = useCallback(async (name: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authService.updateProfile({ name });
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true, message: 'Profile updated successfully' };
      }
      
      return { success: false, message: response.message || 'Failed to update profile' };
    } catch (error: any) {
      return { success: false, message: error.message || 'An error occurred' };
    }
  }, []);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authService.updatePassword({ currentPassword, newPassword });
      
      if (response.success) {
        return { success: true, message: 'Password updated successfully' };
      }
      
      return { success: false, message: response.message || 'Failed to update password' };
    } catch (error: any) {
      return { success: false, message: error.message || 'An error occurred' };
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isLoading,
        user,
        login, 
        register,
        logout,
        updateProfile,
        updatePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
