import React, { createContext, useContext, useState } from 'react'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  login: (role: 'ADMIN' | 'RECORDER' | 'VIEWER') => void
  logout: () => void
}

const DEFAULT_USER: User = {
  id: 1,
  username: 'lanchenba',
  email: 'thoudamlanchenba32@gmail.com',
  role: 'ADMIN',
  first_name: 'Lanchenba',
  last_name: 'Thoudam',
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dairytrack_user')
    return saved ? JSON.parse(saved) : DEFAULT_USER
  })

  const login = (role: 'ADMIN' | 'RECORDER' | 'VIEWER') => {
    const newUser: User = {
      id: role === 'ADMIN' ? 1 : role === 'RECORDER' ? 2 : 3,
      username: role === 'ADMIN' ? 'owner' : role === 'RECORDER' ? 'recorder' : 'viewer',
      email: `${role.toLowerCase()}@dairyfarm.local`,
      role,
      first_name: role === 'ADMIN' ? 'Farm' : role === 'RECORDER' ? 'Milking' : 'Guest',
      last_name: role === 'ADMIN' ? 'Owner' : role === 'RECORDER' ? 'Staff' : 'Viewer',
    }
    setUser(newUser)
    localStorage.setItem('dairytrack_user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('dairytrack_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
