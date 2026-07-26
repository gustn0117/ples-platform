'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { initStore, getArtworks, getUserStars, purchaseArtwork } from '@/lib/store';
import type { Artwork } from '@/lib/mock-data';
import { ArtworkIcon } from '@/lib/icons';
import { IconShoppingBag, IconWallet, IconCoin, IconCheck } from '@/components/icons';
import { generateOrderId } from '@/lib/toss';

export default function ArtworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  // Reflect admin's payment choices verbatim.
  const cashEnabled = !!artwork?.allowedPayments?.includes('cash');
  const starsEnabled = !!artwork?.allowedPayments?.includes('stars');
  const anyEnabled = cashEnabled || starsEnabled;
  // Default selection: whatever is available; if both, prefer cash.
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'stars'>('cash');
  useEffect(() => {
    if (!artwork) return;
    if (cashEnabled) setPaymentMethod('cash');
    else if (starsEnabled) setPaymentMethod('stars');
  }, [artwork, cashEnabled, starsEnabled]);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [userStars, setUserStars] = useState(0);

  const artworkId = Number(params.id);

  useEffect(() => {
    initStore();
    const found = getArtworks().find((a) => a.id === artworkId);
    setArtwork(found ?? null);
    setUserStars(getUserStars());
    setLoading(false);
  }, [artworkId]);

  async function handlePurchase() {
    if (!artwork) return;

    if (paymentMethod === 'stars') {
      if (!user) {
        alert('스타 결제는 로그인이 필요합니다.');
        router.push('/login');
        return;
      }
      if (userStars < artwork.pointPrice) {
        alert('스타가 부족합니다.');
        return;
      }
      setPurchasing(true);
      const result = purchaseArtwork(artwork.id, 'stars');
      if (!result.success) {
        alert(result.error || '구매에 실패했습니다.');
        setPurchasing(false);
        return;
      }
      setPurchaseSuccess(true);
      setUserStars(getUserStars());
      setTimeout(() => setPurchasing(false), 1500);
      return;
    }

    // Cash payment via Toss
    if (!user) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail.trim())) {
        alert('비회원 결제를 위해 유효한 이메일을 입력해주세요.');
        return;
      }
    }

    setPurchasing(true);

    try {
      const orderId = generateOrderId('ART');
      const userEmail = user?.email || guestEmail.trim();
      const userId = user?.id || `guest_${Date.now()}`;
      const res = await fetch('/api/payment/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          userEmail,
          userId,
          orderType: 'artwork',
          itemId: artwork.id,
          itemName: artwork.title,
          amount: artwork.price,
          metadata: { artist: artwork.artist, category: artwork.category, guest: !user },
        }),
      });

      if (!res.ok) {
        alert('주문 생성에 실패했습니다.');
        setPurchasing(false);
        return;
      }

      const params = new URLSearchParams({
        orderId,
        orderName: artwork.title,
        amount: artwork.price.toString(),
        orderType: 'artwork',
        email: userEmail,
        customerName: user?.email || '게스트',
      });
      router.push(`/checkout?${params.toString()}`);
    } catch {
      alert('결제 요청 중 오류가 발생했습니다.');
      setPurchasing(false);
    }
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

  // 품절은 관리자가 명시적으로 soldOut 체크한 경우에만 적용.
  // stock 0은 "재고 미지정"으로 해석 (자동 품절 X). 재고 제한이 필요한 상품만 stock > 0으로 설정.
  const isSoldOut = artwork.soldOut === true;
  const lowStock = !isSoldOut && artwork.stock > 0 && artwork.stock < 10;

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

          {/* Media attachment — placed above description so audio player stays visible */}
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

          <p className="text-gray-600 leading-relaxed mb-4 whitespace-pre-line">{artwork.description}</p>

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

          {anyEnabled && (
            <div className="flex items-baseline gap-3 pb-6 border-b border-gray-100">
              {cashEnabled && (
                <span className="text-2xl font-extrabold text-gray-900 tabular-nums">
                  {artwork.price.toLocaleString()}원
                </span>
              )}
              {cashEnabled && starsEnabled && <span className="text-gray-300">|</span>}
              {starsEnabled && (
                <span className="text-base text-yellow-600 font-medium tabular-nums inline-flex items-center gap-1">
                  <IconCoin className="w-4 h-4" />
                  {artwork.pointPrice.toLocaleString()}★
                </span>
              )}
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

        {/* No payment method enabled by admin — display-only */}
        {!isSoldOut && !purchaseSuccess && !anyEnabled && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-500">현재 이 작품은 감상 전용입니다</p>
          </div>
        )}

        {/* Purchase Section */}
        {!isSoldOut && !purchaseSuccess && anyEnabled && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">결제 방법</p>

            <div className="flex flex-col gap-3 mb-5">
              {/* Cash option */}
              {cashEnabled && (
                <button
                  type="button"
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
                        <p className={`font-semibold text-sm ${paymentMethod === 'cash' ? 'text-gray-900' : 'text-gray-500'}`}>카드 결제</p>
                        <p className="text-sm text-gray-500 mt-0.5 tabular-nums">{artwork.price.toLocaleString()}원</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'cash' ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
                      {paymentMethod === 'cash' && <IconCheck className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </button>
              )}

              {/* Stars option */}
              {starsEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stars')}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    paymentMethod === 'stars'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${paymentMethod === 'stars' ? 'bg-yellow-500' : 'bg-gray-100'}`}>
                        <IconCoin className={`w-5 h-5 ${paymentMethod === 'stars' ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${paymentMethod === 'stars' ? 'text-gray-900' : 'text-gray-500'}`}>스타 결제</p>
                        <p className="text-sm text-yellow-600 mt-0.5 tabular-nums font-medium">{artwork.pointPrice.toLocaleString()}★</p>
                        {user && userStars < artwork.pointPrice && (
                          <p className="text-xs text-red-500 mt-1">보유 스타 부족 (현재 {userStars.toLocaleString()}★)</p>
                        )}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'stars' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'}`}>
                      {paymentMethod === 'stars' && <IconCheck className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* Guest email input (only for cash) */}
            {paymentMethod === 'cash' && !user && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  비회원 결제 · 이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="주문 내역을 받을 이메일을 입력하세요"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                />
                <p className="text-[11px] text-gray-400 mt-1.5">
                  <Link href="/login" className="underline hover:text-gray-600">로그인</Link> 시 더 빠르게 결제할 수 있습니다.
                </p>
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={purchasing || (paymentMethod === 'stars' && !!user && userStars < artwork.pointPrice)}
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

        {/* Shipping & Refund info — only for purchasable artworks */}
        {anyEnabled && (
          <div className="mt-6 bg-gray-50 rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">배송 및 환불 안내</h3>
            <ul className="text-xs text-gray-500 space-y-1.5 leading-relaxed">
              <li>• 배송: 결제 확인 후 3~7 영업일 이내 발송</li>
              <li>• 배송비: 단순 변심 시 고객 부담 / 상품 하자 시 회사 부담</li>
              <li>• 환불: 상품 수령일로부터 7일 이내 요청 가능</li>
              <li>• 디지털 콘텐츠는 이용 전 전액 환불 가능</li>
            </ul>
            <Link
              href="/refund"
              className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-gray-900 hover:text-gray-700"
            >
              환불 및 교환 정책 전문 보기
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
