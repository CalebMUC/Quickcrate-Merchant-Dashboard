import { apiClient } from './client';
import { mockApiService } from './mock';
import { LoginRequest, LoginResponse, User, RefreshTokenRequest } from '@/types';

const USE_MOCK_API = process.env.NEXT_PUBLIC_MOCK_API === 'true';

export const authService = {
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    if (USE_MOCK_API) {
      return await mockApiService.login(credentials);
    }
    
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Store tokens in localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      if (USE_MOCK_API) {
        await mockApiService.logout();
      } else {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Refresh token
  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    if (USE_MOCK_API) {
      return await mockApiService.refreshToken();
    }

    const response = await apiClient.post<LoginResponse>('/auth/refresh', {
      refreshToken,
    });

    // Update stored tokens
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  },

  // Get current user from storage
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get stored token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    return localStorage.getItem('token');
  },

  // Register new user (if needed)
  async register(userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/register', userData);
  },

  // Forgot password
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post('/auth/forgot-password', { email });
  },

  // Reset password
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return apiClient.post('/auth/reset-password', { token, password });
  },

  // Update profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/auth/profile', userData);
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(response));
    
    return response;
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },
};