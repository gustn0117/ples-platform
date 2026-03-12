'use client'

import { useEffect } from 'react'
import { AuthProvider } from '@/lib/auth-context'
import { initStore, syncFromServer } from '@/lib/store'

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initStore()
    syncFromServer()

    const handleFocus = () => { syncFromServer() }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  return <AuthProvider>{children}</AuthProvider>
}
