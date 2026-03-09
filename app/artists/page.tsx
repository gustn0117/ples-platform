'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { IconMicrophone, IconSearch, IconHeart, IconHeartFilled, IconTrendingUp, IconCheck } from '@/components/icons';

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

export default function ArtistsPage() {
  const { user } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'latest' | 'investments'>('popular');
  const [likedArtists, setLikedArtists] = useState<Set<string>>(new Set());
  const [likingInProgress, setLikingInProgress] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

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
        {/* Search Bar with clear button */}
        <div className="relative mb-6">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="아티스트 이름 또는 장르로 검색..."
            className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 focus:bg-white transition-all duration-300"
          />
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

        {/* Sort Tabs - pill segment style */}
        <div className="mb-8">
          <div className="inline-flex bg-gray-100/80 rounded-2xl p-1.5 gap-1">
            {sortTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSortBy(tab.key)}
                className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  sortBy === tab.key
                    ? 'bg-white text-gray-900 shadow-sm shadow-gray-200/50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.icon}
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

              return (
                <div
                  key={artist.id}
                  className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all duration-500 overflow-hidden group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Letter Avatar Area */}
                  <div
                    className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center cursor-pointer relative overflow-hidden"
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
                    <span className="inline-block mt-1.5 mb-3 text-[11px] text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-0.5">
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
              <button
                onClick={() => setSelectedArtist(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="w-28 h-28 bg-gray-900 text-white rounded-3xl flex items-center justify-center text-5xl font-bold mx-auto mb-5 shadow-xl shadow-gray-900/10">
                {selectedArtist.name.charAt(0)}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedArtist.name}</h3>
              <span className="inline-flex items-center text-sm text-gray-400 bg-white border border-gray-100 rounded-full px-4 py-1.5 shadow-sm">
                {selectedArtist.genre}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
              <div className="p-6 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <IconHeart className="w-4 h-4 text-red-400" />
                  <p className="text-2xl font-bold text-gray-900 tabular-nums">{selectedArtist.likes.toLocaleString()}</p>
                </div>
                <p className="text-xs text-gray-400 font-medium">좋아요</p>
              </div>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <IconTrendingUp className="w-4 h-4 text-gray-400" />
                  <p className="text-2xl font-bold text-gray-900 tabular-nums">{(selectedArtist.investments || 0).toLocaleString()}</p>
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

            {/* Action */}
            <div className="px-6 pb-6">
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
