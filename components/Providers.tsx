'use client'

import { useEffect, useState } from 'react'
import { AuthProvider } from '@/lib/auth-context'
import { initStore, syncFromServer } from '@/lib/store'

export default function Providers({ children }: { children: React.ReactNode }) {
  // Start as true so SSR renders full HTML for crawlers
  const [ready, setReady] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    initStore()

    const hasCache = !!localStorage.getItem('ples_artists')

    if (hasCache) {
      setHydrated(true)
      syncFromServer()
    } else {
      // First visit: sync then mark hydrated
      setReady(false)
      syncFromServer().finally(() => {
        setReady(true)
        setHydrated(true)
      })
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
