'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'

interface Stats {
  userCount: number
  artistCount: number
  voteCount: number
  totalRevenue: number
}

interface RecentPurchase {
  id: string
  amount: number
  payment_method: string
  created_at: string
  profiles: { nickname: string } | null
  artworks: { title: string } | null
}

interface RecentVoteEntry {
  id: string
  created_at: string
  profiles: { nickname: string } | null
  votes: { title: string } | null
}

export default function AdminDashboard() {
  const { session } = useAuth()
  const [stats, setStats] = useState<Stats>({
    userCount: 0,
    artistCount: 0,
    voteCount: 0,
    totalRevenue: 0,
  })
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([])
  const [recentVotes, setRecentVotes] = useState<RecentVoteEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!session?.access_token) return
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats)
          setRecentPurchases(data.recentPurchases ?? [])
          setRecentVotes(data.recentVotes ?? [])
        }
      } catch (err) {
        console.error('통계 조회 실패:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [session])

  const statCards = [
    { label: '총 회원수', value: stats.userCount, color: 'bg-gray-700', icon: '👥' },
    { label: '총 아티스트', value: stats.artistCount, color: 'bg-gray-600', icon: '🎤' },
    { label: '총 투표수', value: stats.voteCount, color: 'bg-gray-500', icon: '🗳️' },
    { label: '총 매출', value: `₩${stats.totalRevenue.toLocaleString()}`, color: 'bg-gray-800', icon: '💰' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-700"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-xl text-white`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity chart placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">일일 활동 현황</h2>
        <div className="flex items-end gap-2 h-40">
          {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95, 70, 60].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-gray-600 rounded-t-sm transition-all"
                style={{ height: `${h}%` }}
              />
              <span className="text-xs text-gray-400">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent purchases */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 구매</h2>
          {recentPurchases.length === 0 ? (
            <p className="text-gray-400 text-sm">구매 기록이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {recentPurchases.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {p.profiles?.nickname ?? '알 수 없음'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {p.artworks?.title ?? '삭제된 상품'} · {p.payment_method}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">₩{p.amount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(p.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent votes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 투표 참여</h2>
          {recentVotes.length === 0 ? (
            <p className="text-gray-400 text-sm">투표 기록이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {recentVotes.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {v.profiles?.nickname ?? '알 수 없음'}
                    </p>
                    <p className="text-xs text-gray-500">{v.votes?.title ?? '삭제된 투표'}</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(v.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
