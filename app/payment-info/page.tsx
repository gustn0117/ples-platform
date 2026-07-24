import Link from 'next/link';

export const metadata = {
  title: '결제 안내 · PLES',
  description: 'PLES 갤러리 작품 구매를 위한 결제 안내',
};

export default function PaymentInfoPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 안내</h1>
        <p className="text-sm text-gray-500 mb-10">PLES 갤러리 작품 구매를 위한 결제 방식과 절차를 안내드립니다.</p>

        <div className="space-y-10 text-gray-600 leading-relaxed text-sm">
          {/* 1. 판매 상품 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. 판매 상품</h2>
            <p className="mb-3">PLES는 아티스트가 제작한 아트워크(실물·디지털)를 판매하는 아트 커머스 플랫폼입니다.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>실물 작품</strong>: 평면아트, 조형아트, 포스터, 포토카드, 머천다이즈, 책 등 (택배 배송)</li>
              <li><strong>디지털 작품</strong>: 디지털 아트 파일, 사운드아트, 미디어아트 등 (다운로드/스트리밍)</li>
            </ul>
          </section>

          {/* 2. 결제 수단 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. 결제 수단</h2>
            <p className="mb-4">모든 상품은 <strong>토스페이먼츠(TossPayments)</strong>를 통한 단건 카드 결제만 지원합니다.</p>
            <div className="rounded-2xl border border-gray-900 bg-gray-50 p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">지원 결제 수단</p>
              <p className="text-sm font-semibold text-gray-900 mb-2">신용카드 / 체크카드</p>
              <p className="text-xs text-gray-500">회원·비회원 모두 결제 가능 (비회원은 이메일 입력으로 주문 처리)</p>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              ※ 포인트(스타) 충전형 결제, 아티스트 응원(스타 보내기), 사이버 머니 시스템은 <strong>제공하지 않습니다.</strong> 모든 결제는 <strong>상품별 단건 카드 결제</strong>로만 이루어집니다.
            </p>
          </section>

          {/* 3. 결제 절차 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. 결제 절차</h2>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>갤러리(<Link href="/artworks" className="text-indigo-600 underline">/artworks</Link>)에서 원하는 작품 선택</li>
              <li>작품 상세 페이지 &quot;결제하기&quot; 버튼 클릭</li>
              <li>비회원의 경우 주문 내역 수신용 이메일 입력</li>
              <li>토스페이먼츠 결제창에서 카드 정보 입력 후 결제 완료</li>
              <li>결제 완료 시 이메일로 주문 확인서 발송, 실물 상품은 3~7 영업일 내 발송</li>
            </ol>
          </section>

          {/* 4. 가격대 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. 상품 가격대</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">구분</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">가격대</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">예시</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 font-medium text-gray-900">소액 굿즈·디지털</td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-500">1,000원 ~ 50,000원</td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-500">포스터, 포토카드, 디지털 콘텐츠</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 font-medium text-gray-900">평면아트·앨범</td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-500">3,000원 ~ 100,000원</td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-500">「마린린먼로」 (3,000원)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 font-medium text-gray-900">조형아트·고가 작품</td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-500">100,000원 ~ 500,000원</td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-500">「호수 속 물방울」 (300,000원)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-xs mt-3">
              <li>현재 판매 중 최고가: <strong>300,000원</strong></li>
              <li>향후 판매 예정 최대 금액: <strong>500,000원 이내</strong>로 운영 예정</li>
              <li>500,000원 초과 상품은 사전 PG사 협의 후 등록</li>
              <li>1,000,000원 이상 고액 작품은 별도 견적·계약 방식으로 처리, 사이트 결제 대상에서 제외</li>
            </ul>
          </section>

          {/* 5. 배송 및 환불 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. 배송 및 환불</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>실물 작품 배송: 결제 완료 후 <strong>3~7 영업일 이내 발송</strong>, 최대 수령 기간 14일 이내</li>
              <li>디지털 작품: 결제 완료 즉시 다운로드/열람 가능</li>
              <li>환불: 상품 수령일로부터 <strong>7일 이내</strong> 요청 가능, 최초 결제 수단으로 원상 취소</li>
              <li>디지털 콘텐츠는 이용 전 전액 환불 가능</li>
            </ul>
            <p className="mt-4">
              자세한 정책은 <Link href="/refund" className="text-indigo-600 underline">환불 및 교환 정책</Link> 페이지를 참고해주세요.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-100 text-xs text-gray-400">
            <p>(주) 플레스 | 대표: 유리아 | 사업자등록번호: 516-86-03447</p>
            <p>통신판매업신고번호: 2026-서울강남-01946</p>
            <p>문의: <a href="mailto:leahyu827@naver.com" className="text-indigo-600 underline">leahyu827@naver.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
