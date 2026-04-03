'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'

interface Order {
  id: string
  user_email: string
  order_type: string
  item_name: string
  amount: number
  points_amount: number | null
  status: string
  payment_method: string | null
  payment_key: string | null
  receipt_url: string | null
  created_at: string
  paid_at: string | null
  metadata: any
}

type FilterStatus = '전체' | 'paid' | 'pending' | 'failed' | 'cancelled'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '대기중', color: 'bg-yellow-50 text-yellow-600' },
  paid: { label: '결제완료', color: 'bg-emerald-50 text-emerald-600' },
  failed: { label: '실패', color: 'bg-red-50 text-red-500' },
  cancelled: { label: '취소됨', color: 'bg-gray-100 text-gray-500' },
  partial_refund: { label: '부분환불', color: 'bg-orange-50 text-orange-600' },
  refunded: { label: '환불됨', color: 'bg-purple-50 text-purple-600' },
}

export default function AdminPaymentsPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('전체')

  // 환불 모달 상태
  const [cancelModal, setCancelModal] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null })
  const [cancelReason, setCancelReason] = useState('')
  const [cancelAmount, setCancelAmount] = useState('')
  const [isPartialRefund, setIsPartialRefund] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    try {
      const res = await fetch('/api/payment/orders?limit=200')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e)
    }
    setLoading(false)
  }

  function openCancelModal(order: Order) {
    setCancelModal({ open: true, order })
    setCancelReason('')
    setCancelAmount('')
    setIsPartialRefund(false)
    setCancelError('')
  }

  function closeCancelModal() {
    setCancelModal({ open: false, order: null })
    setCancelReason('')
    setCancelAmount('')
    setIsPartialRefund(false)
    setCancelError('')
  }

  async function handleCancel() {
    if (!cancelModal.order || !cancelReason.trim()) {
      setCancelError('취소 사유를 입력해주세요.')
      return
    }

    setCancelLoading(true)
    setCancelError('')

    try {
      // mock auth 토큰 생성
      const token = btoa(JSON.stringify({ id: user?.id }))

      const body: Record<string, any> = {
        orderId: cancelModal.order.id,
        cancelReason: cancelReason.trim(),
      }

      if (isPartialRefund && cancelAmount) {
        const amount = parseInt(cancelAmount)
        if (isNaN(amount) || amount <= 0 || amount >= cancelModal.order.amount) {
          setCancelError('부분 환불 금액이 올바르지 않습니다.')
          setCancelLoading(false)
          return
        }
        body.cancelAmount = amount
      }

      const res = await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setCancelError(data.error || '환불 처리에 실패했습니다.')
        setCancelLoading(false)
        return
      }

      closeCancelModal()
      fetchOrders()
    } catch {
      setCancelError('서버 오류가 발생했습니다.')
    }
    setCancelLoading(false)
  }

  const filtered = filter === '전체'
    ? orders
    : orders.filter((o) => o.status === filter)

  const stats = {
    total: orders.length,
    paid: orders.filter((o) => o.status === 'paid').length,
    pending: orders.filter((o) => o.status === 'pending').length,
    cancelled: orders.filter((o) => ['cancelled', 'partial_refund'].includes(o.status)).length,
    totalRevenue: orders
      .filter((o) => o.status === 'paid')
      .reduce((sum, o) => sum + o.amount, 0),
  }

  const filters: { key: FilterStatus; label: string }[] = [
    { key: '전체', label: '전체' },
    { key: 'paid', label: '결제완료' },
    { key: 'pending', label: '대기중' },
    { key: 'failed', label: '실패' },
    { key: 'cancelled', label: '취소/환불' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">결제 관리</h1>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          새로고침
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 font-medium mb-1">전체 주문</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}<span className="text-sm text-gray-400 ml-1">건</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 font-medium mb-1">결제 완료</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.paid}<span className="text-sm text-gray-400 ml-1">건</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 font-medium mb-1">대기중</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}<span className="text-sm text-gray-400 ml-1">건</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 font-medium mb-1">취소/환불</p>
          <p className="text-2xl font-bold text-gray-500">{stats.cancelled}<span className="text-sm text-gray-400 ml-1">건</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-400 font-medium mb-1">총 매출</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()}<span className="text-sm text-gray-400 ml-0.5">원</span></p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              filter === f.key
                ? 'bg-gray-900 text-white'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">일시</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문번호</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구매자</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결제수단</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      불러오는 중...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                      </svg>
                      <span className="text-gray-400 text-sm">결제 내역이 없습니다.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-500' }
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {order.paid_at
                          ? new Date(order.paid_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                          : new Date(order.created_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{order.id.slice(0, 20)}...</td>
                      <td className="px-4 py-3 text-gray-700 text-xs">{order.user_email}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 text-xs">{order.item_name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          order.order_type === 'points' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {order.order_type === 'points' ? '충전' : '작품'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{order.payment_method || '-'}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 font-mono text-xs">
                        {order.amount.toLocaleString()}원
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.status === 'paid' && order.payment_key && (
                          <button
                            onClick={() => openCancelModal(order)}
                            className="text-xs text-red-500 font-medium hover:text-red-700 transition-colors px-2 py-1 rounded hover:bg-red-50"
                          >
                            환불
                          </button>
                        )}
                        {order.receipt_url && (
                          <a
                            href={order.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-400 font-medium hover:text-gray-600 transition-colors px-2 py-1 rounded hover:bg-gray-50"
                          >
                            영수증
                          </a>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel/Refund Modal */}
      {cancelModal.open && cancelModal.order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={closeCancelModal} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">결제 취소/환불</h3>
              <p className="text-sm text-gray-500 mt-1">
                {cancelModal.order.item_name} ({cancelModal.order.amount.toLocaleString()}원)
              </p>
            </div>

            {/* 취소 사유 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">취소 사유 *</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="환불 사유를 입력하세요"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
              />
            </div>

            {/* 부분 환불 토글 */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPartialRefund(!isPartialRefund)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  isPartialRefund ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  isPartialRefund ? 'translate-x-5' : ''
                }`} />
              </button>
              <span className="text-sm text-gray-600">부분 환불</span>
            </div>

            {/* 부분 환불 금액 */}
            {isPartialRefund && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  환불 금액 (최대 {cancelModal.order.amount.toLocaleString()}원)
                </label>
                <input
                  type="number"
                  value={cancelAmount}
                  onChange={(e) => setCancelAmount(e.target.value)}
                  placeholder="환불할 금액"
                  max={cancelModal.order.amount - 1}
                  min={1}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
                />
              </div>
            )}

            {/* 에러 */}
            {cancelError && (
              <p className="text-sm text-red-500">{cancelError}</p>
            )}

            {/* 버튼 */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={closeCancelModal}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelLoading || !cancelReason.trim()}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {cancelLoading ? '처리 중...' : isPartialRefund ? '부분 환불 처리' : '전액 환불 처리'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
