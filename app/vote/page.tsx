'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { IconVote, IconCoin, IconCheck, IconSparkle } from '@/components/icons';

interface VoteOption {
  id: string;
  vote_id: string;
  label: string;
  vote_count: number;
}

interface Vote {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  ends_at: string;
  reward_points: number;
  created_at: string;
  vote_options: VoteOption[];
}

export default function VotePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [votedItems, setVotedItems] = useState<Set<string>>(new Set());
  const [votingInProgress, setVotingInProgress] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchVotes();
  }, [user]);

  async function fetchVotes() {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          id, title, description, is_active, ends_at, reward_points, created_at,
          vote_options (id, vote_id, label, vote_count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setVotes(data as Vote[]);

      if (user) {
        const { data: userVotes } = await supabase
          .from('user_votes')
          .select('vote_id')
          .eq('user_id', user.id);

        if (userVotes) {
          setVotedItems(new Set(userVotes.map((v) => v.vote_id)));
        }
      }
    } catch (err) {
      console.error('투표 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(voteId: string) {
    if (!user || !selectedOptions[voteId] || votedItems.has(voteId)) return;

    const optionId = selectedOptions[voteId];
    setVotingInProgress(voteId);

    try {
      const { error: voteError } = await supabase.from('user_votes').insert({
        user_id: user.id,
        vote_id: voteId,
        option_id: optionId,
      });

      if (voteError) throw voteError;

      const option = votes
        .find((v) => v.id === voteId)
        ?.vote_options.find((o) => o.id === optionId);

      if (option) {
        await supabase
          .from('vote_options')
          .update({ vote_count: option.vote_count + 1 })
          .eq('id', optionId);
      }

      const currentVote = votes.find((v) => v.id === voteId);
      const pointReward = currentVote?.reward_points || 10;

      await supabase.from('points_transactions').insert({
        user_id: user.id,
        amount: pointReward,
        type: 'earn',
        description: `투표 참여: ${currentVote?.title || ''}`,
      });

      if (profile) {
        await supabase
          .from('profiles')
          .update({ points: profile.points + pointReward })
          .eq('id', user.id);
      }

      setVotedItems(new Set([...votedItems, voteId]));
      setVoteSuccess(voteId);
      setTimeout(() => setVoteSuccess(null), 3000);

      await fetchVotes();
      await refreshProfile();
    } catch (err) {
      console.error('투표 실패:', err);
      alert('투표 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setVotingInProgress(null);
    }
  }

  const getTotalVotes = (options: VoteOption[]) =>
    options.reduce((sum, opt) => sum + (opt.vote_count || 0), 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-6">
              <IconVote className="w-7 h-7 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              투표에 참여하고 포인트를 적립하려면<br />먼저 로그인해주세요
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-gray-900 text-white text-sm font-medium rounded-2xl hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/10"
            >
              로그인하러 가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gray-50/50 border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
            <div className="skeleton-heading w-56 mb-3" />
            <div className="skeleton-text w-80" />
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 p-8 space-y-4">
                <div className="skeleton-heading w-3/4" />
                <div className="skeleton-text w-1/2" />
                <div className="space-y-3 pt-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="skeleton h-14 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-gray-50/50 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
              <IconVote className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">국민 프로듀서 투표</h1>
          </div>
          <p className="text-gray-400 ml-[52px]">투표에 참여하고 포인트를 적립하세요</p>
          {profile && (
            <div className="mt-6 ml-[52px] inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <IconCoin className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">보유 포인트</span>
              <span className="text-sm font-bold text-gray-900 tabular-nums">
                {profile.points.toLocaleString()}P
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Vote List */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {votes.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4 animate-gentle-float">
              <IconVote className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-400">현재 진행 중인 투표가 없습니다</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {votes.map((vote, voteIndex) => {
              const total = getTotalVotes(vote.vote_options);
              const hasVoted = votedItems.has(vote.id);
              const isVoting = votingInProgress === vote.id;
              const justVoted = voteSuccess === vote.id;

              return (
                <div
                  key={vote.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500"
                >
                  {/* Vote Header */}
                  <div className="relative p-8 pb-5 dot-pattern-subtle rounded-t-3xl">
                    {/* Vote index badge */}
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 text-xs font-bold tabular-nums">
                        {String(voteIndex + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4 mb-4 pr-10">
                      <h2 className="text-xl font-bold text-gray-900 leading-snug">{vote.title}</h2>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="sparkle-badge inline-flex items-center gap-1.5 bg-gray-900 text-white rounded-xl px-3 py-1.5 text-xs font-semibold">
                          <IconCoin className="w-3.5 h-3.5" />
                          +{vote.reward_points || 10}P
                        </span>
                        {hasVoted && (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-emerald-100">
                            <IconCheck className="w-3 h-3" />
                            완료
                          </span>
                        )}
                        {!hasVoted && (
                          <span
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide ${
                              vote.is_active
                                ? 'bg-gray-900 text-white shadow-sm shadow-gray-900/20'
                                : 'bg-gray-100 text-gray-400 ring-1 ring-gray-200'
                            }`}
                          >
                            {vote.is_active ? '진행중' : '종료'}
                          </span>
                        )}
                      </div>
                    </div>
                    {vote.description && (
                      <p className="text-sm text-gray-500 mb-2">{vote.description}</p>
                    )}
                    <p className="text-xs text-gray-300 font-medium">
                      마감일 {new Date(vote.ends_at).toLocaleDateString('ko-KR')} · {total.toLocaleString()}명 참여
                    </p>
                  </div>

                  {/* Options */}
                  <div className="px-8 pb-5 flex flex-col gap-2.5">
                    {vote.vote_options.map((option) => {
                      const percentage = total > 0 ? Math.round((option.vote_count / total) * 100) : 0;
                      const isSelected = selectedOptions[vote.id] === option.id;

                      return (
                        <button
                          key={option.id}
                          onClick={() => {
                            if (!hasVoted && vote.is_active && !isVoting)
                              setSelectedOptions({ ...selectedOptions, [vote.id]: option.id });
                          }}
                          disabled={!vote.is_active || hasVoted || isVoting}
                          className={`relative w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 group/option ${
                            isSelected
                              ? 'border-gray-900 bg-gray-50 shadow-sm shadow-gray-900/5'
                              : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50/50 hover:shadow-sm bg-white'
                          } ${!vote.is_active || hasVoted ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'}`}
                        >
                          <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {/* Radio indicator with spring animation */}
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                                  isSelected
                                    ? 'border-gray-900 bg-gray-900 animate-spring-scale'
                                    : 'border-gray-300 group-hover/option:border-gray-400'
                                }`}
                              >
                                {isSelected && (
                                  <IconCheck className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className={`font-medium text-sm transition-colors duration-200 ${isSelected ? 'text-gray-900 font-semibold' : 'text-gray-600 group-hover/option:text-gray-900'}`}>{option.label}</span>
                            </div>
                            {(hasVoted || !vote.is_active) && (
                              <span className="text-sm font-bold text-gray-900 tabular-nums">
                                {percentage}%
                              </span>
                            )}
                          </div>

                          {/* Progress bar with gradient and delayed animation */}
                          {(hasVoted || !vote.is_active) && (
                            <div className="vote-progress-enter">
                              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-2 rounded-full transition-all duration-1000 ease-out"
                                  style={{
                                    width: `${percentage}%`,
                                    background: 'linear-gradient(90deg, #374151, #111827)',
                                    transitionDelay: '0.2s',
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer / Action */}
                  <div className="px-8 pb-8 pt-4">
                    <div className="border-t border-gray-100 pt-5">
                      {justVoted ? (
                        <div className="relative flex items-center justify-center gap-2.5 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-fade-in-up vote-confetti-container overflow-hidden">
                          {/* Confetti dots */}
                          <div className="vote-confetti-dot" />
                          <div className="vote-confetti-dot" />
                          <div className="vote-confetti-dot" />
                          <div className="vote-confetti-dot" />
                          <div className="vote-confetti-dot" />
                          <div className="vote-confetti-dot" />
                          {/* Bounce-in checkmark */}
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center animate-bounce-check">
                            <IconCheck className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-emerald-600">
                            투표 완료! +{vote.reward_points || 10}P 적립되었습니다
                          </span>
                        </div>
                      ) : vote.is_active && !hasVoted ? (
                        <button
                          onClick={() => handleVote(vote.id)}
                          disabled={!selectedOptions[vote.id] || isVoting}
                          className={`w-full py-4 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2.5 ${
                            selectedOptions[vote.id] && !isVoting
                              ? 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-900/15 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isVoting ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              투표 중...
                            </>
                          ) : (
                            <>
                              <IconCheck className="w-4 h-4" />
                              투표하기
                            </>
                          )}
                        </button>
                      ) : hasVoted ? (
                        <div className="flex items-center justify-center gap-2.5 py-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <IconCheck className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm text-gray-500 font-medium">투표 완료</span>
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <span className="text-sm text-gray-400 font-medium">종료된 투표입니다</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
