'use client'

import Link from 'next/link'

const SERVICE_LINKS = [
  { label: '투표', href: '/vote' },
  { label: '아티스트', href: '/artists' },
  { label: '마켓', href: '/artworks' },
  { label: '영상', href: '/videos' },
  { label: '랭킹', href: '/ranking' },
]

const SUPPORT_LINKS = [
  { label: '이용약관', href: '/terms' },
  { label: '개인정보처리방침', href: '/privacy' },
  { label: '공지사항', href: '/notice' },
  { label: '문의하기', href: '/contact' },
]

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-16">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="text-xl font-bold tracking-tight text-gray-900">
                PLES
              </span>
            </Link>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              팬이 만드는 아티스트 플랫폼
            </p>
          </div>

          {/* Service links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-900">
              서비스
            </h3>
            <ul className="mt-5 space-y-3">
              {SERVICE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors duration-200 hover:text-gray-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-900">
              고객지원
            </h3>
            <ul className="mt-5 space-y-3">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors duration-200 hover:text-gray-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-900">
              회사 정보
            </h3>
            <div className="mt-5 space-y-1.5 text-sm text-gray-400 leading-relaxed">
              <p>(주) 플레스</p>
              <p>대표: 유리아</p>
              <p>사업자등록번호: 516-86-03447</p>
              <p className="pt-1">서울특별시 강남구 테헤란로82길 15, 1489호</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 tracking-wide">
            &copy; {new Date().getFullYear()} PLES. All rights reserved.
          </p>
          <p className="text-xs text-gray-300 tracking-wide">
            팬이 만드는 아티스트 플랫폼
          </p>
        </div>
      </div>
    </footer>
  )
}
