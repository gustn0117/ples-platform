'use client';

import { useState } from 'react';
import { artists } from '@/lib/mock-data';

export default function ArtistsPage() {
  const [likedArtists, setLikedArtists] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<'popular' | 'latest'>('popular');

  const sortedArtists = [...artists].sort((a, b) =>
    sortBy === 'popular' ? b.likes - a.likes : b.id - a.id
  );

  const toggleLike = (id: number) => {
    const newSet = new Set(likedArtists);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setLikedArtists(newSet);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">아티스트 투자</h1>
          <p className="text-gray-500">좋아하는 아티스트에게 투자(좋아요)하고 응원하세요</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('popular')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              sortBy === 'popular'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            인기순
          </button>
          <button
            onClick={() => setSortBy('latest')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              sortBy === 'latest'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            최신순
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {sortedArtists.map((artist, index) => {
          const isLiked = likedArtists.has(artist.id);
          const displayLikes = artist.likes + (isLiked ? 1 : 0);

          return (
            <div
              key={artist.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover"
            >
              {/* Image area */}
              <div className="relative aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <span className="text-5xl">{artist.image}</span>
                {index < 3 && (
                  <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {index + 1}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-0.5">{artist.name}</h3>
                <p className="text-xs text-gray-400 mb-3">{artist.genre}</p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {displayLikes.toLocaleString()} 투자
                  </span>
                  <button
                    onClick={() => toggleLike(artist.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isLiked
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-500'
                    }`}
                  >
                    {isLiked ? '💜 투자완료' : '투자하기'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
