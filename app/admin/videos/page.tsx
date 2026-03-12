// app/admin/videos/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import type { Video } from '@/lib/mock-data'

const emptyForm = {
  title: '',
  duration: '',
  pointReward: 20,
  videoUrl: '',
  thumbnailData: '',
  link: '',
}

export default function AdminVideosPage() {
  const [videos, setVideosState] = useState<Video[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/store')
      if (!res.ok) return
      const data = await res.json()
      setVideosState(data.videos || [])
    } catch (e) {
      console.error('Failed to fetch videos:', e)
    }
  }

  const saveToServer = async (updatedVideos: Video[]) => {
    try {
      const res = await fetch('/api/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'videos', value: updatedVideos }),
      })
      if (!res.ok) alert('서버 저장에 실패했습니다. 다시 시도해주세요.')
    } catch {
      alert('서버 저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  useEffect(() => {
    fetchVideos()
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
      videoUrl: v.videoUrl || '',
      thumbnailData: v.thumbnailData || '',
      link: v.link || '',
    })
    setModalOpen(true)
  }

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return alert('이미지 파일만 업로드 가능합니다.')
    if (file.size > 2 * 1024 * 1024) return alert('이미지 크기는 2MB 이하만 가능합니다.')
    const reader = new FileReader()
    reader.onload = () => {
      setForm({ ...form, thumbnailData: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!form.title) return alert('제목은 필수입니다.')

    const videoData = {
      title: form.title,
      duration: form.duration,
      pointReward: form.pointReward,
      videoUrl: form.videoUrl || undefined,
      thumbnailData: form.thumbnailData || undefined,
      link: form.link || undefined,
    }

    let updated: Video[]
    if (editingId !== null) {
      updated = videos.map((v) => (v.id === editingId ? { ...v, ...videoData } : v))
    } else {
      const newId = Date.now()
      updated = [...videos, { ...videoData, id: newId, watched: false } as Video]
    }

    setVideosState(updated)
    setModalOpen(false)
    saveToServer(updated)
  }

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`"${title}" 미디어를 삭제하시겠습니까?`)) return
    const updated = videos.filter((v) => v.id !== id)
    setVideosState(updated)
    saveToServer(updated)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">미디어 관리</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          추가
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">미디어</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">재생시간</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">보상</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">링크</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {videos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                    등록된 미디어가 없습니다.
                  </td>
                </tr>
              ) : (
                videos.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-400 text-xs font-mono">{v.id}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        {v.thumbnailData ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={v.thumbnailData} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <div>{v.title}</div>
                          {v.videoUrl && (
                            <div className="text-[10px] text-gray-400 truncate max-w-[200px]">{v.videoUrl}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {v.duration}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-md">
                        +{v.pointReward}P
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {v.link ? (
                        <a href={v.link} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-700 text-xs underline truncate block max-w-[120px]">
                          링크
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openEdit(v)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.title)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 rounded-md hover:bg-red-50 transition-colors border border-red-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              {editingId !== null ? '미디어 수정' : '미디어 추가'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">제목 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                />
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">썸네일 이미지</label>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
                {form.thumbnailData ? (
                  <div className="relative group">
                    <img
                      src={form.thumbnailData}
                      alt="썸네일"
                      className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => thumbnailInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-gray-900 text-xs font-medium rounded-lg"
                      >
                        변경
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, thumbnailData: '' })}
                        className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span className="text-xs">클릭하여 썸네일 업로드 (2MB 이하)</span>
                  </button>
                )}
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">영상 URL (YouTube 등)</label>
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {/* External Link */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">외부 링크</label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">재생시간</label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                    placeholder="3:45"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">보상 포인트</label>
                  <input
                    type="number"
                    value={form.pointReward}
                    onChange={(e) =>
                      setForm({ ...form, pointReward: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
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
