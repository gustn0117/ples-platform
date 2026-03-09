'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { IconShoppingBag, IconPalette, IconCoin, IconWallet, IconCheck } from '@/components/icons';

interface Artwork {
  id: string;
  title: string;
  description: string;
  emoji: string;
  artist_name: string;
  category: string;
  price_cash: number;
  price_points: number;
  stock: number;
  created_at: string;
}

const CATEGORIES = [
  { key: '전체', label: '전체' },
  { key: '앨범', label: '앨범' },
  { key: '포스터', label: '포스터' },
  { key: '포토카드', label: '포토카드' },
  { key: '머천다이즈', label: '머천다이즈' },
  { key: '디지털', label: '디지털' },
];

function isNewProduct(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

function isPointsBestValue(priceCash: number, pricePoints: number): boolean {
  if (priceCash <= 0 || pricePoints <= 0) return false;
  // Consider points a good deal if points-per-won ratio is favorable
  // Simple heuristic: if price_points < price_cash (points feel cheaper)
  return pricePoints < priceCash;
}

export default function ArtworksPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'points'>('cash');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    fetchArtworks();
  }, []);

  async function fetchArtworks() {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setArtworks(data);
    } catch (err) {
      console.error('작품 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase() {
    if (!user || !selectedArtwork || !profile) return;

    setPurchasing(true);

    try {
      if (selectedArtwork.stock <= 0) {
        alert('품절된 상품입니다.');
        return;
      }

      if (paymentMethod === 'points') {
        if (profile.points < selectedArtwork.price_points) {
          alert('포인트가 부족합니다.');
          return;
        }

        await supabase
          .from('profiles')
          .update({ points: profile.points - selectedArtwork.price_points })
          .eq('id', user.id);

        await supabase.from('points_transactions').insert({
          user_id: user.id,
          amount: -selectedArtwork.price_points,
          type: 'spend',
          description: `작품 구매: ${selectedArtwork.title}`,
        });
      }

      await supabase.from('purchases').insert({
        user_id: user.id,
        artwork_id: selectedArtwork.id,
        payment_method: paymentMethod,
        amount: paymentMethod === 'cash' ? selectedArtwork.price_cash : selectedArtwork.price_points,
      });

      await supabase
        .from('artworks')
        .update({ stock: selectedArtwork.stock - 1 })
        .eq('id', selectedArtwork.id);

      setArtworks((prev) =>
        prev.map((a) =>
          a.id === selectedArtwork.id ? { ...a, stock: a.stock - 1 } : a
        )
      );

      setPurchaseSuccess(true);
      await refreshProfile();

      setTimeout(() => {
        setPurchaseSuccess(false);
        setSelectedArtwork(null);
        setPaymentMethod('cash');
      }, 2000);
    } catch (err) {
      console.error('구매 실패:', err);
      alert('구매 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setPurchasing(false);
    }
  }

  const filteredArtworks = artworks.filter(
    (a) => selectedCategory === '전체' || a.category === selectedCategory
  );

  // Category counts for badge display
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { '전체': artworks.length };
    for (const a of artworks) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    }
    return counts;
  }, [artworks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gray-50/50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <div className="skeleton-heading w-32 mb-3" />
            <div className="skeleton-text w-72" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex gap-2 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-9 w-20 shrink-0 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden">
                <div className="aspect-[4/3] skeleton rounded-none" />
                <div className="p-4 space-y-2">
                  <div className="skeleton-text w-2/3" />
                  <div className="skeleton-text w-1/2 h-3" />
                  <div className="skeleton-text w-1/3 h-5 mt-2" />
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
              <IconShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">마켓</h1>
          </div>
          <p className="text-gray-400 ml-[52px]">한정판 아트워크와 굿즈를 구매하세요</p>
          {profile && (
            <div className="mt-6 ml-[52px] inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <IconCoin className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">보유 포인트</span>
              <span className="text-sm font-bold text-gray-900 tabular-nums">
                {profile.points.toLocaleString()}P
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Category Filter - Pill style with count badges and spring animation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.key] || 0;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium whitespace-nowrap rounded-full transition-all duration-300 ${
                  selectedCategory === cat.key
                    ? 'bg-gray-900 text-white shadow-md shadow-gray-900/15 ring-1 ring-gray-900 animate-pill-spring'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-800 hover:bg-gray-50 active:scale-95'
                }`}
              >
                {cat.label}
                <span className={`text-[11px] font-semibold tabular-nums rounded-full px-1.5 py-0.5 min-w-[20px] text-center ${
                  selectedCategory === cat.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        {filteredArtworks.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4 animate-gentle-float">
              <IconShoppingBag className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-400">해당 카테고리에 상품이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 stagger-grid" key={selectedCategory}>
            {filteredArtworks.map((artwork) => {
              const isSoldOut = artwork.stock <= 0;
              const isNew = isNewProduct(artwork.created_at);

              return (
                <div
                  key={artwork.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-300 hover:-translate-y-1 transition-all duration-500 overflow-hidden group"
                >
                  {/* Product Image Placeholder */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                    <div className="flex flex-col items-center gap-2 group-hover:scale-110 transition-transform duration-500">
                      <IconPalette className="w-10 h-10 text-gray-300" />
                      <span className="text-lg font-bold text-gray-300">
                        {artwork.title.charAt(0)}
                      </span>
                    </div>

                    {/* Hover overlay with text */}
                    {!isSoldOut && (
                      <div className="product-hover-overlay rounded-t-2xl">
                        <span className="text-white text-sm font-semibold bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                          자세히 보기
                        </span>
                      </div>
                    )}

                    {/* Sold out overlay */}
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-gray-900 text-white text-xs rounded-xl px-4 py-1.5 font-semibold">
                          품절
                        </span>
                      </div>
                    )}

                    {/* NEW badge */}
                    {isNew && !isSoldOut && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="text-[10px] font-bold tracking-wider text-white bg-gray-900 px-2 py-0.5 rounded-md shadow-sm">
                          NEW
                        </span>
                      </div>
                    )}

                    {/* Low stock */}
                    {!isSoldOut && !isNew && artwork.stock <= 5 && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[11px] font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-lg">
                          {artwork.stock}개 남음
                        </span>
                      </div>
                    )}

                    {/* Category badge */}
                    {artwork.category && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-600 rounded-lg px-2.5 py-1 text-[11px] font-medium border border-gray-100 shadow-sm">
                          {artwork.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <p className="font-semibold text-gray-900 mb-0.5 truncate text-sm">{artwork.title}</p>
                    <p className="text-xs text-gray-400 mb-3">{artwork.artist_name}</p>

                    <div className="flex items-baseline gap-1.5 mb-4">
                      <span className="font-extrabold text-gray-900 text-base">
                        ₩{(artwork.price_cash ?? 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-300 font-medium">or</span>
                      <span className="text-xs text-gray-400 inline-flex items-center gap-0.5">
                        <IconCoin className="w-3 h-3" />
                        {(artwork.price_points ?? 0).toLocaleString()}P
                      </span>
                    </div>

                    {!isSoldOut ? (
                      <button
                        onClick={() => {
                          if (!user) {
                            alert('로그인이 필요합니다.');
                            return;
                          }
                          setSelectedArtwork(artwork);
                          setPaymentMethod('cash');
                          setPurchaseSuccess(false);
                        }}
                        className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/15 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md flex items-center justify-center gap-2"
                      >
                        <IconShoppingBag className="w-4 h-4" />
                        구매하기
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed border border-gray-100"
                      >
                        품절
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {selectedArtwork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => {
            if (!purchasing) {
              setSelectedArtwork(null);
              setPurchaseSuccess(false);
            }
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {purchaseSuccess ? (
              <div className="text-center py-16 px-6">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5 animate-bounce-check">
                  <IconCheck className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">구매 완료</h3>
                <p className="text-sm text-gray-400">주문이 성공적으로 처리되었습니다</p>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="flex items-start justify-between p-6 pb-0">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-0.5">구매 확인</h3>
                    <p className="text-sm text-gray-400">결제 방법을 선택해주세요</p>
                  </div>
                  <button
                    onClick={() => setSelectedArtwork(null)}
                    className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Product Summary with dot pattern */}
                <div className="mx-6 mt-5 p-4 bg-gray-50 rounded-2xl border border-gray-100 dot-pattern-subtle relative overflow-hidden">
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 bg-white rounded-xl border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                      <IconPalette className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{selectedArtwork.title}</p>
                      <p className="text-sm text-gray-400">{selectedArtwork.artist_name}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Options Label */}
                <div className="mx-6 mt-5 mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">결제 방법</p>
                </div>

                {/* Payment Options */}
                <div className="px-6 flex flex-col gap-3">
                  {/* Cash */}
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 active:scale-[0.98] ${
                      paymentMethod === 'cash'
                        ? 'border-gray-900 bg-gray-50 shadow-sm shadow-gray-900/5'
                        : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${paymentMethod === 'cash' ? 'bg-gray-900 shadow-sm shadow-gray-900/20' : 'bg-gray-100'}`}>
                          <IconWallet className={`w-5 h-5 transition-colors duration-300 ${paymentMethod === 'cash' ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm transition-colors duration-200 ${paymentMethod === 'cash' ? 'text-gray-900' : 'text-gray-700'}`}>일반결제</p>
                          <p className="text-sm text-gray-400 mt-0.5 tabular-nums">
                            ₩{(selectedArtwork.price_cash ?? 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        paymentMethod === 'cash' ? 'border-gray-900 bg-gray-900 animate-spring-scale' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'cash' && (
                          <IconCheck className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Points */}
                  <button
                    onClick={() => setPaymentMethod('points')}
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-300 active:scale-[0.98] ${
                      paymentMethod === 'points'
                        ? 'border-gray-900 bg-gray-50 shadow-sm shadow-gray-900/5'
                        : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50/50 bg-white'
                    }`}
                  >
                    {/* Best value badge */}
                    {isPointsBestValue(selectedArtwork.price_cash, selectedArtwork.price_points) && (
                      <div className="absolute -top-2 left-4">
                        <span className="text-[10px] font-bold text-white bg-gray-900 px-2 py-0.5 rounded-md shadow-sm">
                          추천
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${paymentMethod === 'points' ? 'bg-gray-900 shadow-sm shadow-gray-900/20' : 'bg-gray-100'}`}>
                          <IconCoin className={`w-5 h-5 transition-colors duration-300 ${paymentMethod === 'points' ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm transition-colors duration-200 ${paymentMethod === 'points' ? 'text-gray-900' : 'text-gray-700'}`}>포인트결제</p>
                          <p className="text-sm text-gray-400 mt-0.5 tabular-nums">
                            {(selectedArtwork.price_points ?? 0).toLocaleString()}P
                            {profile && (
                              <span className="ml-2 text-gray-300">
                                (보유: {profile.points.toLocaleString()}P)
                              </span>
                            )}
                          </p>
                          {profile && profile.points < selectedArtwork.price_points && (
                            <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              포인트가 부족합니다.{' '}
                              <Link href="/points" className="underline hover:text-red-500">충전하기</Link>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        paymentMethod === 'points' ? 'border-gray-900 bg-gray-900 animate-spring-scale' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'points' && (
                          <IconCheck className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Actions — separated with stronger visual divider */}
                <div className="px-6 pb-6 mt-6">
                  <div className="border-t border-gray-200 pt-5">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedArtwork(null)}
                        className="w-[35%] py-4 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all duration-300 active:scale-[0.98]"
                      >
                        취소
                      </button>
                      <button
                        onClick={handlePurchase}
                        disabled={
                          purchasing ||
                          (paymentMethod === 'points' && profile !== null && profile.points < selectedArtwork.price_points)
                        }
                        className="flex-1 py-4 rounded-2xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 hover:shadow-xl hover:shadow-gray-900/15 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
                      >
                        {purchasing ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            처리 중...
                          </>
                        ) : (
                          <>
                            <IconShoppingBag className="w-4 h-4" />
                            결제하기
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
