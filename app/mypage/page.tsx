'use client';

import Link from 'next/link';

export default function MyPage() {
  const user = {
    name: '김플레스',
    email: 'fan@ples.co.kr',
    points: 1260,
    joinDate: '2026-01-15',
  };

  const stats = [
    { label: '보유 포인트', value: `${user.points.toLocaleString()}P`, color: 'text-purple-600' },
    { label: '참여 투표', value: '12건', color: 'text-blue-600' },
    { label: '투자 아티스트', value: '5명', color: 'text-pink-600' },
    { label: '구매 작품', value: '3건', color: 'text-amber-600' },
  ];

  const recentActivity = [
    { icon: '🗳️', label: '투표 참여', detail: '다음 시즌 메인 보컬리스트 투표', date: '2026-03-08', points: '+10P' },
    { icon: '🎬', label: '영상 시청', detail: 'PLES 아티스트 비하인드 EP.1', date: '2026-03-07', points: '+20P' },
    { icon: '🎨', label: '작품 구매', detail: '봄의 선율 - 김수현', date: '2026-03-07', points: '-45,000P' },
    { icon: '💰', label: '포인트 충전', detail: '50,000원 → 60,000P', date: '2026-03-06', points: '+60,000P' },
    { icon: '🎬', label: '영상 시청', detail: '국민 프로듀서 현장 스케치', date: '2026-03-06', points: '+20P' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl text-white font-bold">
            {user.name[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">가입일: {user.joinDate}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center">
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { href: '/points', label: '포인트 내역', icon: '💰' },
          { href: '/vote', label: '투표 참여', icon: '🗳️' },
          { href: '/artists', label: '투자 아티스트', icon: '💜' },
          { href: '/ranking', label: '랭킹 보기', icon: '🏆' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white rounded-xl border border-gray-100 p-4 text-center card-hover"
          >
            <span className="text-2xl block mb-2">{link.icon}</span>
            <span className="text-sm font-medium text-gray-700">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">최근 활동</h2>
          <Link href="/points" className="text-sm text-purple-500 hover:underline">
            전체보기
          </Link>
        </div>
        <div>
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-6 py-4 border-t border-gray-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{activity.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.detail}</p>
                  <p className="text-xs text-gray-400">{activity.date} · {activity.label}</p>
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${
                  activity.points.startsWith('+') ? 'text-purple-600' : 'text-red-500'
                }`}
              >
                {activity.points}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          비밀번호 변경
        </button>
        <button className="px-4 py-2.5 rounded-xl border border-red-200 text-sm text-red-500 hover:bg-red-50 transition-colors">
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}
