'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

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
  const [animatedCards, setAnimatedCards] = useState(false);

  useEffect(() => {
    fetchArtworks();
  }, []);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setAnimatedCards(true), 100);
    }
  }, [loading]);

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
      // Check stock
      if (selectedArtwork.stock <= 0) {
        alert('품절된 상품입니다.');
        return;
      }

      if (paymentMethod === 'points') {
        // Check balance
        if (profile.points < selectedArtwork.point_price) {
          alert('포인트가 부족합니다.');
          return;
        }

        // Deduct points
        await supabase
          .from('profiles')
          .update({ points: profile.points - selectedArtwork.point_price })
          .eq('id', user.id);

        // Create points transaction
        await supabase.from('points_transactions').insert({
          user_id: user.id,
          amount: -selectedArtwork.point_price,
          type: 'spend',
          description: `작품 구매: ${selectedArtwork.title}`,
        });
      }

      // Create purchase record
      await supabase.from('purchases').insert({
        user_id: user.id,
        artwork_id: selectedArtwork.id,
        payment_method: paymentMethod,
        amount: paymentMethod === 'cash' ? selectedArtwork.price : selectedArtwork.point_price,
      });

      // Decrease stock
      await supabase
        .from('artworks')
        .update({ stock: selectedArtwork.stock - 1 })
        .eq('id', selectedArtwork.id);

      // Update local state
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
      <div className="section-container py-12">
        <div className="mb-10">
          <div className="h-8 bg-white/10 rounded-lg w-48 animate-pulse mb-3" />
          <div className="h-5 bg-white/5 rounded-lg w-80 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] bg-white/5 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-white/10 rounded animate-pulse w-1/3" />
                <div className="h-6 bg-white/10 rounded animate-pulse" />
                <div className="h-4 bg-white/5 rounded animate-pulse w-2/3" />
                <div className="h-10 bg-white/5 rounded-xl animate-pulse mt-4" />
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
          <span className="text-3xl">🛍️</span>
          <h1 className="text-3xl font-bold">마켓</h1>
        </div>
        <p className="text-gray-500">한정판 아트워크와 굿즈를 현금 또는 포인트로 구매하세요</p>
        {profile && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 glass rounded-full">
            <span className="text-sm">💰</span>
            <span className="text-sm font-semibold text-ples-purple">
              보유 포인트: {profile.points.toLocaleString()}P
            </span>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-slideUp" style={{ animationDelay: '0.1s' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              setSelectedCategory(cat.key);
              setAnimatedCards(false);
              setTimeout(() => setAnimatedCards(true), 100);
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.key
                ? 'bg-gradient-to-r from-ples-purple to-ples-blue text-white shadow-lg shadow-ples-purple/20'
                : 'glass text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Artworks Grid */}
      {filteredArtworks.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <span className="text-5xl mb-4 block">🎨</span>
          <p className="text-gray-500 text-lg">해당 카테고리에 작품이 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtworks.map((artwork, index) => {
            const isSoldOut = artwork.stock <= 0;

            return (
              <div
                key={artwork.id}
                className={`glass rounded-2xl overflow-hidden card-hover transition-all duration-500 ${
                  animatedCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${Math.min(index * 80, 400)}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-ples-purple/15 via-ples-pink/10 to-ples-gold/10 flex items-center justify-center">
                  <span className="text-6xl">{artwork.emoji || '🎨'}</span>
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-white font-bold text-lg px-5 py-2.5 border-2 border-white/30 rounded-xl backdrop-blur-sm">
                        품절
                      </span>
                    </div>
                  )}
                  {!isSoldOut && artwork.stock <= 5 && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-red-500/80 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                      잔여 {artwork.stock}개
                    </div>
                  )}
                  {artwork.category && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 glass rounded-full text-xs font-medium text-gray-300">
                      {artwork.category}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <p className="text-xs text-ples-purple font-medium mb-1">{artwork.artist}</p>
                  <h3 className="font-bold text-lg mb-1">{artwork.title}</h3>
                  {artwork.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{artwork.description}</p>
                  )}

                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-600">현금결제</p>
                      <p className="text-lg font-bold">
                        {artwork.price.toLocaleString()}
                        <span className="text-sm text-gray-500">원</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-ples-purple/60">포인트결제</p>
                      <p className="text-lg font-bold text-ples-purple">
                        {artwork.point_price.toLocaleString()}
                        <span className="text-sm">P</span>
                      </p>
                    </div>
                  </div>

                  {!isSoldOut && artwork.stock > 5 && (
                    <p className="text-xs text-gray-600 mb-3">재고 {artwork.stock}개 남음</p>
                  )}

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
                      className="btn-primary w-full py-3"
                    >
                      구매하기
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-white/5 text-gray-600 font-semibold text-sm cursor-not-allowed"
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

      {/* Purchase Modal */}
      {selectedArtwork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => {
            if (!purchasing) {
              setSelectedArtwork(null);
              setPurchaseSuccess(false);
            }
          }}
        >
          <div
            className="glass-strong rounded-3xl max-w-md w-full p-6 animate-fadeIn shadow-2xl shadow-ples-purple/10"
            onClick={(e) => e.stopPropagation()}
          >
            {purchaseSuccess ? (
              <div className="text-center py-8 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-ples-green/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-ples-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">구매 완료!</h3>
                <p className="text-gray-400 text-sm">주문이 성공적으로 처리되었습니다</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold mb-1">{selectedArtwork.title}</h3>
                    <p className="text-sm text-gray-500">{selectedArtwork.artist}</p>
                  </div>
                  <button
                    onClick={() => setSelectedArtwork(null)}
                    className="w-8 h-8 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Payment Options */}
                <div className="flex flex-col gap-3 mb-6">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-ples-purple bg-ples-purple/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">현금 결제</p>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {selectedArtwork.price.toLocaleString()}원
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'cash' ? 'border-ples-purple bg-ples-purple' : 'border-gray-600'
                      }`}>
                        {paymentMethod === 'cash' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('points')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      paymentMethod === 'points'
                        ? 'border-ples-purple bg-ples-purple/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">포인트 결제</p>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {selectedArtwork.point_price.toLocaleString()}P
                          {profile && (
                            <span className="text-ples-purple ml-2">
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
                            <Link href="/points" className="underline hover:text-red-300">충전하기</Link>
                          </p>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'points' ? 'border-ples-purple bg-ples-purple' : 'border-gray-600'
                      }`}>
                        {paymentMethod === 'points' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedArtwork(null)}
                    className="btn-ghost flex-1 py-3"
                  >
                    취소
                  </button>
                  <button
                    onClick={handlePurchase}
                    disabled={
                      purchasing ||
                      (paymentMethod === 'points' && profile !== null && profile.points < selectedArtwork.point_price)
                    }
                    className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {purchasing ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
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
