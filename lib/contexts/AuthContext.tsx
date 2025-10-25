'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginRequest, PasswordResetRequest } from '@/types';
import { authService } from '@/lib/api/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (resetData: PasswordResetRequest) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; requiresPasswordReset: boolean } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'RESET_PASSWORD_SUCCESS'; payload: User }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' }

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  requiresPasswordReset: false
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null }
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: authService.getToken(),
        isAuthenticated: true,
        isLoading: false,
        error: null,
        requiresPasswordReset: action.payload.requiresPasswordReset
      }
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        requiresPasswordReset: false
      }
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false
      }
    
    case 'RESET_PASSWORD_SUCCESS':
      return {
        ...state,
        user: action.payload,
        requiresPasswordReset: false,
        error: null
      }
    
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    default:
      return state
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
          // BYPASS LOGIN FOR TESTING - Auto-authenticate with mock user
        const mockUser: User = {
          id: 'test-user-1',
          email: 'test@merchant.com',
          name: 'Test Merchant',
          role: 'merchant',
          merchantId: 'merchant-123',
          businessName: 'Test Store',
          permissions: ['read', 'write', 'manage_products', 'manage_orders'],
          avatar: undefined,
          isTemporaryPassword: false,
          emailVerified: true,
        };
        
        // Set mock user as authenticated
        dispatch({ type: 'SET_USER', payload: mockUser });
        console.log('🚀 LOGIN BYPASSED - Auto-authenticated as:', mockUser.email);
        
        /* Original authentication logic (commented out for testing)
        const token = authService.getToken();
        const currentUser = authService.getCurrentUser();
        
        if (token && currentUser && authService.isAuthenticated()) {
          dispatch({ type: 'SET_USER', payload: currentUser });
        } else if (token) {
          // Token exists but might be expired, try to refresh
          const refreshed = await authService.refreshToken();
          if (refreshed) {
            const user = authService.getCurrentUser();
            if (user) {
              dispatch({ type: 'SET_USER', payload: user });
            }
          } else {
            await authService.logout();
          }
        }
        */
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Even if there's an error, auto-authenticate for testing
        const mockUser: User = {
          id: 'test-user-1',
          email: 'test@merchant.com',
          name: 'Test Merchant',
          role: 'merchant',
          merchantId: 'merchant-123',
          businessName: 'Test Store',
          permissions: ['read', 'write', 'manage_products', 'manage_orders'],
          avatar: undefined,
          isTemporaryPassword: false,
          emailVerified: true,
        };
        dispatch({ type: 'SET_USER', payload: mockUser });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data.user,
            requiresPasswordReset: response.data.requiresPasswordReset
          }
        });
        return true;
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.message });
        return false;
      }
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const resetPassword = async (resetData: PasswordResetRequest): Promise<boolean> => {
    console.log('AuthContext resetPassword called with:', resetData);
    
    try {
      const response = await authService.resetPassword(resetData);
      console.log('AuthService response:', response);
      
      if (response.success && response.data) {
        dispatch({ type: 'RESET_PASSWORD_SUCCESS', payload: response.data.user });
        return true;
      } else {
        const errorMessage = response.message || 'Password reset failed';
        console.error('Password reset failed:', errorMessage);
        dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
        return false;
      }
    } catch (error) {
      console.error('Password reset error in context:', error);
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: errorMessage
      });
      return false;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      dispatch({ type: 'SET_USER', payload: updatedUser });
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    resetPassword,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
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