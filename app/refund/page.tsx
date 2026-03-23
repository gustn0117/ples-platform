export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">환불 및 교환 정책</h1>
        <div className="prose prose-gray prose-sm max-w-none text-gray-600 leading-relaxed space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. 환불 및 교환 가능 기간</h2>
            <p>상품 또는 서비스 구매일(또는 수령일)로부터 7일 이내 환불 및 교환 요청이 가능합니다.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. 환불 가능 기준</h2>
            <p>다음의 경우 환불 또는 교환이 가능합니다.</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>상품에 하자가 있거나 파손된 경우</li>
              <li>주문 내용과 다른 상품이 배송된 경우</li>
              <li>서비스 이용이 정상적으로 제공되지 않은 경우</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. 환불 불가 기준</h2>
            <p>다음의 경우 환불이 제한됩니다.</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>고객의 책임으로 상품이 훼손된 경우</li>
              <li>상품 사용 또는 개봉으로 가치가 감소한 경우</li>
              <li>디지털 콘텐츠를 이미 이용(다운로드/시청)한 경우</li>
              <li>사전에 환불 불가로 고지된 상품</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. 디지털 콘텐츠 및 서비스</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>결제 후 이용 전: 전액 환불 가능</li>
              <li>일부 이용 후: 이용량에 따라 부분 환불</li>
              <li>이용 완료 후: 환불 불가</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. 환불 절차</h2>
            <p>환불 요청 → 확인 및 승인 → 환불 처리</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. 환불 처리 기간</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>카드 결제: 취소 승인 후 3~7영업일 이내</li>
              <li>계좌 환불: 승인 후 3영업일 이내</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. 배송비 기준</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>단순 변심: 고객 부담</li>
              <li>상품 하자 또는 오배송: 회사 부담</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. 문의</h2>
            <p>이메일: <a href="mailto:leahyu827@naver.com" className="text-indigo-600 hover:text-indigo-800 underline">leahyu827@naver.com</a></p>
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
