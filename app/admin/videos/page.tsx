'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Video {
  id: string
  title: string
  url: string
  emoji: string | null
  duration: string | null
  reward_points: number
  is_active: boolean
}

const emptyForm = {
  title: '',
  url: '',
  emoji: '',
  duration: '',
  reward_points: 50,
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setVideos(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (video: Video) => {
    setEditingId(video.id)
    setForm({
      title: video.title,
      url: video.url,
      emoji: video.emoji ?? '',
      duration: video.duration ?? '',
      reward_points: video.reward_points,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.url) return alert('제목과 URL은 필수입니다.')
    setSaving(true)

    const payload = {
      title: form.title,
      url: form.url,
      emoji: form.emoji || null,
      duration: form.duration || null,
      reward_points: form.reward_points,
    }

    if (editingId) {
      const { error } = await supabase.from('videos').update(payload).eq('id', editingId)
      if (error) {
        alert('수정 실패: ' + error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from('videos').insert({ ...payload, is_active: true })
      if (error) {
        alert('추가 실패: ' + error.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setModalOpen(false)
    fetchVideos()
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('videos').update({ is_active: !current }).eq('id', id)
    if (!error) {
      setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, is_active: !current } : v)))
    }
  }

  const deleteVideo = async (id: string, title: string) => {
    if (!confirm(`"${title}" 영상을 삭제하시겠습니까?`)) return
    const { error } = await supabase.from('videos').delete().eq('id', id)
    if (!error) {
      setVideos((prev) => prev.filter((v) => v.id !== id))
    } else {
      alert('삭제 실패: ' + error.message)
    }
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
                <th className="px-6 py-3 text-left font-medium text-gray-500">영상</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">URL</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">재생시간</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">보상</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">상태</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">로딩 중...</td>
                </tr>
              ) : videos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">등록된 영상이 없습니다.</td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{video.emoji ?? '🎬'}</span>
                        {video.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline truncate max-w-[200px] inline-block">
                        {video.url}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{video.duration ?? '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{video.reward_points}P</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          video.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {video.is_active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(video)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => toggleActive(video.id, video.is_active)}
                          className={`px-3 py-1 text-xs rounded-md transition-colors ${
                            video.is_active
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {video.is_active ? '비활성화' : '활성화'}
                        </button>
                        <button
                          onClick={() => deleteVideo(video.id, video.title)}
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? '영상 수정' : '영상 추가'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                <input
                  type="text"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이모지</label>
                  <input
                    type="text"
                    value={form.emoji}
                    onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="🎬"
                  />
                </div>
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">보상 포인트</label>
                <input
                  type="number"
                  value={form.reward_points}
                  onChange={(e) => setForm({ ...form, reward_points: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
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
                disabled={saving}
                className="flex-1 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? '저장 중...' : editingId ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
