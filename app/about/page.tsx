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
            이상을 현실로 구현하는 창조적 허브
          </p>
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
            문화와 기술, 무한한 상상력을 결합하여<br />새로운 시대의 콘텐츠 경험을 설계합니다
          </h2>
          <div className="space-y-6">
            <p className="text-gray-500 leading-relaxed text-lg">
              PLES는 문화와 기술, 그리고 무한한 상상력을 결합하여 새로운 시대의 콘텐츠 경험을 설계하는 크리에이티브 기업입니다. 우리는 예술과 기술이 교차하는 지점에서 단순한 볼거리를 넘어, 사람과 세계를 연결하는 공감각적 문화 가치를 창조합니다.
            </p>
            <p className="text-gray-500 leading-relaxed text-lg">
              K-pop부터 디지털 아트, AI 콘텐츠, 영상 제작, 그리고 글로벌 엔터테인먼트 프로젝트까지. PLES는 경계 없는 융합을 통해 차세대 문화 플랫폼의 기준을 제시합니다.
            </p>
            <p className="text-gray-500 leading-relaxed text-lg">
              더 나아가 &ldquo;우리가 만드는 월드 아티스트&rdquo;라는 슬로건 아래 <span className="font-medium text-gray-700">ples.world</span> 사이트를 통해 이 플랫폼을 활용하는 모든 분들께 혜택을 드리는 서비스를 제공하고 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Founder & Vision</p>
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-white">YL</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">유리아 (Yu Leah)</h3>
              <p className="text-sm text-gray-400 mb-4">Founder & CEO</p>
              <p className="text-gray-500 leading-relaxed italic mb-4">
                &ldquo;이상을 현실로 &ndash; 철학의 예술적 완성&rdquo;
              </p>
              <p className="text-gray-500 leading-relaxed">
                유리아 대표는 형이상학을 강조한 플라톤과 형이하학을 강조한 아리스토텔레스 이름에서 각각 앞글자와 뒷글자를 따와 사명을 지었습니다. 예술적 감각과 첨단 기술의 조화를 통해 새로운 문화적 문법을 제시하기 위함이었습니다.
              </p>
              <p className="text-gray-500 leading-relaxed mt-4">
                &lt;Cheer up Star&gt;라는 애니메이션 등의 콘텐츠 기획과 글로벌 전시 프로젝트를 필두로, 창작자와 기술, 그리고 대중이 유기적으로 소통하는 혁신적인 창작 생태계를 구축해 나가고 있습니다. 우리는 예술이 단순한 표현을 넘어 삶과 세계를 변화시키는 강력한 동력이 될 것이라 확신합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Our Team</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">The Innovators</h2>
          <p className="text-gray-500 mb-10">PLES는 각 분야의 정점에 선 전문가들이 모인 크리에이티브 집단입니다.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'June', role: 'K-pop Music Producer', desc: '글로벌 음악 프로젝트 및 사운드 디렉팅 총괄' },
              { name: 'Lee', role: 'Art Director', desc: '전시 및 비주얼 아트, 문화 콘텐츠 기획 리더' },
              { name: 'Jung', role: 'IT Specialist', desc: '플랫폼 고도화 및 기술 시스템 구축 전문가' },
              { name: 'Hong', role: 'Film PD', desc: '고감도 영상 콘텐츠 프로덕션 디렉터' },
              { name: 'Aitonia', role: 'AI PD', desc: 'AI 기반 콘텐츠 및 디지털 휴먼 프로젝트 총괄' },
              { name: 'Grimdal', role: 'AI Creator', desc: '생성형 AI 영상 및 디지털 비주얼 크리에이터' },
              { name: 'Um', role: 'Writer', desc: '문학도 출신의 시나리오 작가' },
            ].map((member) => (
              <div key={member.name} className="p-5 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-500">{member.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-400">{member.role}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Awards & Achievements</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-10">글로벌 무대에서 증명된 PLES의 경쟁력</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Domestic */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-gray-900" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Domestic Results</h3>
              </div>
              <ul className="space-y-3">
                {[
                  { award: 'CGV AI 영상 공모전', result: '대상' },
                  { award: '29초 영화제', result: '최우수상' },
                  { award: '고혼진 AI 영상 공모전', result: '우수상' },
                  { award: '대한민국을 빛낸 자랑스러운 인물', result: '문화예술 부문 대상' },
                  { award: '롯데호텔 아트페어', result: '전시 참여' },
                ].map((item) => (
                  <li key={item.award} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.award}</p>
                      <p className="text-xs text-gray-400">{item.result}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* International */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-gray-900" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">International Recognition</h3>
              </div>
              <ul className="space-y-3">
                {[
                  { award: 'AI Film Festival', result: 'AI Film Grand Prize' },
                  { award: 'NY / Milan / Hollywood / London / Paris Movie Awards', result: 'Best Web & TV Series' },
                  { award: 'Sweden International Film Festival', result: 'Best Series Pilot' },
                  { award: 'Caravan International Film Festival', result: 'Best TV Series / Pilot' },
                  { award: 'Dream Catcher International Film Festival', result: 'Award Winner' },
                ].map((item) => (
                  <li key={item.award} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.award}</p>
                      <p className="text-xs text-gray-400">{item.result}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What We Create */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">What We Create</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              'Global K-pop Projects',
              'AI-Driven Content Creation',
              'Digital Art & Exhibition',
              'Animation & Cinematic Content',
              'Virtual Entertainment & Digital Human',
              'Global Cultural Initiatives',
            ].map((item) => (
              <div key={item} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                <p className="text-sm font-medium text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Future */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">The Future of Culture</p>
          <div className="space-y-6">
            <p className="text-gray-500 leading-relaxed text-lg">
              기술이 심화될수록 대중은 더 깊은 서사와 본질적인 감동을 갈망합니다. PLES는 예술과 기술의 완벽한 결합을 통해 시대를 앞서가는 문화 경험을 설계합니다. 우리는 지금, 그 찬란한 미래를 현실로 만들고 있습니다.
            </p>
            <p className="text-gray-500 leading-relaxed text-lg">
              소속 아티스트와의 협업 또는 플레스 팀원과의 협업 문의는 언제든지 환영합니다.
            </p>
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

      <div className="h-20" />
    </div>
  );
}
