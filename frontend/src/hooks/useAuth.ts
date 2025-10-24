import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthService from '../utils/auth'
import type { UserData } from '../utils/auth'

interface UseAuthReturn {
  user: UserData | null
  loading: boolean
  isAuthenticated: boolean
  login: (accessToken: string, refreshToken: string) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const navigate = useNavigate()

  const isAuthenticated = AuthService.isAuthenticated()

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated) {
        try {
          const userData = await AuthService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          console.error('Failed to fetch user:', error)
          setUser(null)
        }
      }
      setLoading(false)
    }

    fetchUser()
  }, [isAuthenticated])

  const login = (accessToken: string, refreshToken: string) => {
    AuthService.setTokens(accessToken, refreshToken)
    refreshUser()
  }

  const logout = async () => {
    await AuthService.logout()
    setUser(null)
    navigate('/signin')
  }

  const refreshUser = async () => {
    setLoading(true)
    try {
      const userData = await AuthService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      setUser(null)
    }
    setLoading(false)
  }

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  }
}

