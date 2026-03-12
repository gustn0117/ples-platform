// app/admin/users/page.tsx
'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { initStore } from '@/lib/store'

export default function AdminUsersPage() {
  const { profile } = useAuth()

  useEffect(() => {
    initStore()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">회원관리</h1>

      {/* Current User Info */}
      {profile && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            현재 로그인 사용자
          </h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xl font-semibold">
              {profile.nickname.charAt(0)}
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{profile.nickname}</p>
              <p className="text-sm text-gray-400">{profile.email}</p>
            </div>
          </div>

          <div className="space-y-0 divide-y divide-gray-100">
            <div className="flex justify-between py-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">사용자 ID</span>
              <span className="text-sm text-gray-700 font-mono">{profile.id.slice(0, 16)}...</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">닉네임</span>
              <span className="text-sm text-gray-700">{profile.nickname}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">이메일</span>
              <span className="text-sm text-gray-700">{profile.email}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">가입일</span>
              <span className="text-sm text-gray-700">
                {new Date(profile.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
