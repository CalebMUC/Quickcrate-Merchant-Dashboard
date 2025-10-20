class TokenService {
  private readonly TOKEN_KEY = 'token'  // Changed to match what API client expects
  private readonly REFRESH_TOKEN_KEY = 'refresh_token'
  private readonly USER_KEY = 'user_data'

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      console.log('🔑 TokenService: Setting real token:', token.substring(0, 20) + '...');
      // Clear any old mock tokens first
      localStorage.removeItem('mock-jwt-token');
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(this.TOKEN_KEY);
      console.log('🔍 TokenService: Getting token:', token ? token.substring(0, 20) + '...' : 'null');
      return token;
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
      console.log('🧹 TokenService: Clearing all tokens (including mock tokens)');
      
      // Clear new tokens
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      
      // Clear any potential mock tokens
      localStorage.removeItem('mock-jwt-token');
      localStorage.removeItem('auth_token');
      
      // Clear any other variations that might exist
      Object.keys(localStorage).forEach(key => {
        if (key.includes('mock') || key.includes('token')) {
          console.log('🗑️ Removing potential mock token:', key);
          localStorage.removeItem(key);
        }
      });
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

  setUserData(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    }
  }

  getUserData(): any | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.USER_KEY)
      return userData ? JSON.parse(userData) : null
    }
    return null
  }
}

export const tokenService = new TokenService()

// Force clear any existing mock tokens on initialization
if (typeof window !== 'undefined') {
  console.log('🚀 Initializing TokenService - Clearing any existing mock tokens');
  tokenService.clearTokens();
}