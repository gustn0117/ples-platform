// app/admin/users/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { getAllUsers, updateUser, deleteUser, type MockUser } from '@/lib/auth-context'
import { initStore, getUserStars, adminAdjustStars, getStarHistory } from '@/lib/store'
import type { StarHistory } from '@/lib/mock-data'

type Tab = 'list' | 'detail'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<MockUser[]>([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('list')
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ nickname: '', email: '', phone: '', realName: '', status: 'active' as 'active' | 'suspended' })
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [sortKey, setSortKey] = useState<'created_at' | 'nickname' | 'email'>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  // Star management
  const [userStars, setUserStars] = useState(0)
  const [starHistory, setStarHistory] = useState<StarHistory[]>([])
  const [starAmount, setStarAmount] = useState(0)
  const [starReason, setStarReason] = useState('')
  const [starResult, setStarResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const reload = () => {
    setUsers(getAllUsers())
  }

  useEffect(() => {
    initStore()
    reload()
  }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  // Filtered & sorted users
  const filtered = users
    .filter((u) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        u.nickname.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.realName || '').toLowerCase().includes(q) ||
        (u.phone || '').includes(q)
      )
    })
    .sort((a, b) => {
      let va: string, vb: string
      if (sortKey === 'created_at') {
        va = a.created_at || '1970'
        vb = b.created_at || '1970'
      } else {
        va = (a as any)[sortKey] || ''
        vb = (b as any)[sortKey] || ''
      }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })

  function openDetail(user: MockUser) {
    setSelectedUser(user)
    setEditForm({
      nickname: user.nickname,
      email: user.email,
      phone: user.phone || '',
      realName: user.realName || '',
      status: user.status || 'active',
    })
    setEditMode(false)
    setConfirmDelete(false)
    setUserStars(getUserStars())
    setStarHistory(getStarHistory())
    setStarAmount(0)
    setStarReason('')
    setStarResult(null)
    setTab('detail')
  }

  function handleStarAdjust() {
    if (starAmount === 0) return setStarResult({ type: 'error', message: '수량을 입력하세요.' })
    if (!starReason.trim()) return setStarResult({ type: 'error', message: '사유를 입력하세요.' })
    const before = getUserStars()
    adminAdjustStars(starAmount, starReason)
    const after = getUserStars()
    setStarResult({
      type: 'success',
      message: `스타: ${before.toLocaleString()}★ → ${after.toLocaleString()}★`,
    })
    setUserStars(after)
    setStarHistory(getStarHistory())
    setStarAmount(0)
    setStarReason('')
  }

  function handleSave() {
    if (!selectedUser) return
    if (!editForm.nickname.trim() || !editForm.email.trim()) {
      setToast({ type: 'error', message: '닉네임과 이메일은 필수입니다.' })
      return
    }
    const ok = updateUser(selectedUser.id, {
      nickname: editForm.nickname.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone.trim() || undefined,
      realName: editForm.realName.trim() || undefined,
      status: editForm.status,
    })
    if (ok) {
      setToast({ type: 'success', message: '회원 정보가 수정되었습니다.' })
      reload()
      const updated = getAllUsers().find((u) => u.id === selectedUser.id)
      if (updated) setSelectedUser(updated)
      setEditMode(false)
    } else {
      setToast({ type: 'error', message: '수정에 실패했습니다.' })
    }
  }

  function handleDelete() {
    if (!selectedUser) return
    const ok = deleteUser(selectedUser.id)
    if (ok) {
      setToast({ type: 'success', message: '회원이 삭제되었습니다.' })
      reload()
      setTab('list')
      setSelectedUser(null)
    } else {
      setToast({ type: 'error', message: '삭제에 실패했습니다.' })
    }
  }

  function handleToggleStatus() {
    if (!selectedUser) return
    const newStatus = (selectedUser.status || 'active') === 'active' ? 'suspended' : 'active'
    const ok = updateUser(selectedUser.id, { status: newStatus })
    if (ok) {
      setToast({ type: 'success', message: newStatus === 'suspended' ? '회원이 정지되었습니다.' : '정지가 해제되었습니다.' })
      reload()
      const updated = getAllUsers().find((u) => u.id === selectedUser.id)
      if (updated) setSelectedUser(updated)
    }
  }

  function handleSort(key: typeof sortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ col }: { col: typeof sortKey }) => {
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-gray-600 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {tab === 'detail' && (
            <button
              onClick={() => { setTab('list'); setSelectedUser(null) }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-semibold text-gray-900">
            {tab === 'list' ? '회원관리' : '회원 상세'}
          </h1>
          {tab === 'list' && (
            <span className="text-sm text-gray-400 font-medium">총 {users.length}명</span>
          )}
        </div>
      </div>

      {tab === 'list' && (
        <>
          {/* Search & Stats */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="이름, 이메일, 전화번호로 검색..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-emerald-700">
                  활성 {users.filter((u) => (u.status || 'active') === 'active').length}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 rounded-xl border border-red-100">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-medium text-red-700">
                  정지 {users.filter((u) => u.status === 'suspended').length}
                </span>
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                    <th
                      className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                      onClick={() => handleSort('nickname')}
                    >
                      닉네임 <SortIcon col="nickname" />
                    </th>
                    <th
                      className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                      onClick={() => handleSort('email')}
                    >
                      이메일 <SortIcon col="email" />
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">실명</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전화번호</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th
                      className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                      onClick={() => handleSort('created_at')}
                    >
                      가입일 <SortIcon col="created_at" />
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center text-gray-400 text-sm">
                        {search ? '검색 결과가 없습니다.' : '가입된 회원이 없습니다.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user, i) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5 text-gray-400 text-xs">{i + 1}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              {user.nickname.charAt(0)}
                            </div>
                            <span className="text-gray-900 font-medium">{user.nickname}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">{user.email}</td>
                        <td className="px-5 py-3.5 text-gray-600">{user.realName || '-'}</td>
                        <td className="px-5 py-3.5 text-gray-600 font-mono text-xs">{user.phone || '-'}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                              (user.status || 'active') === 'active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              (user.status || 'active') === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                            }`} />
                            {(user.status || 'active') === 'active' ? '활성' : '정지'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString('ko-KR')
                            : '-'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => openDetail(user)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                          >
                            상세
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'detail' && selectedUser && (
        <>
          {/* User Profile Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-2xl font-bold">
                  {selectedUser.nickname.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">{selectedUser.nickname}</h2>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                        (selectedUser.status || 'active') === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {(selectedUser.status || 'active') === 'active' ? '활성' : '정지'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{selectedUser.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">ID: {selectedUser.id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleToggleStatus}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors border ${
                    (selectedUser.status || 'active') === 'active'
                      ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
                      : 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {(selectedUser.status || 'active') === 'active' ? '정지하기' : '정지 해제'}
                </button>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-3.5 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    수정하기
                  </button>
                ) : (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-3.5 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-3.5 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      저장
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Info / Edit Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">닉네임</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editForm.nickname}
                    onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                  />
                ) : (
                  <p className="px-3.5 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700">{selectedUser.nickname}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">이메일</label>
                {editMode ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                  />
                ) : (
                  <p className="px-3.5 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700">{selectedUser.email}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">실명</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editForm.realName}
                    onChange={(e) => setEditForm({ ...editForm, realName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                  />
                ) : (
                  <p className="px-3.5 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700">{selectedUser.realName || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">전화번호</label>
                {editMode ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                  />
                ) : (
                  <p className="px-3.5 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700 font-mono">{selectedUser.phone || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">가입일</label>
                <p className="px-3.5 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700">
                  {selectedUser.created_at
                    ? new Date(selectedUser.created_at).toLocaleString('ko-KR')
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Star Management */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              스타 관리
            </h3>

            {/* Current Balance */}
            <div className="flex items-center gap-3 mb-5 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <span className="text-lg">★</span>
              </div>
              <div>
                <p className="text-xs text-amber-600 font-medium">보유 스타</p>
                <p className="text-2xl font-bold text-gray-900">{userStars.toLocaleString()}★</p>
              </div>
            </div>

            {/* Adjust Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">스타 수량</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={starAmount}
                    onChange={(e) => setStarAmount(parseInt(e.target.value) || 0)}
                    placeholder="양수: 지급, 음수: 차감"
                    className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                  />
                  <div className="flex gap-1">
                    {[100, 500, 1000, 5000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setStarAmount((prev) => prev + val)}
                        className="px-2.5 py-2 text-xs bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 font-medium"
                      >
                        +{val >= 1000 ? `${val / 1000}k` : val}
                      </button>
                    ))}
                  </div>
                </div>
                {starAmount !== 0 && (
                  <p className="mt-1.5 text-xs text-gray-400">
                    변경 후:{' '}
                    <span className={`font-medium ${starAmount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {(userStars + starAmount).toLocaleString()}★
                    </span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">사유</label>
                <input
                  type="text"
                  value={starReason}
                  onChange={(e) => setStarReason(e.target.value)}
                  placeholder="지급/차감 사유를 입력하세요"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                />
              </div>
              <button
                onClick={handleStarAdjust}
                disabled={starAmount === 0 || !starReason.trim()}
                className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {starAmount >= 0 ? '스타 지급' : '스타 차감'}
              </button>
            </div>

            {starResult && (
              <div
                className={`mt-3 p-3 rounded-lg text-sm flex items-center gap-2 ${
                  starResult.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {starResult.message}
              </div>
            )}

            {/* Star History */}
            {starHistory.length > 0 && (
              <div className="mt-5 border-t border-gray-100 pt-4">
                <h4 className="text-xs font-medium text-gray-500 mb-3">최근 스타 내역</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {starHistory.slice(0, 10).map((h) => (
                    <div key={h.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            h.type === 'earn' ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                        <span className="text-xs text-gray-600">{h.category}</span>
                        <span className="text-xs text-gray-400">{h.date}</span>
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          h.amount > 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {h.amount > 0 ? '+' : ''}
                        {h.amount.toLocaleString()}★
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl border border-red-100 p-6">
            <h3 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              위험 영역
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              회원을 삭제하면 복구할 수 없습니다. 신중하게 결정해주세요.
            </p>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
              >
                회원 삭제
              </button>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 flex-1">
                  정말 <strong>{selectedUser.nickname}</strong> 회원을 삭제하시겠습니까?
                </p>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3.5 py-2 text-xs font-medium text-gray-600 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3.5 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  삭제 확인
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
