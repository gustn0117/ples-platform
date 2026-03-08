import Link from 'next/link';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="gradient-dark text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                시즌 1 진행중
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6">
                팬이 만드는<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
                  아티스트 플랫폼
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
                투표하고, 응원하고, 구매하고, 시청하면서<br />
                포인트를 쌓는 참여형 플랫폼 PLES
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/vote"
                  className="px-6 py-3 rounded-full gradient-purple text-white font-semibold hover:opacity-90 transition-opacity animate-pulse-glow"
                >
                  투표 참여하기
                </Link>
                <Link
                  href="/artists"
                  className="px-6 py-3 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  아티스트 보기
                </Link>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/3 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl" />
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">참여 → 적립 → 사용 → 재참여</h2>
            <p className="text-gray-500">활동이 쌓이고 재방문이 유도되는 선순환 구조</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: '참여',
                desc: '투표, 좋아요, 영상 시청으로 플랫폼에 참여하세요',
                color: 'from-purple-500 to-purple-600',
                bg: 'bg-purple-50',
              },
              {
                step: '02',
                title: '포인트 적립',
                desc: '참여 활동마다 포인트가 자동으로 적립됩니다',
                color: 'from-blue-500 to-blue-600',
                bg: 'bg-blue-50',
              },
              {
                step: '03',
                title: '포인트 사용',
                desc: '적립된 포인트로 작품을 할인 구매하세요',
                color: 'from-amber-500 to-amber-600',
                bg: 'bg-amber-50',
              },
              {
                step: '04',
                title: '재방문',
                desc: '랭킹, 잔액, 구매이력을 확인하고 다시 참여하세요',
                color: 'from-green-500 to-green-600',
                bg: 'bg-green-50',
              },
            ].map((item) => (
              <div key={item.step} className={`${item.bg} rounded-2xl p-6 card-hover`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-sm font-bold mb-4`}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">PLES의 핵심 기능</h2>
            <p className="text-gray-500">팬과 아티스트를 연결하는 다양한 기능을 제공합니다</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🗳️',
                title: '국민프로듀서 투표',
                desc: '하루 1회, 원하는 항목에 투표하고 10포인트를 받으세요',
                href: '/vote',
                accent: 'border-l-purple-500',
              },
              {
                icon: '💜',
                title: '아티스트 투자',
                desc: '좋아하는 아티스트에게 좋아요를 눌러 응원하세요',
                href: '/artists',
                accent: 'border-l-pink-500',
              },
              {
                icon: '🎨',
                title: '작품 구매',
                desc: '한정판 아트워크와 굿즈를 현금 또는 포인트로 구매하세요',
                href: '/artworks',
                accent: 'border-l-amber-500',
              },
              {
                icon: '🎬',
                title: '영상 리워드',
                desc: '영상을 끝까지 시청하면 20포인트가 적립됩니다',
                href: '/videos',
                accent: 'border-l-blue-500',
              },
              {
                icon: '🏆',
                title: '아티스트 랭킹',
                desc: '인기 아티스트 순위를 확인하고 투자 현황을 살펴보세요',
                href: '/ranking',
                accent: 'border-l-green-500',
              },
              {
                icon: '💰',
                title: '포인트 충전',
                desc: '50,000원 충전 시 60,000P 지급! 더 많은 혜택을 누리세요',
                href: '/points',
                accent: 'border-l-orange-500',
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`bg-white rounded-xl p-6 border-l-4 ${item.accent} card-hover block`}
              >
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">지금 바로 시작하세요</h2>
          <p className="text-gray-500 mb-8">가입하고 첫 투표에 참여하면 바로 포인트를 받을 수 있어요</p>
          <Link
            href="/login"
            className="inline-flex px-8 py-4 rounded-full gradient-purple text-white font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>
    </div>
  );
}
