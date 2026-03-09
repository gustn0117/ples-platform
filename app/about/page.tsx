export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="py-28 sm:py-36">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-7xl sm:text-8xl font-bold text-gray-900 tracking-tighter mb-4">
            PLES
          </h1>
          <p className="text-xl sm:text-2xl text-gray-400 font-medium tracking-wide">
            For AI Creatives
          </p>
          {/* Decorative line */}
          <div className="mt-12 flex items-center justify-center gap-3">
            <div className="w-12 h-px bg-gray-200" />
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-300">
              <path d="M10 2l2.09 6.26L18 10l-5.91 1.74L10 18l-2.09-6.26L2 10l5.91-1.74L10 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="w-12 h-px bg-gray-200" />
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Vision</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 leading-snug">
            팬과 아티스트를 직접 연결하는<br />참여형 플랫폼
          </h2>
          <div className="space-y-6">
            <p className="text-gray-500 leading-relaxed text-lg">
              PLES는 팬과 아티스트를 직접 연결하는 참여형 플랫폼입니다.
              팬들이 단순한 소비자가 아닌, 아티스트의 성장에 직접 참여하는
              새로운 엔터테인먼트 생태계를 만들어갑니다.
            </p>
            <p className="text-gray-500 leading-relaxed text-lg">
              투표, 응원, 시청, 구매 등 모든 팬 활동이 의미 있는 참여로 이어지며,
              참여를 포인트로 보상하고 아티스트의 가치를 팬과 함께 키워가는
              선순환 구조를 통해 K-엔터테인먼트의 새로운 패러다임을 제시합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Key Numbers */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { number: '4', label: '핵심 기능' },
              { number: '5', label: '일일 리워드' },
              { number: '24/7', label: '실시간 랭킹' },
              { number: '100%', label: '팬 참여형' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{stat.number}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Company</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">회사 정보</h2>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <tbody>
                {[
                  ['상호', '(주) 플레스'],
                  ['대표', '유리아'],
                  ['사업자등록번호', '516-86-03447'],
                  ['법인등록번호', '110111-0927317'],
                  ['소재지', '서울특별시 강남구 테헤란로82길 15, 1489호(대치동)'],
                  ['개업일', '2025년 05월 26일'],
                  ['업태', '정보통신업'],
                  ['종목', '미디어콘텐츠창작업 / 전시, 컨벤션 및 행사 대행업 / 매니저업 / 공연 기획업 / 광고 영화 및 비디오물 제작업'],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 text-sm font-medium text-gray-400 w-1/4 align-top whitespace-nowrap">
                      {label}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Contact</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">연락처</h2>

          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <span className="text-sm font-medium text-gray-400 w-20 pt-0.5 shrink-0">이메일</span>
              <a
                href="mailto:leahyu827@naver.com"
                className="text-sm text-gray-900 hover:underline"
              >
                leahyu827@naver.com
              </a>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-sm font-medium text-gray-400 w-20 pt-0.5 shrink-0">전화</span>
              <span className="text-sm text-gray-900">+82.10.8595.7077</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-sm font-medium text-gray-400 w-20 pt-0.5 shrink-0">주소</span>
              <span className="text-sm text-gray-900">서울특별시 강남구 테헤란로82길 15, 1489호(대치동)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom spacer */}
      <div className="h-20" />
    </div>
  );
}
