'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

export interface Profile {
  id: string
  nickname: string
  email: string
  avatar_url: string | null
  points: number
  is_admin: boolean
  created_at: string
}

interface MockUser {
  id: string
  email: string
  nickname: string
  password: string
  realName?: string
  residentNumber?: string
  phone?: string
  created_at?: string
  status?: 'active' | 'suspended'
}

// ── Admin helpers (exported for admin pages) ──

export function getAllUsers(): MockUser[] {
  return getStoredUsers()
}

export function updateUser(userId: string, updates: Partial<Omit<MockUser, 'id'>>) {
  const users = getStoredUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx === -1) return false
  users[idx] = { ...users[idx], ...updates }
  saveUsers(users)
  return true
}

export function deleteUser(userId: string) {
  const users = getStoredUsers()
  const filtered = users.filter((u) => u.id !== userId)
  if (filtered.length === users.length) return false
  saveUsers(filtered)
  // Also clear session if deleted user is logged in
  const session = getStoredSession()
  if (session?.id === userId) {
    localStorage.removeItem(SESSION_KEY)
  }
  return true
}

export function findPasswordByEmail(email: string): { found: boolean; password?: string } {
  const users = getStoredUsers()
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
  if (!user) return { found: false }
  return { found: true, password: user.password }
}

export function findEmailByPhone(phone: string): { found: boolean; email?: string } {
  const users = getStoredUsers()
  const cleaned = phone.replace(/[^0-9]/g, '')
  const user = users.find((u) => u.phone?.replace(/[^0-9]/g, '') === cleaned)
  if (!user) return { found: false }
  return { found: true, email: user.email }
}

export type { MockUser }

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

const USERS_KEY = 'ples_mock_users'
const SESSION_KEY = 'ples_mock_session'

function getStoredUsers(): MockUser[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveUsers(users: MockUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

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

function userToProfile(u: MockUser): Profile {
  return {
    id: u.id,
    nickname: u.nickname,
    email: u.email,
    avatar_url: null,
    points: 0,
    is_admin: false,
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
      setProfile(userToProfile(stored))
    }
  }, [])

  useEffect(() => {
    const stored = getStoredSession()
    if (stored) {
      const u = { id: stored.id, email: stored.email }
      setUser(u)
      setSession({ user: u, access_token: 'mock-token' })
      setProfile(userToProfile(stored))
    }
    setLoading(false)
  }, [])

  const login = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()
    const users = getStoredUsers()
    const found = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.password === trimmedPassword
    )

    if (!found) {
      return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
    }

    const u = { id: found.id, email: found.email }
    setUser(u)
    setSession({ user: u, access_token: 'mock-token' })
    setProfile(userToProfile(found))
    saveSession(found)

    return { error: null }
  }

  const signup = async (
    email: string,
    password: string,
    nickname: string,
    extra?: { realName?: string; residentNumber?: string; phone?: string }
  ): Promise<{ error: string | null }> => {
    const users = getStoredUsers()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    if (users.find((u) => u.email.toLowerCase() === trimmedEmail)) {
      return { error: '이미 가입된 이메일입니다.' }
    }

    const newUser: MockUser = {
      id: crypto.randomUUID(),
      email: trimmedEmail,
      nickname: nickname.trim(),
      password: trimmedPassword,
      realName: extra?.realName,
      residentNumber: extra?.residentNumber,
      phone: extra?.phone,
      created_at: new Date().toISOString(),
      status: 'active',
    }

    users.push(newUser)
    saveUsers(users)

    return { error: null }
  }

  const logout = async () => {
    setUser(null)
    setProfile(null)
    setSession(null)
    saveSession(null)
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
