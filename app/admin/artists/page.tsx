// app/admin/artists/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  initStore,
  getArtists,
  addArtist,
  updateArtist,
  deleteArtist as deleteArtistFromStore,
} from '@/lib/store'
import type { Artist } from '@/lib/mock-data'

const emptyForm = { name: '', genre: '', description: '' }

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)

  const reload = () => setArtists(getArtists())

  useEffect(() => {
    initStore()
    reload()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (a: Artist) => {
    setEditingId(a.id)
    setForm({ name: a.name, genre: a.genre, description: a.description ?? '' })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name || !form.genre) return alert('이름과 장르는 필수입니다.')

    if (editingId !== null) {
      updateArtist(editingId, {
        name: form.name,
        genre: form.genre,
        description: form.description || undefined,
      })
    } else {
      addArtist({
        name: form.name,
        genre: form.genre,
        image: '🎵',
        likes: 0,
        description: form.description || undefined,
      })
    }

    setModalOpen(false)
    reload()
  }

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`"${name}" 아티스트를 삭제하시겠습니까?`)) return
    deleteArtistFromStore(id)
    reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">아티스트 관리</h1>
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
                <th className="px-6 py-3 text-left font-medium text-gray-500">아티스트</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">장르</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">좋아요</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {artists.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    등록된 아티스트가 없습니다.
                  </td>
                </tr>
              ) : (
                artists.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-400">{a.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{a.image}</span>
                        {a.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{a.genre}</td>
                    <td className="px-6 py-4 text-gray-600">{a.likes.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(a)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(a.id, a.name)}
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
              {editingId !== null ? '아티스트 수정' : '아티스트 추가'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">장르 *</label>
                <input
                  type="text"
                  value={form.genre}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
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
