// app/admin/points/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  initStore,
  getUserPoints,
  getPointHistory,
  adminAdjustPoints,
  getChargeRate,
  setChargeRate,
} from '@/lib/store'
import type { PointHistory } from '@/lib/mock-data'

export default function AdminPointsPage() {
  const [points, setPoints] = useState(0)
  const [history, setHistory] = useState<PointHistory[]>([])
  const [amount, setAmount] = useState(0)
  const [reason, setReason] = useState('')
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [chargeRate, setChargeRateState] = useState(1.2)
  const [newRate, setNewRate] = useState('1.2')

  const reload = () => {
    setPoints(getUserPoints())
    setHistory(getPointHistory())
    setChargeRateState(getChargeRate())
    setNewRate(String(getChargeRate()))
  }

  useEffect(() => {
    initStore()
    reload()
  }, [])

  const handleAdjust = () => {
    if (amount === 0) return setResult({ type: 'error', message: '금액을 입력하세요.' })
    if (!reason.trim()) return setResult({ type: 'error', message: '사유를 입력하세요.' })

    const before = getUserPoints()
    adminAdjustPoints(amount, reason)
    const after = getUserPoints()

    setResult({
      type: 'success',
      message: `포인트가 ${before.toLocaleString()}P → ${after.toLocaleString()}P로 변경되었습니다.`,
    })
    setAmount(0)
    setReason('')
    reload()
  }

  const handleRateUpdate = () => {
    const rate = parseFloat(newRate)
    if (isNaN(rate) || rate <= 0) return alert('유효한 비율을 입력하세요.')
    setChargeRate(rate)
    reload()
    alert(`충전 비율이 ${rate}로 변경되었습니다.`)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">포인트 관리</h1>

      {/* Current Balance */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">현재 보유 포인트</p>
            <p className="text-2xl font-bold text-gray-900">{points.toLocaleString()}P</p>
          </div>
        </div>
      </div>

      {/* Adjust Points */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          포인트 지급 / 차감
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">포인트 금액</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                placeholder="양수: 지급, 음수: 차감"
                className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
              />
              <div className="flex gap-1">
                {[100, 500, 1000, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount((prev) => prev + val)}
                    className="px-2.5 py-2 text-xs bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 font-medium"
                  >
                    +{val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              양수 입력 시 지급, 음수 입력 시 차감됩니다.
              {amount !== 0 && (
                <span
                  className={`ml-2 font-medium ${amount > 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  변경 후: {(points + amount).toLocaleString()}P
                </span>
              )}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">사유</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="포인트 지급/차감 사유를 입력하세요"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
            />
          </div>

          <button
            onClick={handleAdjust}
            disabled={amount === 0 || !reason.trim()}
            className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {amount >= 0 ? '포인트 지급' : '포인트 차감'}
          </button>
        </div>

        {result && (
          <div
            className={`mt-4 p-4 rounded-lg text-sm flex items-center gap-2 ${
              result.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {result.type === 'success' ? (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            )}
            {result.message}
          </div>
        )}
      </div>

      {/* Charge Rate */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          충전 비율 설정
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          현재 비율: <span className="font-semibold text-gray-700">{chargeRate}</span> (1원 ={' '}
          {chargeRate}P)
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newRate}
            onChange={(e) => setNewRate(e.target.value)}
            className="w-32 px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
          />
          <button
            onClick={handleRateUpdate}
            className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            변경
          </button>
        </div>
      </div>

      {/* Point History */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-sm font-semibold text-gray-900">포인트 내역</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">내용</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">잔액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">
                    포인트 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{h.date}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                          h.type === 'earn'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {h.type === 'earn' ? (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                          </svg>
                        )}
                        {h.type === 'earn' ? '적립' : '사용'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 text-xs">{h.category}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`font-medium text-xs ${
                          h.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {h.amount > 0 ? '+' : ''}
                        {h.amount.toLocaleString()}P
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{h.balance.toLocaleString()}P</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
