'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'

interface UserProfile {
  id: string
  nickname: string
  email: string
  points: number
}

export default function AdminPointsPage() {
  const { session } = useAuth()
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [amount, setAmount] = useState(0)
  const [reason, setReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const searchUsers = useCallback(async () => {
    if (!session?.access_token || !search.trim()) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ search, page: '1' })
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (err) {
      console.error('검색 실패:', err)
    } finally {
      setLoading(false)
    }
  }, [session, search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchUsers()
  }

  const handleSubmit = async () => {
    if (!session?.access_token || !selectedUser || amount === 0 || !reason.trim()) {
      setResult({ type: 'error', message: '모든 항목을 입력해주세요.' })
      return
    }

    setProcessing(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount,
          reason,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult({
          type: 'success',
          message: `${data.nickname}님의 포인트가 ${data.previousPoints.toLocaleString()}P → ${data.newPoints.toLocaleString()}P로 변경되었습니다.`,
        })
        setSelectedUser({ ...selectedUser, points: data.newPoints })
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, points: data.newPoints } : u))
        )
        setAmount(0)
        setReason('')
      } else {
        setResult({ type: 'error', message: data.error || '처리에 실패했습니다.' })
      }
    } catch (err) {
      console.error('포인트 처리 실패:', err)
      setResult({ type: 'error', message: '서버 오류가 발생했습니다.' })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">포인트 관리</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="닉네임 또는 이메일로 검색..."
          className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          검색
        </button>
      </form>

      {/* Search Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">닉네임</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">이메일</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">현재 포인트</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    로딩 중...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    {search ? '검색 결과가 없습니다.' : '닉네임 또는 이메일로 검색해주세요.'}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedUser?.id === user.id ? 'bg-indigo-50' : ''
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          {user.nickname?.charAt(0) ?? '?'}
                        </div>
                        {user.nickname}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {user.points?.toLocaleString()}P
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedUser(user)
                        }}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          selectedUser?.id === user.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        선택
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Points Form */}
      {selectedUser && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">포인트 지급/차감</h2>

          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">
              {selectedUser.nickname?.charAt(0) ?? '?'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{selectedUser.nickname}</p>
              <p className="text-sm text-gray-500">{selectedUser.email}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-gray-500">현재 포인트</p>
              <p className="text-xl font-bold text-indigo-600">{selectedUser.points?.toLocaleString()}P</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">포인트 금액</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  placeholder="양수: 지급, 음수: 차감"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="flex gap-1">
                  {[100, 500, 1000, 5000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount((prev) => prev + val)}
                      className="px-3 py-2 text-xs bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors"
                    >
                      +{val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                양수 입력 시 지급, 음수 입력 시 차감됩니다.
                {amount !== 0 && (
                  <span className={`ml-2 font-medium ${amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    변경 후: {((selectedUser.points ?? 0) + amount).toLocaleString()}P
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">사유</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="포인트 지급/차감 사유를 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setAmount(0)
                  setReason('')
                  setResult(null)
                }}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={processing || amount === 0 || !reason.trim()}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {processing ? '처리 중...' : amount >= 0 ? '포인트 지급' : '포인트 차감'}
              </button>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div
              className={`mt-4 p-4 rounded-lg text-sm ${
                result.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {result.message}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
