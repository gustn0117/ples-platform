// app/admin/videos/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  initStore,
  getVideos,
  addVideo,
  updateVideo,
  deleteVideo as deleteVideoFromStore,
} from '@/lib/store'
import type { Video } from '@/lib/mock-data'

const emptyForm = {
  title: '',
  duration: '',
  pointReward: 20,
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)

  const reload = () => setVideos(getVideos())

  useEffect(() => {
    initStore()
    reload()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (v: Video) => {
    setEditingId(v.id)
    setForm({
      title: v.title,
      duration: v.duration,
      pointReward: v.pointReward,
    })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.title) return alert('제목은 필수입니다.')

    if (editingId !== null) {
      updateVideo(editingId, {
        title: form.title,
        duration: form.duration,
        pointReward: form.pointReward,
      })
    } else {
      addVideo({
        title: form.title,
        thumbnail: '🎬',
        duration: form.duration,
        pointReward: form.pointReward,
        watched: false,
      })
    }

    setModalOpen(false)
    reload()
  }

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`"${title}" 영상을 삭제하시겠습니까?`)) return
    deleteVideoFromStore(id)
    reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">영상 관리</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          + 추가
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">ID</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">영상</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">재생시간</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">보상</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {videos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    등록된 영상이 없습니다.
                  </td>
                </tr>
              ) : (
                videos.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-400">{v.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{v.thumbnail}</span>
                        {v.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{v.duration}</td>
                    <td className="px-6 py-4 text-gray-600">{v.pointReward}P</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(v)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.title)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId !== null ? '영상 수정' : '영상 추가'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">재생시간</label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="3:45"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    보상 포인트
                  </label>
                  <input
                    type="number"
                    value={form.pointReward}
                    onChange={(e) =>
                      setForm({ ...form, pointReward: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                {editingId !== null ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
