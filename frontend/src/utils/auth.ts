interface Tokens {
  access: string
  refresh: string
}

interface AuthResponse {
  message: string
  tokens: Tokens
}

interface UserData {
  id: number
  first_name: string
  last_name: string
  username: string
  email: string
}

class AuthService {
  private static ACCESS_TOKEN_KEY = 'access_token'
  private static REFRESH_TOKEN_KEY = 'refresh_token'

  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  static isAuthenticated(): boolean {
    return this.getAccessToken() !== null
  }

  static async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      return null
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem(this.ACCESS_TOKEN_KEY, data.access_token)
        return data.access_token
      } else {
        this.clearTokens()
        return null
      }
    } catch (error) {
      console.error('Failed to refresh token:', error)
      this.clearTokens()
      return null
    }
  }

  static async logout(): Promise<void> {
    const accessToken = this.getAccessToken()
    
    if (accessToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        })
      } catch (error) {
        console.error('Logout request failed:', error)
      }
    }

    this.clearTokens()
  }

  static async authenticatedFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    let accessToken = this.getAccessToken()

    if (!accessToken) {
      throw new Error('No access token available')
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    }

    let response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      const newAccessToken = await this.refreshAccessToken()
      
      if (newAccessToken) {
        headers['Authorization'] = `Bearer ${newAccessToken}`
        response = await fetch(url, {
          ...options,
          headers,
        })
      } else {
        throw new Error('Session expired. Please log in again.')
      }
    }

    return response
  }

  static async getCurrentUser(): Promise<UserData | null> {
    try {
      const response = await this.authenticatedFetch('/api/users/me')
      
      if (response.ok) {
        const data = await response.json()
        return data
      }
      
      return null
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  }
}

export default AuthService
export type { Tokens, AuthResponse, UserData }

