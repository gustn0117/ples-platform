import Link from 'next/link';

export const metadata = {
  title: '결제 안내 · PLES',
  description: 'PLES 플랫폼의 결제 수단, 포인트(스타) 충전 및 사용 안내',
};

export default function PaymentInfoPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 안내</h1>
        <p className="text-sm text-gray-500 mb-10">PLES 플랫폼의 결제 수단, 포인트(스타) 충전 및 사용처를 안내합니다.</p>

        <div className="space-y-10 text-gray-600 leading-relaxed text-sm">
          {/* 1. 결제 수단 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. 결제 수단</h2>
            <p className="mb-4">PLES는 두 가지 결제 수단을 지원합니다. 각 상품은 상품 등록 시 설정된 결제 수단에 따라 일반결제 또는 포인트(스타) 결제 중 선택 가능합니다.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-gray-200 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">일반결제</p>
                <p className="text-sm font-semibold text-gray-900 mb-2">신용/체크카드</p>
                <p className="text-xs text-gray-500">토스페이먼츠 PG를 통한 카드 결제. 비회원도 결제 가능.</p>
              </div>
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50/30 p-5">
                <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-1.5">포인트(스타) 결제</p>
                <p className="text-sm font-semibold text-gray-900 mb-2">사이트 내 가상재화</p>
                <p className="text-xs text-gray-500">사전 충전한 스타로 결제. 회원만 가능.</p>
              </div>
            </div>
          </section>

          {/* 2. 상품별 결제 수단 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. 상품별 결제 수단</h2>
            <p className="mb-4">상품의 성격에 따라 결제 수단이 다를 수 있습니다. 각 상품 상세 페이지에서 선택 가능한 결제 수단이 표시됩니다.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>일반결제 + 스타 결제 모두 가능: 대부분의 상품</li>
              <li>일반결제 전용: 고가의 실물 작품·한정판 등 (예: 조형아트 &quot;호수 속 물방울&quot;)</li>
              <li>스타 결제 전용: 디지털 콘텐츠·소액 굿즈 등 (예: 평면아트 &quot;마린린먼로&quot;)</li>
            </ul>
          </section>

          {/* 3. 포인트(스타) 충전 경로 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. 포인트(스타) 충전 경로</h2>
            <p className="mb-4">충전된 스타는 사이트 내 결제·구매에 사용할 수 있습니다.</p>
            <ol className="list-decimal pl-5 space-y-1.5 mb-4">
              <li>로그인 후 상단 메뉴 또는 마이페이지에서 <strong>&quot;스타 충전&quot;</strong> 선택</li>
              <li>충전 페이지(<Link href="/points" className="text-indigo-600 underline">https://ples.world/points</Link>)에서 충전 금액 선택 (5,000원 / 10,000원 / 30,000원 / 50,000원, 1회 최대 10만 원)</li>
              <li><strong>&quot;충전하기&quot;</strong> 클릭 → 토스페이먼츠 결제창에서 결제 수단 선택 후 결제 진행</li>
              <li>결제 승인 시 사이트 내 보유 스타로 즉시 지급</li>
            </ol>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs text-gray-500">충전 경로 URL: <Link href="/points" className="text-indigo-600 underline">/points</Link></p>
            </div>
          </section>

          {/* 4. 포인트(스타) 사용처 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. 포인트(스타) 사용처</h2>
            <p className="mb-4">충전된 스타는 다음 사이트 내 서비스에서만 사용할 수 있으며, 외부로의 현금화·양도는 불가합니다.</p>
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">① 작품(아트워크) 구매</p>
                <p className="text-xs text-gray-500 mb-2">아티스트의 실물·디지털 작품을 스타로 구매. 스타 결제가 허용된 상품에 한함.</p>
                <p className="text-xs text-gray-400">경로: <Link href="/artworks" className="text-indigo-600 underline">/artworks</Link> → 상품 상세 → 스타결제 선택</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">② 아티스트 응원(스타 보내기)</p>
                <p className="text-xs text-gray-500 mb-2">관심 아티스트에게 스타를 보내 응원. 보낸 스타는 아티스트 랭킹에 반영.</p>
                <p className="text-xs text-gray-400">경로: <Link href="/artists" className="text-indigo-600 underline">/artists</Link> → 아티스트 상세 → 스타 보내기</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-700 mb-1.5">📌 위 ①②가 충전된 스타의 전체 사용처입니다.</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                현재 PLES 플랫폼에서 충전된 스타를 <strong>차감하는 사용처는 작품 구매(①)와 아티스트 응원(②) 두 가지</strong>이며, 그 외 경로(투표·영상 시청)는 스타를 <strong>적립</strong>하는 보상 경로로, 사용처가 아닙니다.
                향후 스타 사용처가 추가될 경우 본 페이지에 사전 고지 후 반영합니다.
              </p>
            </div>
          </section>

          {/* 5. 충전 한도 및 환불 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. 충전 한도 및 환불</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>1회 충전 최대 금액: <strong>10만 원</strong></li>
              <li>충전된 스타의 이용 기간: 결제일로부터 <strong>1년(365일)</strong>, 경과 시 자동 소멸</li>
              <li>미사용 잔여 스타는 결제일로부터 1년 이내, 최초 결제 수단으로만 환불 가능</li>
              <li>스타는 사이트 내 상품·서비스 구매 용도로만 사용 가능, 현금화·양도 불가</li>
            </ul>
            <p className="mt-4">
              자세한 정책은 <Link href="/refund" className="text-indigo-600 underline">환불 및 교환 정책</Link> 페이지를 참고해주세요.
            </p>
          </section>

          {/* 6. 결제 흐름 요약 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. 결제 흐름 요약</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">구분</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">충전 경로</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">사용 경로</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 font-medium text-gray-900">일반결제 (카드)</td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-500">필요 없음 (즉시 결제)</td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-500">/artworks 상품 상세 → 일반결제 선택</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 font-medium text-gray-900">포인트(스타)</td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-500">/points → 충전 금액 선택 → 카드결제</td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-500">/artworks (스타결제) · /artists (스타 보내기)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 7. 아티스트 응원(스타 보내기) 구조 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. 아티스트 응원(스타 보내기) 구조 및 정산</h2>
            <div className="rounded-2xl bg-yellow-50/40 border border-yellow-200 p-5 mb-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">⭐ 스타 보내기란?</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                사이트 내에서 사용자가 보유한 스타를 좋아하는 아티스트에게 응원의 의미로 보낼 수 있는 기능입니다.
                보낸 스타는 아티스트의 사이트 내 누적 응원 수치에 가산되어 <Link href="/ranking" className="text-indigo-600 underline">아티스트 랭킹</Link>에 반영됩니다.
              </p>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">아티스트 정산 및 혜택 구조</h3>
            <ul className="list-disc pl-5 space-y-1.5 mb-3">
              <li>사용자가 보낸 스타는 <strong>사이트 내 가상 수치</strong>로 집계되며, 아티스트 계정에 직접 가상화폐가 적립되는 형태가 아닙니다.</li>
              <li>아티스트는 사이트 내 노출 순위·랭킹 등 <strong>비금전적 마케팅 혜택</strong>을 받습니다.</li>
              <li>실제 금전 정산은 본사(주식회사 플레스)와 개별 계약된 아티스트의 경우에만, <strong>월 단위 정산 보고서 기반으로 별도 계약서</strong>에 따라 이루어집니다.</li>
              <li>사용자 ↔ 아티스트 간 <strong>직접적인 금전 거래·환전·송금은 발생하지 않으며</strong>, 모든 결제는 본사를 거쳐 처리됩니다.</li>
              <li>본 기능은 <strong>P2P 송금이나 후원 결제대행이 아닌, 사이트 내부의 응원 시스템</strong>입니다.</li>
            </ul>
            <p className="text-xs text-gray-500">
              ※ 본 구조는 가상재화의 사이트 내 사용 범위에 해당하며, 외부 금전 흐름·환전·정산 청구 등은 발생하지 않습니다.
            </p>
          </section>

          {/* 8. 판매 상품 가격 및 형태 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. 판매 상품 가격대 및 형태</h2>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">상품 형태</h3>
            <ul className="list-disc pl-5 space-y-1.5 mb-4">
              <li><strong>실물 작품</strong>: 평면아트, 조형아트, 포스터, 포토카드, 머천다이즈 등 실물로 배송되는 상품</li>
              <li><strong>디지털 작품</strong>: 디지털 아트 파일, 사운드아트, 미디어아트 등 디지털 형태로 제공되는 상품 (다운로드/스트리밍 제공)</li>
              <li><strong>책</strong>: 도서 형태로 판매되는 상품 (실물 배송)</li>
            </ul>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">가격대 정책</h3>
            <div className="overflow-x-auto mb-3">
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
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li><strong>현재 판매 중 최고가</strong>: 300,000원 (「호수 속 물방울」)</li>
              <li><strong>향후 판매 예정 최대 금액</strong>: <strong>500,000원 이내</strong>로 운영 예정</li>
              <li>500,000원을 초과하는 고액 상품을 등록할 경우, 사전에 PG사와 협의 후 등록할 예정</li>
              <li>1,000,000원 이상 고액 작품은 별도 견적/계약 방식으로 처리, 사이트 결제 대상에서 제외</li>
            </ul>
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
