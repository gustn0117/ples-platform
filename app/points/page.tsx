'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { initStore, getUserPoints, getPointHistory, chargePoints, getChargeRate } from '@/lib/store';
import type { PointHistory } from '@/lib/mock-data';
import {
  IconWallet,
  IconCoin,
  IconGift,
  IconClock,
  IconVote,
  IconPlay,
  IconShoppingBag,
  IconCheck,
  IconArrowRight,
  IconSparkle,
} from '@/components/icons';

type FilterType = '전체' | '적립' | '사용';

const CHARGE_OPTIONS = [5000, 10000, 30000, 50000];

function getCategoryIcon(category: string) {
  if (category.includes('투표')) return <IconVote className="w-4 h-4" />;
  if (category.includes('영상') || category.includes('시청')) return <IconPlay className="w-4 h-4" />;
  if (category.includes('구매') || category.includes('작품')) return <IconShoppingBag className="w-4 h-4" />;
  if (category.includes('충전')) return <IconCoin className="w-4 h-4" />;
  return <IconCoin className="w-4 h-4" />;
}

function getCategoryLabel(category: string): string {
  if (category.includes('투표')) return '투표참여';
  if (category.includes('영상') || category.includes('시청')) return '영상시청';
  if (category.includes('충전')) return '포인트충전';
  if (category.includes('구매') || category.includes('작품')) return '작품구매';
  return category.split(' - ')[0] || category;
}

/* Animated counter */
function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const diff = value - start;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValue.current = value;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

export default function PointsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [filter, setFilter] = useState<FilterType>('전체');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const [chargeSuccess, setChargeSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  // Init store and load data
  useEffect(() => {
    initStore();
    setPoints(getUserPoints());
    setHistory(getPointHistory());
    setReady(true);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const chargeRate = useMemo(() => getChargeRate(), [ready]);

  // Calculate bonus points for a given cash amount
  function calcPoints(cashAmount: number): number {
    return Math.floor(cashAmount * chargeRate);
  }

  // Filtered and sorted history (already sorted newest-first from store)
  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      if (filter === '적립') return h.type === 'earn';
      if (filter === '사용') return h.type === 'use';
      return true;
    });
  }, [history, filter]);

  const filterCounts = useMemo(() => ({
    '전체': history.length,
    '적립': history.filter((h) => h.type === 'earn').length,
    '사용': history.filter((h) => h.type === 'use').length,
  }), [history]);

  const handleCharge = () => {
    if (selectedAmount === null || isCharging) return;

    setIsCharging(true);

    // Simulate brief delay for UX
    setTimeout(() => {
      const earned = chargePoints(selectedAmount);
      setPoints(getUserPoints());
      setHistory(getPointHistory());
      setIsCharging(false);
      setChargeSuccess(true);
      setSelectedAmount(null);

      setTimeout(() => setChargeSuccess(false), 3000);
    }, 600);
  };

  // Don't render until auth check and store init are done
  if (authLoading || !ready || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-800 rounded-2xl" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const filters: FilterType[] = ['전체', '적립', '사용'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* ===== Balance Card ===== */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 rounded-2xl p-8 sm:p-10 mb-8 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/[0.02] rounded-full translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
              <IconWallet className="w-5 h-5 text-white/80" />
            </div>
            <p className="text-sm text-white/50 font-medium tracking-wide">보유 포인트</p>
          </div>

          <p className="text-5xl sm:text-6xl font-bold text-white tracking-tight mb-1 tabular-nums">
            <AnimatedCounter value={points} />
            <span className="text-xl text-white/30 ml-1.5 font-medium">P</span>
          </p>
          <p className="text-sm text-white/30 mt-1">
            약 {Math.floor(points / chargeRate).toLocaleString()}원 상당
          </p>
        </div>
      </div>

      {/* ===== Charge Section ===== */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-2 mb-1">
          <IconGift className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-bold text-gray-900">포인트 충전</h2>
        </div>
        <p className="text-sm text-gray-400 mb-6">충전할 금액을 선택하세요</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {CHARGE_OPTIONS.map((amount) => {
            const bonusPoints = calcPoints(amount);
            const hasBonus = bonusPoints > amount;
            const isSelected = selectedAmount === amount;

            return (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`group relative p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-center ${
                  isSelected
                    ? 'border-gray-900 bg-gray-900 shadow-xl scale-[1.02]'
                    : 'border-gray-100 hover:border-gray-300 hover:shadow-md bg-white'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5">
                    <IconCheck className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* BEST badge for 50,000 option */}
                {amount === 50000 && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-gray-900 text-white text-[10px] font-black rounded-lg shadow-lg tracking-wider border border-gray-700 z-10 whitespace-nowrap">
                    BEST
                  </span>
                )}

                <p className={`text-lg font-bold mb-1 transition-colors ${
                  isSelected ? 'text-white' : 'text-gray-900'
                }`}>
                  {amount.toLocaleString()}원
                </p>

                <p className={`text-sm font-medium transition-colors ${
                  isSelected ? 'text-gray-300' : 'text-gray-400'
                }`}>
                  {amount.toLocaleString()}원
                  <span className={isSelected ? 'text-gray-400' : 'text-gray-300'}> → </span>
                  {bonusPoints.toLocaleString()}P
                </p>

                {hasBonus && (
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white/90'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {Math.round((chargeRate - 1) * 100)}% 보너스
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Summary line */}
        {selectedAmount !== null && (
          <div className="mb-4 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500 font-medium">충전 금액</span>
            <span className="text-gray-900 font-bold">
              {selectedAmount.toLocaleString()}원
              <span className="text-gray-300 mx-2">→</span>
              {calcPoints(selectedAmount).toLocaleString()}P
            </span>
          </div>
        )}

        {/* Charge button */}
        <button
          onClick={handleCharge}
          disabled={selectedAmount === null || isCharging}
          className={`group relative w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 overflow-hidden ${
            selectedAmount !== null && !isCharging
              ? 'bg-gray-900 text-white hover:bg-black hover:shadow-xl hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          {selectedAmount !== null && !isCharging && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          )}
          {isCharging ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              충전 중...
            </span>
          ) : selectedAmount !== null ? (
            <span className="relative z-10 flex items-center justify-center gap-2">
              {selectedAmount.toLocaleString()}원 충전하기
              <IconArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          ) : (
            '충전할 금액을 선택하세요'
          )}
        </button>
      </div>

      {/* ===== Charge Success Toast ===== */}
      {chargeSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm shadow-2xl flex items-center gap-2">
            <IconCheck className="w-4 h-4 text-emerald-400" />
            포인트가 충전되었습니다!
          </div>
        </div>
      )}

      {/* ===== History Section ===== */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <IconClock className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-bold text-gray-900">포인트 내역</h2>
        </div>

        {/* Filter tabs */}
        <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-0.5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
                filter === f
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f}
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md min-w-[22px] text-center transition-colors ${
                filter === f
                  ? 'bg-white/20 text-white/80'
                  : 'bg-gray-200/80 text-gray-400'
              }`}>
                {filterCounts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== History Table ===== */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-16">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[1fr_120px_120px_120px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <span>날짜 / 카테고리</span>
          <span className="text-right">분류</span>
          <span className="text-right">금액</span>
          <span className="text-right">잔액</span>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              {filter === '사용' ? (
                <IconShoppingBag className="w-7 h-7 text-gray-300" />
              ) : filter === '적립' ? (
                <IconSparkle className="w-7 h-7 text-gray-300" />
              ) : (
                <IconClock className="w-7 h-7 text-gray-300" />
              )}
            </div>
            <p className="text-gray-900 font-semibold text-base mb-1">
              {filter === '전체' ? '아직 포인트 내역이 없어요' : filter === '적립' ? '적립 내역이 없어요' : '사용 내역이 없어요'}
            </p>
            <p className="text-gray-400 text-sm">
              {filter === '전체'
                ? '투표, 영상 시청 등 활동으로 포인트를 모아보세요'
                : filter === '적립'
                ? '활동에 참여하면 포인트가 적립됩니다'
                : '갤러리에서 포인트를 사용해보세요'}
            </p>
          </div>
        ) : (
          <>
            {filteredHistory.map((item, idx) => (
              <div
                key={item.id}
                className="group flex items-center gap-3 px-6 py-4 border-t border-gray-50 first:border-0 transition-colors hover:bg-gray-50/60"
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  item.type === 'earn'
                    ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                    : 'bg-red-50 text-red-500 group-hover:bg-red-100'
                }`}>
                  {getCategoryIcon(item.category)}
                </div>

                {/* Date + description */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium truncate">
                    {item.category}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.date}
                  </p>
                </div>

                {/* Category badge (desktop) */}
                <div className="hidden sm:block shrink-0 w-[100px] text-right">
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    item.type === 'earn'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-red-50 text-red-500'
                  }`}>
                    {getCategoryLabel(item.category)}
                  </span>
                </div>

                {/* Amount */}
                <div className="shrink-0 w-[90px] text-right">
                  <p className={`text-sm font-bold tabular-nums ${
                    item.type === 'earn' ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}P
                  </p>
                </div>

                {/* Balance */}
                <div className="shrink-0 w-[90px] text-right hidden sm:block">
                  <p className="text-sm text-gray-400 font-medium tabular-nums">
                    {item.balance.toLocaleString()}P
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
