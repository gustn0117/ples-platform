'use client';

import { useState } from 'react';
import { artworks } from '@/lib/mock-data';

export default function ArtworksPage() {
  const [selectedArtwork, setSelectedArtwork] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'points'>('cash');

  const userPoints = 1260;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">작품 구매</h1>
        <p className="text-gray-500">한정판 아트워크와 굿즈를 만나보세요</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((artwork) => (
          <div
            key={artwork.id}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
              <span className="text-6xl">{artwork.image}</span>
              {artwork.soldOut && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg px-4 py-2 border-2 border-white rounded-lg">
                    SOLD OUT
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-5">
              <p className="text-xs text-purple-500 font-medium mb-1">{artwork.artist}</p>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{artwork.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{artwork.description}</p>

              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400">현금결제</p>
                  <p className="text-lg font-bold text-gray-900">
                    {artwork.price.toLocaleString()}원
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-purple-400">포인트결제</p>
                  <p className="text-lg font-bold text-purple-600">
                    {artwork.pointPrice.toLocaleString()}P
                  </p>
                </div>
              </div>

              {!artwork.soldOut ? (
                <button
                  onClick={() => setSelectedArtwork(artwork.id)}
                  className="w-full py-3 rounded-xl gradient-purple text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  구매하기
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-semibold text-sm cursor-not-allowed"
                >
                  품절
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Purchase Modal */}
      {selectedArtwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fade-in-up">
            {(() => {
              const artwork = artworks.find((a) => a.id === selectedArtwork)!;
              return (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{artwork.title}</h3>
                  <p className="text-sm text-gray-500 mb-6">{artwork.artist}</p>

                  <div className="flex flex-col gap-3 mb-6">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === 'cash'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-100'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">일반 결제</p>
                      <p className="text-sm text-gray-500">
                        {artwork.price.toLocaleString()}원
                      </p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('points')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === 'points'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-100'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">포인트 결제</p>
                      <p className="text-sm text-gray-500">
                        {artwork.pointPrice.toLocaleString()}P
                        <span className="text-purple-500 ml-2">
                          (보유: {userPoints.toLocaleString()}P)
                        </span>
                      </p>
                      {userPoints < artwork.pointPrice && (
                        <p className="text-xs text-red-500 mt-1">
                          포인트가 부족합니다. 충전 후 이용해주세요.
                        </p>
                      )}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedArtwork(null)}
                      className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button className="flex-1 py-3 rounded-xl gradient-purple text-white font-semibold text-sm hover:opacity-90">
                      결제하기
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
