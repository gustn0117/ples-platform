'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { IconWallet, IconCoin, IconGift, IconClock, IconVote, IconPlay, IconShoppingBag, IconCheck } from '@/components/icons';

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

function getCategoryIcon(category: string) {
  if (category.includes('투표') || category.includes('투표')) return <IconVote className="w-4 h-4 text-gray-500" />;
  if (category.includes('영상') || category.includes('시청')) return <IconPlay className="w-4 h-4 text-gray-500" />;
  if (category.includes('구매') || category.includes('작품')) return <IconShoppingBag className="w-4 h-4 text-gray-500" />;
  if (category.includes('충전')) return <IconCoin className="w-4 h-4 text-gray-500" />;
  return <IconCoin className="w-4 h-4 text-gray-500" />;
}

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
          <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-6">
            <IconWallet className="w-10 h-10 text-gray-400" />
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
        <div className="flex items-center gap-3 mb-2">
          <IconWallet className="w-7 h-7 text-gray-900" />
          <h1 className="text-3xl font-bold text-gray-900">포인트</h1>
        </div>
        <p className="text-gray-400">포인트 적립 및 사용 내역을 확인하고 충전하세요</p>
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <IconCoin className="w-6 h-6 text-gray-600" />
          </div>
          <div>
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
        </div>
      </div>

      {/* Charge Section */}
      {showChargeSection && (
        <div className="mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-1">
            <IconGift className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">포인트 충전</h2>
          </div>
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
            <IconCheck className="w-4 h-4" />
            포인트가 충전되었습니다!
          </div>
        </div>
      )}

      {/* History Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <IconClock className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-bold text-gray-900">포인트 내역</h2>
        </div>
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
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 animate-pulse rounded w-32" />
                    <div className="h-3 bg-gray-100 animate-pulse rounded w-24" />
                  </div>
                </div>
                <div className="h-5 bg-gray-100 animate-pulse rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-16">
          {transactionsWithBalance.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <IconClock className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm">내역이 없습니다</p>
            </div>
          ) : (
            transactionsWithBalance.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-6 py-4 border-t border-gray-50 first:border-0 hover:bg-gray-50 transition-colors"
              >
                {/* Category Icon */}
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  {getCategoryIcon(item.category)}
                </div>

                {/* Description */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium truncate">{item.description || item.category}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>

                {/* Amount & Balance */}
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      item.type === 'earn' ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {item.type === 'earn' ? '+' : '-'}
                    {Math.abs(item.amount).toLocaleString()}P
                  </p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    {item.balance.toLocaleString()}P
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
