import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { getTossAuthHeader } from '@/lib/toss'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { paymentKey: string } }
) {
  try {
    // 관리자 인증 확인
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const supabase = createServiceClient()

    let adminUserId: string | null = null
    try {
      const parsed = JSON.parse(atob(token))
      adminUserId = parsed.id
    } catch {
      return NextResponse.json({ error: '유효하지 않은 인증 토큰입니다.' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', adminUserId)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const { paymentKey } = params

    // 토스 결제 조회 API 호출
    const tossRes = await fetch(
      `https://api.tosspayments.com/v1/payments/${paymentKey}`,
      {
        headers: { Authorization: getTossAuthHeader() },
      }
    )

    const tossResult = await tossRes.json()

    if (!tossRes.ok) {
      return NextResponse.json(
        { error: tossResult.message || '결제 조회에 실패했습니다.' },
        { status: tossRes.status }
      )
    }

    return NextResponse.json(tossResult)
  } catch (e) {
    console.error('[payment/query] error:', e)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
