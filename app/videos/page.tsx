'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { initStore, getVideos, getUserWatched, watchVideo, getTodayWatchCount, getUserPoints } from '@/lib/store';
import type { Video } from '@/lib/mock-data';
import Link from 'next/link';

const MAX_DAILY = 5;
const REWARD_POINTS = 20;

export default function VideosPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [watched, setWatched] = useState<number[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [counting, setCounting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const refreshData = useCallback(() => {
    setVideos(getVideos());
    setWatched(getUserWatched());
    setTodayCount(getTodayWatchCount());
    setPoints(getUserPoints());
  }, []);

  useEffect(() => {
    initStore();
    refreshData();
    setLoading(false);
  }, [refreshData]);

  // Countdown timer
  useEffect(() => {
    if (!counting || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [counting, countdown]);

  // Countdown reached 0
  useEffect(() => {
    if (counting && countdown === 0 && activeVideo) {
      setCounting(false);
      const result = watchVideo(activeVideo.id);
      if (result.success && result.points && result.points > 0) {
        setEarnedPoints(result.points);
        setCompleted(true);
        refreshData();
        setToast(`+${result.points}P 적립 완료!`);
        setTimeout(() => setToast(null), 2500);
      } else if (result.success && (result.points === 0 || !result.points)) {
        // Already watched, no additional points
        setCompleted(true);
      } else {
        // Error (e.g., daily limit)
        setToast(result.error || '오류가 발생했습니다.');
        setTimeout(() => setToast(null), 2500);
        closeModal();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, counting]);

  const openWatch = (video: Video) => {
    if (!user) return;
    setActiveVideo(video);
    setCountdown(3);
    setCounting(true);
    setCompleted(false);
    setEarnedPoints(0);
  };

  const closeModal = () => {
    setActiveVideo(null);
    setCounting(false);
    setCompleted(false);
    setEarnedPoints(0);
  };

  const limitReached = todayCount >= MAX_DAILY;
  const progressPercent = (todayCount / MAX_DAILY) * 100;

  // Non-logged-in users can view but not earn
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">
              🎬
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">영상 리워드</h1>
          </div>
          <p className="text-gray-400 ml-[52px] text-sm">
            영상을 시청하고 매 영상당 <span className="text-white font-semibold">{REWARD_POINTS}P</span>를 적립하세요
          </p>

          {/* Daily Progress Card */}
          {user && (
            <div className="mt-8 bg-gray-900 rounded-2xl border border-gray-800 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">📊</span>
                  <div>
                    <span className="text-sm font-bold text-white">오늘의 시청</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {todayCount}/{MAX_DAILY}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">보유 포인트</span>
                  <span className="text-sm font-bold text-white bg-gray-800 px-3 py-1 rounded-lg">
                    {points.toLocaleString()}P
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${progressPercent}%`,
                    background: limitReached
                      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                      : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  }}
                />
              </div>

              {/* Step Dots */}
              <div className="flex justify-between">
                {Array.from({ length: MAX_DAILY }).map((_, i) => {
                  const done = i < todayCount;
                  const isNext = i === todayCount && !limitReached;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                          done
                            ? 'bg-indigo-500 text-white'
                            : isNext
                              ? 'bg-gray-700 text-gray-300 ring-2 ring-indigo-500/50'
                              : 'bg-gray-800 text-gray-600'
                        }`}
                      >
                        {done ? '✓' : i + 1}
                      </div>
                    </div>
                  );
                })}
              </div>

              {limitReached && (
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                    🎉 오늘의 시청 리워드를 모두 받으셨어요! 내일 다시 방문해주세요
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Non-member notice */}
          {!user && (
            <div className="mt-8 bg-gray-900 rounded-2xl border border-gray-800 p-5 sm:p-6 text-center">
              <p className="text-gray-400 text-sm mb-3">
                로그인하면 영상 시청 시 포인트를 적립할 수 있어요
              </p>
              <Link
                href="/login"
                className="inline-flex px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
              >
                로그인하기
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Video Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <div className="aspect-video bg-gray-800 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-800 animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-gray-800 animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🎥</div>
            <h3 className="text-lg font-bold text-gray-300 mb-1">등록된 영상이 없습니다</h3>
            <p className="text-sm text-gray-500">곧 새로운 영상이 업로드될 예정입니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {videos.map((video) => {
              const isWatched = watched.includes(video.id);
              const canEarn = user && !isWatched && !limitReached;

              return (
                <div
                  key={video.id}
                  className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden group hover:border-gray-700 hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div
                    className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center cursor-pointer overflow-hidden"
                    onClick={() => canEarn && openWatch(video)}
                  >
                    {/* Emoji thumbnail */}
                    <span className="text-5xl sm:text-6xl opacity-60 group-hover:opacity-80 transition-opacity duration-300">
                      {video.thumbnail}
                    </span>

                    {/* Play button overlay */}
                    {canEarn && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                          <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Watched overlay */}
                    {isWatched && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700">
                          <span className="text-green-400 text-sm">✓</span>
                          <span className="text-sm font-semibold text-gray-300">적립 완료</span>
                        </div>
                      </div>
                    )}

                    {/* Duration badge */}
                    <span className="absolute bottom-2 right-2 text-[11px] text-gray-300 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md font-medium">
                      {video.duration}
                    </span>

                    {/* Point reward badge */}
                    <span className="absolute top-2 right-2 text-[11px] text-yellow-300 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md font-bold">
                      +{video.pointReward}P
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-200 text-sm mb-3 line-clamp-2 leading-snug">
                      {video.title}
                    </h3>

                    <div className="flex items-center justify-between mb-3">
                      <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-lg border border-yellow-500/20">
                        🪙 +{video.pointReward}P
                      </span>
                      {isWatched ? (
                        <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                          ✓ 적립 완료
                        </span>
                      ) : limitReached && user ? (
                        <span className="text-xs text-gray-500">한도 초과</span>
                      ) : (
                        <span className="text-xs text-gray-500">미시청</span>
                      )}
                    </div>

                    {/* CTA */}
                    {isWatched ? (
                      <div className="w-full py-2.5 rounded-xl bg-gray-800 text-center text-xs font-medium text-gray-500 flex items-center justify-center gap-1.5">
                        ✓ 시청 완료
                      </div>
                    ) : !user ? (
                      <Link
                        href="/login"
                        className="block w-full py-2.5 rounded-xl bg-gray-800 text-center text-xs font-medium text-gray-400 hover:bg-gray-700 transition-colors"
                      >
                        로그인 후 시청
                      </Link>
                    ) : limitReached ? (
                      <div className="w-full py-2.5 rounded-xl bg-gray-800 text-center text-xs font-medium text-gray-600">
                        일일 한도 초과
                      </div>
                    ) : (
                      <button
                        onClick={() => openWatch(video)}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-all duration-200 flex items-center justify-center gap-1.5"
                      >
                        시청하고 포인트 받기 →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Watch Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !counting) closeModal();
          }}
        >
          <div className="bg-gray-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-800">
            {/* Player Area */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl block mb-4">{activeVideo.thumbnail}</span>
                <p className="text-sm font-semibold text-white mb-1 px-4">{activeVideo.title}</p>
                <p className="text-xs text-gray-500 mb-6">영상 재생 중...</p>

                {/* Countdown */}
                {counting && countdown > 0 && (
                  <div className="inline-flex items-center gap-3 px-5 py-3 bg-gray-800 rounded-2xl border border-gray-700">
                    <div className="relative w-14 h-14">
                      <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="#374151" strokeWidth="2.5" />
                        <circle
                          cx="28" cy="28" r="24" fill="none"
                          stroke="#818cf8" strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={`${(countdown / 3) * 150.8} 150.8`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                        {countdown}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-gray-400 block">시청 완료까지</span>
                      <span className="text-xs text-gray-500">{countdown}초 남음</span>
                    </div>
                  </div>
                )}

                {/* Completed */}
                {completed && (
                  <div className="inline-flex flex-col items-center gap-2">
                    {earnedPoints > 0 ? (
                      <>
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20 animate-bounce">
                          <span className="text-lg">🪙</span>
                          <span className="text-base font-bold">+{earnedPoints}P 적립!</span>
                        </div>
                        <span className="text-xs text-gray-500">포인트가 적립되었습니다</span>
                      </>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-gray-300 rounded-2xl border border-gray-700">
                        <span>✓</span>
                        <span className="text-sm font-semibold">이미 적립된 영상입니다</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 flex items-center justify-between border-t border-gray-800">
              <span className="flex items-center gap-1.5 text-xs font-bold text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-xl border border-yellow-500/20">
                🪙 +{activeVideo.pointReward}P
              </span>
              <button
                onClick={closeModal}
                disabled={counting}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  counting
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {counting ? '시청 중...' : '닫기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-semibold text-sm shadow-2xl shadow-indigo-500/30 flex items-center gap-2">
            🪙 {toast}
          </div>
        </div>
      )}
    </div>
  );
}
