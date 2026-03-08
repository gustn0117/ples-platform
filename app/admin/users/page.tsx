'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'

interface UserProfile {
  id: string
  nickname: string
  email: string
  phone: string | null
  avatar_url: string | null
  points: number
  is_admin: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const { session } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const fetchUsers = useCallback(async () => {
    if (!session?.access_token) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setTotalPages(data.totalPages)
        setTotal(data.total)
      }
    } catch (err) {
      console.error('회원 조회 실패:', err)
    } finally {
      setLoading(false)
    }
  }, [session, page, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    if (!session?.access_token) return
    if (!confirm(currentStatus ? '관리자 권한을 해제하시겠습니까?' : '관리자 권한을 부여하시겠습니까?')) return

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId,
          updates: { is_admin: !currentStatus },
        }),
      })
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_admin: !currentStatus } : u))
        )
      }
    } catch (err) {
      console.error('권한 변경 실패:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">회원관리</h1>
        <span className="text-sm text-gray-500">총 {total}명</span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="닉네임 또는 이메일 검색..."
          className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          검색
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">닉네임</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">이메일</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">포인트</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">관리자</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">가입일</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    로딩 중...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    회원이 없습니다.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          {user.nickname?.charAt(0) ?? '?'}
                        </div>
                        {user.nickname}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-gray-600">{user.points?.toLocaleString()}P</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.is_admin
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {user.is_admin ? '관리자' : '일반'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setDetailOpen(true)
                          }}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          상세
                        </button>
                        <button
                          onClick={() => toggleAdmin(user.id, user.is_admin)}
                          className={`px-3 py-1 text-xs rounded-md transition-colors ${
                            user.is_admin
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          }`}
                        >
                          {user.is_admin ? '권한해제' : '관리자 부여'}
                        </button>
                      </div>
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

      {/* User Detail Modal */}
      {detailOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">회원 상세</h2>
              <button onClick={() => setDetailOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold">
                {selectedUser.nickname?.charAt(0) ?? '?'}
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{selectedUser.nickname}</p>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">전화번호</span>
                <span className="text-sm text-gray-900">{selectedUser.phone ?? '미입력'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">포인트</span>
                <span className="text-sm font-medium text-gray-900">{selectedUser.points?.toLocaleString()}P</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">관리자 여부</span>
                <span className={`text-sm font-medium ${selectedUser.is_admin ? 'text-green-600' : 'text-gray-500'}`}>
                  {selectedUser.is_admin ? '관리자' : '일반 회원'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">가입일</span>
                <span className="text-sm text-gray-900">
                  {new Date(selectedUser.created_at).toLocaleString('ko-KR')}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">ID</span>
                <span className="text-xs text-gray-400 font-mono">{selectedUser.id.slice(0, 12)}...</span>
              </div>
            </div>

            <button
              onClick={() => setDetailOpen(false)}
              className="mt-6 w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
