'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { setCurrentUserId } from './store'

export interface Profile {
  id: string
  nickname: string
  email: string
  avatar_url: string | null
  points: number
  is_admin: boolean
  created_at: string
}

export interface MockUser {
  id: string
  email: string
  nickname: string
  password: string
  real_name?: string
  realName?: string
  resident_number?: string
  residentNumber?: string
  phone?: string
  points?: number
  created_at?: string
  status?: 'active' | 'suspended'
  is_admin?: boolean
}

const SESSION_KEY = 'ples_mock_session'

// ── Admin helpers (exported for admin pages) ──

export async function getAllUsersAsync(): Promise<MockUser[]> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get-all-users' }),
    })
    const data = await res.json()
    return (data.users || []).map((u: any) => ({
      ...u,
      realName: u.real_name,
      residentNumber: u.resident_number,
    }))
  } catch {
    return []
  }
}

// Synchronous version for backwards compatibility - returns cached users
let _cachedUsers: MockUser[] = []
export function getAllUsers(): MockUser[] {
  // Trigger async fetch to update cache
  getAllUsersAsync().then(users => { _cachedUsers = users })
  return _cachedUsers
}

export async function updateUserAsync(userId: string, updates: Partial<Omit<MockUser, 'id'>>): Promise<boolean> {
  // Map frontend field names to DB column names
  const dbUpdates: Record<string, any> = {}
  if (updates.nickname !== undefined) dbUpdates.nickname = updates.nickname
  if (updates.email !== undefined) dbUpdates.email = updates.email
  if (updates.password !== undefined) dbUpdates.password = updates.password
  if (updates.realName !== undefined) dbUpdates.real_name = updates.realName
  if (updates.real_name !== undefined) dbUpdates.real_name = updates.real_name
  if (updates.residentNumber !== undefined) dbUpdates.resident_number = updates.residentNumber
  if (updates.resident_number !== undefined) dbUpdates.resident_number = updates.resident_number
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone
  if (updates.status !== undefined) dbUpdates.status = updates.status
  if (updates.points !== undefined) dbUpdates.points = updates.points

  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update-user', userId, updates: dbUpdates }),
    })
    const data = await res.json()
    return data.success === true
  } catch {
    return false
  }
}

export function updateUser(userId: string, updates: Partial<Omit<MockUser, 'id'>>): boolean {
  updateUserAsync(userId, updates)
  return true
}

export async function deleteUserAsync(userId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete-user', userId }),
    })
    const data = await res.json()
    // Clear session if deleted user is logged in
    const session = getStoredSession()
    if (session?.id === userId) {
      localStorage.removeItem(SESSION_KEY)
    }
    return data.success === true
  } catch {
    return false
  }
}

export function deleteUser(userId: string): boolean {
  deleteUserAsync(userId)
  return true
}

export async function findPasswordByEmailAsync(email: string): Promise<{ found: boolean; password?: string }> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'find-password', email }),
    })
    return await res.json()
  } catch {
    return { found: false }
  }
}

export function findPasswordByEmail(email: string): { found: boolean; password?: string } {
  // For backwards compat - caller should use async version
  return { found: false }
}

export async function findEmailByPhoneAsync(phone: string): Promise<{ found: boolean; email?: string }> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'find-email', phone }),
    })
    return await res.json()
  } catch {
    return { found: false }
  }
}

export function findEmailByPhone(phone: string): { found: boolean; email?: string } {
  return { found: false }
}

// ── Auth Context ──

interface AuthContextType {
  user: { id: string; email: string } | null
  profile: Profile | null
  session: { user: { id: string; email: string }; access_token: string } | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error: string | null }>
  signup: (
    email: string,
    password: string,
    nickname: string,
    extra?: { realName?: string; residentNumber?: string; phone?: string }
  ) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getStoredSession(): MockUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(user: MockUser | null) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

function userToProfile(u: any): Profile {
  return {
    id: u.id,
    nickname: u.nickname,
    email: u.email,
    avatar_url: null,
    points: u.points || 0,
    is_admin: u.is_admin || false,
    created_at: u.created_at || new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<{ user: { id: string; email: string }; access_token: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    const stored = getStoredSession()
    if (stored) {
      // Fetch latest user data from DB
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get-user', userId: stored.id }),
        })
        const data = await res.json()
        if (data.user) {
          setProfile(userToProfile(data.user))
          saveSession({ ...stored, points: data.user.points })
        }
      } catch {
        setProfile(userToProfile(stored))
      }
    }
  }, [])

  useEffect(() => {
    const stored = getStoredSession()
    if (stored) {
      const u = { id: stored.id, email: stored.email }
      setUser(u)
      setSession({ user: u, access_token: 'mock-token' })
      setProfile(userToProfile(stored))
      setCurrentUserId(stored.id)
      // Also refresh from DB
      refreshProfile()
    }
    setLoading(false)
  }, [refreshProfile])

  const login = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      })
      const data = await res.json()

      if (data.error) return { error: data.error }

      const found = data.user
      const u = { id: found.id, email: found.email }
      setUser(u)
      setSession({ user: u, access_token: 'mock-token' })
      setProfile(userToProfile(found))
      saveSession(found)
      setCurrentUserId(found.id)

      return { error: null }
    } catch {
      return { error: '서버 연결에 실패했습니다.' }
    }
  }

  const signup = async (
    email: string,
    password: string,
    nickname: string,
    extra?: { realName?: string; residentNumber?: string; phone?: string }
  ): Promise<{ error: string | null }> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          email,
          password,
          nickname,
          realName: extra?.realName,
          residentNumber: extra?.residentNumber,
          phone: extra?.phone,
        }),
      })
      const data = await res.json()

      if (data.error) return { error: data.error }

      return { error: null }
    } catch {
      return { error: '서버 연결에 실패했습니다.' }
    }
  }

  const logout = async () => {
    setUser(null)
    setProfile(null)
    setSession(null)
    saveSession(null)
    setCurrentUserId(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        login,
        signup,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
