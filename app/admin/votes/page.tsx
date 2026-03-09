// app/admin/votes/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  initStore,
  getVotes,
  addVote,
  updateVote,
  deleteVote as deleteVoteFromStore,
} from '@/lib/store'
import type { Vote } from '@/lib/mock-data'

interface OptionInput {
  label: string
}

const emptyForm = {
  title: '',
  description: '',
  pointReward: 10,
  endDate: '',
}

export default function AdminVotesPage() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [options, setOptions] = useState<OptionInput[]>([{ label: '' }, { label: '' }])
  const [resultsOpen, setResultsOpen] = useState(false)
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null)

  const reload = () => setVotes(getVotes())

  useEffect(() => {
    initStore()
    reload()
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
    setOptions(v.options.map((o) => ({ label: o.label })))
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
    updated[index] = { label }
    setOptions(updated)
  }

  const handleSave = () => {
    if (!form.title) return alert('제목은 필수입니다.')
    const validOptions = options.filter((o) => o.label.trim())
    if (validOptions.length < 2) return alert('최소 2개의 선택지를 입력하세요.')

    if (editingId !== null) {
      updateVote(editingId, {
        title: form.title,
        description: form.description || undefined,
        pointReward: form.pointReward,
        endDate: form.endDate,
        options: validOptions.map((o, i) => ({ id: i + 1, label: o.label, votes: 0 })),
      })
    } else {
      addVote({
        title: form.title,
        description: form.description || undefined,
        pointReward: form.pointReward,
        endDate: form.endDate,
        isActive: true,
        options: validOptions.map((o, i) => ({ id: i + 1, label: o.label, votes: 0 })),
      })
    }

    setModalOpen(false)
    reload()
  }

  const toggleActive = (id: number, current: boolean) => {
    updateVote(id, { isActive: !current })
    reload()
  }

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`"${title}" 투표를 삭제하시겠습니까?`)) return
    deleteVoteFromStore(id)
    reload()
  }

  const getTotalVotes = (v: Vote) => v.options.reduce((sum, o) => sum + o.votes, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">투표 관리</h1>
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
                <th className="px-6 py-3 text-left font-medium text-gray-500">제목</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">선택지</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">총 투표수</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">보상</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">상태</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">마감일</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {votes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    등록된 투표가 없습니다.
                  </td>
                </tr>
              ) : (
                votes.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-[200px] truncate">
                      {v.title}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{v.options.length}개</td>
                    <td className="px-6 py-4 text-gray-600">{getTotalVotes(v).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{v.pointReward}P</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          v.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {v.isActive ? '진행중' : '종료'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{v.endDate || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openResults(v)}
                          className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                          결과
                        </button>
                        <button
                          onClick={() => openEdit(v)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => toggleActive(v.id, v.isActive)}
                          className={`px-3 py-1 text-xs rounded-md transition-colors ${
                            v.isActive
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {v.isActive ? '종료' : '활성화'}
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.title)}
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
              {editingId !== null ? '투표 수정' : '투표 추가'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">보상 포인트</label>
                  <input
                    type="number"
                    value={form.pointReward}
                    onChange={(e) =>
                      setForm({ ...form, pointReward: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">마감일</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">선택지 *</label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                  >
                    + 추가
                  </button>
                </div>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`선택지 ${i + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          className="px-2 text-red-400 hover:text-red-600"
                        >
                          X
                        </button>
                      )}
                    </div>
                  ))}
                </div>
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

      {/* Results Modal */}
      {resultsOpen && selectedVote && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setResultsOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-1">{selectedVote.title}</h2>
            <p className="text-sm text-gray-500 mb-6">투표 결과</p>

            <div className="space-y-4">
              {selectedVote.options.map((opt) => {
                const total = getTotalVotes(selectedVote)
                const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0
                return (
                  <div key={opt.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900">{opt.label}</span>
                      <span className="text-gray-500">
                        {opt.votes.toLocaleString()}표 ({pct}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-600 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="mt-4 text-sm text-gray-400 text-center">
              총 {getTotalVotes(selectedVote).toLocaleString()}표
            </p>

            <button
              onClick={() => setResultsOpen(false)}
              className="mt-6 w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
