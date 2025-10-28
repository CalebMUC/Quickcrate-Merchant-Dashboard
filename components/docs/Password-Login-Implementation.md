# Merchant Dashboard Login Implementation Guide

## Overview
This document provides a comprehensive guide for implementing the Merchant Dashboard login system, including temporary password handling, password reset functionality, and secure authentication flow.

## System Architecture

### Frontend Components
- **Login Page**: Initial authentication interface
- **Password Reset Page**: Temporary password reset functionality  
- **Dashboard**: Protected merchant dashboard
- **Authentication Context**: Global authentication state management

### Authentication Flow
1. **Initial Login**: Merchant receives email with temporary credentials
2. **Temporary Password Login**: Merchant logs in with temporary password
3. **Forced Password Reset**: System requires immediate password change
4. **Dashboard Access**: Full access granted after password reset
5. **Session Management**: Secure session handling with JWT tokens

## Frontend Implementation

### 1. Project Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── PasswordResetForm.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── AuthWrapper.tsx
│   ├── ui/
│   │   ├── Input.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Alert.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Layout.tsx
├── contexts/
│   └── AuthContext.tsx
├── services/
│   ├── authService.ts
│   ├── apiClient.ts
│   └── tokenService.ts
├── types/
│   ├── auth.ts
│   └── api.ts
├── pages/
│   ├── login/
│   │   ├── index.tsx
│   │   └── reset-password.tsx
│   ├── dashboard/
│   │   └── index.tsx
│   └── _app.tsx
└── utils/
    ├── validation.ts
    ├── storage.ts
    └── constants.ts
```

### 2. Type Definitions

```typescript
// types/auth.ts
export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  merchantId: string
  businessName: string
  isTemporaryPassword: boolean
  role: string
  emailVerified: boolean
}

export interface AuthResponse {
  success: boolean
  data?: {
    user: User
    token: string
    refreshToken: string
    expiresIn: number
    requiresPasswordReset: boolean
  }
  message: string
  errors?: string[]
}

export interface PasswordResetRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  requiresPasswordReset: boolean
}
```

### 3. Authentication Service

```typescript
// services/authService.ts
import { apiClient } from './apiClient'
import { tokenService } from './tokenService'
import type { LoginCredentials, AuthResponse, PasswordResetRequest } from '@/types/auth'

class AuthService {
  private readonly baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7270/api'

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
      
      if (response.data.success && response.data.data) {
        // Store tokens securely
        tokenService.setToken(response.data.data.token)
        tokenService.setRefreshToken(response.data.data.refreshToken)
        
        // Set up auto-refresh
        this.setupTokenRefresh(response.data.data.expiresIn)
      }
      
      return response.data
    } catch (error) {
      console.error('Login failed:', error)
      throw this.handleError(error)
    }
  }

  async resetPassword(resetData: PasswordResetRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/reset-password', resetData)
      
      if (response.data.success) {
        // Update user state to remove temporary password flag
        const updatedUser = { ...response.data.data?.user, isTemporaryPassword: false }
        // Update stored user data
      }
      
      return response.data
    } catch (error) {
      console.error('Password reset failed:', error)
      throw this.handleError(error)
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = tokenService.getRefreshToken()
      if (!refreshToken) return false

      const response = await apiClient.post<AuthResponse>('/auth/refresh', {
        refreshToken
      })

      if (response.data.success && response.data.data) {
        tokenService.setToken(response.data.data.token)
        this.setupTokenRefresh(response.data.data.expiresIn)
        return true
      }

      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.logout()
      return false
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      tokenService.clearTokens()
      this.clearTokenRefresh()
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<{ data: User }>('/auth/me')
      return response.data.data
    } catch (error) {
      console.error('Get current user failed:', error)
      return null
    }
  }

  private setupTokenRefresh(expiresIn: number): void {
    // Refresh token 5 minutes before expiry
    const refreshTime = (expiresIn - 300) * 1000
    
    this.clearTokenRefresh()
    this.refreshTimer = setTimeout(() => {
      this.refreshToken()
    }, refreshTime)
  }

  private clearTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  private refreshTimer: NodeJS.Timeout | null = null

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message)
    }
    return new Error('An unexpected error occurred')
  }
}

export const authService = new AuthService()
```

### 4. Authentication Context

```typescript
// contexts/AuthContext.tsx
'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '@/services/authService'
import { tokenService } from '@/services/tokenService'
import type { AuthState, User, LoginCredentials, PasswordResetRequest } from '@/types/auth'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
  resetPassword: (resetData: PasswordResetRequest) => Promise<boolean>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
        token: tokenService.getToken(),
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
      return { ...state, user: action.payload, isAuthenticated: true }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    default:
      return state
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenService.getToken()
      
      if (token) {
        try {
          const user = await authService.getCurrentUser()
          if (user) {
            dispatch({ type: 'SET_USER', payload: user })
          } else {
            await logout()
          }
        } catch (error) {
          await logout()
        }
      }
      
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' })
    
    try {
      const response = await authService.login(credentials)
      
      if (response.success && response.data) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data.user,
            requiresPasswordReset: response.data.requiresPasswordReset
          }
        })
        return true
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.message })
        return false
      }
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      })
      return false
    }
  }

  const logout = async (): Promise<void> => {
    await authService.logout()
    dispatch({ type: 'LOGOUT' })
  }

  const resetPassword = async (resetData: PasswordResetRequest): Promise<boolean> => {
    try {
      const response = await authService.resetPassword(resetData)
      
      if (response.success && response.data) {
        dispatch({ type: 'RESET_PASSWORD_SUCCESS', payload: response.data.user })
        return true
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.message })
        return false
      }
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'Password reset failed' 
      })
      return false
    }
  }

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    resetPassword,
    clearError
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### 5. Login Form Component

```typescript
// components/auth/LoginForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const { login, isLoading, error, clearError, requiresPasswordReset } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  useEffect(() => {
    if (requiresPasswordReset) {
      router.push('/login/reset-password')
    }
  }, [requiresPasswordReset, router])

  const onSubmit = async (data: LoginFormData) => {
    clearError()
    const success = await login(data)
    
    if (success && !requiresPasswordReset) {
      router.push('/dashboard')
    }
  }

  const isFormLoading = isLoading || isSubmitting

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Merchant Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your merchant dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="merchant@example.com"
                  className="pl-9"
                  disabled={isFormLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-9 pr-9"
                  disabled={isFormLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  disabled={isFormLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isFormLoading}
            >
              {isFormLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              First time logging in? Use the temporary password sent to your email.
            </p>
            <p className="mt-1">
              You'll be prompted to create a new password after login.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 6. Password Reset Form Component

```typescript
// components/auth/PasswordResetForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2, Lock, CheckCircle } from 'lucide-react'

const passwordResetSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type PasswordResetFormData = z.infer<typeof passwordResetSchema>

export function PasswordResetForm() {
  const router = useRouter()
  const { resetPassword, user, error, clearError } = useAuth()
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema)
  })

  const newPassword = watch('newPassword')

  const onSubmit = async (data: PasswordResetFormData) => {
    clearError()
    const success = await resetPassword(data)
    
    if (success) {
      router.push('/dashboard')
    }
  }

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: 'No password', color: 'bg-gray-200' }
    
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[@$!%*?&]/.test(password)) score++
    
    const strength = (score / 5) * 100
    
    if (strength < 40) return { strength, label: 'Weak', color: 'bg-red-500' }
    if (strength < 80) return { strength, label: 'Good', color: 'bg-yellow-500' }
    return { strength, label: 'Strong', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create New Password</CardTitle>
          <CardDescription>
            Welcome {user?.businessName}! Please create a new secure password.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                For security, you must create a new password before accessing your dashboard.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium leading-none">
                Temporary Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('currentPassword')}
                  id="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  placeholder="Enter temporary password"
                  className="pl-9 pr-9"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium leading-none">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('newPassword')}
                  id="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  placeholder="Create new password"
                  className="pl-9 pr-9"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {newPassword && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Password strength:</span>
                    <span className={`font-medium ${
                      passwordStrength.label === 'Strong' ? 'text-green-600' :
                      passwordStrength.label === 'Good' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
              
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className="pl-9 pr-9"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
              <p className="font-medium">Password requirements:</p>
              <ul className="text-muted-foreground space-y-0.5 ml-2">
                <li>• At least 8 characters long</li>
                <li>• Contains uppercase and lowercase letters</li>
                <li>• Contains at least one number</li>
                <li>• Contains at least one special character</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Password...
                </>
              ) : (
                'Create Password & Continue'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 7. Protected Route Component

```typescript
// components/auth/ProtectedRoute.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, requiresPasswordReset } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push('/login')
      } else if (isAuthenticated && requiresPasswordReset) {
        router.push('/login/reset-password')
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, requiresPasswordReset, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (isAuthenticated && requiresPasswordReset) {
    return null
  }

  return <>{children}</>
}
```

### 8. Token Service

```typescript
// services/tokenService.ts
class TokenService {
  private readonly TOKEN_KEY = 'auth_token'
  private readonly REFRESH_TOKEN_KEY = 'refresh_token'
  private readonly USER_KEY = 'user_data'

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token)
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY)
    }
    return null
  }

  setRefreshToken(refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
    }
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY)
    }
    return null
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem(this.REFRESH_TOKEN_KEY)
      localStorage.removeItem(this.USER_KEY)
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch {
      return true
    }
  }
}

export const tokenService = new TokenService()
```

## Security Considerations

### 1. Password Security
- **Strong Password Policy**: Enforce complex password requirements
- **Password Hashing**: Use bcrypt or similar for secure hashing
- **Temporary Password Expiry**: Set expiration time for temporary passwords
- **Rate Limiting**: Prevent brute force attacks

### 2. Session Management
- **JWT Security**: Use short-lived access tokens with refresh tokens
- **Secure Storage**: Store tokens securely (httpOnly cookies recommended for production)
- **Session Timeout**: Implement automatic logout after inactivity
- **Token Rotation**: Rotate refresh tokens on each use

### 3. API Security
- **HTTPS Only**: Enforce HTTPS for all authentication endpoints
- **CORS Configuration**: Properly configure CORS for frontend domain
- **Input Validation**: Validate all inputs on both client and server
- **Error Handling**: Don't expose sensitive information in error messages

## User Experience Flow

### 1. Initial Login
1. Merchant receives email with temporary credentials
2. Merchant visits login page
3. Enters email and temporary password
4. System validates credentials
5. Redirected to password reset page

### 2. Password Reset
1. Displays welcome message with business name
2. Shows password strength indicator
3. Validates password requirements in real-time
4. Confirms password match
5. Updates password and completes login

### 3. Dashboard Access
1. Full access to merchant dashboard
2. Normal session management
3. Automatic token refresh
4. Secure logout capability

## Testing Strategy

### 1. Unit Tests
- Authentication service methods
- Password validation logic
- Token handling functions
- Form validation schemas

### 2. Integration Tests
- Login flow end-to-end
- Password reset workflow
- Protected route behavior
- Token refresh mechanism

### 3. Security Tests
- Password complexity validation
- Session timeout behavior
- Token expiry handling
- Rate limiting verification

This implementation provides a secure, user-friendly authentication system with proper temporary password handling and robust security measures.