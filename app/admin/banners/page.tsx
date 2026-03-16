// app/admin/banners/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import type { Banner } from '@/lib/mock-data'

const emptyForm = {
  title: '',
  subtitle: '',
  bgColor: '#1a1a1a',
  bgImage: '',
  textColor: 'light' as 'light' | 'dark',
  link: '',
  isActive: true,
  order: 1,
}

export default function AdminBannersPage() {
  const [banners, setBannersState] = useState<Banner[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('이미지 크기는 50MB 이하만 가능합니다.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setForm((prev) => ({ ...prev, bgImage: result }))
    }
    reader.readAsDataURL(file)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/store')
      if (!res.ok) return
      const data = await res.json()
      const serverBanners: Banner[] = data.banners || []
      setBannersState(serverBanners.sort((a: Banner, b: Banner) => a.order - b.order))
    } catch (e) {
      console.error('Failed to fetch banners:', e)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    const maxOrder = banners.length > 0 ? Math.max(...banners.map((b) => b.order)) : 0
    setForm({ ...emptyForm, order: maxOrder + 1 })
    setModalOpen(true)
  }

  const openEdit = (b: Banner) => {
    setEditingId(b.id)
    setForm({
      title: b.title,
      subtitle: b.subtitle,
      bgColor: b.bgColor,
      bgImage: b.bgImage ?? '',
      textColor: b.textColor,
      link: b.link ?? '',
      isActive: b.isActive,
      order: b.order,
    })
    setModalOpen(true)
  }

  const saveBannersToServer = async (updatedBanners: Banner[]) => {
    try {
      const res = await fetch('/api/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'banners', value: updatedBanners }),
      })
      if (!res.ok) {
        alert('서버 저장에 실패했습니다. 다시 시도해주세요.')
        return false
      }
      return true
    } catch {
      alert('서버 저장에 실패했습니다. 다시 시도해주세요.')
      return false
    }
  }

  const handleSave = () => {
    if (!form.title) return alert('제목은 필수입니다.')

    const bannerData = {
      title: form.title,
      subtitle: form.subtitle,
      bgColor: form.bgColor,
      bgImage: form.bgImage || undefined,
      textColor: form.textColor,
      link: form.link || undefined,
      isActive: form.isActive,
      order: form.order,
    }

    let updatedBanners: Banner[]
    if (editingId !== null) {
      updatedBanners = banners.map((b) => (b.id === editingId ? { ...b, ...bannerData } : b))
    } else {
      const newId = Date.now()
      updatedBanners = [...banners, { ...bannerData, id: newId } as Banner]
    }

    // Update UI immediately
    setBannersState(updatedBanners.sort((a, b) => a.order - b.order))
    setModalOpen(false)

    // Save to server in background
    saveBannersToServer(updatedBanners)
  }

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`"${title}" 배너를 삭제하시겠습니까?`)) return
    const updatedBanners = banners.filter((b) => b.id !== id)
    setBannersState(updatedBanners)
    saveBannersToServer(updatedBanners)
  }

  const toggleActive = (b: Banner) => {
    const updatedBanners = banners.map((banner) =>
      banner.id === b.id ? { ...banner, isActive: !banner.isActive } : banner
    )
    setBannersState(updatedBanners)
    saveBannersToServer(updatedBanners)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">배너 관리</h1>
          <p className="text-sm text-gray-500 mt-1">메인 페이지 상단에 표시되는 배너를 관리합니다. 2개씩 묶여서 자동으로 슬라이드됩니다.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          배너 추가
        </button>
      </div>

      {/* Banner list */}
      {banners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-sm">등록된 배너가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow"
            >
              <div className="flex items-stretch">
                {/* Preview color swatch */}
                <div
                  className="w-32 sm:w-48 shrink-0 flex flex-col items-center justify-center p-4 relative overflow-hidden"
                  style={{ backgroundColor: banner.bgColor }}
                >
                  {banner.bgImage && (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${banner.bgImage})` }}
                    />
                  )}
                  {banner.bgImage && (
                    <div className={`absolute inset-0 ${banner.textColor === 'light' ? 'bg-black/30' : 'bg-white/40'}`} />
                  )}
                  {!banner.bgImage && <div className="absolute inset-0 dot-pattern opacity-[0.06]" />}
                  <span className={`relative z-10 text-xs font-bold truncate max-w-full px-2 ${banner.textColor === 'light' ? 'text-white' : 'text-gray-900'}`}>
                    {banner.title}
                  </span>
                  <span className={`relative z-10 text-[10px] mt-0.5 truncate max-w-full px-2 ${banner.textColor === 'light' ? 'text-white/50' : 'text-gray-500'}`}>
                    {banner.subtitle}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{banner.title}</h3>
                      <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        banner.isActive
                          ? 'bg-green-50 text-green-600 border border-green-100'
                          : 'bg-gray-50 text-gray-400 border border-gray-100'
                      }`}>
                        {banner.isActive ? '활성' : '비활성'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 truncate">{banner.subtitle}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                      <span>순서: {banner.order}</span>
                      {banner.link && <span>링크: {banner.link}</span>}
                      <span>색상: {banner.bgColor}</span>
                      {banner.bgImage && <span>이미지: 있음</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleActive(banner)}
                      className={`p-2 rounded-lg text-xs transition-colors ${
                        banner.isActive
                          ? 'hover:bg-yellow-50 text-yellow-600'
                          : 'hover:bg-green-50 text-green-600'
                      }`}
                      title={banner.isActive ? '비활성화' : '활성화'}
                    >
                      {banner.isActive ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => openEdit(banner)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id, banner.title)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-fade-in-up"
          >
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                {editingId !== null ? '배너 수정' : '배너 추가'}
              </h2>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Preview */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">미리보기</label>
                <div
                  className="rounded-xl p-6 min-h-[100px] flex flex-col justify-end relative overflow-hidden"
                  style={{ backgroundColor: form.bgColor }}
                >
                  {form.bgImage && (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${form.bgImage})` }}
                    />
                  )}
                  {form.bgImage && (
                    <div className={`absolute inset-0 ${form.textColor === 'light' ? 'bg-gradient-to-t from-black/60 via-black/20 to-transparent' : 'bg-gradient-to-t from-white/80 via-white/40 to-transparent'}`} />
                  )}
                  {!form.bgImage && <div className="absolute inset-0 dot-pattern opacity-[0.04]" />}
                  <h3 className={`relative z-10 text-base font-bold ${form.textColor === 'light' ? 'text-white' : 'text-gray-900'}`}>
                    {form.title || '배너 제목'}
                  </h3>
                  <p className={`relative z-10 mt-1 text-xs ${form.textColor === 'light' ? 'text-white/60' : 'text-gray-500'}`}>
                    {form.subtitle || '배너 설명'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">제목 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="배너 제목"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">설명</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="배너 설명"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">배경 이미지 (선택)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {form.bgImage ? (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-20 h-14 rounded-lg bg-cover bg-center border border-gray-200 shrink-0"
                      style={{ backgroundImage: `url(${form.bgImage})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 truncate">이미지 등록됨</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, bgImage: '' })}
                      className="shrink-0 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      삭제
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="shrink-0 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      변경
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-4 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors flex flex-col items-center gap-1.5"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    클릭하여 이미지 업로드 (50MB 이하)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">배경색</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.bgColor}
                      onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={form.bgColor}
                      onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">글자색</label>
                  <select
                    value={form.textColor}
                    onChange={(e) => setForm({ ...form, textColor: e.target.value as 'light' | 'dark' })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                  >
                    <option value="light">밝은색 (어두운 배경용)</option>
                    <option value="dark">어두운색 (밝은 배경용)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">링크 (선택)</label>
                  <input
                    type="text"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="/vote"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">순서</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    min={1}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-gray-900 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                </label>
                <span className="text-sm text-gray-600">활성화</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
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
