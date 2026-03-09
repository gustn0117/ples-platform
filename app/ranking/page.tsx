'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { IconTrophy, IconCrown, IconHeart, IconTrendingUp } from '@/components/icons';

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

      const { data: likesData } = await supabase
        .from('artist_likes')
        .select('artist_id');

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
  const tabs: TabType[] = ['종합', '좋아요', '투자'];

  const tabIcons: Record<TabType, React.ReactNode> = {
    '종합': <IconTrophy className="w-3.5 h-3.5" />,
    '좋아요': <IconHeart className="w-3.5 h-3.5" />,
    '투자': <IconTrendingUp className="w-3.5 h-3.5" />,
  };

  const getScore = (artist: ArtistRanking) => {
    switch (activeTab) {
      case '좋아요': return artist.likes;
      case '투자': return artist.investments;
      default: return artist.total;
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="py-16 pb-10">
          <div className="h-8 bg-gray-100 animate-pulse rounded w-48 mb-3" />
          <div className="h-5 bg-gray-100 animate-pulse rounded w-72" />
        </div>
        <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 animate-pulse mb-3" />
              <div className="h-4 bg-gray-100 animate-pulse rounded w-16 mb-2" />
              <div className="h-3 bg-gray-100 animate-pulse rounded w-12" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Decorative Header */}
      <div className="bg-gray-50/50 border-b border-gray-100 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto py-16 pb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gray-900 flex items-center justify-center">
              <IconTrophy className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">아티스트 랭킹</h1>
          </div>
          <p className="text-gray-400 ml-[52px]">인기 아티스트 순위를 확인하세요</p>
        </div>
      </div>

      <div className="px-4 sm:px-6">
        {/* Tabs - pill/segment style with icons */}
        <div className="mt-8 mb-10">
          <div className="inline-flex bg-gray-100/80 rounded-2xl p-1.5 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-5 sm:px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm shadow-gray-200/50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tabIcons[tab]}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        {top3.length >= 3 && (
          <div className="bg-gray-50/60 rounded-3xl p-5 sm:p-10 mb-14">
            <div className="flex items-end justify-center gap-3 sm:gap-8">
              {/* #2 - Left */}
              <div className="flex flex-col items-center flex-1 max-w-[140px] sm:max-w-[180px]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center mb-2 sm:mb-3">
                  <span className="text-xs sm:text-sm font-bold text-gray-600">2</span>
                </div>
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center mb-2 sm:mb-3 shadow-lg shadow-gray-900/10">
                  <span className="text-xl sm:text-3xl font-bold text-white">{top3[1].name[0]}</span>
                </div>
                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm px-3 sm:px-5 py-2 sm:py-3 text-center w-full">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{top3[1].name}</h3>
                  <p className="text-sm sm:text-lg font-bold text-gray-700 mt-0.5 sm:mt-1 tabular-nums">
                    <AnimatedNumber value={getScore(top3[1])} />
                  </p>
                </div>
              </div>

              {/* #1 - Center (larger with glow) */}
              <div className="flex flex-col items-center -mt-4 sm:-mt-6 flex-1 max-w-[160px] sm:max-w-[200px]">
                <IconCrown className="w-5 h-5 sm:w-7 sm:h-7 text-gray-900 mb-1.5 sm:mb-2" />
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gray-900/20 blur-xl scale-110" />
                  <div className="relative w-24 h-24 sm:w-36 sm:h-36 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center mb-2 sm:mb-3 shadow-xl shadow-gray-900/20">
                    <span className="text-4xl sm:text-6xl font-bold text-white">{top3[0].name[0]}</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-md px-4 sm:px-8 py-3 sm:py-5 text-center w-full">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">{top3[0].name}</h3>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-1 tabular-nums">
                    <AnimatedNumber value={getScore(top3[0])} />
                  </p>
                </div>
              </div>

              {/* #3 - Right */}
              <div className="flex flex-col items-center mt-2 sm:mt-4 flex-1 max-w-[130px] sm:max-w-[160px]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center mb-2 sm:mb-3">
                  <span className="text-xs sm:text-sm font-bold text-gray-400">3</span>
                </div>
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center mb-2 sm:mb-3 shadow-lg shadow-gray-900/10">
                  <span className="text-lg sm:text-2xl font-bold text-white">{top3[2].name[0]}</span>
                </div>
                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm px-3 sm:px-5 py-2 sm:py-3 text-center w-full">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{top3[2].name}</h3>
                  <p className="text-sm sm:text-lg font-bold text-gray-700 mt-0.5 sm:mt-1 tabular-nums">
                    <AnimatedNumber value={getScore(top3[2])} />
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Ranking - Mobile Card Layout */}
        <div className="sm:hidden space-y-2.5 mb-16">
          {sortedArtists.map((artist, index) => (
            <div
              key={artist.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                {/* Rank Badge */}
                {index < 3 ? (
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    index === 0
                      ? 'bg-gray-900 text-white shadow-sm shadow-gray-900/20'
                      : index === 1
                      ? 'bg-gray-300 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-gray-300">{index + 1}</span>
                  </div>
                )}

                {/* Avatar + Name */}
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-white">{artist.name[0]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{artist.name}</h3>
                  <span className="text-[11px] text-gray-400">{artist.genre}</span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 pl-11">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <IconHeart className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-medium tabular-nums">
                    <AnimatedNumber value={artist.likes} />
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <IconTrendingUp className="w-3.5 h-3.5 text-gray-300" />
                  <span className="font-medium tabular-nums">
                    <AnimatedNumber value={artist.investments} />
                  </span>
                </div>
                <div className="ml-auto">
                  <span className="text-sm font-bold text-gray-900 tabular-nums">
                    <AnimatedNumber value={artist.total} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full Ranking Table - Desktop */}
        <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-16">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
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
              className="grid grid-cols-12 gap-4 px-4 py-4 mx-2 items-center transition-all duration-200 hover:bg-gray-50 rounded-xl border-t border-gray-50 first:border-0"
            >
              <div className="col-span-1">
                {index < 3 ? (
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? 'bg-gray-900 text-white shadow-sm shadow-gray-900/20'
                      : index === 1
                      ? 'bg-gray-300 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                ) : (
                  <span className="text-sm font-bold text-gray-300 pl-2.5">{index + 1}</span>
                )}
              </div>
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{artist.name[0]}</span>
                </div>
                <span className="font-semibold text-gray-900 text-sm">{artist.name}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg">
                  {artist.genre}
                </span>
              </div>
              <div className="col-span-2 text-right">
                <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-600">
                  <IconHeart className="w-3.5 h-3.5 text-gray-400" />
                  <AnimatedNumber value={artist.likes} />
                </span>
              </div>
              <div className="col-span-1 text-right">
                <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-400">
                  <IconTrendingUp className="w-3.5 h-3.5 text-gray-300" />
                  <AnimatedNumber value={artist.investments} />
                </span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-sm font-bold text-gray-900">
                  <AnimatedNumber value={artist.total} />
                </span>
              </div>
            </div>
          ))}

          {sortedArtists.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <IconTrophy className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm">등록된 아티스트가 없습니다</p>
            </div>
          )}
        </div>

        {/* Empty state for mobile */}
        {sortedArtists.length === 0 && (
          <div className="sm:hidden py-20 text-center mb-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <IconTrophy className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">등록된 아티스트가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
