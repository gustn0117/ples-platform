'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { initStore, getArtworks, getUserStars, purchaseArtwork } from '@/lib/store';
import type { Artwork } from '@/lib/mock-data';
import { ArtworkIcon } from '@/lib/icons';
import { IconShoppingBag, IconCoin, IconWallet, IconCheck } from '@/components/icons';
import { generateOrderId } from '@/lib/toss';

export default function ArtworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'stars'>('cash');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [userStars, setUserStars] = useState(0);

  const artworkId = Number(params.id);

  useEffect(() => {
    initStore();
    const found = getArtworks().find((a) => a.id === artworkId);
    setArtwork(found ?? null);
    setUserStars(getUserStars());
    setLoading(false);
  }, [artworkId]);

  function refreshData() {
    const found = getArtworks().find((a) => a.id === artworkId);
    setArtwork(found ?? null);
    setUserStars(getUserStars());
  }

  async function handlePurchase() {
    if (!user) {
      alert('로그인이 필요합니다. 로그인 후 이용해주세요.');
      return;
    }
    if (!artwork) return;
    setPurchasing(true);

    if (paymentMethod === 'cash') {
      // Real Toss Payments flow
      try {
        const orderId = generateOrderId('ART');
        // Create pending order in DB
        const res = await fetch('/api/payment/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            userEmail: user.email,
            userId: user.id,
            orderType: 'artwork',
            itemId: artwork.id,
            itemName: artwork.title,
            amount: artwork.price,
            metadata: { artist: artwork.artist, category: artwork.category },
          }),
        });

        if (!res.ok) {
          alert('주문 생성에 실패했습니다.');
          setPurchasing(false);
          return;
        }

        // Redirect to checkout page
        const params = new URLSearchParams({
          orderId,
          orderName: artwork.title,
          amount: artwork.price.toString(),
          orderType: 'artwork',
          email: user.email,
        });
        router.push(`/checkout?${params.toString()}`);
      } catch {
        alert('결제 요청 중 오류가 발생했습니다.');
        setPurchasing(false);
      }
      return;
    }

    // Stars payment (existing local flow)
    const result = purchaseArtwork(artwork.id, 'stars');
    if (!result.success) {
      alert(result.error || '구매에 실패했습니다.');
      setPurchasing(false);
      return;
    }

    setPurchaseSuccess(true);
    refreshData();
    setTimeout(() => {
      setPurchaseSuccess(false);
      setPurchasing(false);
    }, 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mb-8" />
          <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse mb-6" />
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-3" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">작품을 찾을 수 없습니다</p>
          <Link
            href="/artworks"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            갤러리로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const isSoldOut = artwork.soldOut || artwork.stock <= 0;
  const lowStock = !isSoldOut && artwork.stock > 0 && artwork.stock < 10;
  const discount = artwork.price - artwork.pointPrice;
  const insufficientStars = userStars < artwork.pointPrice;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8"
        >
          <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          갤러리
        </button>

        {/* Image Area */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-8 overflow-hidden">
          {artwork.imageData ? (
            <img src={artwork.imageData} alt={artwork.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <ArtworkIcon category={artwork.category} className="w-24 h-24 text-gray-400" />
          )}

          {isSoldOut && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-red-500/90 text-white text-sm font-bold rounded-lg px-6 py-2 tracking-wide">
                품절
              </span>
            </div>
          )}

          {artwork.isNew && !isSoldOut && (
            <div className="absolute top-4 left-4">
              <span className="text-xs font-bold tracking-wider text-gray-900 bg-yellow-400 px-3 py-1.5 rounded-lg shadow-lg shadow-yellow-400/30">
                NEW
              </span>
            </div>
          )}

          {lowStock && (
            <div className="absolute top-4 right-4">
              <span className="text-sm font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-lg">
                {artwork.stock}개 남음
              </span>
            </div>
          )}

          <div className="absolute bottom-4 left-4">
            <span className="bg-white/80 backdrop-blur-md text-gray-600 rounded-lg px-3 py-1.5 text-sm font-medium border border-gray-200">
              {artwork.category}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{artwork.title}</h1>
          <p className="text-gray-500 mb-4">{artwork.artist}</p>
          <p className="text-gray-600 leading-relaxed mb-4 whitespace-pre-line">{artwork.description}</p>

          {/* Media attachment */}
          {artwork.mediaData && artwork.mediaType === 'audio' && (
            <div className="mb-4">
              <audio controls className="w-full" src={artwork.mediaData} />
            </div>
          )}
          {artwork.mediaData && artwork.mediaType === 'image' && (
            <div className="mb-4 rounded-xl overflow-hidden border border-gray-200">
              <img src={artwork.mediaData} alt="첨부 이미지" className="w-full" />
            </div>
          )}

          {/* External link */}
          {artwork.link && (
            <a
              href={artwork.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100 mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              외부 링크 열기
            </a>
          )}

          <div className="flex items-baseline gap-3 pb-6 border-b border-gray-100">
            <span className="text-2xl font-extrabold text-gray-900 tabular-nums">
              {artwork.price.toLocaleString()}원
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-base text-yellow-600 font-medium tabular-nums inline-flex items-center gap-1">
              <IconCoin className="w-4 h-4" />
              {artwork.pointPrice.toLocaleString()}★
            </span>
          </div>

          {user && (
            <div className="flex items-center gap-2 mt-4 mb-2">
              <IconCoin className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-500">보유 스타</span>
              <span className="text-sm font-bold text-gray-900 tabular-nums">
                {userStars.toLocaleString()}★
              </span>
            </div>
          )}
        </div>

        {/* Purchase Success */}
        {purchaseSuccess && (
          <div className="bg-white rounded-2xl border border-emerald-200 p-8 mb-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <IconCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">구매 완료!</h3>
            <p className="text-sm text-gray-500">주문이 성공적으로 처리되었습니다</p>
          </div>
        )}

        {/* Purchase Section */}
        {!isSoldOut && !purchaseSuccess && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">결제 방법</p>

            <div className="flex flex-col gap-3 mb-5">
              {/* Cash */}
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
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${paymentMethod === 'cash' ? 'bg-gray-900' : 'bg-gray-100'}`}>
                      <IconWallet className={`w-5 h-5 ${paymentMethod === 'cash' ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${paymentMethod === 'cash' ? 'text-gray-900' : 'text-gray-500'}`}>일반결제</p>
                      <p className="text-sm text-gray-500 mt-0.5 tabular-nums">{artwork.price.toLocaleString()}원</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'cash' ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
                    {paymentMethod === 'cash' && <IconCheck className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </button>

              {/* Stars */}
              <button
                onClick={() => setPaymentMethod('stars')}
                className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  paymentMethod === 'stars'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {discount > 0 && (
                  <div className="absolute -top-2.5 left-4">
                    <span className="text-[10px] font-bold text-gray-900 bg-yellow-400 px-2 py-0.5 rounded-md shadow-lg shadow-yellow-400/20">
                      {discount.toLocaleString()}원 할인
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${paymentMethod === 'stars' ? 'bg-yellow-500' : 'bg-gray-100'}`}>
                      <IconCoin className={`w-5 h-5 ${paymentMethod === 'stars' ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${paymentMethod === 'stars' ? 'text-gray-900' : 'text-gray-500'}`}>스타결제</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm text-yellow-600 tabular-nums font-medium">{artwork.pointPrice.toLocaleString()}★</span>
                        {discount > 0 && (
                          <span className="text-xs text-gray-400 line-through tabular-nums">{artwork.price.toLocaleString()}원</span>
                        )}
                      </div>
                      {user && insufficientStars && (
                        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          스타가 부족합니다.{' '}
                          <Link href="/points" className="underline hover:text-red-400 font-medium">충전하기</Link>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'stars' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'}`}>
                    {paymentMethod === 'stars' && <IconCheck className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={handlePurchase}
              disabled={purchasing || (paymentMethod === 'stars' && insufficientStars)}
              className="w-full py-4 rounded-xl bg-gray-900 text-white text-base font-bold hover:bg-gray-800 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
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
        )}

        {isSoldOut && !purchaseSuccess && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <p className="text-gray-400 font-medium">이 작품은 품절되었습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
