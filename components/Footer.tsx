import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-purple flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <span className="text-lg font-bold text-white">PLES</span>
            </div>
            <p className="text-sm leading-relaxed">
              팬이 투표하고, 아티스트를 응원하고,<br />
              작품을 구매하고, 영상을 시청하면서<br />
              포인트를 쌓는 참여형 아티스트 플랫폼
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">서비스</h4>
            <div className="flex flex-col gap-2">
              <Link href="/vote" className="text-sm hover:text-purple-400 transition-colors">국민프로듀서 투표</Link>
              <Link href="/artists" className="text-sm hover:text-purple-400 transition-colors">아티스트 투자</Link>
              <Link href="/artworks" className="text-sm hover:text-purple-400 transition-colors">작품 구매</Link>
              <Link href="/videos" className="text-sm hover:text-purple-400 transition-colors">영상 리워드</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">고객지원</h4>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-sm hover:text-purple-400 transition-colors">회사소개</Link>
              <Link href="/ranking" className="text-sm hover:text-purple-400 transition-colors">랭킹</Link>
              <Link href="/mypage" className="text-sm hover:text-purple-400 transition-colors">마이페이지</Link>
              <Link href="/points" className="text-sm hover:text-purple-400 transition-colors">포인트 내역</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">회사 정보</h4>
            <div className="flex flex-col gap-2 text-sm">
              <span>(주) 플레스</span>
              <span>대표: 유리아</span>
              <span>사업자등록번호: 516-86-03447</span>
              <span>서울특별시 강남구 테헤란로82길 15</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs">
          <p>&copy; 2025 PLES Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
