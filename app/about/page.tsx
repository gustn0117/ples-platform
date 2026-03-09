export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-dark text-white py-24 sm:py-32">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="w-20 h-20 rounded-2xl gradient-purple flex items-center justify-center text-3xl font-bold mx-auto mb-8 shadow-lg shadow-purple-500/30">
            P
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            팬의 참여가<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
              아티스트의 미래
            </span>
            를 만듭니다
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            PLES는 팬과 아티스트를 직접 연결하는 참여형 플랫폼입니다.
            투표하고, 응원하고, 함께 성장하는 새로운 엔터테인먼트 생태계를 만들어갑니다.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 sm:p-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xl mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">비전</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                팬들이 단순한 소비자가 아닌, 아티스트의 성장에 직접 참여하는
                새로운 엔터테인먼트 생태계를 만들어갑니다. 투표, 응원, 시청, 구매 등
                모든 팬 활동이 의미 있는 참여로 이어지는 플랫폼을 지향합니다.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 sm:p-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">미션</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                팬의 참여를 포인트로 보상하고, 아티스트의 가치를 팬과 함께 키워가는
                선순환 구조를 통해 K-엔터테인먼트의 새로운 패러다임을 제시합니다.
                참여가 곧 가치가 되는 세상을 만들겠습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 sm:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">PLES의 핵심 기능</h2>
            <p className="text-gray-500 text-lg">팬과 아티스트를 연결하는 4가지 핵심 기능</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: '🗳️',
                title: '국민프로듀서 투표',
                desc: '팬이 직접 투표로 아티스트의 주요 결정에 참여합니다. 매 투표 참여 시 포인트가 적립되며, 팬의 의견이 실제 결과에 반영됩니다.',
                gradient: 'from-purple-500 to-purple-600',
                bg: 'from-purple-50 to-purple-100/50',
              },
              {
                icon: '💜',
                title: '아티스트 투자',
                desc: '좋아하는 아티스트에게 좋아요를 눌러 응원하세요. 투자 수가 랭킹에 반영되어 아티스트의 인기를 직접 끌어올릴 수 있습니다.',
                gradient: 'from-pink-500 to-pink-600',
                bg: 'from-pink-50 to-pink-100/50',
              },
              {
                icon: '🎬',
                title: '영상 리워드',
                desc: '아티스트의 비하인드, 연습 영상, 인터뷰 등 독점 콘텐츠를 시청하고 포인트를 적립하세요. 하루 5회까지 리워드를 받을 수 있습니다.',
                gradient: 'from-blue-500 to-blue-600',
                bg: 'from-blue-50 to-blue-100/50',
              },
              {
                icon: '🎨',
                title: '한정판 마켓',
                desc: '아티스트의 특별한 작품, 포토북, 굿즈 등을 현금 또는 적립된 포인트로 구매할 수 있는 마켓플레이스를 운영합니다.',
                gradient: 'from-amber-500 to-amber-600',
                bg: 'from-amber-50 to-amber-100/50',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`bg-gradient-to-br ${feature.bg} rounded-2xl p-7 border border-white/80 hover:shadow-lg transition-shadow duration-300`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-xl mb-5 shadow-sm`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">이렇게 작동합니다</h2>
            <p className="text-gray-500 text-lg">참여에서 보상까지, 심플한 4단계</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: '가입', desc: '간단한 회원가입으로 시작하세요', color: 'from-purple-500 to-purple-600' },
              { step: '02', title: '참여', desc: '투표, 응원, 영상 시청 등 다양한 활동에 참여하세요', color: 'from-blue-500 to-blue-600' },
              { step: '03', title: '적립', desc: '모든 참여 활동에 포인트가 자동으로 적립됩니다', color: 'from-pink-500 to-pink-600' },
              { step: '04', title: '사용', desc: '적립된 포인트로 한정판 작품과 굿즈를 구매하세요', color: 'from-amber-500 to-amber-600' },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gray-200">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-r-2 border-t-2 border-gray-300 rotate-45" />
                  </div>
                )}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-lg font-bold mx-auto mb-4 shadow-lg`}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-20 sm:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">회사 정보</h2>
            <p className="text-gray-500">PLES를 만들어가는 회사를 소개합니다</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full">
              <tbody>
                {[
                  ['상호', '(주) 플레스 (PLES Inc.)'],
                  ['대표', '유리아'],
                  ['사업자등록번호', '516-86-03447'],
                  ['법인등록번호', '110111-0927317'],
                  ['소재지', '서울특별시 강남구 테헤란로82길 15, 1489호(대치동)'],
                  ['개업일', '2025년 05월 26일'],
                  ['업태', '정보통신업'],
                  ['종목', '미디어콘텐츠창작업 / 전시, 컨벤션 및 행사 대행업 / 매니저업 / 공연 기획업 / 광고 영화 및 비디오물 제작업'],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 sm:px-8 py-5 text-sm font-semibold text-gray-500 w-1/3 bg-gray-50/50">
                      {label}
                    </td>
                    <td className="px-6 sm:px-8 py-5 text-sm text-gray-800">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-3xl mx-auto mb-6">
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">문의하기</h2>
          <p className="text-gray-500 mb-8 text-lg">
            비즈니스 제휴, 아티스트 등록, 기타 문의사항은<br />
            아래 이메일로 연락해주세요
          </p>
          <a
            href="mailto:contact@ples.co.kr"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full gradient-purple text-white font-semibold text-lg hover:opacity-90 transition-all hover:shadow-lg shadow-purple-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            contact@ples.co.kr
          </a>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-400">
            <div>
              <p className="font-medium text-gray-600 mb-1">주소</p>
              <p>서울특별시 강남구 테헤란로82길 15</p>
            </div>
            <div>
              <p className="font-medium text-gray-600 mb-1">이메일</p>
              <p>contact@ples.co.kr</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
