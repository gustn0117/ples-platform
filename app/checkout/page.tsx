'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { TOSS_CLIENT_KEY } from '@/lib/toss'
import { IconShoppingBag } from '@/components/icons'

export default function CheckoutPage() {
  return <Suspense fallback={<div className="min-h-screen bg-white" />}><CheckoutContent /></Suspense>
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const orderId = searchParams.get('orderId')
  const orderName = searchParams.get('orderName')
  const amount = Number(searchParams.get('amount'))
  const orderType = searchParams.get('orderType') // 'artwork' | 'points'
  const customerEmail = searchParams.get('email') || user?.email || ''

  const paymentWidgetRef = useRef<any>(null)
  const paymentMethodRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId || !amount || !orderName) return

    async function initToss() {
      try {
        const { loadTossPayments, ANONYMOUS } = await import('@tosspayments/tosspayments-sdk')
        const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY)

        // Use ANONYMOUS for guest checkout (mock auth system)
        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS })
        paymentWidgetRef.current = widgets

        await widgets.setAmount({ currency: 'KRW', value: amount })

        await Promise.all([
          widgets.renderPaymentMethods({
            selector: '#payment-methods',
            variantKey: 'DEFAULT',
          }),
          widgets.renderAgreement({
            selector: '#payment-agreement',
            variantKey: 'AGREEMENT',
          }),
        ])

        setReady(true)
      } catch (e: any) {
        console.error('Toss init error:', e)
        setError('결제 모듈을 불러오는데 실패했습니다.')
      }
    }

    initToss()
  }, [orderId, amount, orderName])

  async function handlePayment() {
    if (!paymentWidgetRef.current || loading) return
    setLoading(true)
    setError(null)

    try {
      await paymentWidgetRef.current.requestPayment({
        orderId,
        orderName,
        customerEmail,
        successUrl: `${window.location.origin}/payment/success?orderType=${orderType}`,
        failUrl: `${window.location.origin}/payment/fail`,
      })
    } catch (e: any) {
      if (e.code === 'USER_CANCEL') {
        setError(null) // User cancelled, not an error
      } else {
        setError(e.message || '결제 요청 중 오류가 발생했습니다.')
      }
      setLoading(false)
    }
  }

  if (!orderId || !amount || !orderName) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">잘못된 결제 요청입니다.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
              <IconShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">
                {orderType === 'points' ? '스타 충전' : '작품 구매'}
              </p>
              <h1 className="text-lg font-bold text-gray-900">{orderName}</h1>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">결제 금액</span>
            <span className="text-2xl font-extrabold text-gray-900 tabular-nums">
              {amount.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* Toss Payment Methods Widget */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
          <div id="payment-methods" className="min-h-[300px]" />
        </div>

        {/* Agreement Widget */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
          <div id="payment-agreement" />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={!ready || loading}
          className="w-full py-4 rounded-2xl bg-gray-900 text-white text-base font-bold hover:bg-black transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              처리 중...
            </span>
          ) : (
            `${amount.toLocaleString()}원 결제하기`
          )}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          결제는 토스페이먼츠를 통해 안전하게 처리됩니다.
        </p>
      </div>
    </div>
  )
}
