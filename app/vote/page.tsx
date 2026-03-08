'use client';

import { useState } from 'react';
import { votes } from '@/lib/mock-data';

export default function VotePage() {
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [votedItems, setVotedItems] = useState<Set<number>>(new Set());

  const handleVote = (voteId: number) => {
    if (!selectedOptions[voteId] || votedItems.has(voteId)) return;
    setVotedItems(new Set([...votedItems, voteId]));
  };

  const getTotalVotes = (vote: typeof votes[0]) =>
    vote.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">국민프로듀서 투표</h1>
        <p className="text-gray-500">하루 1회 투표에 참여하고 10포인트를 받으세요</p>
      </div>

      <div className="flex flex-col gap-8">
        {votes.map((vote) => {
          const total = getTotalVotes(vote);
          const hasVoted = votedItems.has(vote.id);

          return (
            <div
              key={vote.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 pb-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h2 className="text-lg font-bold text-gray-900">{vote.title}</h2>
                  <span
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                      vote.isActive
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {vote.isActive ? '진행중' : '종료'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-5">
                  마감일: {vote.endDate} · 참여 시 +{vote.pointReward}P
                </p>
              </div>

              {/* Options */}
              <div className="px-6 pb-4 flex flex-col gap-3">
                {vote.options.map((option) => {
                  const percentage = total > 0 ? Math.round((option.votes / total) * 100) : 0;
                  const isSelected = selectedOptions[vote.id] === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        if (!hasVoted && vote.isActive)
                          setSelectedOptions({ ...selectedOptions, [vote.id]: option.id });
                      }}
                      disabled={!vote.isActive || hasVoted}
                      className={`relative w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-100 hover:border-gray-200'
                      } ${(!vote.isActive || hasVoted) ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {/* Progress bar background */}
                      {(hasVoted || !vote.isActive) && (
                        <div
                          className="absolute inset-0 bg-purple-100/50 rounded-xl transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      )}
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-purple-500' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                            )}
                          </div>
                          <span className="font-medium text-gray-800">{option.label}</span>
                        </div>
                        {(hasVoted || !vote.isActive) && (
                          <span className="text-sm font-semibold text-purple-600">
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
                {vote.isActive && !hasVoted ? (
                  <button
                    onClick={() => handleVote(vote.id)}
                    disabled={!selectedOptions[vote.id]}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                      selectedOptions[vote.id]
                        ? 'gradient-purple text-white hover:opacity-90'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    투표하기
                  </button>
                ) : hasVoted ? (
                  <div className="flex items-center justify-center gap-2 py-3 bg-green-50 rounded-xl">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold text-green-600">투표 완료! +{vote.pointReward}P 적립</span>
                  </div>
                ) : (
                  <div className="text-center py-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-500">종료된 투표입니다</span>
                  </div>
                )}
                <p className="text-center text-xs text-gray-400 mt-3">
                  총 {total.toLocaleString()}명 참여
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
