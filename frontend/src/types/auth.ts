/**
 * Authentication Types
 */

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface VerifyTokenResponse {
  success: boolean;
  user?: User;
  message?: string;
}
