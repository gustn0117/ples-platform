import { createServiceClient } from './supabase-server'

const TABLE = 'store'

export async function readServerStore(): Promise<Record<string, any> | null> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase.from(TABLE).select('key, value')
    if (error || !data || data.length === 0) return null
    const result: Record<string, any> = {}
    for (const row of data) {
      result[row.key] = row.value
    }
    return result
  } catch {
    return null
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
