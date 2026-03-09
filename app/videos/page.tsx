'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { IconPlay, IconEye, IconClock, IconCoin, IconCheck, IconArrowRight } from '@/components/icons';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  reward_points: number;
  created_at: string;
}

// Confetti particle component for daily completion celebration
function ConfettiCelebration() {
  const particles = useMemo(() => {
    const colors = ['#111827', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#1f2937', '#4b5563', '#e5e7eb'];
    return Array.from({ length: 8 }).map((_, i) => ({
      color: colors[i % colors.length],
      size: 4 + Math.random() * 4,
      left: 10 + (i * 11) + Math.random() * 5,
      delay: i * 0.12,
      animIdx: (i % 8) + 1,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            left: `${p.left}%`,
            top: '40%',
            animation: `confetti-burst-${p.animIdx} 1.8s ease-out ${p.delay}s forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

// Sparkle particles for reward moment
function SparkleParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-gray-600"
          style={{
            animation: `sparkle-fly-${i} 1.2s ease-out ${i * 0.08}s forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

// Equalizer animation for thumbnail hover
function EqualizerBars() {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-[3px] bg-gray-700 rounded-full"
          style={{
            animation: `eq-bar-${i} 0.8s ease-in-out infinite`,
            height: '40%',
          }}
        />
      ))}
    </div>
  );
}

export default function VideosPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchedToday, setWatchedToday] = useState<Set<string>>(new Set());
  const [everRewarded, setEverRewarded] = useState<Set<string>>(new Set());
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [rewardAnimation, setRewardAnimation] = useState<string | null>(null);
  const [showSparkles, setShowSparkles] = useState(false);

  const maxDaily = 5;

  const todayStr = new Date().toISOString().split('T')[0];

  // Check if video is "new" (created within last 3 days)
  const isNewVideo = useCallback((createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 3;
  }, []);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVideos(data);
    }
    setLoading(false);
  }, []);

  const fetchWatchHistory = useCallback(async () => {
    if (!user) return;

    const [allWatchesRes, todayWatchesRes] = await Promise.all([
      supabase
        .from('video_watches')
        .select('video_id')
        .eq('user_id', user.id),
      supabase
        .from('video_watches')
        .select('video_id')
        .eq('user_id', user.id)
        .gte('watched_at', `${todayStr}T00:00:00`)
        .lte('watched_at', `${todayStr}T23:59:59`),
    ]);

    if (allWatchesRes.data) {
      setEverRewarded(new Set(allWatchesRes.data.map((w: { video_id: string }) => w.video_id)));
    }
    if (todayWatchesRes.data) {
      setWatchedToday(new Set(todayWatchesRes.data.map((w: { video_id: string }) => w.video_id)));
    }
  }, [user, todayStr]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    fetchWatchHistory();
  }, [fetchWatchHistory]);

  useEffect(() => {
    if (!isCountingDown || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown]);

  useEffect(() => {
    if (isCountingDown && countdown === 0 && playingVideo) {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1500);
      handleComplete(playingVideo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, isCountingDown]);

  const handleWatch = (video: Video) => {
    if (!user) return;
    if (everRewarded.has(video.id)) return;
    if (watchedToday.size >= maxDaily) return;
    setPlayingVideo(video);
    setCountdown(3);
    setIsCountingDown(true);
    setShowSparkles(false);
  };

  const handleComplete = async (video: Video) => {
    if (!user) return;
    setIsCountingDown(false);

    if (everRewarded.has(video.id)) {
      setPlayingVideo(null);
      return;
    }

    await supabase.from('video_watches').insert({
      user_id: user.id,
      video_id: video.id,
      watched_at: new Date().toISOString(),
    });

    await supabase.from('points_transactions').insert({
      user_id: user.id,
      amount: video.reward_points,
      type: 'earn',
      category: '영상 시청',
      description: `${video.title} 시청 리워드`,
    });

    if (profile) {
      await supabase
        .from('profiles')
        .update({ points: profile.points + video.reward_points })
        .eq('id', user.id);
    }

    setEverRewarded(new Set([...everRewarded, video.id]));
    setWatchedToday(new Set([...watchedToday, video.id]));
    setRewardAnimation(video.id);
    setTimeout(() => setRewardAnimation(null), 2000);
    setPlayingVideo(null);
    await refreshProfile();
  };

  const dailyCount = watchedToday.size;
  const limitReached = dailyCount >= maxDaily;

  const milestoneLabels = ['시작', '', '', '', '완료!'];

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-6">
            <IconPlay className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">로그인이 필요해요</h2>
          <p className="text-gray-400 mb-8">
            영상을 시청하고 포인트를 적립하려면 먼저 로그인해주세요
          </p>
          <Link
            href="/login"
            className="inline-flex px-8 py-3.5 rounded-2xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/10"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50/50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 pb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
              <IconPlay className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">영상 리워드</h1>
          </div>
          <p className="text-gray-400 ml-[52px]">영상을 시청하고 포인트를 적립하세요</p>

          {/* Daily Progress */}
          <div className="relative mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
            {/* Confetti celebration when all 5 completed */}
            {limitReached && <ConfettiCelebration />}

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                    <IconEye className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900">오늘의 시청</span>
                    <span className="text-sm text-gray-400 ml-2">{dailyCount}/{maxDaily}</span>
                  </div>
                </div>
                {limitReached && (
                  <span className="text-xs text-gray-500 bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-100 font-medium">
                    내일 다시 방문해주세요
                  </span>
                )}
              </div>

              {/* Animated gradient progress bar */}
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${(dailyCount / maxDaily) * 100}%`,
                    background: 'linear-gradient(90deg, #374151, #111827, #374151)',
                    backgroundSize: '200% 100%',
                    animation: dailyCount > 0 ? 'progress-gradient-flow 2s linear infinite' : 'none',
                  }}
                />
              </div>

              {/* Step indicators with milestone labels */}
              <div className="flex justify-between mt-3">
                {Array.from({ length: maxDaily }).map((_, i) => {
                  const isCompleted = i < dailyCount;
                  const isNext = i === dailyCount && !limitReached;

                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                          isCompleted
                            ? 'bg-gray-900 text-white shadow-sm'
                            : isNext
                              ? 'bg-gray-200 text-gray-600 border-2 border-gray-400'
                              : 'bg-gray-100 text-gray-400'
                        }`}
                        style={isNext ? { animation: 'step-pulse-glow 2s ease-in-out infinite' } : undefined}
                      >
                        {isCompleted ? <IconCheck className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <span className={`text-[9px] font-medium ${isCompleted ? 'text-gray-600' : 'text-gray-300'}`}>
                        {milestoneLabels[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-100 animate-pulse m-3 rounded-2xl" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
                <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <IconPlay className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">등록된 영상이 없습니다</h3>
          <p className="text-sm text-gray-400">곧 새로운 영상이 업로드될 예정입니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {videos.map((video, videoIndex) => {
            const isRewarded = everRewarded.has(video.id);
            const showReward = rewardAnimation === video.id;
            const canEarnReward = !isRewarded && !limitReached;
            const isNew = isNewVideo(video.created_at);

            return (
              <div
                key={video.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all duration-500"
                style={{
                  opacity: 0,
                  animation: `video-card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${videoIndex * 0.08}s forwards`,
                }}
              >
                {/* Thumbnail */}
                <div
                  className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl m-3 flex items-center justify-center cursor-pointer overflow-hidden"
                  onClick={() => canEarnReward && handleWatch(video)}
                >
                  <IconPlay className="w-12 h-12 text-gray-300" />

                  {/* NEW badge */}
                  {isNew && !isRewarded && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-gray-900 px-2 py-0.5 rounded-lg tracking-wider shadow-sm z-10">
                      NEW
                    </span>
                  )}

                  {/* Hover play overlay with equalizer */}
                  {canEarnReward && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-100 scale-90 transition-transform duration-300">
                          <svg className="w-7 h-7 text-gray-700 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                        {/* Equalizer bars */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                          <EqualizerBars />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rewarded overlay */}
                  {isRewarded && (
                    <div className="absolute inset-0 bg-gray-900/10 flex flex-col items-center justify-center gap-2">
                      <div className={`flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl shadow-md ${showReward ? 'animate-bounce' : ''}`}>
                        <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                          <IconCheck className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">적립 완료</span>
                      </div>
                      {/* Progress indicator for rewarded cards */}
                      <span className="text-[10px] font-bold text-gray-500 bg-white/80 px-2 py-0.5 rounded-md">
                        100%
                      </span>
                    </div>
                  )}

                  {/* Duration badge */}
                  <span className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-gray-500 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg font-medium shadow-sm">
                    <IconClock className="w-3 h-3" />
                    {video.duration}
                  </span>
                </div>

                {/* Info */}
                <div className="px-4 pb-4 pt-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-3 line-clamp-2 leading-snug">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    {/* Improved reward badge with shadow and larger text */}
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-900 bg-gray-50 border border-gray-100 px-3.5 py-2 rounded-xl shadow-sm">
                      <IconCoin className="w-4 h-4" />
                      <span className="text-[13px]">+{video.reward_points}P</span>
                    </span>
                    {isRewarded ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <IconCheck className="w-3.5 h-3.5" />
                        적립 완료
                      </span>
                    ) : limitReached ? (
                      <span className="text-xs text-gray-300">일일 한도 초과</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <span className="text-[10px] text-gray-300 font-medium">0%</span>
                        미시청
                      </span>
                    )}
                  </div>
                  {/* Watch CTA button */}
                  {isRewarded ? (
                    <div className="w-full py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center text-xs font-medium text-gray-400 flex items-center justify-center gap-1.5">
                      <IconCheck className="w-3.5 h-3.5" />
                      시청 완료
                    </div>
                  ) : limitReached ? (
                    <div className="w-full py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center text-xs font-medium text-gray-300">
                      일일 한도 초과
                    </div>
                  ) : (
                    <button
                      onClick={() => handleWatch(video)}
                      className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-all duration-300 hover:shadow-md hover:shadow-gray-900/10 flex items-center justify-center gap-1.5"
                    >
                      시청하고 포인트 받기
                      <IconArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      </div>


      {/* Reward toast */}
      {rewardAnimation && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-semibold text-sm shadow-2xl shadow-gray-900/20 flex items-center gap-2">
            <IconCheck className="w-4 h-4" />
            포인트가 적립되었습니다!
          </div>
        </div>
      )}

      {/* Video player modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scaleIn">
            {/* Player area with animated background gradient */}
            <div
              className="relative aspect-video flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #f9fafb, #f3f4f6, #e5e7eb, #f3f4f6, #f9fafb)',
                backgroundSize: '300% 300%',
                animation: 'player-bg-drift 8s ease infinite',
              }}
            >
              {/* Sparkle particles on reward */}
              {showSparkles && <SparkleParticles />}

              <div className="text-center relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <IconPlay className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{playingVideo.title}</p>
                <p className="text-xs text-gray-400 mb-6">영상 재생 중...</p>

                {/* Countdown — larger circle with pulsing ring */}
                {isCountingDown && countdown > 0 && (
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="relative w-14 h-14">
                      {/* Pulsing outer ring */}
                      <div
                        className="absolute inset-0 rounded-full border-2 border-gray-300"
                        style={{
                          animation: 'countdown-ring-pulse 1.5s ease-out infinite',
                        }}
                      />
                      <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="#f3f4f6" strokeWidth="2.5" />
                        <circle
                          cx="28" cy="28" r="24" fill="none"
                          stroke="#111827" strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={`${(countdown / 3) * 150.8} 150.8`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900">
                        {countdown}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">시청 완료까지</span>
                  </div>
                )}

                {/* Success state — larger, animated reward display */}
                {isCountingDown && countdown === 0 && (
                  <div
                    className="inline-flex items-center gap-2.5 px-6 py-3 bg-gray-900 text-white rounded-2xl shadow-lg"
                    style={{ animation: 'reward-pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
                  >
                    <IconCheck className="w-5 h-5" />
                    <IconCoin className="w-5 h-5" />
                    <span className="text-base font-bold">+{playingVideo.reward_points}P 적립!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 flex justify-between items-center border-t border-gray-100">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-900 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                <IconCoin className="w-3.5 h-3.5" />
                +{playingVideo.reward_points}P
              </span>
              <button
                onClick={() => {
                  setPlayingVideo(null);
                  setIsCountingDown(false);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-200 font-semibold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
