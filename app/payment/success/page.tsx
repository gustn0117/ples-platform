'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { addStars, purchaseArtwork } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { IconCheck, IconShoppingBag, IconCoin } from '@/components/icons'

export default function PaymentSuccessPage() {
  return <Suspense fallback={<div className="min-h-screen bg-white" />}><PaymentSuccessContent /></Suspense>
}

interface ConfirmResult {
  success: boolean
  orderId: string
  orderType: string
  itemId?: number
  itemName: string
  amount: number
  pointsAmount?: number
  receiptUrl?: string
  paymentMethod?: string
  error?: string
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const paymentKey = searchParams.get('paymentKey')
  const orderId = searchParams.get('orderId')
  const amount = Number(searchParams.get('amount'))
  const orderType = searchParams.get('orderType')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [result, setResult] = useState<ConfirmResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const confirmedRef = useRef(false)

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus('error')
      setErrorMsg('결제 정보가 올바르지 않습니다.')
      return
    }

    // 중복 호출 방지 (React Strict Mode + 새로고침)
    if (confirmedRef.current) return
    confirmedRef.current = true

    // sessionStorage에 캐시된 결과가 있으면 바로 표시
    const cacheKey = `payment_result_${orderId}`
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      try {
        const cachedResult = JSON.parse(cached) as ConfirmResult
        setResult(cachedResult)
        setStatus('success')
        return
      } catch {
        sessionStorage.removeItem(cacheKey)
      }
    }

    async function confirmPayment() {
      try {
        const res = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        })

        const data = await res.json()

        if (!res.ok || !data.success) {
          setStatus('error')
          setErrorMsg(data.error || '결제 승인에 실패했습니다.')
          return
        }

        // Fulfill client-side actions
        if (data.orderType === 'points' && data.pointsAmount) {
          addStars(data.pointsAmount, '스타 충전', `${data.amount.toLocaleString()}원`)
        } else if (data.orderType === 'artwork') {
          purchaseArtwork(data.itemId, 'cash')
        }

        // 결과를 sessionStorage에 캐시 (새로고침 대비)
        sessionStorage.setItem(cacheKey, JSON.stringify(data))

        setResult(data)
        setStatus('success')
      } catch {
        setStatus('error')
        setErrorMsg('결제 처리 중 오류가 발생했습니다.')
      }
    }

    confirmPayment()
  }, [paymentKey, orderId, amount])

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">결제를 확인하고 있어요</h2>
          <p className="text-gray-400 text-sm">잠시만 기다려주세요...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">결제 실패</h2>
          <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
          <button
            onClick={() => router.back()}
            className="px-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  const isPoints = result?.orderType === 'points'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
        {/* Success Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-6">
            <IconCheck className="w-8 h-8 text-emerald-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isPoints ? '스타 충전 완료!' : '결제가 완료되었어요!'}
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            {isPoints
              ? `${result?.pointsAmount?.toLocaleString()}★가 충전되었습니다.`
              : `${result?.itemName} 구매가 완료되었습니다.`}
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">주문번호</span>
              <span className="text-gray-900 font-mono text-xs">{result?.orderId}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">상품</span>
              <span className="text-gray-900 font-medium">{result?.itemName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">결제 수단</span>
              <span className="text-gray-900 font-medium">{result?.paymentMethod || '카드'}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-3">
              <span className="text-gray-500 font-medium">결제 금액</span>
              <span className="text-lg font-bold text-gray-900">{result?.amount?.toLocaleString()}원</span>
            </div>
            {isPoints && result?.pointsAmount && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">충전 스타</span>
                <span className="text-lg font-bold text-emerald-600">+{result.pointsAmount.toLocaleString()}★</span>
              </div>
            )}
          </div>

          {/* Receipt */}
          {result?.receiptUrl && (
            <a
              href={result.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              영수증 보기
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isPoints ? (
            <>
              <Link
                href="/points"
                className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl text-center hover:bg-gray-50 transition-colors"
              >
                스타 내역
              </Link>
              <Link
                href="/artworks"
                className="flex-1 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl text-center hover:bg-gray-800 transition-colors"
              >
                갤러리 둘러보기
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/mypage"
                className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl text-center hover:bg-gray-50 transition-colors"
              >
                구매 내역
              </Link>
              <Link
                href="/artworks"
                className="flex-1 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl text-center hover:bg-gray-800 transition-colors"
              >
                갤러리 계속 보기
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
