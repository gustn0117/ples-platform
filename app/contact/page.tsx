export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">문의하기</h1>
        <p className="text-sm text-gray-400 mb-10">소속 아티스트와의 협업 또는 플레스 팀원과의 협업 문의는 언제든지 환영합니다.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/ples.lab/"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Instagram</h3>
            <p className="text-xs text-gray-400">@ples.lab</p>
          </a>

          {/* Email */}
          <a
            href="mailto:leahyu827@naver.com"
            className="group p-6 border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">이메일</h3>
            <p className="text-xs text-gray-400">leahyu827@naver.com</p>
          </a>
        </div>

        {/* Company Info */}
        <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">회사 정보</h3>
          <div className="space-y-2 text-sm text-gray-500">
            <p><span className="text-gray-400 w-24 inline-block">상호</span> (주) 플레스</p>
            <p><span className="text-gray-400 w-24 inline-block">대표</span> 유리아</p>
            <p><span className="text-gray-400 w-24 inline-block">전화</span> +82.10.8595.7077</p>
            <p><span className="text-gray-400 w-24 inline-block">주소</span> 서울특별시 강남구 테헤란로82길 15, 1489호(대치동)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
