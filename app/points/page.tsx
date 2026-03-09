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
  { amount: 50000, points: 60000, bonus: '10,000P 보너스' },
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

    // Create transaction
    await supabase.from('points_transactions').insert({
      user_id: user.id,
      amount: option.points,
      type: 'earn',
      category: '포인트 충전',
      description: `${option.amount.toLocaleString()}원 충전${option.bonus ? ` (${option.bonus})` : ''}`,
    });

    // Update profile points
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

  // Compute running balance
  const transactionsWithBalance = filteredTransactions.map((t, i) => {
    // Sum all amounts from oldest to current to get balance at each point
    // Since transactions are sorted desc, balance at index i = current points - sum of amounts before i
    let balance = profile?.points || 0;
    for (let j = 0; j < i; j++) {
      balance -= transactions[j].amount;
    }
    return { ...t, balance };
  });

  const filters: FilterType[] = ['전체', '적립', '사용'];

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-5xl mx-auto mb-6">
            💰
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">로그인이 필요해요</h2>
          <p className="text-gray-500 mb-6">
            포인트 내역을 확인하고 충전하려면 먼저 로그인해주세요
          </p>
          <Link
            href="/login"
            className="inline-flex px-8 py-3 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">포인트</h1>
        <p className="text-gray-500">포인트 적립 및 사용 내역을 확인하고 충전하세요</p>
      </div>

      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-3xl gradient-dark text-white p-8 sm:p-10 mb-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gray-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10">
          <p className="text-sm text-gray-400 mb-2 font-medium">보유 포인트</p>
          <p className="text-5xl sm:text-6xl font-bold mb-2 tracking-tight">
            {(profile?.points || 0).toLocaleString()}
            <span className="text-2xl sm:text-3xl text-gray-400 ml-1">P</span>
          </p>
          <p className="text-gray-400 text-sm mb-8">
            {profile?.nickname || '회원'}님의 포인트 잔액입니다
          </p>

          <button
            onClick={() => setShowChargeSection(!showChargeSection)}
            className="px-7 py-3 rounded-full bg-white text-gray-800 font-semibold text-sm hover:bg-gray-100 transition-all hover:shadow-lg"
          >
            {showChargeSection ? '충전 닫기' : '포인트 충전하기'}
          </button>
        </div>
      </div>

      {/* Charge Section */}
      {showChargeSection && (
        <div className="mb-8 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 animate-fade-in-up shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">포인트 충전</h2>
          <p className="text-sm text-gray-500 mb-6">충전할 금액을 선택하세요</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {chargeOptions.map((option, index) => (
              <button
                key={option.amount}
                onClick={() => setSelectedCharge(index)}
                className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                  selectedCharge === index
                    ? 'border-gray-500 bg-gray-100 shadow-md shadow-gray-300'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                {option.bonus && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold rounded-full whitespace-nowrap shadow-sm">
                    BEST
                  </span>
                )}
                <p className="text-lg font-bold text-gray-900 mb-1">
                  {option.amount.toLocaleString()}원
                </p>
                <p className={`text-sm font-semibold ${option.bonus ? 'text-ples-silver' : 'text-gray-500'}`}>
                  {option.points.toLocaleString()}P
                </p>
                {option.bonus && (
                  <p className="text-xs text-amber-600 font-medium mt-1">{option.bonus}</p>
                )}
              </button>
            ))}
          </div>

          {selectedCharge !== null && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">결제 금액</span>
                <p className="text-xl font-bold text-gray-900">
                  {chargeOptions[selectedCharge].amount.toLocaleString()}원
                </p>
              </div>
              <div className="text-center">
                <svg className="w-6 h-6 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-600">충전 포인트</span>
                <p className="text-xl font-bold text-ples-silver">
                  {chargeOptions[selectedCharge].points.toLocaleString()}P
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleCharge}
            disabled={selectedCharge === null || isCharging}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
              selectedCharge !== null && !isCharging
                ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:opacity-90 shadow-lg shadow-gray-400/30'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
          <div className="px-6 py-3 bg-green-500 text-white rounded-full font-semibold shadow-xl flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            포인트가 충전되었습니다!
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              filter === f
                ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-lg shadow-gray-400/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* History */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-6 py-4 border-t border-gray-50 first:border-0 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-2">날짜</div>
            <div className="col-span-2">구분</div>
            <div className="col-span-4">내용</div>
            <div className="col-span-2 text-right">포인트</div>
            <div className="col-span-2 text-right">잔액</div>
          </div>

          {transactionsWithBalance.length === 0 ? (
            <div className="py-16 text-center">
              <span className="text-4xl block mb-3">📋</span>
              <p className="text-gray-500">내역이 없습니다</p>
            </div>
          ) : (
            transactionsWithBalance.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 px-6 py-4 border-t border-gray-50 hover:bg-gray-100/30 transition-colors"
              >
                <div className="sm:col-span-2 text-sm text-gray-400">
                  {new Date(item.created_at).toLocaleDateString('ko-KR')}
                </div>
                <div className="sm:col-span-2">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      item.type === 'earn'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-red-50 text-red-500'
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
                    item.amount > 0 ? 'text-ples-silver' : 'text-red-500'
                  }`}
                >
                  {item.amount > 0 ? '+' : ''}
                  {item.amount.toLocaleString()}P
                </div>
                <div className="sm:col-span-2 text-sm text-gray-500 text-right font-medium">
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
