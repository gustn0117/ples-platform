import { createServiceClient } from './supabase-server'

const TABLE = 'store'

// Returns { data, error } instead of null — so callers can distinguish
// "DB has no data" from "DB connection failed"
export async function readServerStore(): Promise<{ data: Record<string, any> | null; error: boolean }> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase.from(TABLE).select('key, value')
    if (error) {
      console.error('[readServerStore] Supabase error:', error)
      return { data: null, error: true }
    }
    if (!data || data.length === 0) {
      return { data: null, error: false } // DB is empty, not an error
    }
    const result: Record<string, any> = {}
    for (const row of data) {
      result[row.key] = row.value
    }
    return { data: result, error: false }
  } catch (e) {
    console.error('[readServerStore] Connection error:', e)
    return { data: null, error: true }
  }
}

export async function writeServerStore(data: Record<string, any>) {
  const supabase = createServiceClient()
  const rows = Object.entries(data).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }))
  await supabase.from(TABLE).upsert(rows, { onConflict: 'key' })
}

export async function updateServerKey(key: string, value: any) {
  const supabase = createServiceClient()
  await supabase.from(TABLE).upsert(
    { key, value, updated_at: new Date().toISOString() },
    { onConflict: 'key' }
  )
}
