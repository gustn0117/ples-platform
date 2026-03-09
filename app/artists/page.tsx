'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

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
    { key: 'popular' as const, label: '인기순' },
    { key: 'latest' as const, label: '최신순' },
    { key: 'investments' as const, label: '투자순' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <div className="h-8 bg-gray-100 rounded-lg w-40 animate-pulse mb-3" />
            <div className="h-5 bg-gray-100 rounded-lg w-72 animate-pulse" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="h-12 bg-gray-100 rounded-xl animate-pulse mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="aspect-square bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-gray-100 rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                  <div className="h-8 bg-gray-100 rounded-full animate-pulse w-20 mt-3" />
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
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">아티스트</h1>
          <p className="text-gray-400">좋아하는 아티스트를 응원하고 투자하세요</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Search Bar */}
        <div className="relative mb-6">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="아티스트 이름 또는 장르로 검색..."
            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all"
          />
        </div>

        {/* Sort Tabs */}
        <div className="flex gap-6 mb-8 border-b border-gray-100">
          {sortTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSortBy(tab.key)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                sortBy === tab.key
                  ? 'text-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {sortBy === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Artists Grid */}
        {filteredArtists.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-400">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredArtists.map((artist) => {
              const isLiked = likedArtists.has(artist.id);
              const isLiking = likingInProgress === artist.id;

              return (
                <div
                  key={artist.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                >
                  {/* Emoji Area */}
                  <div
                    className="aspect-square bg-gray-50 rounded-t-2xl flex items-center justify-center cursor-pointer relative"
                    onClick={() => setSelectedArtist(artist)}
                  >
                    <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">
                      {artist.emoji || '🎵'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3
                      className="font-semibold text-gray-900 truncate cursor-pointer hover:text-gray-600 transition-colors"
                      onClick={() => setSelectedArtist(artist)}
                    >
                      {artist.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">{artist.genre}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>{artist.likes.toLocaleString()}</span>
                        </div>
                        {(artist.investments || 0) > 0 && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span>{artist.investments?.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(artist.id);
                        }}
                        disabled={isLiking}
                        className={`p-1.5 rounded-full transition-all ${
                          isLiking ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isLiked ? (
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-300 hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
          onClick={() => setSelectedArtist(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Artist header */}
            <div className="relative bg-gray-50 p-10 text-center">
              <button
                onClick={() => setSelectedArtist(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className="text-7xl mb-4 block">{selectedArtist.emoji || '🎵'}</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedArtist.name}</h3>
              <p className="text-sm text-gray-400">{selectedArtist.genre}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
              <div className="p-5 text-center">
                <p className="text-2xl font-bold text-gray-900">{selectedArtist.likes.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">좋아요</p>
              </div>
              <div className="p-5 text-center">
                <p className="text-2xl font-bold text-gray-900">{(selectedArtist.investments || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">투자</p>
              </div>
            </div>

            {/* Description */}
            <div className="p-6">
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">소개</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedArtist.description || '아직 소개가 등록되지 않았습니다.'}
              </p>
            </div>

            {/* Action */}
            <div className="px-6 pb-6">
              <button
                onClick={() => toggleLike(selectedArtist.id)}
                disabled={likingInProgress === selectedArtist.id}
                className={`w-full py-3.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  likedArtists.has(selectedArtist.id)
                    ? 'border border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {likedArtists.has(selectedArtist.id) ? (
                  <>
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    좋아요 취소
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
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
