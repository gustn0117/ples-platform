export default function AboutPage() {
  const teamMembers = [
    { name: 'Lee', role: 'Art Director', desc: '전시 및 비주얼 아트, 문화 콘텐츠 기획 리더', color: 'bg-rose-100 text-rose-600' },
    { name: 'June', role: 'K-pop Music Producer', desc: '글로벌 음악 프로젝트 및 사운드 디렉팅 총괄', color: 'bg-violet-100 text-violet-600' },
    { name: 'Jung', role: 'IT Specialist', desc: '플랫폼 고도화 및 기술 시스템 구축 전문가', color: 'bg-blue-100 text-blue-600' },
    { name: 'Hong', role: 'Film PD', desc: '고감도 영상 콘텐츠 프로덕션 디렉터', color: 'bg-amber-100 text-amber-600' },
    { name: 'Hyo', role: 'Influencer Leader', desc: '미스코리아 & 인플루언서 관리', color: 'bg-pink-100 text-pink-600' },
    { name: 'Seung', role: 'Shooting PD', desc: '촬영 기술 리더', color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Aitonia', role: 'AI PD', desc: 'AI 기반 콘텐츠 및 디지털 휴먼 프로젝트 총괄', color: 'bg-emerald-100 text-emerald-600' },
    { name: 'Grimdal', role: 'AI Creator', desc: '생성형 AI 영상 및 디지털 비주얼 크리에이터', color: 'bg-cyan-100 text-cyan-600' },
    { name: 'Um', role: 'Writer', desc: '문학도 출신의 시나리오 작가', color: 'bg-orange-100 text-orange-600' },
  ];

  const domesticAwards = [
    { award: 'CGV AI 영상 공모전', result: '대상' },
    { award: '29초 영화제', result: '최우수상' },
    { award: '고혼진 AI 영상 공모전', result: '우수상' },
    { award: '대한민국을 빛낸 자랑스러운 인물', result: '문화예술 부문 대상' },
    { award: '롯데호텔 아트페어', result: '전시 참여' },
  ];

  const intlAwards = [
    { award: 'AI Film Festival', result: 'AI Film Grand Prize' },
    { award: 'NY / Milan / Hollywood / London / Paris Movie Awards', result: 'Best Web & TV Series' },
    { award: 'Sweden International Film Festival', result: 'Best Series Pilot' },
    { award: 'Caravan International Film Festival', result: 'Best TV Series / Pilot' },
    { award: 'Dream Catcher International Film Festival', result: 'Award Winner' },
  ];

  const services = [
    { icon: '🎵', label: 'Global K-pop Projects' },
    { icon: '🤖', label: 'AI-Driven Content' },
    { icon: '🎨', label: 'Digital Art & Exhibition' },
    { icon: '🎬', label: 'Animation & Cinematic & Commercial' },
    { icon: '👤', label: 'Digital Human' },
    { icon: '🌏', label: 'Global Cultural Initiatives' },
  ];

  return (
    <div className="bg-white">
      {/* Hero — full-bleed image with gradient fade */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-end overflow-hidden">
        <img
          src="/KakaoTalk_Photo_2026-03-12-20-37-09.jpeg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        {/* gradient: transparent top → white bottom for seamless flow */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" />

        <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20 text-center">
          <h1 className="text-7xl sm:text-9xl font-black text-gray-900 tracking-tighter mb-3 drop-shadow-sm">
            PLES
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-medium tracking-wide">
            이상을 현실로 구현하는 창조적 허브
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="py-24 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 rounded-full bg-gray-900" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Vision</p>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-10 leading-snug">
            문화와 기술, 무한한 상상력을 결합하여<br />
            <span className="text-gray-400">새로운 시대의 콘텐츠 경험을 설계합니다</span>
          </h2>
          <div className="space-y-5 text-gray-500 leading-relaxed text-[17px]">
            <p>
              PLES는 문화와 기술, 그리고 무한한 상상력을 결합하여 새로운 시대의 콘텐츠 경험을 설계하는 크리에이티브 기업입니다. 우리는 예술과 기술이 교차하는 지점에서 단순한 볼거리를 넘어, 사람과 세계를 연결하는 공감각적 문화 가치를 창조합니다.
            </p>
            <p>
              K-pop부터 디지털 아트, AI 콘텐츠, 영상 제작, 그리고 글로벌 엔터테인먼트 프로젝트까지. PLES는 경계 없는 융합을 통해 차세대 문화 플랫폼의 기준을 제시합니다.
            </p>
            <p>
              더 나아가 &ldquo;우리가 만드는 월드 아티스트&rdquo;라는 슬로건을 걸고 <span className="font-semibold text-gray-800 underline underline-offset-4 decoration-gray-300">ples.world</span>라는 사이트를 개발함으로서 이 플랫폼을 활용하는 모든 분들께 혜택을 드리는 서비스를 제공하게 되었습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-8 rounded-full bg-gray-900" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Founder & Vision</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-10 items-start">
            <div className="w-32 h-40 sm:w-36 sm:h-44 rounded-2xl overflow-hidden shrink-0 shadow-lg ring-4 ring-white">
              <img src="/KakaoTalk_Photo_2026-03-12-20-37-09.jpeg" alt="유리아 CEO" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">유리아 (Yu Leah)</h3>
              <p className="text-sm text-gray-400 mb-5">Founder & CEO</p>
              <blockquote className="border-l-2 border-gray-300 pl-4 mb-6">
                <p className="text-gray-600 italic">
                  &ldquo;이상을 현실로 &ndash; 철학의 예술적 완성&rdquo;
                </p>
              </blockquote>
              <div className="space-y-4 text-gray-500 leading-relaxed text-[15px]">
                <p>
                  유리아 대표는 형이상학을 강조한 플라톤과 형이하학을 강조한 아리스토텔레스 이름에서 각각 앞글자와 뒷글자를 따와 사명을 지었습니다. 예술적 감각과 첨단 기술의 조화를 통해 새로운 문화적 문법을 제시하기 위함이었습니다.
                </p>
                <p>
                  &lt;Cheer up Star&gt;라는 애니메이션 등의 콘텐츠 기획과 글로벌 전시 프로젝트를 필두로, 창작자와 기술, 그리고 대중이 유기적으로 소통하는 혁신적인 창작 생태계를 구축해 나가고 있습니다. 우리는 예술이 단순한 표현을 넘어 삶과 세계를 변화시키는 강력한 동력이 될 것이라 확신합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 rounded-full bg-gray-900" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Our Team</p>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">The Innovators</h2>
          <p className="text-gray-400 mb-12">각 분야의 정점에 선 전문가들이 모인 크리에이티브 집단</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {teamMembers.map((m) => (
              <div key={m.name} className="group p-5 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${m.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="text-base font-bold">{m.name[0]}</span>
                </div>
                <p className="text-sm font-bold text-gray-900 mb-0.5">{m.name}</p>
                <p className="text-[11px] text-gray-400 mb-3 uppercase tracking-wide">{m.role}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-24 bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 rounded-full bg-white" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Awards</p>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-14">
            글로벌 무대에서 증명된<br />PLES의 경쟁력
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            {/* Domestic */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="w-5 h-px bg-gray-600" />
                Domestic
              </h3>
              <ul className="space-y-5">
                {domesticAwards.map((item) => (
                  <li key={item.award}>
                    <p className="text-sm font-medium text-white mb-0.5">{item.award}</p>
                    <p className="text-xs text-gray-500">{item.result}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* International */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="w-5 h-px bg-gray-600" />
                International
              </h3>
              <ul className="space-y-5">
                {intlAwards.map((item) => (
                  <li key={item.award}>
                    <p className="text-sm font-medium text-white mb-0.5">{item.award}</p>
                    <p className="text-xs text-gray-500">{item.result}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What We Create */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 rounded-full bg-gray-900" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">What We Create</p>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-12">우리가 만드는 것들</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {services.map((s) => (
              <div key={s.label} className="group p-6 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm transition-all text-center">
                <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">{s.icon}</span>
                <p className="text-sm font-medium text-gray-700">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Future — CTA style */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">The Future of Culture</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 leading-snug">
            예술이 단순한 표현을 넘어<br />삶과 세계를 변화시키는 강력한 동력
          </h2>
          <p className="text-gray-500 leading-relaxed text-[17px] mb-4 max-w-2xl mx-auto">
            기술이 심화될수록 대중은 더 깊은 서사와 본질적인 감동을 갈망합니다. PLES는 예술과 기술의 완벽한 결합을 통해 시대를 앞서가는 문화 경험을 설계합니다. 우리는 지금, 그 찬란한 미래를 현실로 만들고 있습니다.
          </p>
          <p className="text-gray-500 leading-relaxed text-[17px] max-w-2xl mx-auto">
            소속 아티스트와의 협업 또는 플레스 팀원과의 협업문의는 언제든지 환영합니다. 감사합니다.
          </p>
          <div className="mt-10">
            <a
              href="mailto:leahyu827@naver.com"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              협업 문의하기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 rounded-full bg-gray-900" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Partners</p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            {['대한민국축구협회', '서울옥션블루'].map((partner) => (
              <div key={partner} className="px-8 py-5 rounded-2xl border border-gray-100 bg-white hover:shadow-sm transition-shadow">
                <p className="text-sm font-semibold text-gray-800">{partner}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Info + Contact combined */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            {/* Company */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full bg-gray-900" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Company</p>
              </div>
              <div className="space-y-4">
                {[
                  ['상호', '(주) 플레스'],
                  ['대표', '유리아'],
                  ['사업자등록번호', '516-86-03447'],
                  ['법인등록번호', '110111-0927317'],
                  ['개업일', '2025년 05월 26일'],
                  ['업태', '정보통신업'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="text-xs font-medium text-gray-400 w-24 pt-0.5 shrink-0">{label}</span>
                    <span className="text-sm text-gray-900">{value}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3">
                  <span className="text-xs font-medium text-gray-400 w-24 pt-0.5 shrink-0">종목</span>
                  <span className="text-sm text-gray-900 leading-relaxed">미디어콘텐츠창작업 / 전시, 컨벤션 및 행사 대행업 / 매니저업 / 공연 기획업 / 광고 영화 및 비디오물 제작업</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full bg-gray-900" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Contact</p>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">이메일</p>
                  <a href="mailto:leahyu827@naver.com" className="text-sm text-gray-900 hover:underline font-medium">
                    leahyu827@naver.com
                  </a>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">전화</p>
                  <p className="text-sm text-gray-900 font-medium">+82.10.8595.7077</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">주소</p>
                  <p className="text-sm text-gray-900 leading-relaxed">서울특별시 강남구 테헤란로82길 15,<br />1489호(대치동)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-16" />
    </div>
  );
}
