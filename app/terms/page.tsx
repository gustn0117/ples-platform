export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">이용약관</h1>
        <div className="prose prose-gray prose-sm max-w-none text-gray-600 leading-relaxed space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">제1조 (목적)</h2>
            <p>이 약관은 (주)플레스(이하 &quot;회사&quot;)가 운영하는 PLES 플랫폼(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">제2조 (정의)</h2>
            <p>1. &quot;서비스&quot;란 회사가 제공하는 투표, 아티스트 응원, 갤러리, 미디어 시청, 스타 적립 등 모든 온라인 서비스를 말합니다.</p>
            <p>2. &quot;이용자&quot;란 서비스에 접속하여 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</p>
            <p>3. &quot;스타&quot;란 서비스 내에서 활동을 통해 적립하거나 충전하여 사용하는 가상 재화를 말합니다.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">제3조 (서비스 이용)</h2>
            <p>1. 서비스는 회원가입 후 이용할 수 있으며, 일부 서비스는 비회원도 열람할 수 있습니다.</p>
            <p>2. 이용자는 1인 1계정 기준으로 서비스를 이용해야 합니다.</p>
            <p>3. 서비스 내 스타는 환불이 불가하며, 서비스 내에서만 사용할 수 있습니다.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">제4조 (면책조항)</h2>
            <p>회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.</p>
          </section>
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">시행일: 2025년 05월 26일</p>
            <p className="text-xs text-gray-400">(주) 플레스 | 대표: 유리아</p>
          </div>
        </div>
      </div>
    </div>
  );
}
