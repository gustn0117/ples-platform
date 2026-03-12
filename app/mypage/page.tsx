'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  initStore,
  getUserPoints,
  getUserVoted,
  getUserLiked,
  getUserPurchases,
  getUserWatched,
  getVotes,
  getArtists,
  getVideos,
  getPointHistory,
  type Purchase,
} from '@/lib/store';

interface Order {
  id: string
  order_type: string
  item_name: string
  amount: number
  points_amount: number | null
  status: string
  payment_method: string | null
  created_at: string
  paid_at: string | null
}
import Link from 'next/link';
import {
  IconCoin,
  IconVote,
  IconHeart,
  IconShoppingBag,
  IconPlay,
  IconArrowRight,
  IconWallet,
} from '@/components/icons';
import { ArtistIcon } from '@/lib/icons';

type TabKey = 'votes' | 'artists' | 'purchases' | 'videos';

function getMembershipBadge(points: number) {
  if (points >= 10000) return { label: 'VIP', color: 'bg-yellow-500 text-black' };
  if (points >= 5000) return { label: 'PRO', color: 'bg-gray-600 text-white' };
  if (points >= 1000) return { label: 'MEMBER', color: 'bg-gray-400 text-white' };
  return { label: 'NEW', color: 'bg-gray-200 text-gray-600' };
}

export default function MyPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('votes');
  const [ready, setReady] = useState(false);

  // Data states
  const [points, setPoints] = useState(0);
  const [votedMap, setVotedMap] = useState<Record<number, number>>({});
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [watchedIds, setWatchedIds] = useState<number[]>([]);

  useEffect(() => {
    initStore();
    setPoints(getUserPoints());
    setVotedMap(getUserVoted());
    setLikedIds(getUserLiked());
    setPurchases(getUserPurchases());
    setWatchedIds(getUserWatched());
    setReady(true);

    // Fetch real orders from DB
    if (user?.email) {
      fetch(`/api/payment/orders?email=${encodeURIComponent(user.email)}&status=paid`)
        .then((r) => r.ok ? r.json() : [])
        .then((data) => setOrders(data))
        .catch(() => {});
    }
  }, [user]);

  // Redirect to login if not logged in
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
          <p className="text-gray-400 mb-8">마이페이지를 이용하려면 먼저 로그인해주세요</p>
          <Link
            href="/login"
            className="inline-flex px-10 py-4 rounded-xl bg-gray-900 text-white font-semibold text-base hover:bg-gray-800 transition-colors"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-gray-100 rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
            ))}
          </div>
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const nickname = profile?.nickname || '회원';
  const email = profile?.email || user.email || '';
  const membership = getMembershipBadge(points);

  // Derived data for tabs
  const allVotes = getVotes();
  const allArtists = getArtists();
  const allVideos = getVideos();

  const voteCount = Object.keys(votedMap).length;
  const likedCount = likedIds.length;
  const paidOrders = orders.filter((o) => o.status === 'paid');
  const purchaseCount = purchases.length + paidOrders.length;
  const watchedCount = watchedIds.length;

  // Build vote history with chosen option
  const voteHistory = Object.entries(votedMap).map(([voteIdStr, optionId]) => {
    const voteId = Number(voteIdStr);
    const vote = allVotes.find((v) => v.id === voteId);
    const chosenOption = vote?.options.find((o) => o.id === optionId);
    return {
      voteId,
      title: vote?.title || '삭제된 투표',
      chosenOption: chosenOption?.label || '알 수 없음',
      pointReward: vote?.pointReward || 0,
    };
  });

  // Build liked artist names
  const likedArtistList = likedIds
    .map((id) => allArtists.find((a) => a.id === id))
    .filter(Boolean) as { id: number; name: string; genre: string }[];

  // Build watched video titles
  const watchedVideoList = watchedIds
    .map((id) => allVideos.find((v) => v.id === id))
    .filter(Boolean) as { id: number; title: string; duration: string; pointReward: number }[];

  const statCards = [
    { label: '보유 포인트', value: points.toLocaleString(), suffix: 'P', icon: <IconCoin className="w-5 h-5" />, highlight: true },
    { label: '투표 참여', value: voteCount.toString(), suffix: '회', icon: <IconVote className="w-5 h-5" />, highlight: false },
    { label: '좋아요 아티스트', value: likedCount.toString(), suffix: '명', icon: <IconHeart className="w-5 h-5" />, highlight: false },
    { label: '작품 구매', value: purchaseCount.toString(), suffix: '건', icon: <IconShoppingBag className="w-5 h-5" />, highlight: false },
  ];

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'votes', label: '투표내역', icon: <IconVote className="w-4 h-4" /> },
    { key: 'artists', label: '좋아요 아티스트', icon: <IconHeart className="w-4 h-4" /> },
    { key: 'purchases', label: '구매내역', icon: <IconShoppingBag className="w-4 h-4" /> },
    { key: 'videos', label: '시청미디어', icon: <IconPlay className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* ===== Profile Card ===== */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 mb-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center gap-5">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{nickname[0]}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white truncate">{nickname}</h2>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider ${membership.color}`}>
                {membership.label}
              </span>
            </div>
            <p className="text-sm text-white/50 truncate">{email}</p>
            <p className="text-sm text-white/40 mt-1">
              보유 포인트 <span className="text-white font-bold">{points.toLocaleString()}P</span>
            </p>
          </div>
        </div>
      </div>

      {/* ===== Stats Grid (4 cards) ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
              stat.highlight
                ? 'bg-gray-900 border-gray-800 text-white'
                : 'bg-white border-gray-100'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              stat.highlight ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {stat.icon}
            </div>
            <p className={`text-2xl font-bold tabular-nums ${stat.highlight ? 'text-white' : 'text-gray-900'}`}>
              {stat.value}
              <span className={`text-sm ml-0.5 ${stat.highlight ? 'text-white/50' : 'text-gray-400'}`}>{stat.suffix}</span>
            </p>
            <p className={`text-xs mt-1 font-medium ${stat.highlight ? 'text-white/60' : 'text-gray-400'}`}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ===== Point History Link ===== */}
      <Link
        href="/points"
        className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-5 mb-8 hover:border-gray-200 hover:shadow-sm transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
            <IconWallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">포인트 내역 및 충전</p>
            <p className="text-xs text-gray-400 mt-0.5">충전, 적립, 사용 내역을 확인하세요</p>
          </div>
        </div>
        <IconArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </Link>

      {/* ===== Activity Tabs ===== */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
        {/* Tab Navigation */}
        <div className="p-4 pb-0">
          <div className="flex bg-gray-50 rounded-xl p-1.5 gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center justify-center gap-1.5 px-5 py-3 text-sm font-semibold whitespace-nowrap rounded-lg transition-all duration-200 flex-1 sm:flex-none ${
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
          {/* ---- 투표내역 Tab ---- */}
          {activeTab === 'votes' && (
            voteHistory.length === 0 ? (
              <EmptyState
                icon={<IconVote className="w-8 h-8 text-gray-300" />}
                title="참여한 투표가 없어요"
                desc="좋아하는 아티스트에게 투표하고 포인트도 받아보세요"
                link="/vote"
                linkLabel="투표하러 가기"
              />
            ) : (
              <div className="divide-y divide-gray-50">
                {voteHistory.map((record) => (
                  <div key={record.voteId} className="flex items-center justify-between py-3.5 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-200 transition-colors">
                        <IconVote className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{record.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          선택: <span className="text-gray-600 font-medium">{record.chosenOption}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg shrink-0 ml-3">
                      +{record.pointReward}P
                    </span>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ---- 좋아요 아티스트 Tab ---- */}
          {activeTab === 'artists' && (
            likedArtistList.length === 0 ? (
              <EmptyState
                icon={<IconHeart className="w-8 h-8 text-gray-300" />}
                title="좋아요한 아티스트가 없어요"
                desc="마음에 드는 아티스트를 발견하고 응원해보세요"
                link="/ranking"
                linkLabel="아티스트 둘러보기"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {likedArtistList.map((artist) => (
                  <div key={artist.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                      <span className="text-white"><ArtistIcon genre={artist.genre} className="w-5 h-5" /></span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{artist.name}</p>
                      <p className="text-xs text-gray-400">{artist.genre}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ---- 구매내역 Tab ---- */}
          {activeTab === 'purchases' && (
            purchaseCount === 0 ? (
              <EmptyState
                icon={<IconShoppingBag className="w-8 h-8 text-gray-300" />}
                title="구매 내역이 없어요"
                desc="아티스트들의 특별한 작품을 만나보세요"
                link="/artworks"
                linkLabel="갤러리 둘러보기"
              />
            ) : (
              <div className="divide-y divide-gray-50">
                {/* Real orders from DB (Toss Payments) */}
                {paidOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3.5 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-gray-200 transition-colors ${
                        order.order_type === 'points' ? 'bg-blue-50' : 'bg-gray-100'
                      }`}>
                        {order.order_type === 'points'
                          ? <IconCoin className="w-4 h-4 text-blue-500" />
                          : <IconShoppingBag className="w-4 h-4 text-gray-500" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{order.item_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.paid_at || order.created_at).toLocaleDateString('ko-KR')} | {order.payment_method || '카드'}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 shrink-0 ml-3">
                      ₩{order.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                {/* Local purchases (points payment) */}
                {purchases.map((record, idx) => (
                  <div key={`local-${idx}`} className="flex items-center justify-between py-3.5 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-200 transition-colors">
                        <IconShoppingBag className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{record.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(record.date).toLocaleDateString('ko-KR')} | {record.method === 'cash' ? '현금' : '포인트'}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 shrink-0 ml-3">
                      {record.amount.toLocaleString()}{record.method === 'cash' ? '원' : 'P'}
                    </span>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ---- 시청미디어 Tab ---- */}
          {activeTab === 'videos' && (
            watchedVideoList.length === 0 ? (
              <EmptyState
                icon={<IconPlay className="w-8 h-8 text-gray-300" />}
                title="시청한 미디어가 없어요"
                desc="미디어를 시청하고 포인트를 적립해보세요"
                link="/videos"
                linkLabel="미디어 보러 가기"
              />
            ) : (
              <div className="divide-y divide-gray-50">
                {watchedVideoList.map((video) => (
                  <div key={video.id} className="flex items-center justify-between py-3.5 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-200 transition-colors">
                        <IconPlay className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{video.duration}</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg shrink-0 ml-3">
                      +{video.pointReward}P
                    </span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* Reusable empty state component */
function EmptyState({
  icon,
  title,
  desc,
  link,
  linkLabel,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  link: string;
  linkLabel: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
      <p className="text-xs text-gray-400 mb-4">{desc}</p>
      <Link
        href={link}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
      >
        {linkLabel}
        <IconArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
