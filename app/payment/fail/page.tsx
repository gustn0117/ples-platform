'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PaymentFailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const code = searchParams.get('code')
  const message = searchParams.get('message')
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제가 취소되었어요</h1>
        <p className="text-gray-500 text-sm mb-2">
          {message || '결제가 정상적으로 처리되지 않았습니다.'}
        </p>
        {code && (
          <p className="text-xs text-gray-400 mb-8">에러 코드: {code}</p>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            홈으로 가기
          </Link>
        </div>
      </div>
    </div>
  )
}
