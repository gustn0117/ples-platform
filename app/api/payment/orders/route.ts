import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// POST: Create a new pending order
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, userEmail, userId, orderType, itemId, itemName, amount, pointsAmount, metadata } = body

    if (!orderId || !userEmail || !orderType || !itemName || !amount) {
      return NextResponse.json({ error: 'missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase.from('orders').insert({
      id: orderId,
      user_email: userEmail,
      user_id: userId || null,
      order_type: orderType,
      item_id: itemId || null,
      item_name: itemName,
      amount,
      points_amount: pointsAmount || null,
      status: 'pending',
      metadata: metadata || {},
    })

    if (error) {
      console.error('[orders/POST] insert error:', error)
      return NextResponse.json({ error: 'failed to create order' }, { status: 500 })
    }

    return NextResponse.json({ success: true, orderId })
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 })
  }
}

// GET: Fetch orders (admin or user-specific)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = createServiceClient()
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (email) query = query.eq('user_email', email)
    if (status) query = query.eq('status', status)

    const { data, error } = await query

    if (error) {
      console.error('[orders/GET] error:', error)
      return NextResponse.json({ error: 'failed to fetch orders' }, { status: 500 })
    }

    return NextResponse.json(data || [], {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
