'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface PointTransaction {
  id: string;
  amount: number;
  type: 'earn' | 'use';
  category: string;
  description: string;
  created_at: string;
}

const chargeOptions = [
  { amount: 5000, points: 5000, bonus: null },
  { amount: 10000, points: 10000, bonus: null },
  { amount: 30000, points: 30000, bonus: null },
  { amount: 50000, points: 60000, bonus: '60,000P' },
];

type FilterType = '전체' | '적립' | '사용';

export default function PointsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('전체');
  const [selectedCharge, setSelectedCharge] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const [chargeSuccess, setChargeSuccess] = useState(false);
  const [showChargeSection, setShowChargeSection] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleCharge = async () => {
    if (!user || !profile || selectedCharge === null) return;

    const option = chargeOptions[selectedCharge];
    setIsCharging(true);

    await supabase.from('points_transactions').insert({
      user_id: user.id,
      amount: option.points,
      type: 'earn',
      category: '포인트 충전',
      description: `${option.amount.toLocaleString()}원 충전${option.bonus ? ` (보너스 포함)` : ''}`,
    });

    await supabase
      .from('profiles')
      .update({ points: profile.points + option.points })
      .eq('id', user.id);

    await refreshProfile();
    await fetchTransactions();

    setIsCharging(false);
    setChargeSuccess(true);
    setSelectedCharge(null);
    setTimeout(() => setChargeSuccess(false), 3000);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === '적립') return t.type === 'earn';
    if (filter === '사용') return t.type === 'use';
    return true;
  });

  const transactionsWithBalance = filteredTransactions.map((t, i) => {
    let balance = profile?.points || 0;
    for (let j = 0; j < i; j++) {
      balance -= transactions[j].amount;
    }
    return { ...t, balance };
  });

  const filters: FilterType[] = ['전체', '적립', '사용'];

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl mx-auto mb-6">
            💰
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">로그인이 필요해요</h2>
          <p className="text-gray-400 mb-8">
            포인트 내역을 확인하고 충전하려면 먼저 로그인해주세요
          </p>
          <Link
            href="/login"
            className="inline-flex px-8 py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="py-16 pb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">포인트</h1>
        <p className="text-gray-400">포인트 적립 및 사용 내역을 확인하고 충전하세요</p>
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-amber-400 p-8 mb-8">
        <p className="text-sm text-gray-400 font-medium mb-1">보유 포인트</p>
        <p className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
          {(profile?.points || 0).toLocaleString()}
          <span className="text-lg text-gray-400 ml-1 font-medium">P</span>
        </p>
        <button
          onClick={() => setShowChargeSection(!showChargeSection)}
          className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
        >
          {showChargeSection ? '충전 닫기' : '포인트 충전하기'}
        </button>
      </div>

      {/* Charge Section */}
      {showChargeSection && (
        <div className="mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">포인트 충전</h2>
          <p className="text-sm text-gray-400 mb-6">충전할 금액을 선택하세요</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {chargeOptions.map((option, index) => (
              <button
                key={option.amount}
                onClick={() => setSelectedCharge(index)}
                className={`relative p-5 rounded-2xl border-2 transition-all text-center ${
                  selectedCharge === index
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <p className="text-lg font-bold text-gray-900 mb-1">
                  {option.amount.toLocaleString()}원
                </p>
                <p className="text-sm text-gray-500">
                  {option.points.toLocaleString()}P
                </p>
                {option.bonus && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-gray-900 text-white text-[10px] font-bold rounded-full whitespace-nowrap">
                    {option.bonus}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleCharge}
            disabled={selectedCharge === null || isCharging}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
              selectedCharge !== null && !isCharging
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            {isCharging ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                충전 중...
              </span>
            ) : (
              '충전하기'
            )}
          </button>
        </div>
      )}

      {/* Charge success toast */}
      {chargeSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm shadow-xl flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            포인트가 충전되었습니다!
          </div>
        </div>
      )}

      {/* History Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">포인트 내역</h2>
        {/* Filter Tabs - underline style */}
        <div className="flex gap-6 border-b border-gray-100">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
                filter === f
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-6 py-4 border-t border-gray-50 first:border-0 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-32" />
                  <div className="h-3 bg-gray-100 animate-pulse rounded w-24" />
                </div>
                <div className="h-5 bg-gray-100 animate-pulse rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-16">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
            <div className="col-span-2">날짜</div>
            <div className="col-span-2">구분</div>
            <div className="col-span-4">내용</div>
            <div className="col-span-2 text-right">포인트</div>
            <div className="col-span-2 text-right">잔액</div>
          </div>

          {transactionsWithBalance.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl mx-auto mb-3">
                📋
              </div>
              <p className="text-gray-400 text-sm">내역이 없습니다</p>
            </div>
          ) : (
            transactionsWithBalance.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 px-6 py-4 border-t border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <div className="sm:col-span-2 text-sm text-gray-400">
                  {new Date(item.created_at).toLocaleDateString('ko-KR')}
                </div>
                <div className="sm:col-span-2">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                      item.type === 'earn'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-gray-100 text-red-500'
                    }`}
                  >
                    {item.type === 'earn' ? '적립' : '사용'}
                  </span>
                </div>
                <div className="sm:col-span-4">
                  <p className="text-sm text-gray-800 font-medium">{item.description || item.category}</p>
                  <p className="text-xs text-gray-400 sm:hidden mt-0.5">
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div
                  className={`sm:col-span-2 text-sm font-bold text-right ${
                    item.type === 'earn' ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {item.type === 'earn' ? '+' : '-'}
                  {Math.abs(item.amount).toLocaleString()}P
                </div>
                <div className="sm:col-span-2 text-sm text-gray-400 text-right font-medium">
                  {item.balance.toLocaleString()}P
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
