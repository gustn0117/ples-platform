'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Artist {
  id: string
  name: string
  genre: string
  image_url: string | null
  emoji: string | null
  description: string | null
  likes: number
  investments: number
  is_active: boolean
}

const emptyForm = {
  name: '',
  genre: '',
  emoji: '',
  description: '',
  image_url: '',
}

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchArtists = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setArtists(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchArtists()
  }, [fetchArtists])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (artist: Artist) => {
    setEditingId(artist.id)
    setForm({
      name: artist.name,
      genre: artist.genre,
      emoji: artist.emoji ?? '',
      description: artist.description ?? '',
      image_url: artist.image_url ?? '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.genre) return alert('이름과 장르는 필수입니다.')
    setSaving(true)

    const payload = {
      name: form.name,
      genre: form.genre,
      emoji: form.emoji || null,
      description: form.description || null,
      image_url: form.image_url || null,
    }

    if (editingId) {
      const { error } = await supabase.from('artists').update(payload).eq('id', editingId)
      if (error) {
        alert('수정 실패: ' + error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from('artists').insert({ ...payload, likes: 0, investments: 0, is_active: true })
      if (error) {
        alert('추가 실패: ' + error.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setModalOpen(false)
    fetchArtists()
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('artists').update({ is_active: !current }).eq('id', id)
    if (!error) {
      setArtists((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: !current } : a)))
    }
  }

  const deleteArtist = async (id: string, name: string) => {
    if (!confirm(`"${name}" 아티스트를 삭제하시겠습니까?`)) return
    const { error } = await supabase.from('artists').delete().eq('id', id)
    if (!error) {
      setArtists((prev) => prev.filter((a) => a.id !== id))
    } else {
      alert('삭제 실패: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">아티스트 관리</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + 추가
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">아티스트</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">장르</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">좋아요</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">투자</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">상태</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">로딩 중...</td>
                </tr>
              ) : artists.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">등록된 아티스트가 없습니다.</td>
                </tr>
              ) : (
                artists.map((artist) => (
                  <tr key={artist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{artist.emoji ?? '🎵'}</span>
                        {artist.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{artist.genre}</td>
                    <td className="px-6 py-4 text-gray-600">{artist.likes?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{artist.investments?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          artist.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {artist.is_active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(artist)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => toggleActive(artist.id, artist.is_active)}
                          className={`px-3 py-1 text-xs rounded-md transition-colors ${
                            artist.is_active
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {artist.is_active ? '비활성화' : '활성화'}
                        </button>
                        <button
                          onClick={() => deleteArtist(artist.id, artist.name)}
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
              {editingId ? '아티스트 수정' : '아티스트 추가'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">장르 *</label>
                <input
                  type="text"
                  value={form.genre}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이모지</label>
                <input
                  type="text"
                  value={form.emoji}
                  onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="🎤"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
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
