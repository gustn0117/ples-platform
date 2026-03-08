'use client';

import { artists } from '@/lib/mock-data';

export default function RankingPage() {
  const sorted = [...artists].sort((a, b) => b.likes - a.likes);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">아티스트 랭킹</h1>
        <p className="text-gray-500">누적 투자(좋아요) 수 기준 순위입니다</p>
      </div>

      {/* Top 3 */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[sorted[1], sorted[0], sorted[2]].map((artist, visualIdx) => {
          const rank = visualIdx === 0 ? 2 : visualIdx === 1 ? 1 : 3;
          const isFirst = rank === 1;

          return (
            <div
              key={artist.id}
              className={`flex flex-col items-center ${isFirst ? '-mt-4' : 'mt-4'}`}
            >
              <div
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-3 ${
                  isFirst
                    ? 'bg-gradient-to-br from-amber-300 to-amber-500 animate-pulse-glow'
                    : rank === 2
                    ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                    : 'bg-gradient-to-br from-amber-600 to-amber-800'
                }`}
              >
                <span className={`${isFirst ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl'}`}>
                  {artist.image}
                </span>
                <div
                  className={`absolute -top-2 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ${
                    isFirst
                      ? 'bg-amber-500'
                      : rank === 2
                      ? 'bg-gray-400'
                      : 'bg-amber-700'
                  }`}
                >
                  {rank}
                </div>
              </div>
              <h3 className={`font-bold text-gray-900 ${isFirst ? 'text-lg' : 'text-sm'}`}>
                {artist.name}
              </h3>
              <p className="text-xs text-gray-400">{artist.genre}</p>
              <p className={`font-bold mt-1 ${isFirst ? 'text-purple-600' : 'text-gray-600'}`}>
                {artist.likes.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Full list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase">
          <div className="col-span-1">순위</div>
          <div className="col-span-6">아티스트</div>
          <div className="col-span-3">장르</div>
          <div className="col-span-2 text-right">투자 수</div>
        </div>

        {sorted.map((artist, index) => (
          <div
            key={artist.id}
            className={`grid grid-cols-12 gap-4 px-6 py-4 border-t border-gray-50 items-center hover:bg-gray-50/50 transition-colors ${
              index < 3 ? 'bg-purple-50/30' : ''
            }`}
          >
            <div className="col-span-1">
              <span
                className={`text-sm font-bold ${
                  index === 0
                    ? 'text-amber-500'
                    : index === 1
                    ? 'text-gray-400'
                    : index === 2
                    ? 'text-amber-700'
                    : 'text-gray-400'
                }`}
              >
                {index + 1}
              </span>
            </div>
            <div className="col-span-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-lg">
                {artist.image}
              </div>
              <span className="font-medium text-gray-900">{artist.name}</span>
            </div>
            <div className="col-span-3 text-sm text-gray-500">{artist.genre}</div>
            <div className="col-span-2 text-right text-sm font-semibold text-purple-600">
              {artist.likes.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
