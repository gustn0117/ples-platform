'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  getVotes,
  getUserVoted,
  hasVotedToday,
  castVote,
  getUserStars,
  initStore,
} from '@/lib/store';
import Link from 'next/link';
import type { Vote } from '@/lib/mock-data';

export default function VotePage() {
  const { user } = useAuth();
  const [votes, setVotesData] = useState<Vote[]>([]);
  const [userVoted, setUserVoted] = useState<Record<number, { optionId: number; date: string }>>({});
  const [userStars, setUserStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [votingInProgress, setVotingInProgress] = useState<number | null>(null);
  const [voteSuccess, setVoteSuccess] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    initStore();
    refreshData();
    const onSync = () => refreshData();
    window.addEventListener('ples-data-synced', onSync);
    return () => window.removeEventListener('ples-data-synced', onSync);
  }, []);

  function refreshData() {
    setVotesData(getVotes());
    setUserVoted(getUserVoted());
    setUserStars(getUserStars());
    setLoading(false);
  }

  function handleVote(voteId: number) {
    const optionId = selectedOptions[voteId];
    if (!user || optionId === undefined) return;

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
            매일 투표에 참여하고 스타를 적립하세요
          </p>
          {user && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-100 rounded-xl text-sm">
              <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>
              <span className="text-gray-400">보유 스타</span>
              <span className="font-bold text-gray-900 tabular-nums">
                {userStars.toLocaleString()}
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
              const votedToday = user ? hasVotedToday(vote.id) : false;
              const isVoting = votingInProgress === vote.id;
              const justVoted = voteSuccess === vote.id;
              const showResults = votedToday || !vote.isActive;
              const canVote = !votedToday && vote.isActive && !isVoting;
              const canSubmit = canVote && !!user;

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
                        {/* Star reward badge */}
                        <span className="inline-flex items-center gap-1 bg-yellow-500 text-white rounded-lg px-2.5 py-1 text-xs font-semibold">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>
                          +{vote.pointReward}
                        </span>
                        {/* Status badges */}
                        {votedToday && (
                          <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
                            오늘 완료
                          </span>
                        )}
                        {!vote.isActive && (
                          <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-400">
                            종료
                          </span>
                        )}
                      </div>
                    </div>
                    {vote.description && (
                      <p className="text-sm text-gray-500 mb-3 whitespace-pre-wrap">
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
                      const canSelect = canVote;

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
                          {/* Media preview */}
                          {option.mediaType === 'image' && option.mediaData && (
                            <div className="mb-3 rounded-lg overflow-hidden border border-gray-100">
                              <img
                                src={option.mediaData}
                                alt={option.label}
                                className="w-full h-40 object-cover"
                              />
                            </div>
                          )}
                          {option.mediaType === 'audio' && option.mediaData && (
                            <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                              <audio
                                src={option.mediaData}
                                controls
                                className="w-full h-10"
                              />
                            </div>
                          )}

                          {/* Link button */}
                          {option.link && (
                            <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                              <a
                                href={option.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
                              >
                                확인하기
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                              </a>
                            </div>
                          )}

                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-3">
                              {/* Radio button */}
                              {canVote && (
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
                                className={`text-sm whitespace-pre-wrap ${
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
                    {justVoted ? (
                      /* Just voted success */
                      <div className="flex items-center justify-center gap-2 py-3 bg-yellow-50 rounded-xl border border-yellow-200">
                        <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>
                        <span className="text-sm font-semibold text-gray-900">
                          투표 완료! +{vote.pointReward}★ 적립되었습니다
                        </span>
                      </div>
                    ) : vote.isActive && canVote ? (
                      /* Can vote */
                      <button
                        onClick={() => {
                          if (!user) { setShowAuthModal(true); return; }
                          handleVote(vote.id);
                        }}
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
                    ) : votedToday ? (
                      /* Voted today */
                      <div className="text-center py-3 bg-green-50 rounded-xl border border-green-100">
                        <span className="text-sm text-green-600 font-medium">
                          오늘 이미 투표했습니다 · 내일 다시 참여하세요!
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

      {/* Auth Modal for non-logged-in users */}
      {showAuthModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowAuthModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">투표에 참여하세요!</h3>
            <p className="text-sm text-gray-400 mb-6">로그인하거나 회원가입하여<br />투표하고 스타를 적립하세요</p>
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/login"
                onClick={() => {/* Will open register tab */}}
                className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                회원가입
              </Link>
            </div>
            <button
              onClick={() => setShowAuthModal(false)}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
