'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

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
  end_date: string;
  point_reward: number;
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
          id, title, description, is_active, end_date, point_reward, created_at,
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
      const pointReward = currentVote?.point_reward || 10;

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
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center animate-slideUp">
          <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🗳️</span>
          </div>
          <h2 className="text-2xl font-bold mb-3">로그인이 필요합니다</h2>
          <p className="text-gray-500 mb-8">투표에 참여하려면 먼저 로그인해주세요</p>
          <Link href="/login" className="btn-primary inline-flex px-8 py-3.5">
            로그인하러 가기
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="section-container py-12">
        <div className="mb-10">
          <div className="h-8 bg-gray-100 rounded-lg w-64 animate-pulse mb-3" />
          <div className="h-5 bg-gray-50 rounded-lg w-96 animate-pulse" />
        </div>
        <div className="flex flex-col gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 space-y-4">
              <div className="h-6 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-50 rounded-lg w-1/2 animate-pulse" />
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10 animate-slideUp">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🗳️</span>
          <h1 className="text-3xl font-bold">국민프로듀서 투표</h1>
        </div>
        <p className="text-gray-500">투표에 참여하고 포인트를 받으세요</p>
        {profile && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 glass rounded-full">
            <span className="text-sm">💰</span>
            <span className="text-sm font-semibold text-ples-silver">
              보유 포인트: {profile.points.toLocaleString()}P
            </span>
          </div>
        )}
      </div>

      {/* Vote List */}
      {votes.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <span className="text-5xl mb-4 block">📭</span>
          <p className="text-gray-500 text-lg">현재 진행 중인 투표가 없습니다</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {votes.map((vote, voteIndex) => {
            const total = getTotalVotes(vote.vote_options);
            const hasVoted = votedItems.has(vote.id);
            const isVoting = votingInProgress === vote.id;
            const justVoted = voteSuccess === vote.id;

            return (
              <div
                key={vote.id}
                className="glass rounded-2xl overflow-hidden card-hover animate-slideUp"
                style={{ animationDelay: `${voteIndex * 0.1}s` }}
              >
                {/* Header */}
                <div className="p-6 pb-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h2 className="text-lg font-bold">{vote.title}</h2>
                    <span
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                        vote.is_active
                          ? 'bg-ples-green/10 text-ples-green border border-ples-green/20'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {vote.is_active ? '진행중' : '종료'}
                    </span>
                  </div>
                  {vote.description && (
                    <p className="text-sm text-gray-500 mb-2">{vote.description}</p>
                  )}
                  <p className="text-sm text-gray-600 mb-5">
                    마감일: {new Date(vote.end_date).toLocaleDateString('ko-KR')} · 참여 시 +{vote.point_reward || 10}P
                  </p>
                </div>

                {/* Options */}
                <div className="px-6 pb-4 flex flex-col gap-3">
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
                        className={`relative w-full text-left p-4 rounded-xl border transition-all overflow-hidden ${
                          isSelected
                            ? 'border-gray-300 bg-gray-100'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!vote.is_active || hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        {/* Animated Progress bar */}
                        {(hasVoted || !vote.is_active) && (
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                        )}
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'border-gray-900 bg-gray-900' : 'border-gray-400'
                              }`}
                            >
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className="font-medium">{option.label}</span>
                          </div>
                          {(hasVoted || !vote.is_active) && (
                            <span className="text-sm font-bold text-ples-silver">
                              {percentage}%
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                  {justVoted ? (
                    <div className="flex items-center justify-center gap-2 py-3.5 bg-ples-green/10 rounded-xl border border-ples-green/20 animate-slideUp">
                      <svg className="w-5 h-5 text-ples-green" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-semibold text-ples-green">
                        투표 완료! +{vote.point_reward || 10}P 적립되었습니다
                      </span>
                    </div>
                  ) : vote.is_active && !hasVoted ? (
                    <button
                      onClick={() => handleVote(vote.id)}
                      disabled={!selectedOptions[vote.id] || isVoting}
                      className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                        selectedOptions[vote.id] && !isVoting
                          ? 'btn-primary'
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isVoting ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          투표 중...
                        </>
                      ) : (
                        '투표하기'
                      )}
                    </button>
                  ) : hasVoted ? (
                    <div className="flex items-center justify-center gap-2 py-3.5 bg-gray-100 rounded-xl">
                      <svg className="w-4 h-4 text-ples-silver" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-semibold text-ples-silver">투표 완료</span>
                    </div>
                  ) : (
                    <div className="text-center py-3.5 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-500">종료된 투표입니다</span>
                    </div>
                  )}
                  <p className="text-center text-xs text-gray-600 mt-3">
                    총 {total.toLocaleString()}명 참여
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
