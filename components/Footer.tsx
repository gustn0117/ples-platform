'use client'

import Link from 'next/link'

const SERVICE_LINKS = [
  { label: '투표', href: '/vote' },
  { label: '아티스트', href: '/artists' },
  { label: '갤러리', href: '/artworks' },
  { label: '미디어', href: '/videos' },
  { label: '랭킹', href: '/ranking' },
]

const SUPPORT_LINKS = [
  { label: '이용약관', href: '/terms' },
  { label: '개인정보처리방침', href: '/privacy' },
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
            <Link href="/" className="inline-block group">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center group-hover:rounded-xl transition-all duration-300">
                  <span className="text-[10px] font-bold text-white tracking-tight">P</span>
                </div>
                <span className="text-xl font-bold text-gray-900 logo-text-animate">
                  PLES
                </span>
              </div>
            </Link>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              우리가 만드는<br />월드 아티스트
            </p>

            {/* Social icons - with tooltips and stagger */}
            <div className="mt-6 flex items-center gap-3 social-stagger">
              <a
                href="#"
                className="social-tooltip social-color-transition group/social flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400 hover:bg-gray-900 hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
                aria-label="Twitter"
                data-tooltip="Twitter"
              >
                <svg className="w-[18px] h-[18px] transition-transform duration-300 group-hover/social:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a
                href="#"
                className="social-tooltip social-color-transition group/social flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400 hover:bg-gray-900 hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
                aria-label="Instagram"
                data-tooltip="Instagram"
              >
                <svg className="w-[18px] h-[18px] transition-transform duration-300 group-hover/social:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a
                href="#"
                className="social-tooltip social-color-transition group/social flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400 hover:bg-gray-900 hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
                aria-label="YouTube"
                data-tooltip="YouTube"
              >
                <svg className="w-[18px] h-[18px] transition-transform duration-300 group-hover/social:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
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

          {/* Separator dot between link groups (visible on lg) */}
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
                <p>전화: +82 10-8595-7077</p>
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
          {/* Gradient separator line */}
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
