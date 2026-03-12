'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { initStore, getArtist, toggleLike, getUserLiked } from '@/lib/store';
import type { Artist } from '@/lib/mock-data';
import { ArtistIcon } from '@/lib/icons';
import { IconHeart, IconHeartFilled, IconArrowRight } from '@/components/icons';

export default function ArtistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const artistId = Number(params.id);

  useEffect(() => {
    initStore();
    const a = getArtist(artistId);
    if (!a) {
      setLoading(false);
      return;
    }
    setArtist(a);
    setIsLiked(getUserLiked().includes(artistId));
    setLoading(false);
  }, [artistId]);

  function handleToggleLike() {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    toggleLike(artistId);
    setArtist(getArtist(artistId) ?? null);
    setIsLiked(getUserLiked().includes(artistId));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div className="h-6 w-20 bg-gray-100 rounded animate-pulse mb-8" />
          <div className="aspect-[4/3] bg-gray-50 rounded-2xl animate-pulse mb-6" />
          <div className="h-8 w-48 bg-gray-100 rounded animate-pulse mb-3" />
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">아티스트를 찾을 수 없습니다</p>
          <Link
            href="/artists"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8"
        >
          <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          아티스트 목록
        </button>

        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center mb-8 relative overflow-hidden">
          {artist.imageData ? (
            <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-5 border-4 border-white shadow-lg">
              <img src={artist.imageData} alt={artist.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <span className="block mb-5 text-gray-400">
              <ArtistIcon genre={artist.genre} className="w-24 h-24 mx-auto" />
            </span>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{artist.name}</h1>
          <span className="inline-block text-sm text-gray-400 bg-white border border-gray-100 rounded-full px-4 py-1.5">
            {artist.genre}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 mb-8 py-5 border-y border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <IconHeart className="w-4 h-4 text-red-400" />
              <p className="text-2xl font-bold text-gray-900 tabular-nums">
                {artist.likes.toLocaleString()}
              </p>
            </div>
            <p className="text-xs text-gray-400">좋아요</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">소개</h2>
          <p className="text-gray-600 leading-relaxed">
            {artist.description || '아직 소개가 등록되지 않았습니다.'}
          </p>
        </div>

        {/* SNS Links */}
        {artist.sns && Object.values(artist.sns).some(Boolean) && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">SNS</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {artist.sns.instagram && (
                <a
                  href={artist.sns.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  Instagram
                </a>
              )}
              {artist.sns.youtube && (
                <a
                  href={artist.sns.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  YouTube
                </a>
              )}
              {artist.sns.twitter && (
                <a
                  href={artist.sns.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  X
                </a>
              )}
            </div>
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={handleToggleLike}
          className={`w-full py-4 rounded-xl text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${
            isLiked
              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {isLiked ? (
            <>
              <IconHeartFilled className="w-4 h-4 text-red-500" />
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
  );
}
