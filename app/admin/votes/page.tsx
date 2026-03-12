// app/admin/votes/page.tsx
'use client'

import { useEffect, useState } from 'react'
import type { Vote } from '@/lib/mock-data'

interface OptionInput {
  label: string
  mediaType?: 'image' | 'audio'
  mediaData?: string
  link?: string
}

const emptyForm = {
  title: '',
  description: '',
  pointReward: 10,
  endDate: '',
}

export default function AdminVotesPage() {
  const [votes, setVotesState] = useState<Vote[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [options, setOptions] = useState<OptionInput[]>([{ label: '' }, { label: '' }])
  const [resultsOpen, setResultsOpen] = useState(false)
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null)

  const fetchVotes = async () => {
    try {
      const res = await fetch('/api/store')
      if (!res.ok) return
      const data = await res.json()
      setVotesState(data.votes || [])
    } catch (e) {
      console.error('Failed to fetch votes:', e)
    }
  }

  const saveToServer = async (updated: Vote[]) => {
    try {
      const res = await fetch('/api/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'votes', value: updated }),
      })
      if (!res.ok) alert('서버 저장에 실패했습니다. 다시 시도해주세요.')
    } catch {
      alert('서버 저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  useEffect(() => {
    fetchVotes()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setOptions([{ label: '' }, { label: '' }])
    setModalOpen(true)
  }

  const openEdit = (v: Vote) => {
    setEditingId(v.id)
    setForm({
      title: v.title,
      description: v.description ?? '',
      pointReward: v.pointReward,
      endDate: v.endDate,
    })
    setOptions(v.options.map((o) => ({ label: o.label, mediaType: o.mediaType, mediaData: o.mediaData, link: o.link })))
    setModalOpen(true)
  }

  const openResults = (v: Vote) => {
    setSelectedVote(v)
    setResultsOpen(true)
  }

  const addOption = () => setOptions([...options, { label: '' }])

  const removeOption = (index: number) => {
    if (options.length <= 2) return
    setOptions(options.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, label: string) => {
    const updated = [...options]
    updated[index] = { ...updated[index], label }
    setOptions(updated)
  }

  const handleMediaUpload = (index: number, file: File) => {
    const isImage = file.type.startsWith('image/')
    const isAudio = file.type.startsWith('audio/')
    if (!isImage && !isAudio) return alert('이미지 또는 오디오 파일만 업로드 가능합니다.')
    if (file.size > 5 * 1024 * 1024) return alert('파일 크기는 5MB 이하로 제한됩니다.')

    const reader = new FileReader()
    reader.onload = () => {
      const updated = [...options]
      updated[index] = {
        ...updated[index],
        mediaType: isImage ? 'image' : 'audio',
        mediaData: reader.result as string,
      }
      setOptions(updated)
    }
    reader.readAsDataURL(file)
  }

  const removeMedia = (index: number) => {
    const updated = [...options]
    updated[index] = { ...updated[index], mediaType: undefined, mediaData: undefined }
    setOptions(updated)
  }

  const handleSave = () => {
    if (!form.title) return alert('제목은 필수입니다.')
    const validOptions = options.filter((o) => o.label.trim())
    if (validOptions.length < 2) return alert('최소 2개의 선택지를 입력하세요.')

    const mappedOptions = validOptions.map((o, i) => ({
      id: i + 1,
      label: o.label,
      votes: 0,
      ...(o.mediaType && o.mediaData ? { mediaType: o.mediaType, mediaData: o.mediaData } : {}),
      ...(o.link ? { link: o.link } : {}),
    }))

    const voteData = {
      title: form.title,
      description: form.description || undefined,
      pointReward: form.pointReward,
      endDate: form.endDate,
      options: mappedOptions,
    }

    let updated: Vote[]
    if (editingId !== null) {
      updated = votes.map((v) => (v.id === editingId ? { ...v, ...voteData } : v))
    } else {
      const newId = Date.now()
      updated = [...votes, { ...voteData, id: newId, isActive: true } as Vote]
    }

    setVotesState(updated)
    setModalOpen(false)
    saveToServer(updated)
  }

  const toggleActive = (id: number, current: boolean) => {
    const updated = votes.map((v) => (v.id === id ? { ...v, isActive: !current } : v))
    setVotesState(updated)
    saveToServer(updated)
  }

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`"${title}" 투표를 삭제하시겠습니까?`)) return
    const updated = votes.filter((v) => v.id !== id)
    setVotesState(updated)
    saveToServer(updated)
  }

  const getTotalVotes = (v: Vote) => v.options.reduce((sum, o) => sum + o.votes, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">투표 관리</h1>
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
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">선택지</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 투표수</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">보상</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">마감일</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {votes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    등록된 투표가 없습니다.
                  </td>
                </tr>
              ) : (
                votes.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900 max-w-[200px] truncate">
                      {v.title}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{v.options.length}개</td>
                    <td className="px-5 py-3.5 text-gray-600 font-medium">{getTotalVotes(v).toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-md">
                        +{v.pointReward}P
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                          v.isActive
                            ? 'bg-green-50 text-green-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${v.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {v.isActive ? '진행중' : '종료'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{v.endDate || '-'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openResults(v)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors border border-indigo-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                          </svg>
                          결과
                        </button>
                        <button
                          onClick={() => openEdit(v)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => toggleActive(v.id, v.isActive)}
                          className={`px-2.5 py-1.5 text-xs rounded-md transition-colors border ${
                            v.isActive
                              ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                              : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                          }`}
                        >
                          {v.isActive ? '종료' : '활성화'}
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.title)}
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
              {editingId !== null ? '투표 수정' : '투표 추가'}
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
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">설명</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">마감일</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                  />
                </div>
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-500">선택지 *</label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-medium"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    추가
                  </button>
                </div>
                <div className="space-y-3">
                  {options.map((opt, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => updateOption(i, e.target.value)}
                          placeholder={`선택지 ${i + 1}`}
                          className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(i)}
                            className="px-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {/* Link input */}
                      <input
                        type="url"
                        value={opt.link || ''}
                        onChange={(e) => {
                          const updated = [...options]
                          updated[i] = { ...updated[i], link: e.target.value || undefined }
                          setOptions(updated)
                        }}
                        placeholder="링크 URL (선택사항)"
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors text-gray-500"
                      />
                      {/* Media upload */}
                      {opt.mediaData ? (
                        <div className="flex items-center gap-3">
                          {opt.mediaType === 'image' ? (
                            <img src={opt.mediaData} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                          ) : (
                            <audio src={opt.mediaData} controls className="h-8 flex-1" />
                          )}
                          <button
                            type="button"
                            onClick={() => removeMedia(i)}
                            className="text-xs text-red-500 hover:text-red-600 font-medium shrink-0"
                          >
                            삭제
                          </button>
                        </div>
                      ) : (
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                          </svg>
                          이미지/음악 첨부
                          <input
                            type="file"
                            accept="image/*,audio/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleMediaUpload(i, file)
                              e.target.value = ''
                            }}
                          />
                        </label>
                      )}
                    </div>
                  ))}
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

      {/* Results Modal */}
      {resultsOpen && selectedVote && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setResultsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{selectedVote.title}</h2>
            <p className="text-xs text-gray-400 mb-6">투표 결과</p>

            <div className="space-y-4">
              {selectedVote.options.map((opt) => {
                const total = getTotalVotes(selectedVote)
                const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0
                return (
                  <div key={opt.id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-900">{opt.label}</span>
                      <span className="text-gray-400 text-xs">
                        {opt.votes.toLocaleString()}표 ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-800 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="mt-5 text-xs text-gray-400 text-center">
              총 {getTotalVotes(selectedVote).toLocaleString()}표
            </p>

            <button
              onClick={() => setResultsOpen(false)}
              className="mt-5 w-full py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
