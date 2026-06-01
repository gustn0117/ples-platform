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
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">③ 투표 참여 보상 (사용은 아님)</p>
                <p className="text-xs text-gray-500 mb-2">투표 참여 시 보상으로 스타를 적립받을 수 있습니다(사용처가 아닌 적립처).</p>
                <p className="text-xs text-gray-400">경로: <Link href="/vote" className="text-indigo-600 underline">/vote</Link></p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">④ 미디어 시청 보상 (사용은 아님)</p>
                <p className="text-xs text-gray-500 mb-2">영상 시청을 통해 스타를 적립받을 수 있습니다(사용처가 아닌 적립처).</p>
                <p className="text-xs text-gray-400">경로: <Link href="/videos" className="text-indigo-600 underline">/videos</Link></p>
              </div>
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
