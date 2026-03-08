export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-dark text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 rounded-2xl gradient-purple flex items-center justify-center text-2xl font-bold mx-auto mb-6">
            P
          </div>
          <h1 className="text-4xl font-bold mb-4">(주) 플레스</h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            팬과 아티스트를 연결하는 참여형 플랫폼을 만듭니다
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">비전</h2>
              <p className="text-gray-600 leading-relaxed">
                PLES는 팬들이 단순한 소비자가 아닌, 아티스트의 성장에 직접 참여하는
                새로운 엔터테인먼트 생태계를 만들어갑니다. 투표, 응원, 시청, 구매 등
                모든 팬 활동이 의미 있는 참여로 이어지는 플랫폼을 지향합니다.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">미션</h2>
              <p className="text-gray-600 leading-relaxed">
                팬의 참여를 포인트로 보상하고, 아티스트의 가치를 팬과 함께 키워가는
                선순환 구조를 통해 K-엔터테인먼트의 새로운 패러다임을 제시합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">주요 프로젝트</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: '🎤',
                title: '국민프로듀서',
                desc: '팬 투표로 아티스트의 주요 결정에 직접 참여하는 시스템',
              },
              {
                icon: '💜',
                title: '아티스트 투자',
                desc: '좋아하는 아티스트를 응원하고 랭킹에 반영되는 팬덤 시스템',
              },
              {
                icon: '🎬',
                title: '영상 리워드',
                desc: '비하인드 콘텐츠를 시청하고 포인트를 적립하는 리워드 시스템',
              },
              {
                icon: '🎨',
                title: '한정판 마켓',
                desc: '아티스트의 특별한 작품과 굿즈를 만날 수 있는 마켓플레이스',
              },
            ].map((project) => (
              <div key={project.title} className="bg-white rounded-xl p-6 border border-gray-100">
                <span className="text-3xl mb-3 block">{project.icon}</span>
                <h3 className="font-bold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-sm text-gray-600">{project.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">회사 정보</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <tbody>
                {[
                  ['회사명', '(주) 플레스 (PLES Inc.)'],
                  ['대표이사', '유리아'],
                  ['설립일', '2025년 05월 26일'],
                  ['사업자등록번호', '516-86-03447'],
                  ['소재지', '서울특별시 강남구 테헤란로82길 15, 1489호(대치동)'],
                  ['업태', '정보통신업 / 미디어콘텐츠창작업'],
                  ['종목', '공연 기획업 / 광고 영화 및 비디오물 제작업 / 매니저업'],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 text-sm font-medium text-gray-500 w-1/3 bg-gray-50/50">
                      {label}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">문의하기</h2>
          <p className="text-gray-500 mb-6">비즈니스 관련 문의는 아래 이메일로 연락해주세요</p>
          <a
            href="mailto:contact@ples.co.kr"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-purple text-white font-semibold hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            contact@ples.co.kr
          </a>
        </div>
      </section>
    </div>
  );
}
