'use client'

import { useEffect, useState } from 'react'
import { AuthProvider } from '@/lib/auth-context'
import { initStore, syncFromServer } from '@/lib/store'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [, setSyncVersion] = useState(0)

  useEffect(() => {
    initStore()

    // If localStorage already has cached data, render immediately
    const hasCache = !!localStorage.getItem('ples_artists')

    if (hasCache) {
      setReady(true)
      syncFromServer()
    } else {
      syncFromServer().finally(() => setReady(true))
    }

    // Re-render all children when server data arrives
    const handleSynced = () => setSyncVersion((v) => v + 1)
    const handleFocus = () => { syncFromServer() }
    window.addEventListener('ples-data-synced', handleSynced)
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('ples-data-synced', handleSynced)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  if (!ready) {
    return <div className="min-h-screen bg-white" />
  }

  return <AuthProvider>{children}</AuthProvider>
}
