'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import {
  IconCoin, IconVote, IconHeart, IconShoppingBag, IconPlay,
  IconArrowRight, IconCheck, IconTrophy, IconWallet
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
  videos: { title: string; thumbnail: string; point_reward: number } | null;
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
          .select('id, watched_at, videos(title, thumbnail, point_reward)')
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

  const statCards = [
    { label: '보유 포인트', value: `${(profile?.points || 0).toLocaleString()}P`, icon: <IconCoin className="w-5 h-5 text-gray-500" /> },
    { label: '투표 수', value: `${stats.totalVotes}`, icon: <IconVote className="w-5 h-5 text-gray-500" /> },
    { label: '좋아요', value: `${stats.likedArtists}`, icon: <IconHeart className="w-5 h-5 text-gray-500" /> },
    { label: '구매', value: `${stats.purchases}`, icon: <IconShoppingBag className="w-5 h-5 text-gray-500" /> },
  ];

  const tabItems = [
    { key: 'votes' as const, label: '참여한 투표', icon: <IconVote className="w-4 h-4" /> },
    { key: 'artists' as const, label: '좋아요 아티스트', icon: <IconHeart className="w-4 h-4" /> },
    { key: 'purchases' as const, label: '구매 내역', icon: <IconShoppingBag className="w-4 h-4" /> },
    { key: 'videos' as const, label: '시청 영상', icon: <IconPlay className="w-4 h-4" /> },
  ];

  const quickNavItems = [
    { label: '포인트 관리', href: '/points', icon: <IconWallet className="w-5 h-5 text-gray-600" /> },
    { label: '아티스트 랭킹', href: '/ranking', icon: <IconTrophy className="w-5 h-5 text-gray-600" /> },
    { label: '영상 리워드', href: '/videos', icon: <IconPlay className="w-5 h-5 text-gray-600" /> },
    { label: '마켓', href: '/market', icon: <IconShoppingBag className="w-5 h-5 text-gray-600" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="py-16 pb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">마이페이지</h1>
        <p className="text-gray-400">내 활동을 확인하고 관리하세요</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-5">
          {/* Avatar - large letter avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center shrink-0">
            <span className="text-3xl font-bold text-white">{nickname[0]}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-lg font-bold text-gray-900">{nickname}</h2>
              <button
                onClick={() => {
                  setNewNickname(nickname);
                  setShowNicknameModal(true);
                }}
                className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-400">{email}</p>
            {joinDate && (
              <p className="text-xs text-gray-300 mt-1">{joinDate} 가입</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Activity Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        {/* Tab Navigation - underline style */}
        <div className="flex border-b border-gray-100 overflow-x-auto px-2">
          {tabItems.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
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
                    <p className="text-sm text-gray-400">참여한 투표가 없습니다</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {voteRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
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
                    <p className="text-sm text-gray-400">좋아요한 아티스트가 없습니다</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {likedArtists.map((record) => (
                      <div key={record.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
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
                    <p className="text-sm text-gray-400">구매 내역이 없습니다</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {purchaseRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
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
                    <p className="text-sm text-gray-400">시청 완료한 영상이 없습니다</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {watchedVideos.map((record) => (
                      <div key={record.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                            <IconPlay className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{record.videos?.title || '삭제된 영상'}</p>
                            <p className="text-xs text-gray-400">
                              +{record.videos?.point_reward || 0}P 적립
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
            </>
          )}
        </div>
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {quickNavItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                {item.icon}
              </div>
              <IconArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            <p className="text-sm font-semibold text-gray-900">{item.label}</p>
          </Link>
        ))}
      </div>

      {/* Account Actions */}
      <div className="flex items-center gap-3 mb-16 pt-4 border-t border-gray-100">
        <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-medium">
          비밀번호 변경
        </button>
        <span className="text-gray-200">|</span>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors font-medium"
        >
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
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">회원 탈퇴</h3>
            <p className="text-sm text-gray-400 mb-4">
              탈퇴 시 모든 데이터(포인트, 투표 내역, 구매 내역 등)가 삭제되며 복구할 수 없습니다.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-sm text-gray-600 font-medium mb-0.5">탈퇴 문의</p>
              <p className="text-sm text-gray-900 font-semibold">support@ples.co.kr</p>
              <p className="text-xs text-gray-400 mt-1">위 이메일로 탈퇴를 요청해주세요</p>
            </div>
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="w-full py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Edit Nickname Modal */}
      {showNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">닉네임 수정</h3>
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

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowNicknameModal(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveNickname}
                disabled={!newNickname.trim() || savingNickname}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                  newNickname.trim() && !savingNickname
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                {savingNickname ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
