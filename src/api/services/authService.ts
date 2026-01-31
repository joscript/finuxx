import { apiClient, STORAGE_KEYS } from '../client';
import { ENDPOINTS } from '../config';
import { User, AuthTokens } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<{ success: boolean; data?: AuthResponse; message?: string }> {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.REGISTER,
      data,
      false // No auth required
    );

    if (response.success && response.data) {
      // Save tokens
      await apiClient.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      // Save user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
    }

    return response;
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<{ success: boolean; data?: AuthResponse; message?: string }> {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.LOGIN,
      data,
      false // No auth required
    );

    if (response.success && response.data) {
      // Save tokens
      await apiClient.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      // Save user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    // Clear tokens regardless of response
    await apiClient.clearTokens();
    return response;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<{ success: boolean; data?: { user: User }; message?: string }> {
    return apiClient.get<{ user: User }>(ENDPOINTS.AUTH.ME);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<{ success: boolean; data?: { user: User }; message?: string }> {
    const response = await apiClient.put<{ user: User }>(ENDPOINTS.AUTH.ME, data);
    
    if (response.success && response.data) {
      // Update saved user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
    }
    
    return response;
  }

  /**
   * Update password
   */
  async updatePassword(data: UpdatePasswordRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.put(ENDPOINTS.AUTH.UPDATE_PASSWORD, data);
  }

  /**
   * Get stored user from AsyncStorage
   */
  async getStoredUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Failed to get stored user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<{ success: boolean; message?: string; timestamp?: string }> {
    return apiClient.get(ENDPOINTS.HEALTH, false);
  }
}

export const authService = new AuthService();
