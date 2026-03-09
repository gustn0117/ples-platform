'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { initStore, getArtworks, getUserPoints, purchaseArtwork, getPointHistory } from '@/lib/store';
import Link from 'next/link';
import { IconShoppingBag, IconCoin, IconWallet, IconCheck, IconPalette } from '@/components/icons';
import type { Artwork } from '@/lib/mock-data';
import { ArtworkIcon } from '@/lib/icons';

const CATEGORIES = ['전체', '앨범', '포스터', '포토카드', '머천다이즈', '디지털'] as const;
type Category = typeof CATEGORIES[number];

export default function ArtworksPage() {
  const { user } = useAuth();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'points'>('cash');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    initStore();
    setArtworks(getArtworks());
    setUserPoints(getUserPoints());
    setLoading(false);
  }, []);

  function refreshData() {
    setArtworks(getArtworks());
    setUserPoints(getUserPoints());
  }

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

  function handleClickPurchase(artwork: Artwork) {
    if (!user) {
      alert('로그인이 필요합니다. 로그인 후 이용해주세요.');
      return;
    }
    setSelectedArtwork(artwork);
    setPaymentMethod('cash');
    setPurchaseSuccess(false);
  }

  function handleConfirmPurchase() {
    if (!selectedArtwork) return;
    setPurchasing(true);

    const result = purchaseArtwork(selectedArtwork.id, paymentMethod);

    if (!result.success) {
      alert(result.error || '구매에 실패했습니다.');
      setPurchasing(false);
      return;
    }

    setPurchaseSuccess(true);
    refreshData();

    setTimeout(() => {
      setPurchaseSuccess(false);
      setSelectedArtwork(null);
      setPurchasing(false);
    }, 2000);
  }

  function closeModal() {
    if (!purchasing) {
      setSelectedArtwork(null);
      setPurchaseSuccess(false);
    }
  }

  const discount = selectedArtwork
    ? selectedArtwork.price - selectedArtwork.pointPrice
    : 0;

  const insufficientPoints = selectedArtwork
    ? userPoints < selectedArtwork.pointPrice
    : false;

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
              <span className="text-xs text-gray-500">보유 포인트</span>
              <span className="text-sm font-bold text-gray-900 tabular-nums">
                {userPoints.toLocaleString()}P
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
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-full transition-all duration-200 ${
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
                  <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                    <span className="group-hover:scale-110 transition-transform duration-500 text-gray-400">
                      <ArtworkIcon category={artwork.category} className="w-12 h-12" />
                    </span>

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
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <p className="font-semibold text-gray-900 text-sm truncate mb-0.5">{artwork.title}</p>
                    <p className="text-xs text-gray-500 mb-3">{artwork.artist}</p>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="font-extrabold text-gray-900 text-base tabular-nums">
                        {artwork.price.toLocaleString()}원
                      </span>
                      <span className="text-[11px] text-gray-300">|</span>
                      <span className="text-xs text-yellow-600 font-medium tabular-nums inline-flex items-center gap-0.5">
                        <IconCoin className="w-3 h-3" />
                        {artwork.pointPrice.toLocaleString()}P
                      </span>
                    </div>

                    {!isSoldOut ? (
                      <button
                        onClick={() => handleClickPurchase(artwork)}
                        className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <IconShoppingBag className="w-4 h-4" />
                        구매하기
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed border border-gray-200"
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

      {/* Detail/Purchase Modal */}
      {selectedArtwork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl shadow-gray-300/50 border border-gray-200 overflow-hidden"
            style={{ animation: 'modalIn 0.25s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {purchaseSuccess ? (
              /* Success State */
              <div className="text-center py-16 px-6">
                <div
                  className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5"
                  style={{ animation: 'bounceIn 0.5s ease-out' }}
                >
                  <IconCheck className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">구매 완료!</h3>
                <p className="text-sm text-gray-500">주문이 성공적으로 처리되었습니다</p>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="flex items-start justify-between p-5 pb-0">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">구매 확인</h3>
                    <p className="text-sm text-gray-500 mt-0.5">결제 방법을 선택해주세요</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Product Summary */}
                <div className="mx-5 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center shrink-0 text-gray-400">
                      <ArtworkIcon category={selectedArtwork.category} className="w-7 h-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">{selectedArtwork.title}</p>
                      <p className="text-sm text-gray-500">{selectedArtwork.artist}</p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{selectedArtwork.description}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Label */}
                <div className="mx-5 mt-5 mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">결제 방법</p>
                </div>

                {/* Payment Options */}
                <div className="px-5 flex flex-col gap-3">
                  {/* Cash Payment */}
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      paymentMethod === 'cash'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            paymentMethod === 'cash' ? 'bg-gray-900' : 'bg-gray-100'
                          }`}
                        >
                          <IconWallet
                            className={`w-5 h-5 ${paymentMethod === 'cash' ? 'text-white' : 'text-gray-400'}`}
                          />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${paymentMethod === 'cash' ? 'text-gray-900' : 'text-gray-500'}`}>
                            일반결제
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5 tabular-nums">
                            {selectedArtwork.price.toLocaleString()}원
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          paymentMethod === 'cash' ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                        }`}
                      >
                        {paymentMethod === 'cash' && <IconCheck className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </button>

                  {/* Points Payment */}
                  <button
                    onClick={() => setPaymentMethod('points')}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      paymentMethod === 'points'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {/* Discount badge */}
                    {discount > 0 && (
                      <div className="absolute -top-2.5 left-4">
                        <span className="text-[10px] font-bold text-gray-900 bg-yellow-400 px-2 py-0.5 rounded-md shadow-lg shadow-yellow-400/20">
                          {discount.toLocaleString()}원 할인
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            paymentMethod === 'points' ? 'bg-yellow-500' : 'bg-gray-100'
                          }`}
                        >
                          <IconCoin
                            className={`w-5 h-5 ${paymentMethod === 'points' ? 'text-white' : 'text-gray-400'}`}
                          />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${paymentMethod === 'points' ? 'text-gray-900' : 'text-gray-500'}`}>
                            포인트결제
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm text-yellow-600 tabular-nums font-medium">
                              {selectedArtwork.pointPrice.toLocaleString()}P
                            </span>
                            {discount > 0 && (
                              <span className="text-xs text-gray-400 line-through tabular-nums">
                                {selectedArtwork.price.toLocaleString()}원
                              </span>
                            )}
                          </div>
                          {/* Current balance */}
                          {user && (
                            <p className="text-xs text-gray-500 mt-1 tabular-nums">
                              보유: {userPoints.toLocaleString()}P
                            </p>
                          )}
                          {/* Insufficient warning */}
                          {user && insufficientPoints && (
                            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              포인트가 부족합니다.{' '}
                              <Link href="/points" className="underline hover:text-red-400 font-medium">
                                충전하기
                              </Link>
                            </p>
                          )}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          paymentMethod === 'points' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'
                        }`}
                      >
                        {paymentMethod === 'points' && <IconCheck className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="px-5 pb-5 mt-5">
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex gap-3">
                      <button
                        onClick={closeModal}
                        className="w-[35%] py-3.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 active:scale-[0.98]"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleConfirmPurchase}
                        disabled={
                          purchasing ||
                          (paymentMethod === 'points' && insufficientPoints)
                        }
                        className="flex-1 py-3.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
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

      {/* Modal Animation Styles */}
      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.1);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
