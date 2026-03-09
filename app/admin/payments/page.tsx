'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'

interface Payment {
  id: string
  created_at: string
  payment_method: string
  amount: number
  points_used: number
  profiles: { nickname: string; email: string } | null
  artworks: { title: string; emoji: string | null } | null
}

export default function AdminPaymentsPage() {
  const { session } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')

  const fetchPayments = useCallback(async () => {
    if (!session?.access_token) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      if (paymentMethod) params.set('paymentMethod', paymentMethod)

      const res = await fetch(`/api/admin/payments?${params}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setPayments(data.payments)
        setTotalPages(data.totalPages)
        setTotal(data.total)
      }
    } catch (err) {
      console.error('결제 내역 조회 실패:', err)
    } finally {
      setLoading(false)
    }
  }, [session, page, dateFrom, dateTo, paymentMethod])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPayments()
  }

  const resetFilters = () => {
    setDateFrom('')
    setDateTo('')
    setPaymentMethod('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">결제 내역</h1>
        <span className="text-sm text-gray-500">총 {total}건</span>
      </div>

      {/* Filters */}
      <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">시작일</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">종료일</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">결제 방법</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white"
          >
            <option value="">전체</option>
            <option value="cash">현금</option>
            <option value="points">포인트</option>
            <option value="card">카드</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          검색
        </button>
        <button
          type="button"
          onClick={resetFilters}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          초기화
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">날짜</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">구매자</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">상품</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">결제 방법</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">금액</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">포인트 사용</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    로딩 중...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    결제 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(payment.created_at).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {payment.profiles?.nickname ?? '알 수 없음'}
                        </p>
                        <p className="text-xs text-gray-400">{payment.profiles?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{payment.artworks?.emoji ?? '🎨'}</span>
                        {payment.artworks?.title ?? '삭제된 상품'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          payment.payment_method === 'points'
                            ? 'bg-gray-200 text-gray-700'
                            : payment.payment_method === 'card'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {payment.payment_method === 'points'
                          ? '포인트'
                          : payment.payment_method === 'card'
                          ? '카드'
                          : '현금'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {payment.amount ? `₩${payment.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {payment.points_used ? `${payment.points_used.toLocaleString()}P` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              {page} / {totalPages} 페이지
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                이전
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
