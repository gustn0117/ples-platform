import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { getTossAuthHeader } from '@/lib/toss'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // 관리자 인증 확인
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const supabase = createServiceClient()

    // 토큰에서 사용자 정보 파싱 (mock auth 시스템)
    let adminUserId: string | null = null
    try {
      const parsed = JSON.parse(atob(token))
      adminUserId = parsed.id
    } catch {
      return NextResponse.json({ error: '유효하지 않은 인증 토큰입니다.' }, { status: 401 })
    }

    // 관리자 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', adminUserId)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const { orderId, cancelReason, cancelAmount } = await request.json()

    if (!orderId || !cancelReason) {
      return NextResponse.json({ error: 'orderId와 cancelReason은 필수입니다.' }, { status: 400 })
    }

    // 주문 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (order.status !== 'paid') {
      return NextResponse.json({ error: '결제 완료 상태의 주문만 취소할 수 있습니다.' }, { status: 400 })
    }

    if (!order.payment_key) {
      return NextResponse.json({ error: '결제 키가 없는 주문입니다.' }, { status: 400 })
    }

    // 토스 결제 취소 API 호출
    const cancelBody: Record<string, any> = { cancelReason }
    if (cancelAmount) {
      cancelBody.cancelAmount = cancelAmount
    }

    const tossRes = await fetch(
      `https://api.tosspayments.com/v1/payments/${order.payment_key}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: getTossAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cancelBody),
      }
    )

    const tossResult = await tossRes.json()

    if (!tossRes.ok) {
      return NextResponse.json(
        { error: tossResult.message || '결제 취소에 실패했습니다.', code: tossResult.code },
        { status: 400 }
      )
    }

    // 주문 상태 업데이트
    const isPartialCancel = cancelAmount && cancelAmount < order.amount
    const newStatus = isPartialCancel ? 'partial_refund' : 'cancelled'

    await supabase
      .from('orders')
      .update({
        status: newStatus,
        metadata: {
          ...order.metadata,
          cancelReason,
          cancelAmount: cancelAmount || order.amount,
          cancelledAt: new Date().toISOString(),
          cancelledBy: adminUserId,
          cancels: tossResult.cancels,
        },
      })
      .eq('id', orderId)

    return NextResponse.json({
      success: true,
      orderId,
      status: newStatus,
      cancelAmount: cancelAmount || order.amount,
      cancels: tossResult.cancels,
    })
  } catch (e) {
    console.error('[payment/cancel] error:', e)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
