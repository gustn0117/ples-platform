import Link from 'next/link';

export const metadata = {
  title: '서비스 안내 · PLES',
};

export default function PointsPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">스타(포인트) 서비스가 종료되었습니다</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          결제 정책 개편에 따라 스타 충전 및 사용 서비스는 종료되었습니다.<br />
          갤러리의 모든 작품은 <strong>카드 결제</strong>로 구매하실 수 있습니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link
            href="/artworks"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            갤러리 보러가기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
