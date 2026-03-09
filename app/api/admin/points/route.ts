import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

async function verifyAdmin(token: string): Promise<boolean> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: 'ples_platform' } }
  )
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return false

  const serviceClient = createServiceClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return profile?.is_admin === true
}

// POST: Add or deduct points
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token || !(await verifyAdmin(token))) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const supabase = createServiceClient()
  const body = await request.json()
  const { userId, amount, reason } = body

  if (!userId || amount === undefined || !reason) {
    return NextResponse.json({ error: '필수 파라미터가 없습니다.' }, { status: 400 })
  }

  // Get current points
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('points, nickname')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
  }

  const newPoints = (profile.points ?? 0) + amount
  if (newPoints < 0) {
    return NextResponse.json({ error: '포인트가 부족합니다.' }, { status: 400 })
  }

  // Update profile points
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ points: newPoints })
    .eq('id', userId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Create transaction record
  const { error: txError } = await supabase
    .from('points_transactions')
    .insert({
      user_id: userId,
      amount,
      reason,
      balance_after: newPoints,
    })

  if (txError) {
    console.error('포인트 트랜잭션 기록 실패:', txError.message)
  }

  return NextResponse.json({
    success: true,
    nickname: profile.nickname,
    previousPoints: profile.points ?? 0,
    newPoints,
    amount,
  })
}
