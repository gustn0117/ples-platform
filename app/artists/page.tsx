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
  const [animatedCards, setAnimatedCards] = useState(false);

  useEffect(() => {
    fetchArtists();
    if (user) fetchUserLikes();
  }, [user]);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setAnimatedCards(true), 100);
    }
  }, [loading]);

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

  if (loading) {
    return (
      <div className="section-container py-12">
        <div className="mb-10">
          <div className="h-8 bg-white/10 rounded-lg w-48 animate-pulse mb-3" />
          <div className="h-5 bg-white/5 rounded-lg w-80 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden glass">
              <div className="aspect-square bg-white/5 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-white/10 rounded animate-pulse" />
                <div className="h-3 bg-white/5 rounded animate-pulse w-2/3" />
                <div className="h-8 bg-white/5 rounded-full animate-pulse w-24 mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="section-container py-12">
      {/* Header */}
      <div className="mb-10 animate-slideUp">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">💜</span>
          <h1 className="text-3xl font-bold">아티스트</h1>
        </div>
        <p className="text-gray-500">좋아하는 아티스트에게 투자(좋아요)하고 응원하세요</p>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="아티스트 이름 또는 장르로 검색..."
            className="input-modern pl-12"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          {[
            { key: 'popular' as const, label: '인기순' },
            { key: 'latest' as const, label: '최신순' },
            { key: 'investments' as const, label: '투자순' },
          ].map((sort) => (
            <button
              key={sort.key}
              onClick={() => setSortBy(sort.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                sortBy === sort.key
                  ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-lg shadow-black/30'
                  : 'glass text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      {/* Artists Grid */}
      {filteredArtists.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <span className="text-5xl mb-4 block">🔍</span>
          <p className="text-gray-500 text-lg">검색 결과가 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredArtists.map((artist, index) => {
            const isLiked = likedArtists.has(artist.id);
            const isLiking = likingInProgress === artist.id;

            return (
              <div
                key={artist.id}
                className={`glass rounded-2xl overflow-hidden card-hover transition-all duration-500 ${
                  animatedCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${Math.min(index * 50, 500)}ms` }}
              >
                {/* Image area */}
                <div
                  className="relative aspect-square bg-gradient-to-br from-white/10 via-ples-silver/5 to-ples-gold/5 flex items-center justify-center cursor-pointer group"
                  onClick={() => setSelectedArtist(artist)}
                >
                  <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform duration-300">
                    {artist.emoji || '🎵'}
                  </span>
                  {index < 3 && (
                    <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      {index + 1}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                      상세보기
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3
                    className="font-bold mb-0.5 cursor-pointer hover:text-white transition-colors truncate"
                    onClick={() => setSelectedArtist(artist)}
                  >
                    {artist.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">{artist.genre}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <span className="text-xs">💜</span>
                      <span>{artist.likes.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => toggleLike(artist.id)}
                      disabled={isLiking}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isLiked
                          ? 'bg-ples-gold text-ples-dark shadow-lg shadow-ples-gold/20 hover:bg-ples-gold/80'
                          : 'bg-white/5 text-gray-400 hover:bg-ples-gold/10 hover:text-ples-gold border border-white/10'
                      } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isLiking ? '...' : isLiked ? '💜' : '🤍'}
                    </button>
                  </div>

                  {(artist.investments || 0) > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      투자 {artist.investments?.toLocaleString()}회
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedArtist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedArtist(null)}
        >
          <div
            className="glass-strong rounded-3xl max-w-lg w-full overflow-hidden animate-fadeIn shadow-2xl shadow-black/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Artist header */}
            <div className="relative bg-gradient-to-br from-white/15 via-ples-silver/10 to-ples-gold/5 p-8 text-center">
              <button
                onClick={() => setSelectedArtist(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className="text-7xl mb-4 block">{selectedArtist.emoji || '🎵'}</span>
              <h3 className="text-2xl font-bold mb-1">{selectedArtist.name}</h3>
              <p className="text-sm text-gray-400">{selectedArtist.genre}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 divide-x divide-white/5 border-b border-white/5">
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-ples-silver">{selectedArtist.likes.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">좋아요</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-ples-gold">{(selectedArtist.investments || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">투자</p>
              </div>
            </div>

            {/* Description */}
            <div className="p-6">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">소개</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                {selectedArtist.description || '아직 소개가 등록되지 않았습니다.'}
              </p>
            </div>

            {/* Action */}
            <div className="px-6 pb-6">
              <button
                onClick={() => toggleLike(selectedArtist.id)}
                disabled={likingInProgress === selectedArtist.id}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                  likedArtists.has(selectedArtist.id)
                    ? 'bg-ples-gold text-ples-dark hover:bg-ples-gold/80'
                    : 'btn-primary'
                }`}
              >
                {likedArtists.has(selectedArtist.id) ? '💜 좋아요 취소' : '🤍 좋아요'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
