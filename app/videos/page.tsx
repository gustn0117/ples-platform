'use client';

import { useState } from 'react';
import { videos } from '@/lib/mock-data';

export default function VideosPage() {
  const [watchedVideos, setWatchedVideos] = useState<Set<number>>(new Set());
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const maxDailyRewards = 5;
  const dailyWatched = watchedVideos.size;

  const handleWatch = (id: number) => {
    setPlayingVideo(id);
  };

  const handleComplete = (id: number) => {
    if (watchedVideos.size < maxDailyRewards) {
      setWatchedVideos(new Set([...watchedVideos, id]));
    }
    setPlayingVideo(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">영상 리워드</h1>
          <p className="text-gray-500">영상을 끝까지 시청하면 포인트가 적립됩니다</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full">
          <span className="text-sm text-purple-600 font-medium">
            오늘 적립: {dailyWatched}/{maxDailyRewards}
          </span>
          <div className="w-20 h-2 bg-purple-100 rounded-full overflow-hidden">
            <div
              className="h-full gradient-purple rounded-full transition-all"
              style={{ width: `${(dailyWatched / maxDailyRewards) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {videos.map((video) => {
          const isWatched = watchedVideos.has(video.id);

          return (
            <div
              key={video.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover"
            >
              {/* Thumbnail */}
              <div
                className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center cursor-pointer group"
                onClick={() => !isWatched && handleWatch(video.id)}
              >
                <span className="text-4xl">{video.thumbnail}</span>
                {!isWatched && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                )}
                {isWatched && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-full">
                      적립 완료 +{video.pointReward}P
                    </div>
                  </div>
                )}
                <span className="absolute bottom-2 right-2 text-xs text-white/80 bg-black/50 px-2 py-0.5 rounded">
                  {video.duration}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                  {video.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-500 font-medium">
                    +{video.pointReward}P
                  </span>
                  {isWatched ? (
                    <span className="text-xs text-green-500 font-medium">시청 완료</span>
                  ) : (
                    <span className="text-xs text-gray-400">미시청</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video player modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden animate-fade-in-up">
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <span className="text-6xl block mb-4">
                  {videos.find((v) => v.id === playingVideo)?.thumbnail}
                </span>
                <p className="text-lg font-medium mb-2">
                  {videos.find((v) => v.id === playingVideo)?.title}
                </p>
                <p className="text-gray-400 text-sm">영상 재생 중...</p>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                90% 이상 시청 시 포인트가 적립됩니다
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPlayingVideo(null)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                >
                  닫기
                </button>
                <button
                  onClick={() => handleComplete(playingVideo)}
                  className="px-4 py-2 rounded-lg text-sm gradient-purple text-white hover:opacity-90"
                >
                  시청 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
