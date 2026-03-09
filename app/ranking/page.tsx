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
  const rankBadges = ['🥇', '🥈', '🥉'];
  const tabs: TabType[] = ['종합', '좋아요', '투자'];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="py-16 pb-10">
          <div className="h-8 bg-gray-100 animate-pulse rounded w-48 mb-3" />
          <div className="h-5 bg-gray-100 animate-pulse rounded w-72" />
        </div>
        <div className="grid grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 animate-pulse mb-3" />
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="py-16 pb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">아티스트 랭킹</h1>
        <p className="text-gray-400">인기 아티스트 순위를 확인하세요</p>
      </div>

      {/* Tabs - underline style */}
      <div className="flex gap-8 mb-12 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === tab
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {top3.length >= 3 && (
        <div className="flex items-end justify-center gap-4 sm:gap-8 mb-16">
          {/* #2 - Left */}
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-2">🥈</span>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <span className="text-3xl sm:text-4xl">{top3[1].image}</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 text-center">
              <h3 className="text-sm font-bold text-gray-900">{top3[1].name}</h3>
              <p className="text-lg font-bold text-gray-700 mt-1">
                <AnimatedNumber
                  value={activeTab === '좋아요' ? top3[1].likes : activeTab === '투자' ? top3[1].investments : top3[1].total}
                />
              </p>
            </div>
          </div>

          {/* #1 - Center (larger) */}
          <div className="flex flex-col items-center -mt-6">
            <span className="text-3xl mb-2">🥇</span>
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <span className="text-5xl sm:text-6xl">{top3[0].image}</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 text-center">
              <h3 className="text-base font-bold text-gray-900">{top3[0].name}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                <AnimatedNumber
                  value={activeTab === '좋아요' ? top3[0].likes : activeTab === '투자' ? top3[0].investments : top3[0].total}
                />
              </p>
            </div>
          </div>

          {/* #3 - Right */}
          <div className="flex flex-col items-center mt-4">
            <span className="text-2xl mb-2">🥉</span>
            <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <span className="text-2xl sm:text-3xl">{top3[2].image}</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 text-center">
              <h3 className="text-sm font-bold text-gray-900">{top3[2].name}</h3>
              <p className="text-lg font-bold text-gray-700 mt-1">
                <AnimatedNumber
                  value={activeTab === '좋아요' ? top3[2].likes : activeTab === '투자' ? top3[2].investments : top3[2].total}
                />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full Ranking Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-16">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
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
            className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-gray-50 border-t border-gray-50 first:border-0"
          >
            <div className="col-span-1">
              {index < 3 ? (
                <span className="text-lg">{rankBadges[index]}</span>
              ) : (
                <span className="text-sm font-bold text-gray-300 pl-1">{index + 1}</span>
              )}
            </div>
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                {artist.image}
              </div>
              <span className="font-semibold text-gray-900 text-sm">{artist.name}</span>
            </div>
            <div className="col-span-2">
              <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg">
                {artist.genre}
              </span>
            </div>
            <div className="col-span-2 text-right text-sm font-medium text-gray-600">
              <AnimatedNumber value={artist.likes} />
            </div>
            <div className="col-span-1 text-right text-sm font-medium text-gray-400">
              <AnimatedNumber value={artist.investments} />
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
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl mx-auto mb-3">
              🏆
            </div>
            <p className="text-gray-400 text-sm">등록된 아티스트가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
