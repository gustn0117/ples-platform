export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>
        <div className="prose prose-gray prose-sm max-w-none text-gray-600 leading-relaxed space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. 수집하는 개인정보 항목</h2>
            <p>회사는 회원가입 및 서비스 이용을 위해 다음과 같은 개인정보를 수집합니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>필수항목: 이름, 이메일, 비밀번호, 닉네임, 휴대폰 번호</li>
              <li>자동 수집 항목: 접속 로그, 접속 IP, 서비스 이용 기록</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. 개인정보의 수집 및 이용 목적</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>회원 가입 및 관리: 회원 식별, 가입 의사 확인, 본인 확인</li>
              <li>서비스 제공: 투표, 아티스트 응원, 스타 적립 및 사용, 결제 처리</li>
              <li>서비스 개선: 신규 서비스 개발, 이용 통계 분석</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. 개인정보의 보유 및 이용 기간</h2>
            <p>회원 탈퇴 시 즉시 파기하며, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>계약 또는 청약 철회 등에 관한 기록: 5년</li>
              <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
              <li>소비자 불만 또는 분쟁 처리에 관한 기록: 3년</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. 개인정보의 제3자 제공</h2>
            <p>회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 의한 경우는 예외로 합니다.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. 개인정보보호 책임자</h2>
            <p>성명: 유리아 (대표이사)</p>
            <p>이메일: leahyu827@naver.com</p>
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
