/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '@/types/auth';
import { authService } from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication on mount
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setIsLoading(true);
    
    try {
      const storedToken = authService.getStoredToken();
      const storedUser = authService.getStoredUser();

      if (storedToken && storedUser) {
        // Verify token is still valid
        const verifyResult = await authService.verifyToken(storedToken);
        
        if (verifyResult.success && verifyResult.user) {
          setToken(storedToken);
          setUser(verifyResult.user);
        } else {
          // Token is invalid, clear stored data
          authService.removeToken();
          authService.removeUser();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear any invalid stored data
      authService.removeToken();
      authService.removeUser();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const loginResponse = await authService.login(username, password);
      
      if (loginResponse.success) {
        // Store authentication data
        authService.storeToken(loginResponse.token);
        authService.storeUser(loginResponse.user);
        
        // Update state
        setToken(loginResponse.token);
        setUser(loginResponse.user);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear stored data
    authService.removeToken();
    authService.removeUser();
    
    // Clear state
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!(token && user);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
