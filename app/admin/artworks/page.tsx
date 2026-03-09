// app/admin/artworks/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  initStore,
  getArtworks,
  addArtwork,
  updateArtwork,
  deleteArtwork as deleteArtworkFromStore,
} from '@/lib/store'
import type { Artwork } from '@/lib/mock-data'

const categories: Artwork['category'][] = ['앨범', '포스터', '포토카드', '머천다이즈', '디지털']

const emptyForm = {
  title: '',
  artist: '',
  category: '앨범' as Artwork['category'],
  price: 0,
  pointPrice: 0,
  description: '',
  stock: 0,
}

export default function AdminArtworksPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)

  const reload = () => setArtworks(getArtworks())

  useEffect(() => {
    initStore()
    reload()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (a: Artwork) => {
    setEditingId(a.id)
    setForm({
      title: a.title,
      artist: a.artist,
      category: a.category,
      price: a.price,
      pointPrice: a.pointPrice,
      description: a.description,
      stock: a.stock,
    })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.title || !form.artist) return alert('제목과 아티스트는 필수입니다.')

    if (editingId !== null) {
      updateArtwork(editingId, {
        title: form.title,
        artist: form.artist,
        category: form.category,
        price: form.price,
        pointPrice: form.pointPrice,
        description: form.description,
        stock: form.stock,
      })
    } else {
      addArtwork({
        title: form.title,
        artist: form.artist,
        image: '🎨',
        category: form.category,
        price: form.price,
        pointPrice: form.pointPrice,
        description: form.description,
        soldOut: false,
        stock: form.stock,
      })
    }

    setModalOpen(false)
    reload()
  }

  const toggleSoldOut = (id: number, current: boolean) => {
    updateArtwork(id, { soldOut: !current })
    reload()
  }

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`"${title}" 작품을 삭제하시겠습니까?`)) return
    deleteArtworkFromStore(id)
    reload()
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
              {artworks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    등록된 상품이 없습니다.
                  </td>
                </tr>
              ) : (
                artworks.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{a.image}</span>
                        {a.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{a.artist}</td>
                    <td className="px-6 py-4 text-gray-600">{a.category}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {a.price != null ? `₩${a.price.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {a.pointPrice != null ? `${a.pointPrice.toLocaleString()}P` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-medium ${
                          a.stock <= 0
                            ? 'text-red-600'
                            : a.stock <= 5
                            ? 'text-yellow-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {a.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          a.soldOut
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {a.soldOut ? '품절' : '판매중'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(a)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => toggleSoldOut(a.id, a.soldOut)}
                          className={`px-3 py-1 text-xs rounded-md transition-colors ${
                            a.soldOut
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }`}
                        >
                          {a.soldOut ? '판매재개' : '품절처리'}
                        </button>
                        <button
                          onClick={() => handleDelete(a.id, a.title)}
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
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId !== null ? '상품 수정' : '상품 추가'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    아티스트 *
                  </label>
                  <input
                    type="text"
                    value={form.artist}
                    onChange={(e) => setForm({ ...form, artist: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as Artwork['category'] })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    가격(현금)
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    가격(포인트)
                  </label>
                  <input
                    type="number"
                    value={form.pointPrice}
                    onChange={(e) =>
                      setForm({ ...form, pointPrice: parseInt(e.target.value) || 0 })
                    }
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
