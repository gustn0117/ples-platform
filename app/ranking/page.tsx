'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { initStore, getArtists, hasStarredToday, giveStar } from '@/lib/store';
import { type Artist } from '@/lib/mock-data';
import { ArtistIcon, CrownIcon } from '@/lib/icons';
import { IconStar, IconStarFilled } from '@/components/icons';

export default function RankingPage() {
  const { user } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [starredTodayIds, setStarredTodayIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initStore();
    refreshData();
    setLoading(false);
  }, []);

  function refreshData() {
    const all = getArtists();
    const sorted = [...all].sort((a, b) => b.likes - a.likes);
    setArtists(sorted);
    setStarredTodayIds(new Set(all.map(a => a.id).filter(id => hasStarredToday(id))));
  }

  function handleGiveStar(artistId: number) {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    const result = giveStar(artistId);
    if (!result.success) {
      alert(result.error);
      return;
    }
    refreshData();
  }

  const maxLikes = artists.length > 0 ? artists[0].likes : 1;
  const top3 = artists.slice(0, 3);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-72" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">아티스트 랭킹</h1>
        <p className="text-gray-500">스타 수 기준 인기 아티스트 순위</p>
      </div>

      {/* Top 3 Podium */}
      {top3.length >= 3 && (
        <div className="bg-gray-50 rounded-3xl p-6 sm:p-10 mb-12">
          <div className="flex items-end justify-center gap-4 sm:gap-8">
            {/* 2nd Place - Left */}
            <div className="flex flex-col items-center flex-1 max-w-[160px]">
              <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center mb-2">
                <span className="text-xs font-bold text-white">2</span>
              </div>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center mb-3 shadow-lg">
                <span className="text-white"><ArtistIcon genre={top3[1].genre} className="w-8 h-8 sm:w-10 sm:h-10" /></span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 text-center w-full shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 truncate">{top3[1].name}</h3>
                <span className="text-[11px] text-gray-400 block">{top3[1].genre}</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <IconStar className="w-3.5 h-3.5 text-yellow-500" />
                  <p className="text-lg font-bold text-gray-700 tabular-nums">{top3[1].likes.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* 1st Place - Center (larger) */}
            <div className="flex flex-col items-center flex-1 max-w-[180px] -mt-6">
              <div className="mb-1 text-yellow-500"><CrownIcon className="w-7 h-7 mx-auto" /></div>
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gray-900/15 blur-xl scale-110" />
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center mb-3 shadow-xl">
                  <span className="text-white"><ArtistIcon genre={top3[0].genre} className="w-12 h-12 sm:w-16 sm:h-16" /></span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center -mt-1 mb-2 border-2 border-white shadow-md">
                <span className="text-sm font-bold text-white">1</span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 text-center w-full shadow-md">
                <h3 className="text-base font-bold text-gray-900 truncate">{top3[0].name}</h3>
                <span className="text-xs text-gray-400 block">{top3[0].genre}</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <IconStar className="w-4 h-4 text-yellow-500" />
                  <p className="text-2xl font-bold text-gray-900 tabular-nums">{top3[0].likes.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* 3rd Place - Right */}
            <div className="flex flex-col items-center flex-1 max-w-[150px] mt-4">
              <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                <span className="text-xs font-bold text-gray-600">3</span>
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center mb-3 shadow-lg">
                <span className="text-white"><ArtistIcon genre={top3[2].genre} className="w-7 h-7 sm:w-8 sm:h-8" /></span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 text-center w-full shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 truncate">{top3[2].name}</h3>
                <span className="text-[11px] text-gray-400 block">{top3[2].genre}</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <IconStar className="w-3.5 h-3.5 text-yellow-500" />
                  <p className="text-lg font-bold text-gray-700 tabular-nums">{top3[2].likes.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Ranking Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
          <div className="col-span-1">순위</div>
          <div className="col-span-4 sm:col-span-3">아티스트</div>
          <div className="col-span-2 sm:col-span-2">장르</div>
          <div className="col-span-3 sm:col-span-4 text-right">스타</div>
          <div className="col-span-2 sm:col-span-2 text-center"></div>
        </div>

        {/* Rows */}
        {artists.map((artist, index) => {
          const rank = index + 1;
          const barWidth = maxLikes > 0 ? (artist.likes / maxLikes) * 100 : 0;
          const doneToday = starredTodayIds.has(artist.id);

          return (
            <div
              key={artist.id}
              className={`grid grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-6 py-4 items-center transition-colors hover:bg-gray-50 ${
                index !== artists.length - 1 ? 'border-b border-gray-50' : ''
              } ${rank <= 3 ? 'bg-gray-50/50' : ''}`}
            >
              {/* Rank */}
              <div className="col-span-1">
                {rank <= 3 ? (
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                      rank === 1
                        ? 'bg-gray-900 text-white shadow-sm'
                        : rank === 2
                        ? 'bg-gray-400 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {rank}
                  </div>
                ) : (
                  <span className="text-sm font-bold text-gray-300 pl-2">{rank}</span>
                )}
              </div>

              {/* Artist: Icon + Name */}
              <div className="col-span-4 sm:col-span-3 flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                  <span className="text-white"><ArtistIcon genre={artist.genre} className="w-5 h-5" /></span>
                </div>
                <span className="font-semibold text-gray-900 text-sm truncate">{artist.name}</span>
              </div>

              {/* Genre Badge */}
              <div className="col-span-2 sm:col-span-2">
                <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg inline-block truncate max-w-full">
                  {artist.genre}
                </span>
              </div>

              {/* Star Count with Bar */}
              <div className="col-span-3 sm:col-span-4">
                <div className="flex items-center gap-2 sm:gap-3 justify-end">
                  <div className="hidden sm:block flex-1 max-w-[200px]">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-900 rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 tabular-nums whitespace-nowrap">
                    {artist.likes.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Star Button */}
              <div className="col-span-2 sm:col-span-2 flex justify-center">
                <button
                  onClick={() => handleGiveStar(artist.id)}
                  disabled={doneToday}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    doneToday
                      ? 'bg-yellow-50 cursor-default'
                      : 'bg-gray-100 hover:bg-gray-200 active:scale-90'
                  }`}
                >
                  {doneToday ? (
                    <IconStarFilled className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <IconStar className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {artists.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm">등록된 아티스트가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
