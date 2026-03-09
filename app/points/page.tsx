'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { IconWallet, IconCoin, IconGift, IconClock, IconVote, IconPlay, IconShoppingBag, IconCheck, IconArrowRight, IconSparkle } from '@/components/icons';

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

/* Animated counter component */
function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
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

/* Confetti celebration dots */
function ConfettiCelebration() {
  const dots = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const angle = (i / 20) * 360;
      const distance = 40 + Math.random() * 80;
      const x = Math.cos((angle * Math.PI) / 180) * distance;
      const y = Math.sin((angle * Math.PI) / 180) * distance;
      const shade = Math.random() > 0.5 ? 'bg-gray-400' : Math.random() > 0.5 ? 'bg-gray-600' : 'bg-gray-300';
      const size = 3 + Math.random() * 5;
      return { x, y, shade, size, delay: Math.random() * 0.3 };
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center">
      {dots.map((dot, i) => (
        <div
          key={i}
          className={`confetti-dot ${dot.shade}`}
          style={{
            width: dot.size,
            height: dot.size,
            animationDelay: `${dot.delay}s`,
            transform: `translate(${dot.x}px, ${dot.y}px)`,
            animationDuration: `${0.8 + Math.random() * 0.6}s`,
          }}
        />
      ))}
    </div>
  );
}

/* Date grouping helper */
function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  if (date >= todayStart) return '오늘';
  if (date >= yesterdayStart) return '어제';
  if (date >= weekStart) return '이번 주';
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
}

const TRANSACTIONS_PER_PAGE = 20;

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

  /* Filter counts for tab badges */
  const filterCounts = useMemo(() => ({
    '전체': transactions.length,
    '적립': transactions.filter(t => t.type === 'earn').length,
    '사용': transactions.filter(t => t.type === 'use').length,
  }), [transactions]);

  const transactionsWithBalance = filteredTransactions.map((t, i) => {
    let balance = profile?.points || 0;
    for (let j = 0; j < i; j++) {
      balance -= transactions[j].amount;
    }
    return { ...t, balance };
  });

  /* Recent change indicator */
  const lastTransaction = transactions[0];
  const recentChange = lastTransaction
    ? { amount: lastTransaction.amount, type: lastTransaction.type }
    : null;

  const hasMoreTransactions = filteredTransactions.length > TRANSACTIONS_PER_PAGE;
  const visibleTransactions = transactionsWithBalance.slice(0, TRANSACTIONS_PER_PAGE);

  /* Group transactions by date */
  const groupedTransactions = useMemo(() => {
    const groups: { label: string; items: typeof visibleTransactions }[] = [];
    let currentGroup = '';
    visibleTransactions.forEach((t) => {
      const group = getDateGroup(t.created_at);
      if (group !== currentGroup) {
        currentGroup = group;
        groups.push({ label: group, items: [] });
      }
      groups[groups.length - 1].items.push(t);
    });
    return groups;
  }, [visibleTransactions]);

  const filters: FilterType[] = ['전체', '적립', '사용'];

  /* Floating particles for balance card */
  const particles = [
    { top: '12%', left: '10%', size: 3, delay: '0s' },
    { top: '30%', left: '85%', size: 2, delay: '1.2s' },
    { top: '60%', left: '75%', size: 4, delay: '0.6s' },
    { top: '80%', left: '15%', size: 2, delay: '1.8s' },
    { top: '20%', left: '55%', size: 3, delay: '2.4s' },
    { top: '70%', left: '40%', size: 2, delay: '0.3s' },
    { top: '45%', left: '92%', size: 3, delay: '1.5s' },
    { top: '15%', left: '70%', size: 2, delay: '2.0s' },
  ];

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
        {/* Balance Card - dark gradient with mesh + floating particles */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 mb-8 mt-8 overflow-hidden">
          <div className="absolute inset-0 mesh-gradient-dark" />
          <div className="noise-overlay" />

          {/* Floating particles */}
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/[0.07] animate-float"
              style={{
                top: p.top,
                left: p.left,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: `${5 + i * 0.7}s`,
              }}
            />
          ))}

          <div className="relative z-10 flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 w-12 h-12 rounded-xl bg-white/20 blur-lg" />
              <div className="relative w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                <IconCoin className="w-6 h-6 text-white/80" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-sm text-white/60 font-medium">보유 포인트</p>
                {/* Recent change indicator */}
                {recentChange && recentChange.type === 'earn' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold animate-fade-in-up">
                    +{recentChange.amount.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-5xl font-bold text-white tracking-tight mb-4 tabular-nums">
                <AnimatedCounter value={profile?.points || 0} />
                <span className="text-lg text-white/40 ml-1 font-medium">P</span>
              </p>
              <button
                onClick={() => setShowChargeSection(!showChargeSection)}
                className="group relative inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white text-gray-900 font-bold text-sm hover:bg-gray-50 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="coin-spin-hover relative z-10" style={{ perspective: '200px' }}>
                  <IconCoin className="w-4 h-4 text-gray-500" />
                </span>
                <span className="relative z-10">{showChargeSection ? '충전 닫기' : '포인트 충전하기'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Charge Section */}
        {showChargeSection && (
          <div className="mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 animate-fade-in-up">
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
                  className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-center hover:-translate-y-1 ${
                    selectedCharge === index
                      ? 'border-gray-900 bg-gray-900 scale-[1.02] shadow-xl charge-card-glow'
                      : 'border-gray-100 hover:border-gray-300 hover:shadow-md bg-white'
                  }`}
                >
                  {selectedCharge === index && (
                    <div className="absolute top-3 right-3">
                      <IconCheck className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {/* BEST badge on 50,000원 option */}
                  {index === 3 && (
                    <span className="absolute -top-3 -right-2 px-2.5 py-0.5 bg-gray-900 text-white text-[10px] font-black rounded-lg shadow-lg tracking-wider border border-gray-700 z-10">
                      BEST
                    </span>
                  )}
                  <p className={`text-lg font-bold mb-1 transition-colors duration-300 ${
                    selectedCharge === index ? 'text-white' : 'text-gray-900'
                  }`}>
                    {option.amount.toLocaleString()}원
                  </p>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    selectedCharge === index ? 'text-gray-300' : 'text-gray-400'
                  }`}>
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

            {/* Total summary line */}
            {selectedCharge !== null && (
              <div className="mb-4 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-sm animate-fade-in-up">
                <span className="text-gray-500 font-medium">충전 금액</span>
                <span className="text-gray-900 font-bold">
                  {chargeOptions[selectedCharge].amount.toLocaleString()}원
                  <span className="text-gray-300 mx-2">→</span>
                  받을 포인트: {chargeOptions[selectedCharge].points.toLocaleString()}P
                </span>
              </div>
            )}

            <button
              onClick={handleCharge}
              disabled={selectedCharge === null || isCharging}
              className={`group relative w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 overflow-hidden ${
                selectedCharge !== null && !isCharging
                  ? 'bg-gray-900 text-white hover:bg-black hover:shadow-xl hover:shadow-gray-900/20 hover:-translate-y-0.5'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              {selectedCharge !== null && !isCharging && (
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
              ) : selectedCharge !== null ? (
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {chargeOptions[selectedCharge].amount.toLocaleString()}원 충전하기
                  <IconArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              ) : (
                '충전할 금액을 선택하세요'
              )}
            </button>
          </div>
        )}

        {/* Charge success toast + confetti */}
        {chargeSuccess && (
          <>
            <ConfettiCelebration />
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
              <div className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm shadow-xl flex items-center gap-2">
                <IconCheck className="w-4 h-4" />
                포인트가 충전되었습니다!
              </div>
            </div>
          </>
        )}

        {/* History Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <IconClock className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">포인트 내역</h2>
          </div>
          {/* Filter Tabs - pill segment style with count badges */}
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
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md min-w-[22px] text-center transition-colors duration-300 ${
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
            {visibleTransactions.length === 0 ? (
              <div className="py-24 text-center">
                <div className="relative w-20 h-20 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-5">
                  <div className="absolute inset-0 rounded-3xl dot-pattern opacity-40" />
                  {/* Animated empty state icon */}
                  <div className="relative z-10 animate-float-slow">
                    {filter === '사용' ? (
                      <IconShoppingBag className="w-8 h-8 text-gray-300" />
                    ) : filter === '적립' ? (
                      <IconSparkle className="w-8 h-8 text-gray-300" />
                    ) : (
                      <IconClock className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                </div>
                <p className="text-gray-900 font-semibold text-base mb-1.5">
                  {filter === '전체' ? '아직 포인트 내역이 없어요' : filter === '적립' ? '적립 내역이 없어요' : '사용 내역이 없어요'}
                </p>
                <p className="text-gray-400 text-sm mb-1">
                  {filter === '전체' ? '투표, 영상 시청 등 활동으로 포인트를 모아보세요' : filter === '적립' ? '활동에 참여하면 포인트가 적립됩니다' : '마켓에서 포인트를 사용해보세요'}
                </p>
                <p className="text-gray-300 text-xs mb-6">
                  {filter === '전체' ? '첫 포인트를 적립하고 다양한 혜택을 누려보세요!' : filter === '적립' ? '투표, 영상 시청으로 쉽게 적립할 수 있어요' : '아티스트 작품과 굿즈를 포인트로 만나보세요'}
                </p>
                <Link
                  href={filter === '사용' ? '/artworks' : '/vote'}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
                >
                  {filter === '사용' ? '마켓 둘러보기' : '포인트 적립하러 가기'}
                  <IconArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <>
                {groupedTransactions.map((group) => (
                  <div key={group.label}>
                    {/* Date group header */}
                    <div className="px-6 py-2.5 bg-gray-50/80 border-t border-gray-100 first:border-0">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{group.label}</span>
                    </div>
                    {group.items.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`animate-slide-in-row flex items-center gap-3 px-6 py-4 border-t transition-all duration-200 hover:bg-gray-50/80 group border-l-[3px] ${
                          item.type === 'earn'
                            ? 'border-l-emerald-400 border-t-gray-50'
                            : 'border-l-red-400 border-t-gray-50'
                        }`}
                        style={{ animationDelay: `${idx * 50}ms` }}
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
                    ))}
                  </div>
                ))}

                {/* More indicator */}
                {hasMoreTransactions && (
                  <div className="px-6 py-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400 font-medium">
                      더 많은 내역이 있습니다 ({filteredTransactions.length - TRANSACTIONS_PER_PAGE}건 더)
                    </p>
                    <div className="flex justify-center gap-1 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-100" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
