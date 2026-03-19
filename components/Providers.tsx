'use client'

import { useEffect, useState } from 'react'
import { AuthProvider } from '@/lib/auth-context'
import { initStore, syncFromServer } from '@/lib/store'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initStore()

    // If localStorage already has cached data, render immediately
    const hasCache = !!localStorage.getItem('ples_artists')

    if (hasCache) {
      setReady(true)
      // Still sync in background for fresh data
      syncFromServer()
    } else {
      // First visit: must wait for server data
      syncFromServer().finally(() => setReady(true))
    }

    const handleFocus = () => { syncFromServer() }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  if (!ready) {
    return <div className="min-h-screen bg-white" />
  }

  return <AuthProvider>{children}</AuthProvider>
}
