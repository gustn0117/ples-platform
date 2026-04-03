import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { getTossAuthHeader } from '@/lib/toss'
import { readServerStore, updateServerKey } from '@/lib/server-store'
import { artworks as defaultArtworks } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { eventType, data } = body

    if (!eventType || !data) {
      return NextResponse.json({ success: true }) // 200 응답 필수
    }

    if (eventType === 'PAYMENT_STATUS_CHANGED') {
      const { paymentKey, orderId } = data

      if (!paymentKey || !orderId) {
        return NextResponse.json({ success: true })
      }

      // 방어적으로 토스 API에서 실제 결제 상태 조회
      const tossRes = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}`, {
        headers: { Authorization: getTossAuthHeader() },
      })

      if (!tossRes.ok) {
        console.error('[webhook] Failed to query Toss payment:', await tossRes.text())
        return NextResponse.json({ success: true })
      }

      const tossPayment = await tossRes.json()
      const supabase = createServiceClient()

      // 주문 조회
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (!order) {
        console.error('[webhook] Order not found:', orderId)
        return NextResponse.json({ success: true })
      }

      // 결제 완료 (DONE)
      if (tossPayment.status === 'DONE' && order.status === 'pending') {
        await supabase
          .from('orders')
          .update({
            status: 'paid',
            payment_key: paymentKey,
            payment_method: tossPayment.method || tossPayment.easyPay?.provider || '카드',
            receipt_url: tossPayment.receipt?.url || null,
            paid_at: new Date().toISOString(),
            metadata: {
              ...order.metadata,
              tossPayment: {
                method: tossPayment.method,
                card: tossPayment.card,
                easyPay: tossPayment.easyPay,
                totalAmount: tossPayment.totalAmount,
              },
              confirmedVia: 'webhook',
            },
          })
          .eq('id', orderId)
          .eq('status', 'pending') // 원자적 업데이트

        // 작품 구매 시 재고 차감
        if (order.order_type === 'artwork' && order.item_id) {
          const storeResult = await readServerStore()
          const artworks = storeResult.data?.artworks || defaultArtworks
          const updated = artworks.map((a: any) => {
            if (a.id === order.item_id && a.stock > 0) {
              return { ...a, stock: a.stock - 1, soldOut: a.stock - 1 <= 0 }
            }
            return a
          })
          await updateServerKey('artworks', updated)
        }
      }

      // 결제 취소 (CANCELED)
      if (tossPayment.status === 'CANCELED' && order.status === 'paid') {
        await supabase
          .from('orders')
          .update({
            status: 'cancelled',
            metadata: {
              ...order.metadata,
              cancelledVia: 'webhook',
              cancels: tossPayment.cancels,
            },
          })
          .eq('id', orderId)
      }

      // 부분 취소 (PARTIAL_CANCELED)
      if (tossPayment.status === 'PARTIAL_CANCELED' && order.status === 'paid') {
        await supabase
          .from('orders')
          .update({
            status: 'partial_refund',
            metadata: {
              ...order.metadata,
              cancelledVia: 'webhook',
              cancels: tossPayment.cancels,
            },
          })
          .eq('id', orderId)
      }
    }

    // 10초 내 200 응답 필수
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[webhook] error:', e)
    // 에러가 나도 200 응답 (재시도 방지)
    return NextResponse.json({ success: true })
  }
}
