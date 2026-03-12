import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { TOSS_SECRET_KEY } from '@/lib/toss'
import { readServerStore, updateServerKey } from '@/lib/server-store'
import { artworks as defaultArtworks } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { paymentKey, orderId, amount } = await request.json()

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: 'missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 1. Verify order exists and is pending
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: '이미 처리된 주문입니다.' }, { status: 400 })
    }

    // Verify amount matches
    if (order.amount !== amount) {
      return NextResponse.json({ error: '결제 금액이 일치하지 않습니다.' }, { status: 400 })
    }

    // 2. Confirm payment with Toss Payments API
    const confirmRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })

    const tossResult = await confirmRes.json()

    if (!confirmRes.ok) {
      // Payment failed - update order status
      await supabase
        .from('orders')
        .update({ status: 'failed', metadata: { ...order.metadata, tossError: tossResult } })
        .eq('id', orderId)

      return NextResponse.json(
        { error: tossResult.message || '결제 승인에 실패했습니다.' },
        { status: 400 }
      )
    }

    // 3. Payment confirmed - update order
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_key: paymentKey,
        payment_method: tossResult.method || tossResult.easyPay?.provider || '카드',
        receipt_url: tossResult.receipt?.url || null,
        paid_at: new Date().toISOString(),
        metadata: {
          ...order.metadata,
          tossPayment: {
            method: tossResult.method,
            card: tossResult.card,
            easyPay: tossResult.easyPay,
            totalAmount: tossResult.totalAmount,
          },
        },
      })
      .eq('id', orderId)

    // 4. Fulfill the order based on type
    if (order.order_type === 'artwork') {
      // Decrease stock
      const storeData = await readServerStore()
      const artworks = storeData?.artworks || defaultArtworks
      const updated = artworks.map((a: any) => {
        if (a.id === order.item_id && a.stock > 0) {
          return { ...a, stock: a.stock - 1, soldOut: a.stock - 1 <= 0 }
        }
        return a
      })
      await updateServerKey('artworks', updated)
    }
    // Points fulfillment is handled client-side after redirect

    return NextResponse.json({
      success: true,
      orderId,
      orderType: order.order_type,
      itemId: order.item_id,
      itemName: order.item_name,
      amount: order.amount,
      pointsAmount: order.points_amount,
      receiptUrl: tossResult.receipt?.url || null,
      paymentMethod: tossResult.method || tossResult.easyPay?.provider || '카드',
    })
  } catch (e) {
    console.error('[payment/confirm] error:', e)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
