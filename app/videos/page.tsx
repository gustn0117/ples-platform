'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { IconPlay, IconEye, IconClock, IconCoin, IconCheck } from '@/components/icons';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  reward_points: number;
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="py-16 pb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
            <IconPlay className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">영상 리워드</h1>
        </div>
        <p className="text-gray-400 ml-[52px]">영상을 시청하고 포인트를 적립하세요</p>
      </div>

      {/* Daily Progress */}
      <div className="mb-10 bg-gray-50/50 rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IconEye className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">오늘 {dailyCount}/{maxDaily} 시청</span>
          </div>
          {limitReached && (
            <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">내일 다시 방문해주세요</span>
          )}
        </div>
        <div className="w-full h-2 bg-gray-200/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-900 rounded-full transition-all duration-500"
            style={{ width: `${(dailyCount / maxDaily) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {Array.from({ length: maxDaily }).map((_, i) => (
            <div key={i} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              i < dailyCount ? 'bg-gray-900 text-white' : 'bg-gray-200/50 text-gray-400'
            }`}>
              {i < dailyCount ? <IconCheck className="w-3 h-3" /> : i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((video) => {
            const isRewarded = everRewarded.has(video.id);
            const showReward = rewardAnimation === video.id;
            const canEarnReward = !isRewarded && !limitReached;

            return (
              <div
                key={video.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all duration-500"
              >
                {/* Thumbnail */}
                <div
                  className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl m-3 flex items-center justify-center cursor-pointer overflow-hidden"
                  onClick={() => canEarnReward && handleWatch(video)}
                >
                  <IconPlay className="w-12 h-12 text-gray-300" />

                  {/* Hover play overlay */}
                  {canEarnReward && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-100 scale-90 transition-transform duration-300">
                        <svg className="w-7 h-7 text-gray-700 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Rewarded overlay */}
                  {isRewarded && (
                    <div className="absolute inset-0 bg-gray-900/10 flex items-center justify-center">
                      <div className={`flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl shadow-sm ${showReward ? 'animate-bounce' : ''}`}>
                        <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                          <IconCheck className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">적립 완료</span>
                      </div>
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
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-900 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                      <IconCoin className="w-3.5 h-3.5" />
                      +{video.reward_points}P
                    </span>
                    {isRewarded ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <IconCheck className="w-3.5 h-3.5" />
                        적립 완료
                      </span>
                    ) : limitReached ? (
                      <span className="text-xs text-gray-300">일일 한도 초과</span>
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
            {/* Player area */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <IconPlay className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{playingVideo.title}</p>
                <p className="text-xs text-gray-400 mb-6">영상 재생 중...</p>

                {/* Countdown */}
                {isCountingDown && countdown > 0 && (
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="18" fill="none" stroke="#f3f4f6" strokeWidth="2" />
                        <circle
                          cx="20" cy="20" r="18" fill="none"
                          stroke="#111827" strokeWidth="2.5" strokeLinecap="round"
                          strokeDasharray={`${(countdown / 3) * 113.1} 113.1`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">
                        {countdown}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">시청 완료까지</span>
                  </div>
                )}

                {/* Success state */}
                {isCountingDown && countdown === 0 && (
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-2xl">
                    <IconCheck className="w-4 h-4" />
                    <IconCoin className="w-4 h-4" />
                    <span className="text-sm font-semibold">+{playingVideo.reward_points}P 적립!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 flex justify-between items-center border-t border-gray-100">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-900 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                <IconCoin className="w-3.5 h-3.5" />
                +{playingVideo.reward_points}P
              </span>
              <button
                onClick={() => {
                  setPlayingVideo(null);
                  setIsCountingDown(false);
                }}
                className="px-5 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors font-medium"
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
