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

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token || !(await verifyAdmin(token))) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const supabase = createServiceClient()

  const [usersRes, artistsRes, votesRes, revenueRes, purchasesRes, userVotesRes] =
    await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('artists').select('*', { count: 'exact', head: true }),
      supabase.from('votes').select('*', { count: 'exact', head: true }),
      supabase.from('purchases').select('amount'),
      supabase
        .from('purchases')
        .select('id, amount, payment_method, created_at, profiles(nickname), artworks(title)')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('user_votes')
        .select('id, created_at, profiles(nickname), votes(title)')
        .order('created_at', { ascending: false })
        .limit(10),
    ])

  const totalRevenue = (revenueRes.data ?? []).reduce(
    (sum: number, row: { amount: number }) => sum + (row.amount ?? 0),
    0
  )

  return NextResponse.json({
    stats: {
      userCount: usersRes.count ?? 0,
      artistCount: artistsRes.count ?? 0,
      voteCount: votesRes.count ?? 0,
      totalRevenue,
    },
    recentPurchases: purchasesRes.data ?? [],
    recentVotes: userVotesRes.data ?? [],
  })
}
