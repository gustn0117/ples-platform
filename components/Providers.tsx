'use client'

import { useEffect, useState } from 'react'
import { AuthProvider } from '@/lib/auth-context'
import { initStore, syncFromServer } from '@/lib/store'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initStore()
    // Fetch shared data from server (so all domains see the same data)
    syncFromServer().finally(() => setReady(true))

    const handleFocus = () => {
      syncFromServer().then(() => {
        window.dispatchEvent(new Event('ples-store-updated'))
      })
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  if (!ready) {
    return <div className="min-h-screen bg-white" />
  }

  return <AuthProvider>{children}</AuthProvider>
}
