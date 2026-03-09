'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  getVotes,
  getUserVoted,
  castVote,
  getUserPoints,
  initStore,
} from '@/lib/store';
import Link from 'next/link';
import type { Vote } from '@/lib/mock-data';

export default function VotePage() {
  const { user } = useAuth();
  const [votes, setVotesData] = useState<Vote[]>([]);
  const [userVoted, setUserVoted] = useState<Record<number, number>>({});
  const [userPoints, setUserPointsState] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [votingInProgress, setVotingInProgress] = useState<number | null>(null);
  const [voteSuccess, setVoteSuccess] = useState<number | null>(null);

  useEffect(() => {
    initStore();
    refreshData();
  }, []);

  function refreshData() {
    setVotesData(getVotes());
    setUserVoted(getUserVoted());
    setUserPointsState(getUserPoints());
    setLoading(false);
  }

  function handleVote(voteId: number) {
    const optionId = selectedOptions[voteId];
    if (!user || optionId === undefined || userVoted[voteId] !== undefined) return;

    setVotingInProgress(voteId);

    // Small delay to show loading state
    setTimeout(() => {
      const result = castVote(voteId, optionId);

      if (result.success) {
        setVoteSuccess(voteId);
        refreshData();
        setTimeout(() => setVoteSuccess(null), 3000);
      } else {
        alert(result.error || '투표 중 오류가 발생했습니다.');
      }

      setVotingInProgress(null);
    }, 400);
  }

  function getTotalVotes(options: Vote['options']) {
    return options.reduce((sum, opt) => sum + opt.votes, 0);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 p-6 animate-pulse"
              >
                <div className="h-5 bg-gray-100 rounded w-2/3 mb-3" />
                <div className="h-4 bg-gray-50 rounded w-1/2 mb-5" />
                <div className="space-y-3">
                  <div className="h-12 bg-gray-50 rounded-xl" />
                  <div className="h-12 bg-gray-50 rounded-xl" />
                  <div className="h-12 bg-gray-50 rounded-xl" />
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            세계시민 프로듀서 투표
          </h1>
          <p className="text-sm text-gray-500">
            투표에 참여하고 포인트를 적립하세요
          </p>
          {user && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm">
              <span className="text-gray-400">보유 포인트</span>
              <span className="font-bold text-gray-900 tabular-nums">
                {userPoints.toLocaleString()}P
              </span>
            </div>
          )}
        </div>

        {/* Vote Cards */}
        {votes.length === 0 ? (
          <div className="text-center py-20 border border-gray-100 rounded-2xl">
            <p className="text-gray-400">현재 진행 중인 투표가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-6">
            {votes.map((vote) => {
              const total = getTotalVotes(vote.options);
              const hasVoted = userVoted[vote.id] !== undefined;
              const isVoting = votingInProgress === vote.id;
              const justVoted = voteSuccess === vote.id;
              const showResults = hasVoted || !vote.isActive;

              return (
                <div
                  key={vote.id}
                  className="border border-gray-100 rounded-2xl overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h2 className="text-lg font-bold text-gray-900 leading-snug">
                        {vote.title}
                      </h2>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Point reward badge */}
                        <span className="inline-flex items-center gap-1 bg-gray-900 text-white rounded-lg px-2.5 py-1 text-xs font-semibold">
                          +{vote.pointReward}P
                        </span>
                        {/* Status badge */}
                        {!vote.isActive && (
                          <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-400">
                            종료
                          </span>
                        )}
                      </div>
                    </div>
                    {vote.description && (
                      <p className="text-sm text-gray-500 mb-3">
                        {vote.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>
                        마감일{' '}
                        {new Date(vote.endDate).toLocaleDateString('ko-KR')}
                      </span>
                      <span className="text-gray-200">|</span>
                      <span>{total.toLocaleString()}명 참여</span>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="px-6 pb-4 space-y-2">
                    {vote.options.map((option) => {
                      const percentage =
                        total > 0
                          ? Math.round((option.votes / total) * 100)
                          : 0;
                      const isSelected = selectedOptions[vote.id] === option.id;
                      const canSelect =
                        !hasVoted && vote.isActive && !isVoting && !!user;

                      return (
                        <button
                          key={option.id}
                          onClick={() => {
                            if (canSelect) {
                              setSelectedOptions({
                                ...selectedOptions,
                                [vote.id]: option.id,
                              });
                            }
                          }}
                          disabled={!canSelect}
                          className={`relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-100 bg-white'
                          } ${
                            canSelect
                              ? 'cursor-pointer hover:border-gray-300 hover:bg-gray-50/50 active:scale-[0.99]'
                              : 'cursor-default'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-3">
                              {/* Radio button */}
                              {vote.isActive && !hasVoted && (
                                <div
                                  className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected
                                      ? 'border-gray-900 bg-gray-900'
                                      : 'border-gray-300'
                                  }`}
                                  style={{ width: 18, height: 18 }}
                                >
                                  {isSelected && (
                                    <svg
                                      className="w-2.5 h-2.5 text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                </div>
                              )}
                              <span
                                className={`text-sm ${
                                  isSelected
                                    ? 'font-semibold text-gray-900'
                                    : 'font-medium text-gray-700'
                                }`}
                              >
                                {option.label}
                              </span>
                            </div>
                            {showResults && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 tabular-nums">
                                  {option.votes.toLocaleString()}표
                                </span>
                                <span className="text-sm font-bold text-gray-900 tabular-nums min-w-[3ch] text-right">
                                  {percentage}%
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Percentage bar */}
                          {showResults && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-1.5 rounded-full bg-gray-900 transition-all duration-700 ease-out"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer / Action */}
                  <div className="px-6 pb-6 pt-2">
                    {/* Not logged in */}
                    {!user && vote.isActive ? (
                      <Link
                        href="/login"
                        className="block w-full text-center py-4 rounded-xl bg-gray-100 text-gray-500 text-base font-medium hover:bg-gray-200 transition-colors"
                      >
                        로그인 후 투표에 참여하세요
                      </Link>
                    ) : justVoted ? (
                      /* Just voted success */
                      <div className="flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-xl border border-gray-200">
                        <svg
                          className="w-5 h-5 text-gray-900"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm font-semibold text-gray-900">
                          투표 완료! +{vote.pointReward}P 적립되었습니다
                        </span>
                      </div>
                    ) : vote.isActive && !hasVoted && user ? (
                      /* Can vote */
                      <button
                        onClick={() => handleVote(vote.id)}
                        disabled={
                          selectedOptions[vote.id] === undefined || isVoting
                        }
                        className={`w-full py-4 rounded-xl text-base font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                          selectedOptions[vote.id] !== undefined && !isVoting
                            ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isVoting ? (
                          <>
                            <svg
                              className="w-4 h-4 animate-spin"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            투표 중...
                          </>
                        ) : (
                          '투표하기'
                        )}
                      </button>
                    ) : hasVoted ? (
                      /* Already voted */
                      <div className="text-center py-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-sm text-gray-500 font-medium">
                          이미 참여한 투표입니다
                        </span>
                      </div>
                    ) : (
                      /* Ended */
                      <div className="text-center py-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-sm text-gray-400 font-medium">
                          종료된 투표입니다
                        </span>
                      </div>
                    )}
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
