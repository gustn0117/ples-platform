'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { IconMicrophone, IconSearch, IconHeart, IconHeartFilled, IconTrendingUp, IconCheck, IconSparkle } from '@/components/icons';

interface Artist {
  id: string;
  name: string;
  emoji: string;
  genre: string;
  description: string;
  likes: number;
  investments: number;
  created_at: string;
}

const genreDotColors: Record<string, string> = {
  '힙합': 'bg-gray-800',
  '발라드': 'bg-gray-400',
  '댄스': 'bg-gray-600',
  '인디': 'bg-gray-500',
  '록': 'bg-gray-700',
  'R&B': 'bg-gray-450',
  '팝': 'bg-gray-350',
};

function getGenreDotColor(genre: string): string {
  return genreDotColors[genre] || 'bg-gray-400';
}

function SparkleAnimation({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-sparkle-burst"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            animationDelay: `${i * 0.08}s`,
          }}
        >
          <IconSparkle className="w-3 h-3 text-gray-400" />
        </div>
      ))}
    </div>
  );
}

function PopularityRing({ value, max }: { value: number; max: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const percentage = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference - percentage * circumference;

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="6" />
        <circle
          cx="50" cy="50" r={radius} fill="none" stroke="#111827" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="animate-progress-ring"
          style={{ '--ring-offset': offset } as React.CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-900 tabular-nums">{Math.round(percentage * 100)}%</span>
      </div>
    </div>
  );
}

export default function ArtistsPage() {
  const { user } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'latest' | 'investments'>('popular');
  const [likedArtists, setLikedArtists] = useState<Set<string>>(new Set());
  const [likingInProgress, setLikingInProgress] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [sparklingId, setSparklingId] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Tab indicator
  const sortTabContainerRef = useRef<HTMLDivElement>(null);
  const sortTabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [sortIndicatorStyle, setSortIndicatorStyle] = useState({ left: 0, width: 0 });

  const updateSortIndicator = useCallback((key: string) => {
    const container = sortTabContainerRef.current;
    const button = sortTabRefs.current[key];
    if (container && button) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      setSortIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, []);

  useEffect(() => {
    updateSortIndicator(sortBy);
  }, [sortBy, updateSortIndicator, loading]);

  // Keyboard shortcut for search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetchArtists();
    if (user) fetchUserLikes();
  }, [user]);

  async function fetchArtists() {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('likes', { ascending: false });

      if (error) throw error;
      if (data) setArtists(data);
    } catch (err) {
      console.error('아티스트 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserLikes() {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('artist_likes')
        .select('artist_id')
        .eq('user_id', user.id);

      if (data) {
        setLikedArtists(new Set(data.map((l) => l.artist_id)));
      }
    } catch (err) {
      console.error('좋아요 정보 로딩 실패:', err);
    }
  }

  async function toggleLike(artistId: string) {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (likingInProgress) return;
    setLikingInProgress(artistId);

    const isLiked = likedArtists.has(artistId);
    const artist = artists.find((a) => a.id === artistId);
    if (!artist) return;

    // Trigger sparkle on like (not unlike)
    if (!isLiked) {
      setSparklingId(artistId);
      setTimeout(() => setSparklingId(null), 700);
    }

    try {
      if (isLiked) {
        await supabase
          .from('artist_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('artist_id', artistId);

        await supabase
          .from('artists')
          .update({ likes: Math.max(0, artist.likes - 1) })
          .eq('id', artistId);

        const newSet = new Set(likedArtists);
        newSet.delete(artistId);
        setLikedArtists(newSet);

        setArtists((prev) =>
          prev.map((a) =>
            a.id === artistId ? { ...a, likes: Math.max(0, a.likes - 1) } : a
          )
        );
      } else {
        await supabase.from('artist_likes').insert({
          user_id: user.id,
          artist_id: artistId,
        });

        await supabase
          .from('artists')
          .update({ likes: artist.likes + 1 })
          .eq('id', artistId);

        setLikedArtists(new Set([...likedArtists, artistId]));

        setArtists((prev) =>
          prev.map((a) =>
            a.id === artistId ? { ...a, likes: a.likes + 1 } : a
          )
        );
      }
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
    } finally {
      setLikingInProgress(null);
    }
  }

  const filteredArtists = artists
    .filter((a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.genre?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'popular') return b.likes - a.likes;
      if (sortBy === 'investments') return (b.investments || 0) - (a.investments || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const maxLikes = Math.max(...artists.map(a => a.likes), 1);

  const sortTabs = [
    { key: 'popular' as const, label: '인기순', icon: <IconHeart className="w-3.5 h-3.5" /> },
    { key: 'latest' as const, label: '최신순', icon: null },
    { key: 'investments' as const, label: '투자순', icon: <IconTrendingUp className="w-3.5 h-3.5" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gray-50/50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <div className="skeleton-heading w-40 mb-3" />
            <div className="skeleton-text w-72" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="skeleton h-12 rounded-xl mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden">
                <div className="aspect-square skeleton rounded-none" />
                <div className="p-4 space-y-2">
                  <div className="skeleton-text w-2/3" />
                  <div className="skeleton-text w-1/2 h-3" />
                  <div className="skeleton h-8 rounded-full w-20 mt-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-gray-50/50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
              <IconMicrophone className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">아티스트</h1>
          </div>
          <p className="text-gray-400 ml-[52px]">좋아하는 아티스트를 응원하고 투자하세요</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Search Bar with keyboard shortcut hint */}
        <div className={`relative mb-6 ${searchFocused ? 'search-focused' : ''}`}>
          <IconSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-250 ${
            searchFocused ? 'text-gray-600 scale-110' : 'text-gray-300'
          }`} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="아티스트 이름 또는 장르로 검색..."
            className="w-full pl-12 pr-24 py-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 focus:bg-white transition-all duration-300"
          />
          {/* Keyboard shortcut badge */}
          {!searchQuery && !searchFocused && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-md">
                {typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent) ? '\u2318' : 'Ctrl'}
              </kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-md">
                K
              </kbd>
            </div>
          )}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-200"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort Tabs with sliding indicator */}
        <div className="mb-8">
          <div ref={sortTabContainerRef} className="relative inline-flex bg-gray-100/80 rounded-2xl p-1.5 gap-1">
            {/* Sliding indicator */}
            <div
              className="absolute top-1.5 h-[calc(100%-12px)] bg-white rounded-xl shadow-sm shadow-gray-200/50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ left: sortIndicatorStyle.left, width: sortIndicatorStyle.width }}
            />
            {sortTabs.map((tab) => (
              <button
                key={tab.key}
                ref={(el) => { sortTabRefs.current[tab.key] = el; }}
                onClick={() => setSortBy(tab.key)}
                className={`relative z-10 flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-300 ${
                  sortBy === tab.key
                    ? 'text-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.icon && (
                  <span className={sortBy === tab.key ? 'animate-icon-bounce' : ''}>
                    {tab.icon}
                  </span>
                )}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Artists Grid */}
        {filteredArtists.length === 0 ? (
          <div className="text-center py-24 bg-gray-50/50 rounded-3xl border border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
              {searchQuery ? (
                <IconSearch className="w-7 h-7 text-gray-300" />
              ) : (
                <IconMicrophone className="w-7 h-7 text-gray-300" />
              )}
            </div>
            <p className="text-gray-900 font-semibold mb-1.5">
              {searchQuery ? '검색 결과가 없습니다' : '등록된 아티스트가 없습니다'}
            </p>
            <p className="text-sm text-gray-400">
              {searchQuery ? (
                <>
                  &ldquo;{searchQuery}&rdquo;에 대한 결과를 찾을 수 없습니다
                </>
              ) : (
                '아티스트가 등록되면 여기에 표시됩니다'
              )}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-5 px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                검색어 지우기
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredArtists.map((artist, index) => {
              const isLiked = likedArtists.has(artist.id);
              const isLiking = likingInProgress === artist.id;
              const isSparkling = sparklingId === artist.id;

              return (
                <div
                  key={artist.id}
                  className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all duration-500 overflow-hidden group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Letter Avatar Area */}
                  <div
                    className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-gray-100 group-hover:to-gray-200 flex items-center justify-center cursor-pointer relative overflow-hidden transition-all duration-700"
                    onClick={() => setSelectedArtist(artist)}
                  >
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/5 transition-colors duration-500" />
                    <div className="w-20 h-20 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl font-bold group-hover:scale-110 group-hover:rounded-xl transition-all duration-500 shadow-lg shadow-gray-900/10">
                      {artist.name.charAt(0)}
                    </div>
                    {/* Rank for top 3 */}
                    {sortBy === 'popular' && index < 3 && (
                      <div className={`absolute top-3 left-3 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 shadow-sm border border-gray-100'
                      }`}>
                        {index + 1}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3
                      className="font-semibold text-gray-900 truncate cursor-pointer hover:text-gray-600 transition-colors"
                      onClick={() => setSelectedArtist(artist)}
                    >
                      {artist.name}
                    </h3>
                    {/* Genre badge with colored dot */}
                    <span className="inline-flex items-center gap-1.5 mt-1.5 mb-3 text-[11px] text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${getGenreDotColor(artist.genre)}`} />
                      {artist.genre}
                    </span>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <IconHeart className="w-3.5 h-3.5" />
                          <span className="text-xs tabular-nums">{artist.likes.toLocaleString()}</span>
                        </div>
                        {(artist.investments || 0) > 0 && (
                          <div className="flex items-center gap-1">
                            <IconTrendingUp className="w-3.5 h-3.5" />
                            <span className="text-xs tabular-nums">{artist.investments?.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <SparkleAnimation show={isSparkling} />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(artist.id);
                          }}
                          disabled={isLiking}
                          className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                            isLiking ? 'opacity-50 cursor-not-allowed scale-90' :
                            isLiked
                              ? 'bg-gray-900 hover:bg-gray-800 shadow-sm shadow-gray-900/20 active:scale-90'
                              : 'bg-gray-100 hover:bg-gray-200 active:scale-90'
                          }`}
                        >
                          {isLiked ? (
                            <IconHeartFilled className="w-[18px] h-[18px] text-white" />
                          ) : (
                            <IconHeart className="w-[18px] h-[18px] text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Invest button */}
                    <button
                      className="w-full mt-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-[0.98]"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <IconTrendingUp className="w-3.5 h-3.5 text-gray-400" />
                      투자하기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedArtist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => setSelectedArtist(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Artist header */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-12 text-center">
              {/* Share + Close buttons */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white transition-all duration-200"
                  title="공유하기"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedArtist(null)}
                  className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="w-28 h-28 bg-gray-900 text-white rounded-3xl flex items-center justify-center text-5xl font-bold mx-auto mb-5 shadow-xl shadow-gray-900/10">
                {selectedArtist.name.charAt(0)}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedArtist.name}</h3>
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-400 bg-white border border-gray-100 rounded-full px-4 py-1.5 shadow-sm">
                <span className={`w-2 h-2 rounded-full ${getGenreDotColor(selectedArtist.genre)}`} />
                {selectedArtist.genre}
              </span>
            </div>

            {/* Popularity ring + Stats */}
            <div className="px-6 pt-6 pb-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">인기도</h4>
              <PopularityRing value={selectedArtist.likes} max={maxLikes} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 border-y border-gray-100">
              <div className="p-6 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <IconHeart className="w-4 h-4 text-red-400" />
                  <p className="text-2xl font-bold text-gray-900 tabular-nums">{selectedArtist.likes.toLocaleString()}</p>
                  <span className="text-gray-400 text-xs animate-arrow-pulse">&uarr;</span>
                </div>
                <p className="text-xs text-gray-400 font-medium">좋아요</p>
              </div>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <IconTrendingUp className="w-4 h-4 text-gray-400" />
                  <p className="text-2xl font-bold text-gray-900 tabular-nums">{(selectedArtist.investments || 0).toLocaleString()}</p>
                  <span className="text-gray-400 text-xs animate-arrow-pulse">&uarr;</span>
                </div>
                <p className="text-xs text-gray-400 font-medium">투자</p>
              </div>
            </div>

            {/* Description */}
            <div className="p-6">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">소개</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedArtist.description || '아직 소개가 등록되지 않았습니다.'}
              </p>
            </div>

            {/* Similar artists placeholder */}
            <div className="px-6 pb-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">비슷한 아티스트</h4>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-sm text-gray-400">준비 중...</p>
              </div>
            </div>

            {/* Action */}
            <div className="px-6 pb-6 pt-2">
              <button
                onClick={() => toggleLike(selectedArtist.id)}
                disabled={likingInProgress === selectedArtist.id}
                className={`w-full py-4 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2.5 ${
                  likingInProgress === selectedArtist.id ? 'opacity-60 cursor-not-allowed' : ''
                } ${
                  likedArtists.has(selectedArtist.id)
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-[0.98]'
                    : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/10 active:scale-[0.98]'
                }`}
              >
                {likedArtists.has(selectedArtist.id) ? (
                  <>
                    <IconCheck className="w-[18px] h-[18px] text-gray-500" />
                    좋아요 취소
                  </>
                ) : (
                  <>
                    <IconHeart className="w-[18px] h-[18px]" />
                    좋아요
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
