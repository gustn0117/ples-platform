'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { IconShoppingBag, IconPalette, IconCoin, IconWallet, IconCheck } from '@/components/icons';

interface Artwork {
  id: string;
  title: string;
  description: string;
  emoji: string;
  artist: string;
  category: string;
  price: number;
  point_price: number;
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
        if (profile.points < selectedArtwork.point_price) {
          alert('포인트가 부족합니다.');
          return;
        }

        await supabase
          .from('profiles')
          .update({ points: profile.points - selectedArtwork.point_price })
          .eq('id', user.id);

        await supabase.from('points_transactions').insert({
          user_id: user.id,
          amount: -selectedArtwork.point_price,
          type: 'spend',
          description: `작품 구매: ${selectedArtwork.title}`,
        });
      }

      await supabase.from('purchases').insert({
        user_id: user.id,
        artwork_id: selectedArtwork.id,
        payment_method: paymentMethod,
        amount: paymentMethod === 'cash' ? selectedArtwork.price : selectedArtwork.point_price,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <div className="skeleton-heading w-32 mb-3" />
            <div className="skeleton-text w-72" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-5 w-16 shrink-0 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center gap-3 mb-2">
            <IconShoppingBag className="w-8 h-8 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">마켓</h1>
          </div>
          <p className="text-gray-400">한정판 아트워크와 굿즈를 구매하세요</p>
          {profile && (
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full">
              <IconCoin className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">보유 포인트</span>
              <span className="text-sm font-semibold text-gray-900">
                {profile.points.toLocaleString()}P
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Category Filter */}
        <div className="flex gap-6 mb-8 overflow-x-auto pb-px border-b border-gray-100 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                selectedCategory === cat.key
                  ? 'text-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {cat.label}
              {selectedCategory === cat.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredArtworks.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <IconShoppingBag className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-400">해당 카테고리에 상품이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredArtworks.map((artwork) => {
              const isSoldOut = artwork.stock <= 0;

              return (
                <div
                  key={artwork.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                >
                  {/* Product Image Placeholder */}
                  <div className="relative aspect-[4/3] bg-gray-50 rounded-t-xl flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 group-hover:scale-110 transition-transform duration-300">
                      <IconPalette className="w-10 h-10 text-gray-300" />
                      <span className="text-lg font-bold text-gray-300">
                        {artwork.title.charAt(0)}
                      </span>
                    </div>

                    {/* Sold out overlay */}
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <span className="bg-gray-900 text-white text-xs rounded-full px-3 py-1 font-medium">
                          품절
                        </span>
                      </div>
                    )}

                    {/* Low stock */}
                    {!isSoldOut && artwork.stock <= 5 && (
                      <div className="absolute top-3 right-3">
                        <span className="text-xs font-medium text-red-500">
                          남은 수량: {artwork.stock}
                        </span>
                      </div>
                    )}

                    {/* Category badge */}
                    {artwork.category && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/80 backdrop-blur-sm text-gray-600 rounded-full px-3 py-1 text-xs border border-gray-100">
                          {artwork.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <p className="font-medium text-gray-900 mb-0.5 truncate">{artwork.title}</p>
                    <p className="text-sm text-gray-400 mb-3">{artwork.artist}</p>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="font-semibold text-gray-900">
                        ₩{artwork.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400 inline-flex items-center gap-0.5">
                        <IconCoin className="w-3.5 h-3.5" />
                        {artwork.point_price.toLocaleString()}P
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
                        className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        구매하기
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
          onClick={() => {
            if (!purchasing) {
              setSelectedArtwork(null);
              setPurchaseSuccess(false);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {purchaseSuccess ? (
              <div className="text-center py-12 px-6">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <IconCheck className="w-6 h-6 text-emerald-600" />
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
                    className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Product Summary */}
                <div className="mx-6 mt-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-xl border border-gray-100 flex items-center justify-center shrink-0">
                      <IconPalette className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{selectedArtwork.title}</p>
                      <p className="text-sm text-gray-400">{selectedArtwork.artist}</p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-6 mt-5 border-t border-gray-100" />

                {/* Payment Options */}
                <div className="p-6 flex flex-col gap-3">
                  {/* Cash */}
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                          <IconWallet className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">일반결제</p>
                          <p className="text-sm text-gray-400 mt-0.5">
                            ₩{selectedArtwork.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        paymentMethod === 'cash' ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'cash' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Points */}
                  <button
                    onClick={() => setPaymentMethod('points')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      paymentMethod === 'points'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                          <IconCoin className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">포인트결제</p>
                          <p className="text-sm text-gray-400 mt-0.5">
                            {selectedArtwork.point_price.toLocaleString()}P
                            {profile && (
                              <span className="ml-2 text-gray-300">
                                (보유: {profile.points.toLocaleString()}P)
                              </span>
                            )}
                          </p>
                          {profile && profile.points < selectedArtwork.point_price && (
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
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        paymentMethod === 'points' ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'points' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                  <button
                    onClick={() => setSelectedArtwork(null)}
                    className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handlePurchase}
                    disabled={
                      purchasing ||
                      (paymentMethod === 'points' && profile !== null && profile.points < selectedArtwork.point_price)
                    }
                    className="flex-1 py-3.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      '결제하기'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
