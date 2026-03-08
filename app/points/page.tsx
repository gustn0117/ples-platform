'use client';

import { pointHistory } from '@/lib/mock-data';

export default function PointsPage() {
  const currentBalance = 1260;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">포인트 내역</h1>
        <p className="text-gray-500">포인트 적립 및 사용 내역을 확인하세요</p>
      </div>

      {/* Balance Card */}
      <div className="gradient-dark text-white rounded-2xl p-6 sm:p-8 mb-8">
        <p className="text-sm text-gray-300 mb-1">보유 포인트</p>
        <p className="text-4xl font-bold mb-6">{currentBalance.toLocaleString()}P</p>
        <button className="px-6 py-2.5 rounded-full bg-white text-purple-700 font-semibold text-sm hover:bg-gray-100 transition-colors">
          포인트 충전하기
        </button>
        <p className="text-xs text-gray-400 mt-3">50,000원 충전 시 60,000P 지급</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['전체', '적립', '사용'].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === '전체'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
          <div className="col-span-2">날짜</div>
          <div className="col-span-2">구분</div>
          <div className="col-span-4">항목</div>
          <div className="col-span-2 text-right">포인트</div>
          <div className="col-span-2 text-right">잔액</div>
        </div>

        {pointHistory.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 px-6 py-4 border-t border-gray-50 hover:bg-gray-50/50 transition-colors"
          >
            <div className="sm:col-span-2 text-sm text-gray-400">{item.date}</div>
            <div className="sm:col-span-2">
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  item.type === 'earn'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-red-50 text-red-500'
                }`}
              >
                {item.type === 'earn' ? '적립' : '사용'}
              </span>
            </div>
            <div className="sm:col-span-4 text-sm text-gray-800 font-medium">{item.category}</div>
            <div
              className={`sm:col-span-2 text-sm font-semibold text-right ${
                item.amount > 0 ? 'text-purple-600' : 'text-red-500'
              }`}
            >
              {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}P
            </div>
            <div className="sm:col-span-2 text-sm text-gray-500 text-right">
              {Math.abs(item.balance).toLocaleString()}P
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
