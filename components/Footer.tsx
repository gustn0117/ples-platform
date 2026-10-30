'use client'

import Link from 'next/link'

// 현재 노출 중인 탭과 동일하게 유지 (숨긴 탭은 Header.tsx 참고)
const SERVICE_LINKS = [
  { label: '전체', href: '/artworks' },
  { label: '아티스트', href: '/artists' },
  { label: '미디어', href: '/videos' },
]

const SUPPORT_LINKS = [
  { label: '이용약관', href: '/terms' },
  { label: '개인정보처리방침', href: '/privacy' },
  { label: '결제 안내', href: '/payment-info' },
  { label: '환불 및 교환 정책', href: '/refund' },
  { label: '공지사항', href: '/notice' },
  { label: '문의하기', href: '/contact' },
]

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-gray-50/50 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-16">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block group" aria-label="PLES 홈으로">
              <img
                src="/logo/ples-logo-96.png"
                alt="PLES"
                className="h-7 w-auto group-hover:opacity-80 transition-opacity duration-200"
              />
            </Link>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              우리가 만드는<br />월드 아티스트
            </p>
          </div>

          {/* Service links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-900 mb-5 footer-heading-underline cursor-default">
              서비스
            </h3>
            <ul className="space-y-3">
              {SERVICE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group/link inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-900 footer-link-indent"
                  >
                    <span>{link.label}</span>
                    <svg className="w-3 h-3 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-900 mb-5 footer-heading-underline cursor-default">
              고객지원
            </h3>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group/link inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-900 footer-link-indent"
                  >
                    <span>{link.label}</span>
                    <svg className="w-3 h-3 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-900 mb-5 footer-heading-underline cursor-default">
              회사 정보
            </h3>
            <div className="company-info-card">
              <div className="space-y-2 text-sm text-gray-400 leading-relaxed">
                <p className="font-medium text-gray-500">(주) 플레스</p>
                <p>대표: 유리아</p>
                <p>사업자등록번호: 516-86-03447</p>
                <p>통신판매업신고번호: 2026-서울강남-01946</p>
                <p>전화: 02-514-7077</p>
                <p>이메일: <a href="mailto:leahyu827@naver.com" className="hover:text-gray-900">leahyu827@naver.com</a></p>
                <p className="pt-1 flex items-start gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span>서울특별시 강남구 테헤란로82길 15, 1489호</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar with gradient line */}
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

          <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 tracking-wide copyright-hover">
              &copy; {new Date().getFullYear()} PLES<span className="copyright-full">&nbsp;(주) 플레스</span>. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <p className="text-xs text-gray-300 tracking-wide">
                우리가 만드는 월드 아티스트
              </p>

              {/* Back to top button */}
              <button
                onClick={scrollToTop}
                className="group/top flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition-all duration-300 hover:border-gray-300 hover:bg-gray-900 hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/10 animate-top-bounce"
                aria-label="맨 위로"
                style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover/top:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
