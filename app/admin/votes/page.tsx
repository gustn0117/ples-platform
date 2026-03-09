'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface VoteOption {
  id: string
  vote_id: string
  label: string
  vote_count: number
}

interface Vote {
  id: string
  title: string
  description: string | null
  is_active: boolean
  reward_points: number
  ends_at: string | null
  vote_options: VoteOption[]
}

interface OptionInput {
  label: string
}

const emptyForm = {
  title: '',
  description: '',
  reward_points: 100,
  ends_at: '',
}

export default function AdminVotesPage() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [resultsOpen, setResultsOpen] = useState(false)
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [options, setOptions] = useState<OptionInput[]>([{ label: '' }, { label: '' }])
  const [saving, setSaving] = useState(false)

  const fetchVotes = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('votes')
      .select('*, vote_options(*)')
      .order('created_at', { ascending: false })

    if (!error && data) setVotes(data as Vote[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchVotes()
  }, [fetchVotes])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setOptions([{ label: '' }, { label: '' }])
    setModalOpen(true)
  }

  const openEdit = (vote: Vote) => {
    setEditingId(vote.id)
    setForm({
      title: vote.title,
      description: vote.description ?? '',
      reward_points: vote.reward_points,
      ends_at: vote.ends_at ? vote.ends_at.slice(0, 16) : '',
    })
    setOptions(vote.vote_options.map((o) => ({ label: o.label })))
    setModalOpen(true)
  }

  const openResults = (vote: Vote) => {
    setSelectedVote(vote)
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

  const handleSave = async () => {
    if (!form.title) return alert('제목은 필수입니다.')
    const validOptions = options.filter((o) => o.label.trim())
    if (validOptions.length < 2) return alert('최소 2개의 선택지를 입력하세요.')
    setSaving(true)

    const payload = {
      title: form.title,
      description: form.description || null,
      reward_points: form.reward_points,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    }

    if (editingId) {
      const { error } = await supabase.from('votes').update(payload).eq('id', editingId)
      if (error) {
        alert('수정 실패: ' + error.message)
        setSaving(false)
        return
      }
      // Delete old options and re-insert
      await supabase.from('vote_options').delete().eq('vote_id', editingId)
      const { error: optErr } = await supabase.from('vote_options').insert(
        validOptions.map((o) => ({ vote_id: editingId, label: o.label, vote_count: 0 }))
      )
      if (optErr) {
        alert('선택지 수정 실패: ' + optErr.message)
        setSaving(false)
        return
      }
    } else {
      const { data: newVote, error } = await supabase
        .from('votes')
        .insert({ ...payload, is_active: true })
        .select()
        .single()

      if (error || !newVote) {
        alert('추가 실패: ' + (error?.message ?? '알 수 없는 오류'))
        setSaving(false)
        return
      }

      const { error: optErr } = await supabase.from('vote_options').insert(
        validOptions.map((o) => ({ vote_id: newVote.id, label: o.label, vote_count: 0 }))
      )
      if (optErr) {
        alert('선택지 추가 실패: ' + optErr.message)
      }
    }

    setSaving(false)
    setModalOpen(false)
    fetchVotes()
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('votes').update({ is_active: !current }).eq('id', id)
    if (!error) {
      setVotes((prev) => prev.map((v) => (v.id === id ? { ...v, is_active: !current } : v)))
    }
  }

  const getTotalVotes = (vote: Vote) =>
    vote.vote_options.reduce((sum, o) => sum + (o.vote_count ?? 0), 0)

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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">로딩 중...</td>
                </tr>
              ) : votes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">등록된 투표가 없습니다.</td>
                </tr>
              ) : (
                votes.map((vote) => (
                  <tr key={vote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{vote.title}</td>
                    <td className="px-6 py-4 text-gray-600">{vote.vote_options.length}개</td>
                    <td className="px-6 py-4 text-gray-600">{getTotalVotes(vote).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{vote.reward_points}P</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          vote.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {vote.is_active ? '진행중' : '종료'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {vote.ends_at ? new Date(vote.ends_at).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openResults(vote)}
                          className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                          결과
                        </button>
                        <button
                          onClick={() => openEdit(vote)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => toggleActive(vote.id, vote.is_active)}
                          className={`px-3 py-1 text-xs rounded-md transition-colors ${
                            vote.is_active
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {vote.is_active ? '종료' : '활성화'}
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
              {editingId ? '투표 수정' : '투표 추가'}
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
                    value={form.reward_points}
                    onChange={(e) => setForm({ ...form, reward_points: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">마감일</label>
                  <input
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
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
                    className="text-xs text-gray-600 hover:text-gray-700 font-medium"
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
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
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
                disabled={saving}
                className="flex-1 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? '저장 중...' : editingId ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {resultsOpen && selectedVote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setResultsOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-1">{selectedVote.title}</h2>
            <p className="text-sm text-gray-500 mb-6">투표 결과</p>

            <div className="space-y-4">
              {selectedVote.vote_options.map((opt) => {
                const total = getTotalVotes(selectedVote)
                const pct = total > 0 ? Math.round((opt.vote_count / total) * 100) : 0
                return (
                  <div key={opt.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900">{opt.label}</span>
                      <span className="text-gray-500">{opt.vote_count}표 ({pct}%)</span>
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
