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

interface Stats {
  points: number;
  totalVotes: number;
  likedArtists: number;
  purchases: number;
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

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Fetch counts in parallel
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const getCategoryIcon = (category: string) => {
    if (category.includes('투표')) return '🗳️';
    if (category.includes('영상') || category.includes('시청')) return '🎬';
    if (category.includes('구매') || category.includes('작품')) return '🎨';
    if (category.includes('충전')) return '💰';
    if (category.includes('좋아요') || category.includes('투자')) return '💜';
    return '📌';
  };

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-5xl mx-auto mb-6">
            👤
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">로그인이 필요해요</h2>
          <p className="text-gray-500 mb-6">
            마이페이지를 이용하려면 먼저 로그인해주세요
          </p>
          <Link
            href="/login"
            className="inline-flex px-8 py-3 rounded-full gradient-purple text-white font-semibold hover:opacity-90 transition-opacity"
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
    { label: '보유 포인트', value: `${(profile?.points || 0).toLocaleString()}P`, color: 'from-purple-500 to-purple-600', textColor: 'text-purple-600', bg: 'bg-purple-50' },
    { label: '총 투표 수', value: `${stats.totalVotes}건`, color: 'from-blue-500 to-blue-600', textColor: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '좋아요 아티스트', value: `${stats.likedArtists}명`, color: 'from-pink-500 to-pink-600', textColor: 'text-pink-600', bg: 'bg-pink-50' },
    { label: '구매 내역', value: `${stats.purchases}건`, color: 'from-amber-500 to-amber-600', textColor: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const quickLinks = [
    { href: '/vote', label: '투표하기', icon: '🗳️', desc: '의견을 표현하세요' },
    { href: '/videos', label: '영상 보기', icon: '🎬', desc: '시청하고 적립받기' },
    { href: '/artworks', label: '마켓', icon: '🎨', desc: '작품 구매하기' },
    { href: '/points', label: '포인트 충전', icon: '💰', desc: '충전하고 사용하기' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm mb-8">
        {/* Gradient border top */}
        <div className="h-2 gradient-purple" />

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-5 mb-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-amber-400 p-0.5">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl font-bold text-purple-600">
                  {nickname[0]}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{nickname}</h1>
                <button
                  onClick={() => {
                    setNewNickname(nickname);
                    setShowNicknameModal(true);
                  }}
                  className="text-xs text-purple-500 hover:text-purple-700 font-medium px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  수정
                </button>
              </div>
              <p className="text-sm text-gray-500">{email}</p>
              {joinDate && (
                <p className="text-xs text-gray-400 mt-1">가입일: {joinDate}</p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                  <div className="h-7 bg-gray-200 rounded w-20 mx-auto mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-16 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {statCards.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`${stat.bg} rounded-xl p-4 text-center animate-fade-in-up`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <p className={`text-xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {quickLinks.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white rounded-2xl border border-gray-100 p-5 text-center card-hover group"
          >
            <span className="text-3xl inline-block mb-2 group-hover:scale-110 transition-transform">
              {link.icon}
            </span>
            <span className="text-sm font-semibold text-gray-800 block">{link.label}</span>
            <span className="text-xs text-gray-400 block mt-0.5">{link.desc}</span>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">최근 활동</h2>
          <Link href="/points" className="text-sm text-purple-500 hover:text-purple-700 font-medium transition-colors">
            전체보기
          </Link>
        </div>

        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 border-t border-gray-50 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-40" />
                      <div className="h-3 bg-gray-100 rounded w-28" />
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="py-12 text-center border-t border-gray-50">
            <span className="text-3xl block mb-2">📋</span>
            <p className="text-gray-500 text-sm">아직 활동 내역이 없습니다</p>
            <p className="text-gray-400 text-xs mt-1">투표, 영상 시청, 작품 구매로 활동을 시작하세요</p>
          </div>
        ) : (
          recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between px-6 py-4 border-t border-gray-50 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-lg">
                  {getCategoryIcon(activity.category)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description || activity.category}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(activity.created_at).toLocaleDateString('ko-KR')} · {activity.category}
                  </p>
                </div>
              </div>
              <span
                className={`text-sm font-bold ${
                  activity.amount > 0 ? 'text-purple-600' : 'text-red-500'
                }`}
              >
                {activity.amount > 0 ? '+' : ''}
                {activity.amount.toLocaleString()}P
              </span>
            </div>
          ))
        )}
      </div>

      {/* Account Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium">
          비밀번호 변경
        </button>
        <button className="px-5 py-2.5 rounded-xl border border-red-200 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium">
          회원 탈퇴
        </button>
      </div>

      {/* Nickname saved toast */}
      {nicknameSaved && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="px-6 py-3 bg-green-500 text-white rounded-full font-semibold shadow-xl flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            닉네임이 변경되었습니다!
          </div>
        </div>
      )}

      {/* Edit Nickname Modal */}
      {showNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 animate-fade-in-up shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">닉네임 수정</h3>
            <p className="text-sm text-gray-500 mb-5">새로운 닉네임을 입력해주세요</p>

            <input
              type="text"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="닉네임을 입력하세요"
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-2 text-right">{newNickname.length}/20</p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowNicknameModal(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveNickname}
                disabled={!newNickname.trim() || savingNickname}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                  newNickname.trim() && !savingNickname
                    ? 'gradient-purple text-white hover:opacity-90'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
