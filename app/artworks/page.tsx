'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { initStore, getArtworks, getUserStars } from '@/lib/store';
import Link from 'next/link';
import { IconShoppingBag, IconCoin, IconPalette } from '@/components/icons';
import type { Artwork } from '@/lib/mock-data';
import { ArtworkIcon } from '@/lib/icons';

const CATEGORIES = ['전체', '앨범', '포스터', '포토카드', '머천다이즈', '디지털', '평면아트', '조형아트', '미디어아트', '사운드아트', '책'] as const;
type Category = typeof CATEGORIES[number];

export default function ArtworksPage() {
  const { user } = useAuth();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체');
  const [userStars, setUserStars] = useState(0);

  useEffect(() => {
    initStore();
    setArtworks(getArtworks());
    setUserStars(getUserStars());
    setLoading(false);
    const onSync = () => {
      setArtworks(getArtworks());
      setUserStars(getUserStars());
    };
    window.addEventListener('ples-data-synced', onSync);
    return () => window.removeEventListener('ples-data-synced', onSync);
  }, []);

  const filteredArtworks = useMemo(() => {
    if (selectedCategory === '전체') return artworks;
    return artworks.filter((a) => a.category === selectedCategory);
  }, [artworks, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { '전체': artworks.length };
    for (const a of artworks) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    }
    return counts;
  }, [artworks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-64 bg-gray-200/60 rounded-lg animate-pulse mb-8" />
          <div className="flex gap-2 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-9 w-20 bg-gray-200 rounded-full animate-pulse shrink-0" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200/60 rounded animate-pulse" />
                  <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse mt-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
              <IconShoppingBag className="w-5 h-5 text-gray-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">갤러리</h1>
          </div>
          <p className="text-gray-500 ml-[52px] text-sm">한정판 아트워크와 굿즈를 만나보세요</p>
          {user && (
            <div className="mt-4 ml-[52px] inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
              <IconCoin className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-500">보유 스타</span>
              <span className="text-sm font-bold text-gray-900 tabular-nums">
                {userStars.toLocaleString()}★
              </span>
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium whitespace-nowrap rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {cat}
                <span
                  className={`text-[11px] font-semibold tabular-nums rounded-full px-1.5 py-0.5 min-w-[20px] text-center ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        {filteredArtworks.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <IconShoppingBag className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500">해당 카테고리에 상품이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredArtworks.map((artwork) => {
              const isSoldOut = artwork.soldOut || artwork.stock <= 0;
              const lowStock = !isSoldOut && artwork.stock > 0 && artwork.stock < 10;

              return (
                <div
                  key={artwork.id}
                  className={`bg-white rounded-2xl border border-gray-200 overflow-hidden group transition-all duration-300 ${
                    isSoldOut ? 'opacity-70' : 'hover:border-gray-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50'
                  }`}
                >
                  {/* Image Area */}
                  <Link href={`/artworks/${artwork.id}`} className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                    {artwork.imageData ? (
                      <img src={artwork.imageData} alt={artwork.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <span className="group-hover:scale-110 transition-transform duration-500 text-gray-400">
                        <ArtworkIcon category={artwork.category} className="w-12 h-12" />
                      </span>
                    )}

                    {/* Sold Out Overlay */}
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-red-500/90 text-white text-xs font-bold rounded-lg px-4 py-1.5 tracking-wide">
                          품절
                        </span>
                      </div>
                    )}

                    {/* NEW Badge */}
                    {artwork.isNew && !isSoldOut && (
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-bold tracking-wider text-gray-900 bg-yellow-400 px-2.5 py-1 rounded-md shadow-lg shadow-yellow-400/30">
                          NEW
                        </span>
                      </div>
                    )}

                    {/* Low Stock Badge */}
                    {lowStock && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-lg">
                          {artwork.stock}개 남음
                        </span>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-white/80 backdrop-blur-md text-gray-600 rounded-lg px-2.5 py-1 text-[11px] font-medium border border-gray-200">
                        {artwork.category}
                      </span>
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link href={`/artworks/${artwork.id}`} className="font-semibold text-gray-900 text-sm truncate block mb-0.5 hover:text-gray-600 transition-colors">{artwork.title}</Link>
                    <p className="text-xs text-gray-500 mb-3">{artwork.artist}</p>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="font-extrabold text-gray-900 text-base tabular-nums">
                        {artwork.price.toLocaleString()}원
                      </span>
                      <span className="text-[11px] text-gray-300">|</span>
                      <span className="text-xs text-yellow-600 font-medium tabular-nums inline-flex items-center gap-0.5">
                        <IconCoin className="w-3 h-3" />
                        {artwork.pointPrice.toLocaleString()}★
                      </span>
                    </div>

                    {artwork.link && (
                      <a
                        href={artwork.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5 mb-2 border border-indigo-100"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        외부 링크
                      </a>
                    )}

                    {!isSoldOut ? (
                      <Link
                        href={`/artworks/${artwork.id}`}
                        className="w-full py-3.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <IconShoppingBag className="w-4 h-4" />
                        구매하기
                      </Link>
                    ) : (
                      <div
                        className="w-full py-3.5 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium text-center border border-gray-200"
                      >
                        품절
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
