'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import {
  IconCoin, IconVote, IconHeart, IconShoppingBag, IconPlay,
  IconArrowRight, IconCheck, IconTrophy, IconWallet, IconSparkle, IconSettings
} from '@/components/icons';

interface PointTransaction {
  id: string;
  amount: number;
  type: 'earn' | 'use';
  category: string;
  description: string;
  created_at: string;
}

interface Stats {
  points: number;
  totalVotes: number;
  likedArtists: number;
  purchases: number;
}

interface VoteRecord {
  id: string;
  created_at: string;
  votes: { title: string; category: string } | null;
}

interface LikedArtist {
  id: string;
  created_at: string;
  artists: { name: string; genre: string; thumbnail: string } | null;
}

interface PurchaseRecord {
  id: string;
  created_at: string;
  amount: number;
  artworks: { title: string; artist_name: string; thumbnail: string } | null;
}

interface WatchedVideo {
  id: string;
  watched_at: string;
  videos: { title: string; thumbnail: string; reward_points: number } | null;
}

/* Animated number counter */
function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
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

/* Membership badge based on points */
function getMembershipBadge(points: number): { label: string; color: string } {
  if (points >= 10000) return { label: 'VIP', color: 'bg-gray-900 text-white' };
  if (points >= 5000) return { label: '프로', color: 'bg-gray-700 text-white' };
  if (points >= 1000) return { label: '일반', color: 'bg-gray-400 text-white' };
  return { label: '뉴비', color: 'bg-gray-200 text-gray-600' };
}

/* Mini trend line SVG */
function MiniTrendLine({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 20" fill="none" className={`w-12 h-5 ${className}`}>
      <polyline
        points="0,18 8,14 16,16 24,10 32,12 40,6 48,2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.35"
      />
    </svg>
  );
}

export default function MyPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [stats, setStats] = useState<Stats>({ points: 0, totalVotes: 0, likedArtists: 0, purchases: 0 });
  const [recentActivity, setRecentActivity] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [savingNickname, setSavingNickname] = useState(false);
  const [nicknameSaved, setNicknameSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'votes' | 'artists' | 'purchases' | 'videos'>('votes');
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>([]);
  const [likedArtists, setLikedArtists] = useState<LikedArtist[]>([]);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [watchedVideos, setWatchedVideos] = useState<WatchedVideo[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [votesRes, likesRes, purchasesRes, activityRes] = await Promise.all([
      supabase.from('user_votes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('artist_likes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('purchases').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase
        .from('points_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    setStats({
      points: profile?.points || 0,
      totalVotes: votesRes.count || 0,
      likedArtists: likesRes.count || 0,
      purchases: purchasesRes.count || 0,
    });

    if (activityRes.data) {
      setRecentActivity(activityRes.data);
    }

    setLoading(false);
  }, [user, profile?.points]);

  const fetchTabData = useCallback(async (tab: typeof activeTab) => {
    if (!user) return;
    setTabLoading(true);

    switch (tab) {
      case 'votes': {
        const { data } = await supabase
          .from('user_votes')
          .select('id, created_at, votes(title, category)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
        if (data) setVoteRecords(data as unknown as VoteRecord[]);
        break;
      }
      case 'artists': {
        const { data } = await supabase
          .from('artist_likes')
          .select('id, created_at, artists(name, genre, thumbnail)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
        if (data) setLikedArtists(data as unknown as LikedArtist[]);
        break;
      }
      case 'purchases': {
        const { data } = await supabase
          .from('purchases')
          .select('id, created_at, amount, artworks(title, artist_name, thumbnail)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
        if (data) setPurchaseRecords(data as unknown as PurchaseRecord[]);
        break;
      }
      case 'videos': {
        const { data } = await supabase
          .from('video_watches')
          .select('id, watched_at, videos(title, thumbnail, reward_points)')
          .eq('user_id', user.id)
          .order('watched_at', { ascending: false })
          .limit(20);
        if (data) setWatchedVideos(data as unknown as WatchedVideo[]);
        break;
      }
    }

    setTabLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab, fetchTabData]);

  const handleSaveNickname = async () => {
    if (!user || !newNickname.trim()) return;
    setSavingNickname(true);

    const { error } = await supabase
      .from('profiles')
      .update({ nickname: newNickname.trim() })
      .eq('id', user.id);

    if (!error) {
      await refreshProfile();
      setShowNicknameModal(false);
      setNicknameSaved(true);
      setTimeout(() => setNicknameSaved(false), 3000);
    }

    setSavingNickname(false);
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">로그인이 필요해요</h2>
          <p className="text-gray-400 mb-8">
            마이페이지를 이용하려면 먼저 로그인해주세요
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

  const nickname = profile?.nickname || '회원';
  const email = profile?.email || user.email || '';
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const membership = getMembershipBadge(profile?.points || 0);

  const statCards = [
    { label: '보유 포인트', value: profile?.points || 0, suffix: 'P', icon: <IconCoin className="w-5 h-5" />, highlight: true },
    { label: '투표 수', value: stats.totalVotes, suffix: '', icon: <IconVote className="w-5 h-5" />, highlight: false },
    { label: '좋아요', value: stats.likedArtists, suffix: '', icon: <IconHeart className="w-5 h-5" />, highlight: false },
    { label: '구매', value: stats.purchases, suffix: '', icon: <IconShoppingBag className="w-5 h-5" />, highlight: false },
  ];

  const tabItems = [
    { key: 'votes' as const, label: '참여한 투표', icon: <IconVote className="w-4 h-4" /> },
    { key: 'artists' as const, label: '좋아요 아티스트', icon: <IconHeart className="w-4 h-4" /> },
    { key: 'purchases' as const, label: '구매 내역', icon: <IconShoppingBag className="w-4 h-4" /> },
    { key: 'videos' as const, label: '시청 영상', icon: <IconPlay className="w-4 h-4" /> },
  ];

  const quickNavItems = [
    { label: '포인트 관리', desc: '충전 및 내역 확인', href: '/points', icon: <IconWallet className="w-5 h-5 text-white" />, badge: null },
    { label: '아티스트 랭킹', desc: '실시간 순위 확인', href: '/ranking', icon: <IconTrophy className="w-5 h-5 text-white" />, badge: null },
    { label: '영상 리워드', desc: '영상 보고 포인트 적립', href: '/videos', icon: <IconPlay className="w-5 h-5 text-white" />, badge: 'NEW' },
    { label: '마켓', desc: '아티스트 작품 구매', href: '/market', icon: <IconShoppingBag className="w-5 h-5 text-white" />, badge: null },
  ];

  /* Empty state configs per tab */
  const emptyStates: Record<typeof activeTab, { icon: React.ReactNode; title: string; desc: string; link: string; linkLabel: string }> = {
    votes: {
      icon: <IconVote className="w-8 h-8 text-gray-300" />,
      title: '참여한 투표가 없어요',
      desc: '좋아하는 아티스트에게 투표하고 포인트도 받아보세요',
      link: '/vote',
      linkLabel: '투표하러 가기',
    },
    artists: {
      icon: <IconHeart className="w-8 h-8 text-gray-300" />,
      title: '좋아요한 아티스트가 없어요',
      desc: '마음에 드는 아티스트를 발견하고 응원해보세요',
      link: '/ranking',
      linkLabel: '아티스트 둘러보기',
    },
    purchases: {
      icon: <IconShoppingBag className="w-8 h-8 text-gray-300" />,
      title: '구매 내역이 없어요',
      desc: '아티스트들의 특별한 작품을 만나보세요',
      link: '/market',
      linkLabel: '마켓 둘러보기',
    },
    videos: {
      icon: <IconPlay className="w-8 h-8 text-gray-300" />,
      title: '시청한 영상이 없어요',
      desc: '영상을 시청하고 포인트를 적립해보세요',
      link: '/videos',
      linkLabel: '영상 보러 가기',
    },
  };

  /* View all links per tab */
  const viewAllLinks: Record<typeof activeTab, string> = {
    votes: '/vote',
    artists: '/ranking',
    purchases: '/market',
    videos: '/videos',
  };

  const hasTabRecords = (tab: typeof activeTab) => {
    switch (tab) {
      case 'votes': return voteRecords.length > 0;
      case 'artists': return likedArtists.length > 0;
      case 'purchases': return purchaseRecords.length > 0;
      case 'videos': return watchedVideos.length > 0;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header with animated welcome */}
      <div className="py-16 pb-10">
        <p className="text-gray-400 text-sm mb-2 animate-fade-in-up">
          <span className="animate-wave">👋</span> 안녕하세요, <span className="text-gray-600 font-semibold">{nickname}</span>님!
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">마이페이지</h1>
        <p className="text-gray-400">내 활동을 확인하고 관리하세요</p>
      </div>

      {/* Profile Section - Dark Gradient Card */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 mb-6 overflow-hidden mesh-gradient-dark">
        <div className="noise-overlay" />
        <div className="relative z-10 flex items-center gap-5">
          {/* Avatar with animated gradient border */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-white/20 blur-xl" />
            <div className="relative avatar-gradient-border">
              <div className="relative w-20 h-20 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{nickname[0]}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-lg font-bold text-white">{nickname}</h2>
              {/* Membership badge */}
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider ${membership.color}`}>
                {membership.label}
              </span>
              <button
                onClick={() => {
                  setNewNickname(nickname);
                  setShowNicknameModal(true);
                }}
                className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-white/50">{email}</p>
            {joinDate && (
              <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full bg-white/10 text-xs text-white/60 font-medium">
                {joinDate} 가입
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
              <div className="h-8 bg-gray-100 rounded w-16 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-12" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 stagger-children">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className={`group relative rounded-2xl border shadow-sm p-5 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md cursor-default ${
                stat.highlight
                  ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 text-white hover:shadow-gray-900/20 animate-stat-sparkle'
                  : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-gray-200/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                  stat.highlight ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200/70 group-hover:text-gray-700'
                }`}>
                  {stat.icon}
                </div>
                {/* Mini trend chart */}
                <MiniTrendLine className={stat.highlight ? 'text-white/40' : 'text-gray-300'} />
              </div>
              <p className={`text-2xl font-bold transition-colors duration-300 tabular-nums ${stat.highlight ? 'text-white' : 'text-gray-900'}`}>
                <AnimatedNumber value={stat.value} />
                {stat.suffix && <span className={`text-sm ml-0.5 ${stat.highlight ? 'text-white/50' : 'text-gray-400'}`}>{stat.suffix}</span>}
              </p>
              <p className={`text-xs mt-1 font-medium transition-colors duration-300 ${stat.highlight ? 'text-white/60' : 'text-gray-400 group-hover:text-gray-500'}`}>{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Activity Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        {/* Tab Navigation - Pill/Segment style */}
        <div className="p-4 pb-0">
          <div className="inline-flex bg-gray-50 rounded-xl p-1.5 gap-1 overflow-x-auto w-full sm:w-auto">
            {tabItems.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold whitespace-nowrap rounded-lg transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {tabLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Votes Tab */}
              {activeTab === 'votes' && (
                voteRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
                      <div className="animate-float-slow">{emptyStates.votes.icon}</div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{emptyStates.votes.title}</p>
                    <p className="text-xs text-gray-400 mb-4">{emptyStates.votes.desc}</p>
                    <Link href={emptyStates.votes.link} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                      {emptyStates.votes.linkLabel} <IconArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {voteRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between py-3 transition-all duration-200 hover:bg-gray-50/50 hover:-translate-y-px hover:shadow-sm rounded-lg px-2 -mx-2 group">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200/70 transition-colors">
                            <IconVote className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{record.votes?.title || '삭제된 투표'}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{record.votes?.category || ''}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-300 shrink-0 ml-4">
                          {new Date(record.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Artists Tab */}
              {activeTab === 'artists' && (
                likedArtists.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
                      <div className="animate-float-slow">{emptyStates.artists.icon}</div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{emptyStates.artists.title}</p>
                    <p className="text-xs text-gray-400 mb-4">{emptyStates.artists.desc}</p>
                    <Link href={emptyStates.artists.link} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                      {emptyStates.artists.linkLabel} <IconArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {likedArtists.map((record) => (
                      <div key={record.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 hover:-translate-y-px hover:shadow-sm transition-all duration-200 group">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center group-hover:shadow-md transition-shadow">
                          <span className="text-sm font-bold text-white">{record.artists?.name?.[0] || '?'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{record.artists?.name || '알 수 없음'}</p>
                          <p className="text-xs text-gray-400">{record.artists?.genre || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Purchases Tab */}
              {activeTab === 'purchases' && (
                purchaseRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
                      <div className="animate-float-slow">{emptyStates.purchases.icon}</div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{emptyStates.purchases.title}</p>
                    <p className="text-xs text-gray-400 mb-4">{emptyStates.purchases.desc}</p>
                    <Link href={emptyStates.purchases.link} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                      {emptyStates.purchases.linkLabel} <IconArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {purchaseRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between py-3 transition-all duration-200 hover:bg-gray-50/50 hover:-translate-y-px hover:shadow-sm rounded-lg px-2 -mx-2 group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200/70 transition-colors">
                            <IconShoppingBag className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{record.artworks?.title || '삭제된 작품'}</p>
                            <p className="text-xs text-gray-400">{record.artworks?.artist_name || ''}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-sm font-bold text-gray-900">{record.amount?.toLocaleString()}P</p>
                          <p className="text-xs text-gray-300">{new Date(record.created_at).toLocaleDateString('ko-KR')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Videos Tab */}
              {activeTab === 'videos' && (
                watchedVideos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
                      <div className="animate-float-slow">{emptyStates.videos.icon}</div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{emptyStates.videos.title}</p>
                    <p className="text-xs text-gray-400 mb-4">{emptyStates.videos.desc}</p>
                    <Link href={emptyStates.videos.link} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                      {emptyStates.videos.linkLabel} <IconArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {watchedVideos.map((record) => (
                      <div key={record.id} className="flex items-center justify-between py-3 transition-all duration-200 hover:bg-gray-50/50 hover:-translate-y-px hover:shadow-sm rounded-lg px-2 -mx-2 group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200/70 transition-colors">
                            <IconPlay className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{record.videos?.title || '삭제된 영상'}</p>
                            <p className="text-xs text-gray-400">
                              +{record.videos?.reward_points || 0}P 적립
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-300 shrink-0 ml-4">
                          {new Date(record.watched_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* View all link */}
              {hasTabRecords(activeTab) && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <Link
                    href={viewAllLinks[activeTab]}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    전체보기
                    <IconArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 stagger-children">
        {quickNavItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-gray-200 group relative"
          >
            {/* NEW badge */}
            {item.badge && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-gray-900 text-white text-[9px] font-black rounded-md shadow-sm tracking-wider z-10">
                {item.badge}
              </span>
            )}
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:from-gray-700 group-hover:to-gray-800 transition-all duration-300">
                {item.icon}
              </div>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-50 group-hover:bg-gray-900 transition-colors duration-300">
                <IconArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-800">{item.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Account Actions */}
      <div className="flex items-center gap-3 mb-16 pt-4 border-t border-gray-100">
        <button className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors font-medium group">
          <IconSettings className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
          비밀번호 변경
        </button>
        <span className="text-gray-200">|</span>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors font-medium group"
        >
          <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          회원 탈퇴
        </button>
      </div>

      {/* Nickname saved toast */}
      {nicknameSaved && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm shadow-xl flex items-center gap-2">
            <IconCheck className="w-4 h-4" />
            닉네임이 변경되었습니다!
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-scaleIn">
            {/* Modal close button */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">회원 탈퇴</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              탈퇴 시 모든 데이터(포인트, 투표 내역, 구매 내역 등)가 삭제되며 복구할 수 없습니다.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 font-medium mb-0.5">탈퇴 문의</p>
              <p className="text-sm text-gray-900 font-semibold">support@ples.co.kr</p>
              <p className="text-xs text-gray-400 mt-1">위 이메일로 탈퇴를 요청해주세요</p>
            </div>
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* Edit Nickname Modal */}
      {showNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-scaleIn">
            {/* Modal header with close button */}
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-gray-900">닉네임 수정</h3>
              <button
                onClick={() => setShowNicknameModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-5">새로운 닉네임을 입력해주세요</p>

            <input
              type="text"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="닉네임을 입력하세요"
              autoFocus
            />
            <p className="text-xs text-gray-300 mt-2 text-right">{newNickname.length}/20</p>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowNicknameModal(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                취소
              </button>
              <button
                onClick={handleSaveNickname}
                disabled={!newNickname.trim() || savingNickname}
                className={`flex-[1.5] py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  newNickname.trim() && !savingNickname
                    ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow-md'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                {savingNickname ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
