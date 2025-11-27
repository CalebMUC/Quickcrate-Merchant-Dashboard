import { apiClient } from './client';
import { tokenService } from '../services/tokenService';
import { LoginRequest, AuthResponse, User, RefreshTokenRequest, PasswordResetRequest } from '@/types';

// Import cleanup to ensure it runs
import './cleanup';

class AuthService {
  private refreshTimer: NodeJS.Timeout | null = null;

  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('🚀 Real API Login - Sending request to:', '/Authentication/login');
    console.log('📧 Credentials:', { email: credentials.email });
    
    //const response = await apiClient.post<AuthResponse>('/Authentication/login', credentials);
    const response = await apiClient.post<AuthResponse>('/Identity/Merchant/login', credentials);
    console.log('✅ Login API Response:', response);
    
    // Store tokens securely
    if (response.success && response.data) {
      console.log('🔑 Storing real tokens:', { 
        tokenExists: !!response.data.token,
        refreshTokenExists: !!response.data.refreshToken
      });
      
      tokenService.setToken(response.data.token);
      tokenService.setRefreshToken(response.data.refreshToken);
      tokenService.setUserData(response.data.user);
      
      // Set up auto-refresh
      this.setupTokenRefresh(response.data.expiresIn);
    }
    
    return response;
  }

  // Reset password
  async resetPassword(resetData: PasswordResetRequest): Promise<AuthResponse> {
    console.log('🔑 Real API Reset Password - Called with:', resetData);

    try {
      // Backend expects exactly the same format as frontend form
      const backendData = {
        currentPassword: resetData.currentPassword,
        newPassword: resetData.newPassword,
        confirmPassword: resetData.confirmPassword
      };
      
      console.log('🚀 Sending request to /Authentication/reset-password with data:', backendData);
      // const response = await apiClient.post<AuthResponse>('/Authentication/reset-password', backendData);
      const response = await apiClient.post<AuthResponse>('/Identity/reset-password', backendData);
      console.log('✅ Real Backend response:', response);
      
      if (response.success && response.data) {
        // Update user state to remove temporary password flag
        const updatedUser = { ...response.data.user, isTemporaryPassword: false };
        tokenService.setUserData(updatedUser);
        
        // Update tokens if provided (new real tokens)
        if (response.data.token) {
          console.log('🔑 Storing new real token after password reset');
          tokenService.setToken(response.data.token);
          this.setupTokenRefresh(response.data.expiresIn);
        }
      }
      
      return response;
    } catch (error) {
      console.error('💥 Real API Password reset error:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      console.log('🚪 Real API Logout - Calling backend');
      await apiClient.post('/Authentication/logout');
      console.log('✅ Real API Logout successful');
    } catch (error) {
      console.error('💥 Real API Logout error:', error);
    } finally {
      // Clear local storage
      console.log('🧹 Clearing all tokens and refresh timer');
      tokenService.clearTokens();
      this.clearTokenRefresh();
    }
  }

  // Refresh token
  async refreshToken(): Promise<boolean> {
    const refreshToken = tokenService.getRefreshToken();
    const token = tokenService.getToken();
    
    console.log('🔄 Real API Token Refresh - Checking tokens');
    
    if (!refreshToken) {
      console.log('❌ No refresh token available');
      return false;
    }

    if (!token) {
      console.log('❌ No current token available');
      return false;
    }

    try {
      console.log('🚀 Real API Token Refresh - Sending request');
      // const response = await apiClient.post<AuthResponse>('/Authentication/refresh', {
      //   refreshToken,
      //   token,
      // });

        const response = await apiClient.post<AuthResponse>('/Identity/Merchant/refresh', {
        refreshToken,
        token,
      });

      console.log('✅ Real API Token Refresh response:', response);

      if (response.success && response.data) {
        console.log('🔑 Storing new refreshed real tokens');
        tokenService.setToken(response.data.token);
        tokenService.setRefreshToken(response.data.refreshToken);
        this.setupTokenRefresh(response.data.expiresIn);
        return true;
      }

      console.log('❌ Real API Token refresh failed - invalid response');
      return false;
    } catch (error) {
      console.error('💥 Real API Token refresh failed:', error);
      this.logout();
      return false;
    }
  }

  // Get current user from storage
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    return tokenService.getUserData();
  }

  // Get current user from API
  async fetchCurrentUser(): Promise<User | null> {
    try {
      console.log('👤 Real API Get Current User - Fetching from backend');
      const response = await apiClient.get<{ data: User }>('/Authentication/me');
      console.log('✅ Real API Current User response:', response);
      return response.data;
    } catch (error) {
      console.error('💥 Real API Get current user failed:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = tokenService.getToken();
    return !!token && !tokenService.isTokenExpired(token);
  }

  // Get stored token
  getToken(): string | null {
    return tokenService.getToken();
  }

  // Register new user (if needed)
  async register(userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/Authentication/register', userData);
  }

  // Forgot password
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post('/Authentication/forgot-password', { email });
  }

  // Reset password with token
  async resetPasswordWithToken(token: string, password: string): Promise<{ message: string }> {
    return apiClient.post('/Authentication/reset-password-token', { token, password });
  }

  // Update profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/Authentication/profile', userData);
    
    // Update stored user data
    tokenService.setUserData(response);
    
    return response;
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post('/Authentication/change-password', {
      currentPassword,
      newPassword,
    });
  }

  private setupTokenRefresh(expiresIn: number): void {
    // Refresh token 5 minutes before expiry
    const refreshTime = (expiresIn - 300) * 1000;
    
    this.clearTokenRefresh();
    this.refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, refreshTime);
  }

  private clearTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

export const authService = new AuthService();
