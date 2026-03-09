'use client'

import { useEffect } from 'react'
import { AuthProvider } from '@/lib/auth-context'
import { initStore } from '@/lib/store'

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initStore()
  }, [])

  return <AuthProvider>{children}</AuthProvider>
}
