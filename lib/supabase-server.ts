import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://api.hsweb.pics'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTc5OTUzNTYwMH0.xTNteRFphY3F9W2PPWOwCQ9PDXD05ySRqkJu5d4Cej0'

// Next.js 14 App Router auto-caches all fetch() calls — including those made
// inside supabase-js. That caused stale vote counts: writes succeeded but
// subsequent reads returned cached responses. Override with cache: 'no-store'.
const noCacheFetch: typeof fetch = (url, init) =>
  fetch(url, { ...init, cache: 'no-store' })

export function createServiceClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    db: { schema: 'ples_platform' },
    global: { fetch: noCacheFetch },
  })
}
