/**
 * Authentication Service
 * Handles login, logout, and token management
 */

import { LoginRequest, LoginResponse, VerifyTokenResponse, User } from '@/types/auth';

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
  }

  /**
   * Login user with username and password
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  /**
   * Verify JWT token validity
   */
  async verifyToken(token: string): Promise<VerifyTokenResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token verification failed');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Token verification failed'
      };
    }
  }

  /**
   * Store token in localStorage
   */
  storeToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hsbc_auth_token', token);
    }
  }

  /**
   * Get token from localStorage
   */
  getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hsbc_auth_token');
    }
    return null;
  }

  /**
   * Remove token from localStorage
   */
  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hsbc_auth_token');
    }
  }

  /**
   * Store user data in localStorage
   */
  storeUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hsbc_user_data', JSON.stringify(user));
    }
  }

  /**
   * Get user data from localStorage
   */
  getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('hsbc_user_data');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  /**
   * Remove user data from localStorage
   */
  removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hsbc_user_data');
    }
  }
}

export const authService = new AuthService();
