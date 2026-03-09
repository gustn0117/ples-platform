'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { initStore, getArtists, getUserLiked, toggleLike } from '@/lib/store';
import type { Artist } from '@/lib/mock-data';
import { IconMicrophone, IconSearch, IconHeart, IconHeartFilled, IconCheck, IconTrendingUp } from '@/components/icons';
import { ArtistIcon } from '@/lib/icons';

type SortKey = 'popular' | 'latest' | 'investments';

export default function ArtistsPage() {
  const { user } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('popular');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [mounted, setMounted] = useState(false);

  // Initialize store and load data
  useEffect(() => {
    initStore();
    setArtists(getArtists());
    setLikedIds(new Set(getUserLiked()));
    setMounted(true);
  }, []);

  function refreshData() {
    setArtists(getArtists());
    setLikedIds(new Set(getUserLiked()));
  }

  function handleToggleLike(artistId: number) {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    toggleLike(artistId);
    refreshData();
    // Update selected artist if modal is open
    if (selectedArtist && selectedArtist.id === artistId) {
      const updated = getArtists().find((a) => a.id === artistId);
      if (updated) setSelectedArtist(updated);
    }
  }

  const filteredArtists = artists
    .filter(
      (a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.genre.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'popular') return b.likes - a.likes;
      if (sortBy === 'investments') return b.likes - a.likes; // fallback: use likes
      return b.id - a.id; // latest = higher id first
    });

  const sortTabs: { key: SortKey; label: string }[] = [
    { key: 'popular', label: '인기순' },
    { key: 'latest', label: '최신순' },
    { key: 'investments', label: '투자순' },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="h-8 w-40 bg-gray-100 rounded mb-4 animate-pulse" />
          <div className="h-4 w-64 bg-gray-100 rounded mb-10 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden">
                <div className="aspect-square bg-gray-50 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
              <IconMicrophone className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">아티스트</h1>
          </div>
          <p className="text-gray-400 text-sm ml-[52px]">
            좋아하는 아티스트를 응원하세요 · {artists.length}명
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="아티스트 이름 또는 장르 검색..."
            className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 rounded-xl p-1 w-fit">
          {sortTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSortBy(tab.key)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                sortBy === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filteredArtists.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
            <IconSearch className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 font-medium mb-1">검색 결과가 없습니다</p>
            <p className="text-sm text-gray-400">
              &ldquo;{searchQuery}&rdquo;에 대한 결과를 찾을 수 없습니다
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              검색어 지우기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredArtists.map((artist) => {
              const isLiked = likedIds.has(artist.id);

              return (
                <div
                  key={artist.id}
                  className="bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
                >
                  {/* Avatar Area */}
                  <div
                    className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center cursor-pointer relative"
                    onClick={() => setSelectedArtist(artist)}
                  >
                    <span className="group-hover:scale-110 transition-transform duration-300 text-gray-400">
                      <ArtistIcon genre={artist.genre} className="w-12 h-12" />
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3
                      className="font-semibold text-gray-900 text-sm truncate cursor-pointer hover:text-gray-600 transition-colors"
                      onClick={() => setSelectedArtist(artist)}
                    >
                      {artist.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 mb-3">{artist.genre}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-gray-400">
                        <IconHeart className="w-3.5 h-3.5" />
                        <span className="text-xs tabular-nums">{artist.likes.toLocaleString()}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLike(artist.id);
                        }}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isLiked
                            ? 'bg-gray-900 hover:bg-gray-800 active:scale-90'
                            : 'bg-gray-100 hover:bg-gray-200 active:scale-90'
                        }`}
                      >
                        {isLiked ? (
                          <IconHeartFilled className="w-4 h-4 text-white" />
                        ) : (
                          <IconHeart className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
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
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-10 text-center">
              <button
                onClick={() => setSelectedArtist(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <span className="block mb-4 text-gray-400"><ArtistIcon genre={selectedArtist.genre} className="w-16 h-16 mx-auto" /></span>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedArtist.name}</h3>
              <span className="inline-block text-xs text-gray-400 bg-white border border-gray-100 rounded-full px-3 py-1">
                {selectedArtist.genre}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 border-b border-gray-100">
              <div className="p-5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <IconHeart className="w-4 h-4 text-gray-400" />
                  <p className="text-xl font-bold text-gray-900 tabular-nums">
                    {selectedArtist.likes.toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-gray-400">좋아요</p>
              </div>
            </div>

            {/* Description */}
            <div className="p-6">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">소개</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedArtist.description || '아직 소개가 등록되지 않았습니다.'}
              </p>
            </div>

            {/* Like Button */}
            <div className="px-6 pb-6">
              <button
                onClick={() => handleToggleLike(selectedArtist.id)}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${
                  likedIds.has(selectedArtist.id)
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {likedIds.has(selectedArtist.id) ? (
                  <>
                    <IconCheck className="w-4 h-4 text-gray-500" />
                    좋아요 취소
                  </>
                ) : (
                  <>
                    <IconHeart className="w-4 h-4" />
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
