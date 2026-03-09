'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  point_reward: number;
  created_at: string;
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

  const maxDaily = 5;

  const todayStr = new Date().toISOString().split('T')[0];

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

    // Fetch all-time watches (to know which videos were ever rewarded)
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

  // Countdown timer logic
  useEffect(() => {
    if (!isCountingDown || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown]);

  // When countdown reaches 0, complete the watch
  useEffect(() => {
    if (isCountingDown && countdown === 0 && playingVideo) {
      handleComplete(playingVideo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, isCountingDown]);

  const handleWatch = (video: Video) => {
    if (!user) return;
    // Already rewarded for this video (any time) - can still watch but no points
    if (everRewarded.has(video.id)) return;
    // Daily limit for NEW rewards
    if (watchedToday.size >= maxDaily) return;
    setPlayingVideo(video);
    setCountdown(3);
    setIsCountingDown(true);
  };

  const handleComplete = async (video: Video) => {
    if (!user) return;
    setIsCountingDown(false);

    // Double-check: only reward if never rewarded before for this video
    if (everRewarded.has(video.id)) {
      setPlayingVideo(null);
      return;
    }

    // Record the watch
    await supabase.from('video_watches').insert({
      user_id: user.id,
      video_id: video.id,
      watched_at: new Date().toISOString(),
    });

    // Award points
    await supabase.from('points_transactions').insert({
      user_id: user.id,
      amount: video.point_reward,
      type: 'earn',
      category: '영상 시청',
      description: `${video.title} 시청 리워드`,
    });

    // Update profile points
    if (profile) {
      await supabase
        .from('profiles')
        .update({ points: profile.points + video.point_reward })
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

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-5xl mx-auto mb-6">
            🎬
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">로그인이 필요해요</h2>
          <p className="text-gray-500 mb-6">
            영상을 시청하고 포인트를 적립하려면 먼저 로그인해주세요
          </p>
          <Link
            href="/login"
            className="inline-flex px-8 py-3 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">영상 리워드</h1>
          <p className="text-gray-500">영상을 끝까지 시청하면 포인트가 적립됩니다</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl border border-gray-200">
          <div className="text-sm font-semibold text-gray-700">
            오늘 {dailyCount}/{maxDaily} 시청 완료
          </div>
          <div className="w-24 h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gray-700 to-gray-900 rounded-full transition-all duration-500"
              style={{ width: `${(dailyCount / maxDaily) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily limit banner */}
      {limitReached && (
        <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100 text-center animate-fade-in-up">
          <span className="text-4xl block mb-3">🎉</span>
          <h3 className="text-lg font-bold text-amber-800 mb-1">
            오늘의 리워드를 모두 받았어요!
          </h3>
          <p className="text-sm text-amber-600">내일 다시 방문해서 포인트를 적립하세요</p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">📭</span>
          <h3 className="text-lg font-bold text-gray-700 mb-1">등록된 영상이 없습니다</h3>
          <p className="text-sm text-gray-400">곧 새로운 영상이 업로드될 예정입니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {videos.map((video) => {
            const isRewarded = everRewarded.has(video.id);
            const showReward = rewardAnimation === video.id;
            const canEarnReward = !isRewarded && !limitReached;

            return (
              <div
                key={video.id}
                className={`bg-white rounded-2xl border overflow-hidden card-hover ${
                  isRewarded ? 'border-green-200' : 'border-gray-100'
                }`}
              >
                {/* Thumbnail */}
                <div
                  className={`relative aspect-video flex items-center justify-center cursor-pointer group overflow-hidden ${
                    isRewarded
                      ? 'bg-gradient-to-br from-green-800 to-green-900'
                      : 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-900'
                  }`}
                  onClick={() => canEarnReward && handleWatch(video)}
                >
                  {/* Animated background circles */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gray-1000/10 rounded-full" />
                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gray-500/10 rounded-full" />
                  </div>

                  <span className="text-5xl relative z-10">{video.thumbnail}</span>

                  {/* Play overlay */}
                  {canEarnReward && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                        <svg className="w-6 h-6 text-gray-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Rewarded overlay */}
                  {isRewarded && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className={`px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-full shadow-lg ${
                        showReward ? 'animate-bounce' : ''
                      }`}>
                        적립 완료 +{video.point_reward}P
                      </div>
                    </div>
                  )}

                  {/* Duration badge */}
                  <span className="absolute bottom-2 right-2 text-xs text-white/90 bg-black/60 px-2.5 py-1 rounded-lg font-medium backdrop-blur-sm">
                    {video.duration}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-3 line-clamp-2 leading-snug">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isRewarded
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      +{video.point_reward}P
                    </span>
                    {isRewarded ? (
                      <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        적립 완료
                      </span>
                    ) : limitReached ? (
                      <span className="text-xs text-gray-400">일일 한도 초과</span>
                    ) : (
                      <span className="text-xs text-gray-400">미시청</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reward animation toast */}
      {rewardAnimation && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="px-6 py-3 bg-green-500 text-white rounded-full font-semibold shadow-xl flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            포인트가 적립되었습니다!
          </div>
        </div>
      )}

      {/* Video player modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden animate-fade-in-up shadow-2xl">
            {/* Fake video player */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gray-1000/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-gray-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gray-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>

              {/* Play animation bars */}
              <div className="absolute bottom-0 left-0 right-0 flex items-end gap-1 px-8 pb-6 h-24">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gray-400/60 rounded-t"
                    style={{
                      height: `${20 + Math.sin(i * 0.5 + Date.now() * 0.001) * 30 + Math.random() * 20}%`,
                      animation: `pulse ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 text-center text-white">
                <span className="text-7xl block mb-4">{playingVideo.thumbnail}</span>
                <p className="text-lg font-semibold mb-2">{playingVideo.title}</p>
                <p className="text-gray-400 text-sm mb-6">영상 재생 중...</p>

                {/* Countdown */}
                {isCountingDown && countdown > 0 && (
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full backdrop-blur-sm">
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
                        <circle
                          cx="18" cy="18" r="16" fill="none"
                          stroke="white" strokeWidth="2" strokeLinecap="round"
                          strokeDasharray={`${(countdown / 3) * 100.53} 100.53`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                        {countdown}
                      </span>
                    </div>
                    <span className="text-sm">시청 완료까지</span>
                  </div>
                )}

                {isCountingDown && countdown === 0 && (
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/80 rounded-full backdrop-blur-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold">포인트 적립 완료!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                  +{playingVideo.point_reward}P
                </span>
                <span className="text-sm text-gray-500">시청 완료 시 포인트 지급</span>
              </div>
              <button
                onClick={() => {
                  setPlayingVideo(null);
                  setIsCountingDown(false);
                }}
                className="px-5 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-200 transition-colors font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
