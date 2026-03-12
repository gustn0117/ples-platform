// app/admin/artists/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import type { Artist } from '@/lib/mock-data'

const emptyForm = { name: '', genre: '', description: '', imageData: '', instagram: '', youtube: '', twitter: '' }

export default function AdminArtistsPage() {
  const [artists, setArtistsState] = useState<Artist[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const fetchArtists = async () => {
    try {
      const res = await fetch('/api/store')
      if (!res.ok) return
      const data = await res.json()
      setArtistsState(data.artists || [])
    } catch (e) {
      console.error('Failed to fetch artists:', e)
    }
  }

  const saveToServer = async (updated: Artist[]) => {
    try {
      const res = await fetch('/api/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'artists', value: updated }),
      })
      if (!res.ok) alert('서버 저장에 실패했습니다. 다시 시도해주세요.')
    } catch {
      alert('서버 저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  useEffect(() => {
    fetchArtists()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (a: Artist) => {
    setEditingId(a.id)
    setForm({ name: a.name, genre: a.genre, description: a.description ?? '', imageData: a.imageData ?? '', instagram: a.sns?.instagram ?? '', youtube: a.sns?.youtube ?? '', twitter: a.sns?.twitter ?? '' })
    setModalOpen(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return alert('이미지 파일만 업로드 가능합니다.')
    if (file.size > 2 * 1024 * 1024) return alert('이미지 크기는 2MB 이하만 가능합니다.')
    const reader = new FileReader()
    reader.onload = () => {
      setForm({ ...form, imageData: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!form.name || !form.genre) return alert('이름과 장르는 필수입니다.')

    const snsData = {
      instagram: form.instagram || undefined,
      youtube: form.youtube || undefined,
      twitter: form.twitter || undefined,
    }
    const hasSns = Object.values(snsData).some(Boolean)

    const artistData = {
      name: form.name,
      genre: form.genre,
      description: form.description || undefined,
      imageData: form.imageData || undefined,
      sns: hasSns ? snsData : undefined,
    }

    let updated: Artist[]
    if (editingId !== null) {
      updated = artists.map((a) => (a.id === editingId ? { ...a, ...artistData } : a))
    } else {
      const newId = Date.now()
      updated = [...artists, { ...artistData, id: newId, likes: 0 } as Artist]
    }

    setArtistsState(updated)
    setModalOpen(false)
    saveToServer(updated)
  }

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`"${name}" 아티스트를 삭제하시겠습니까?`)) return
    const updated = artists.filter((a) => a.id !== id)
    setArtistsState(updated)
    saveToServer(updated)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">아티스트 관리</h1>
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
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">아티스트</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">장르</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">스타</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {artists.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">
                    등록된 아티스트가 없습니다.
                  </td>
                </tr>
              ) : (
                artists.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-400 text-xs font-mono">{a.id}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        {a.imageData ? (
                          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={a.imageData} alt={a.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                          </div>
                        )}
                        {a.name}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">{a.genre}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                        {a.likes.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openEdit(a)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(a.id, a.name)}
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
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              {editingId !== null ? '아티스트 수정' : '아티스트 추가'}
            </h2>

            <div className="space-y-4">
              {/* Profile Image Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">프로필 이미지</label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {form.imageData ? (
                  <div className="relative group w-24 h-24">
                    <img
                      src={form.imageData}
                      alt="프로필"
                      className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="px-2 py-1 bg-white text-gray-900 text-[10px] font-medium rounded-md"
                      >
                        변경
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, imageData: '' })}
                        className="px-2 py-1 bg-red-500 text-white text-[10px] font-medium rounded-md"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-gray-400 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                    <span className="text-[10px]">업로드</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">이름 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">장르 *</label>
                <input
                  type="text"
                  value={form.genre}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">설명</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors resize-none"
                />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-xs font-medium text-gray-500 mb-3">SNS 링크</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-16 shrink-0">Instagram</span>
                    <input
                      type="url"
                      value={form.instagram}
                      onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-16 shrink-0">YouTube</span>
                    <input
                      type="url"
                      value={form.youtube}
                      onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                      placeholder="https://youtube.com/..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-16 shrink-0">X (Twitter)</span>
                    <input
                      type="url"
                      value={form.twitter}
                      onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                      placeholder="https://x.com/..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                    />
                  </div>
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
