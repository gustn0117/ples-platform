'use client'

import { useEffect, useState } from 'react'
import { AuthProvider } from '@/lib/auth-context'
import { initStore, syncFromServer } from '@/lib/store'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [, setSyncVersion] = useState(0)

  useEffect(() => {
    initStore()

    // If we have cached server data, show immediately; otherwise wait for server
    const hasCache = !!localStorage.getItem('ples_artists')
    if (hasCache) {
      setReady(true)
    }
    syncFromServer().finally(() => setReady(true))

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
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-3 border-gray-200 border-t-gray-800 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">로딩 중...</p>
        </div>
      </div>
    )
  }

  return <AuthProvider>{children}</AuthProvider>
}
