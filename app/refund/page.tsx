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
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. 스타(포인트·크레딧) 이용 및 환불 정책</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1.5">8-1. 포인트의 이용 기간</h3>
                <p>충전된 스타의 이용 기간은 결제 시점으로부터 1년(365일) 이내로 제한됩니다. 1년이 경과한 포인트는 자동으로 소멸됩니다.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1.5">8-2. 포인트 환불 조건 및 정책</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>충전된 스타의 환불 가능 기간은 결제 시점으로부터 1년 이내입니다.</li>
                  <li>환불은 사용하지 않은 잔여 포인트에 한하여 신청 가능하며, 환불 시에는 반드시 최초 결제가 이루어졌던 동일한 결제 수단(해당 카드 취소 등)을 통해서만 환불 처리가 진행됩니다. (현금 환불이나 타 수단 대체 불가)</li>
                  <li>부분 사용 후 남은 잔액에 대한 환불의 경우, 회사가 정한 소정의 취소 수수료나 환불 기준에 따라 원 결제 수단의 부분 취소 방식으로 처리됩니다.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1.5">8-3. 이용 제한 및 양도 금지</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>스타는 홈페이지 내 지정된 상품 및 서비스 구매 용도로만 사용 가능하며, 외부로의 출금이나 현금화가 불가능합니다.</li>
                  <li>충전된 스타는 어떠한 경우에도 사용자 간 양도, 매매, 증여가 절대 불가합니다.</li>
                  <li>카드사 및 PG사 심사 정책에 따라 포인트 충전 금액 한도는 1회 최대 10만 원으로 제한됩니다.</li>
                </ul>
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. 문의</h2>
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
