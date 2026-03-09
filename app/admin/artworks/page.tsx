'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Artwork {
  id: string
  title: string
  artist_name: string
  emoji: string | null
  price_cash: number
  price_points: number
  stock: number
  category: string | null
  description: string | null
  is_active: boolean
}

const emptyForm = {
  title: '',
  artist_name: '',
  emoji: '',
  price_cash: 0,
  price_points: 0,
  stock: 0,
  category: '',
  description: '',
}

export default function AdminArtworksPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchArtworks = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setArtworks(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchArtworks()
  }, [fetchArtworks])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (item: Artwork) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      artist_name: item.artist_name,
      emoji: item.emoji ?? '',
      price_cash: item.price_cash,
      price_points: item.price_points,
      stock: item.stock,
      category: item.category ?? '',
      description: item.description ?? '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.artist_name) return alert('제목과 아티스트명은 필수입니다.')
    setSaving(true)

    const payload = {
      title: form.title,
      artist_name: form.artist_name,
      emoji: form.emoji || null,
      price_cash: form.price_cash,
      price_points: form.price_points,
      stock: form.stock,
      category: form.category || null,
      description: form.description || null,
    }

    if (editingId) {
      const { error } = await supabase.from('artworks').update(payload).eq('id', editingId)
      if (error) {
        alert('수정 실패: ' + error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from('artworks').insert({ ...payload, is_active: true })
      if (error) {
        alert('추가 실패: ' + error.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setModalOpen(false)
    fetchArtworks()
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('artworks').update({ is_active: !current }).eq('id', id)
    if (!error) {
      setArtworks((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: !current } : a)))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">마켓 관리</h1>
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
                <th className="px-6 py-3 text-left font-medium text-gray-500">상품</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">아티스트</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">카테고리</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">가격(현금)</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">가격(포인트)</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">재고</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">상태</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">로딩 중...</td>
                </tr>
              ) : artworks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">등록된 상품이 없습니다.</td>
                </tr>
              ) : (
                artworks.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.emoji ?? '🎨'}</span>
                        {item.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.artist_name}</td>
                    <td className="px-6 py-4 text-gray-600">{item.category ?? '-'}</td>
                    <td className="px-6 py-4 text-gray-600">₩{item.price_cash?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{item.price_points?.toLocaleString()}P</td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${item.stock <= 0 ? 'text-red-600' : item.stock <= 5 ? 'text-yellow-600' : 'text-gray-900'}`}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          item.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {item.is_active ? '판매중' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => toggleActive(item.id, item.is_active)}
                          className={`px-3 py-1 text-xs rounded-md transition-colors ${
                            item.is_active
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {item.is_active ? '비활성화' : '활성화'}
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
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? '상품 수정' : '상품 추가'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">아티스트명 *</label>
                  <input
                    type="text"
                    value={form.artist_name}
                    onChange={(e) => setForm({ ...form, artist_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이모지</label>
                <input
                  type="text"
                  value={form.emoji}
                  onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="🎨"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">가격(현금)</label>
                  <input
                    type="number"
                    value={form.price_cash}
                    onChange={(e) => setForm({ ...form, price_cash: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">가격(포인트)</label>
                  <input
                    type="number"
                    value={form.price_points}
                    onChange={(e) => setForm({ ...form, price_points: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">재고</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
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
