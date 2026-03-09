// app/admin/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  initStore,
  getArtists,
  getVotes,
  getArtworks,
  getVideos,
  getPointHistory,
  getUserPoints,
} from '@/lib/store'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    artists: 0,
    votes: 0,
    artworks: 0,
    videos: 0,
    pointHistory: 0,
    userPoints: 0,
  })

  useEffect(() => {
    initStore()
    setStats({
      artists: getArtists().length,
      votes: getVotes().length,
      artworks: getArtworks().length,
      videos: getVideos().length,
      pointHistory: getPointHistory().length,
      userPoints: getUserPoints(),
    })
  }, [])

  const cards = [
    { label: '전체 아티스트', value: stats.artists, unit: '명', color: 'bg-blue-500' },
    { label: '전체 투표', value: stats.votes, unit: '개', color: 'bg-purple-500' },
    { label: '전체 작품', value: stats.artworks, unit: '개', color: 'bg-pink-500' },
    { label: '전체 영상', value: stats.videos, unit: '개', color: 'bg-green-500' },
    { label: '포인트 내역', value: stats.pointHistory, unit: '건', color: 'bg-orange-500' },
    { label: '현재 포인트', value: stats.userPoints.toLocaleString(), unit: 'P', color: 'bg-indigo-500' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">대시보드</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">{card.label}</span>
              <span className={`w-3 h-3 rounded-full ${card.color}`} />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {card.value}
              <span className="text-base font-normal text-gray-400 ml-1">{card.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
