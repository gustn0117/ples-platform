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

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case '앨범': return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303" />
        </svg>
      )
      case '포스터': return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
        </svg>
      )
      default: return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">갤러리 관리</h1>
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
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">아티스트</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격(현금)</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격(포인트)</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">재고</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {artworks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                    등록된 상품이 없습니다.
                  </td>
                </tr>
              ) : (
                artworks.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                          </svg>
                        </div>
                        <span className="truncate max-w-[150px]">{a.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{a.artist}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                        {categoryIcon(a.category)}
                        {a.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 font-mono text-xs">
                      {a.price != null ? `₩${a.price.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 font-mono text-xs">
                      {a.pointPrice != null ? `${a.pointPrice.toLocaleString()}P` : '-'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`font-medium text-xs ${
                          a.stock <= 0
                            ? 'text-red-600'
                            : a.stock <= 5
                            ? 'text-amber-600'
                            : 'text-gray-700'
                        }`}
                      >
                        {a.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                          a.soldOut
                            ? 'bg-red-50 text-red-600'
                            : 'bg-green-50 text-green-600'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${a.soldOut ? 'bg-red-500' : 'bg-green-500'}`} />
                        {a.soldOut ? '품절' : '판매중'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openEdit(a)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => toggleSoldOut(a.id, a.soldOut)}
                          className={`px-2.5 py-1.5 text-xs rounded-md transition-colors border ${
                            a.soldOut
                              ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                              : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {a.soldOut ? '판매재개' : '품절처리'}
                        </button>
                        <button
                          onClick={() => handleDelete(a.id, a.title)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 rounded-md hover:bg-red-50 transition-colors border border-red-200"
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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              {editingId !== null ? '상품 수정' : '상품 추가'}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">아티스트 *</label>
                  <input
                    type="text"
                    value={form.artist}
                    onChange={(e) => setForm({ ...form, artist: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">카테고리</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as Artwork['category'] })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors bg-white"
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
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">가격(현금)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">가격(포인트)</label>
                  <input
                    type="number"
                    value={form.pointPrice}
                    onChange={(e) =>
                      setForm({ ...form, pointPrice: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">재고</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                  />
                </div>
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
