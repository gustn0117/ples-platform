import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// GET /api/user-data?userId=xxx&key=yyy (or no key for all)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const supabase = createServiceClient()
  const key = searchParams.get('key')

  if (key) {
    const { data } = await supabase
      .from('user_data')
      .select('value')
      .eq('user_id', userId)
      .eq('key', key)
      .maybeSingle()

    return NextResponse.json({ value: data?.value ?? null })
  }

  // Get all user data
  const { data } = await supabase
    .from('user_data')
    .select('key, value')
    .eq('user_id', userId)

  const result: Record<string, any> = {}
  for (const row of data || []) {
    result[row.key] = row.value
  }
  return NextResponse.json(result)
}

// PUT /api/user-data - upsert a key
export async function PUT(request: Request) {
  const { userId, key, value } = await request.json()
  if (!userId || !key) return NextResponse.json({ error: 'userId and key required' }, { status: 400 })

  const supabase = createServiceClient()
  await supabase.from('user_data').upsert(
    { user_id: userId, key, value, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,key' }
  )

  return NextResponse.json({ success: true })
}

// POST /api/user-data - add star history + update points
export async function POST(request: Request) {
  const { userId, type, category, amount } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const supabase = createServiceClient()

  // Get current points
  const { data: user } = await supabase
    .from('users')
    .select('points')
    .eq('id', userId)
    .single()

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const newBalance = user.points + amount

  // Update points
  await supabase
    .from('users')
    .update({ points: newBalance })
    .eq('id', userId)

  // Add star history
  await supabase.from('star_history').insert({
    user_id: userId,
    type: amount > 0 ? 'earn' : 'use',
    category,
    amount,
    balance: newBalance,
  })

  return NextResponse.json({ success: true, balance: newBalance })
}
