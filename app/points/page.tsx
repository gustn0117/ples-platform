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
  if (category.includes('투표') || category.includes('투표')) return <IconVote className="w-4 h-4 text-gray-600" />;
  if (category.includes('영상') || category.includes('시청')) return <IconPlay className="w-4 h-4 text-gray-600" />;
  if (category.includes('구매') || category.includes('작품')) return <IconShoppingBag className="w-4 h-4 text-gray-600" />;
  if (category.includes('충전')) return <IconCoin className="w-4 h-4 text-gray-600" />;
  return <IconCoin className="w-4 h-4 text-gray-600" />;
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
    <div className="max-w-4xl mx-auto">
      {/* Decorative Header */}
      <div className="relative bg-gray-50/50 border-b border-gray-100 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="relative max-w-4xl mx-auto py-16 pb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg">
              <IconWallet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">포인트</h1>
          </div>
          <p className="text-gray-400 ml-[60px]">포인트 적립 및 사용 내역을 확인하고 충전하세요</p>
        </div>
      </div>

      <div className="px-4 sm:px-6">
        {/* Balance Card - dark gradient with mesh */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 mb-8 mt-8 overflow-hidden">
          <div className="absolute inset-0 mesh-gradient-dark" />
          <div className="noise-overlay" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 w-12 h-12 rounded-xl bg-white/20 blur-lg" />
              <div className="relative w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                <IconCoin className="w-6 h-6 text-white/80" />
              </div>
            </div>
            <div>
              <p className="text-sm text-white/60 font-medium mb-1">보유 포인트</p>
              <p className="text-5xl font-bold text-white tracking-tight mb-4">
                {(profile?.points || 0).toLocaleString()}
                <span className="text-lg text-white/40 ml-1 font-medium">P</span>
              </p>
              <button
                onClick={() => setShowChargeSection(!showChargeSection)}
                className="px-5 py-2.5 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 hover:shadow-lg transition-all duration-300"
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
                  className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-center hover:-translate-y-1 hover:shadow-md ${
                    selectedCharge === index
                      ? 'border-gray-900 bg-gray-50 scale-[1.02] shadow-lg'
                      : 'border-gray-100 hover:border-gray-300 bg-white'
                  }`}
                >
                  <p className="text-lg font-bold text-gray-900 mb-1">
                    {option.amount.toLocaleString()}원
                  </p>
                  <p className="text-sm text-gray-500">
                    {option.points.toLocaleString()}P
                  </p>
                  {option.bonus && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-gray-900 to-gray-700 text-white text-[11px] font-bold rounded-full whitespace-nowrap shadow-md animate-pulse-glow">
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
          {/* Filter Tabs - pill segment style */}
          <div className="inline-flex bg-gray-50 rounded-xl p-1.5 gap-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                  filter === f
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
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
                  className={`flex items-center gap-3 px-6 py-4 border-t first:border-0 transition-all duration-200 hover:bg-gray-50/80 group border-l-[3px] ${
                    item.type === 'earn'
                      ? 'border-l-emerald-400 border-t-gray-50'
                      : 'border-l-red-400 border-t-gray-50'
                  }`}
                >
                  {/* Category Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    item.type === 'earn' ? 'bg-emerald-50 group-hover:bg-emerald-100' : 'bg-red-50 group-hover:bg-red-100'
                  }`}>
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
                        item.type === 'earn' ? 'text-emerald-600' : 'text-red-500'
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
    </div>
  );
}
