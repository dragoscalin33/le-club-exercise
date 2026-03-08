import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import apiClient from '../api/client'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem('token')
      .then(async (token) => {
        if (!token) return
        const res = await apiClient.get<User>('/auth/me')
        setUser(res.data)
      })
      .catch(() => AsyncStorage.removeItem('token'))
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<{ accessToken: string }>('/auth/login', { email, password })
    await AsyncStorage.setItem('token', res.data.accessToken)
    const me = await apiClient.get<User>('/auth/me')
    setUser(me.data)
  }

  const register = async (email: string, password: string) => {
    const res = await apiClient.post<{ accessToken: string }>('/auth/register', { email, password })
    await AsyncStorage.setItem('token', res.data.accessToken)
    const me = await apiClient.get<User>('/auth/me')
    setUser(me.data)
  }

  const logout = async () => {
    await AsyncStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
