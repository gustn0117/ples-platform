'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface ArtistRanking {
  id: string;
  name: string;
  image: string;
  genre: string;
  likes: number;
  investments: number;
  total: number;
}

type TabType = '종합' | '좋아요' | '투자';

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const diff = value - start;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    prevValue.current = value;
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

export default function RankingPage() {
  const [artists, setArtists] = useState<ArtistRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('종합');

  useEffect(() => {
    async function fetchRankings() {
      setLoading(true);

      const { data: artistData, error } = await supabase
        .from('artists')
        .select('*');

      if (error || !artistData) {
        setLoading(false);
        return;
      }

      // Fetch likes count per artist
      const { data: likesData } = await supabase
        .from('artist_likes')
        .select('artist_id');

      // Count likes per artist
      const likesMap: Record<string, number> = {};
      if (likesData) {
        likesData.forEach((like: { artist_id: string }) => {
          likesMap[like.artist_id] = (likesMap[like.artist_id] || 0) + 1;
        });
      }

      const ranked: ArtistRanking[] = artistData.map((a: Record<string, unknown>) => {
        const likes = likesMap[a.id as string] || (a.likes as number) || 0;
        const investments = (a.investments as number) || 0;
        return {
          id: a.id as string,
          name: a.name as string,
          image: a.image as string,
          genre: a.genre as string,
          likes,
          investments,
          total: likes + investments,
        };
      });

      setArtists(ranked);
      setLoading(false);
    }

    fetchRankings();
  }, []);

  const sortedArtists = [...artists].sort((a, b) => {
    switch (activeTab) {
      case '좋아요': return b.likes - a.likes;
      case '투자': return b.investments - a.investments;
      default: return b.total - a.total;
    }
  });

  const top3 = sortedArtists.slice(0, 3);
  const rankBadges = ['🥇', '🥈', '🥉'];
  const tabs: TabType[] = ['종합', '좋아요', '투자'];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Header skeleton */}
        <div className="mb-10 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-3" />
          <div className="h-5 bg-gray-100 rounded w-72" />
        </div>
        {/* Podium skeleton */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center animate-pulse">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-12" />
            </div>
          ))}
        </div>
        {/* Table skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Gradient Header */}
      <div className="relative overflow-hidden rounded-3xl gradient-dark text-white p-8 sm:p-10 mb-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">아티스트 랭킹</h1>
          <p className="text-gray-300 text-lg">인기 아티스트 순위를 실시간으로 확인하세요</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-lg shadow-gray-400/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-12">
          {[top3[1], top3[0], top3[2]].map((artist, visualIdx) => {
            const rank = visualIdx === 0 ? 2 : visualIdx === 1 ? 1 : 3;
            const isFirst = rank === 1;

            return (
              <div
                key={artist.id}
                className={`flex flex-col items-center animate-fade-in-up ${
                  isFirst ? '-mt-2' : 'mt-6'
                }`}
                style={{ animationDelay: `${visualIdx * 0.15}s` }}
              >
                {/* Rank badge */}
                <span className={`text-3xl sm:text-4xl mb-2 ${isFirst ? 'animate-bounce' : ''}`}>
                  {rankBadges[rank - 1]}
                </span>

                {/* Avatar */}
                <div
                  className={`relative mb-3 rounded-full p-1 ${
                    isFirst
                      ? 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500'
                      : rank === 2
                      ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                      : 'bg-gradient-to-br from-amber-600 to-amber-800'
                  }`}
                >
                  <div
                    className={`rounded-full flex items-center justify-center bg-white ${
                      isFirst
                        ? 'w-24 h-24 sm:w-28 sm:h-28'
                        : 'w-18 h-18 sm:w-22 sm:h-22 w-[72px] h-[72px] sm:w-[88px] sm:h-[88px]'
                    }`}
                  >
                    <span className={`${isFirst ? 'text-5xl sm:text-6xl' : 'text-3xl sm:text-4xl'}`}>
                      {artist.image}
                    </span>
                  </div>
                  {isFirst && (
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg animate-pulse-glow">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <h3 className={`font-bold text-gray-900 ${isFirst ? 'text-lg' : 'text-sm'}`}>
                  {artist.name}
                </h3>
                <p className="text-xs text-gray-400 mb-1">{artist.genre}</p>
                <p className={`font-bold ${isFirst ? 'text-xl text-gray-700' : 'text-sm text-gray-600'}`}>
                  <AnimatedNumber
                    value={activeTab === '좋아요' ? artist.likes : activeTab === '투자' ? artist.investments : artist.total}
                  />
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full ranking table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">순위</div>
          <div className="col-span-4">아티스트</div>
          <div className="col-span-2">장르</div>
          <div className="col-span-2 text-right">좋아요</div>
          <div className="col-span-1 text-right">투자</div>
          <div className="col-span-2 text-right">총점</div>
        </div>

        {sortedArtists.map((artist, index) => (
          <div
            key={artist.id}
            className={`grid grid-cols-12 gap-4 px-6 py-4 border-t border-gray-50 items-center transition-all duration-200 hover:bg-gray-50/40 hover:shadow-sm cursor-default ${
              index < 3 ? 'bg-gradient-to-r from-gray-50/30 to-transparent' : ''
            }`}
          >
            <div className="col-span-1">
              {index < 3 ? (
                <span className="text-xl">{rankBadges[index]}</span>
              ) : (
                <span className="text-sm font-bold text-gray-400 pl-1">{index + 1}</span>
              )}
            </div>
            <div className="col-span-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                index < 3
                  ? 'bg-gradient-to-br from-gray-200 to-gray-300'
                  : 'bg-gray-100'
              }`}>
                {artist.image}
              </div>
              <span className={`font-semibold ${index < 3 ? 'text-gray-900' : 'text-gray-700'}`}>
                {artist.name}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full">
                {artist.genre}
              </span>
            </div>
            <div className="col-span-2 text-right text-sm font-medium text-ples-gold">
              <AnimatedNumber value={artist.likes} />
            </div>
            <div className="col-span-1 text-right text-sm font-medium text-ples-silver">
              <AnimatedNumber value={artist.investments} />
            </div>
            <div className="col-span-2 text-right">
              <span className={`text-sm font-bold ${index < 3 ? 'text-gray-800' : 'text-gray-700'}`}>
                <AnimatedNumber value={artist.total} />
              </span>
            </div>
          </div>
        ))}

        {sortedArtists.length === 0 && (
          <div className="py-16 text-center">
            <span className="text-4xl block mb-3">🏆</span>
            <p className="text-gray-500">등록된 아티스트가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
