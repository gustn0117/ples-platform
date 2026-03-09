'use client'

import { useState } from 'react'
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
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-gray-50/50 border-t border-gray-100">

      {/* Newsletter / CTA Section */}
      <div className="border-b border-gray-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                PLES 소식을 받아보세요
              </h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                새로운 아티스트, 투표 이벤트, 마켓 소식을 가장 먼저 만나보세요.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto gap-2">
              <div className="relative flex-1 lg:w-72">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400/20 transition-all duration-200"
                  required
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-black hover:shadow-lg hover:shadow-black/10 hover:-translate-y-px transition-all duration-300 overflow-hidden relative group"
                style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative">
                  {subscribed ? '완료!' : '구독하기'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>

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
                <span className="text-xl font-bold tracking-tight text-gray-900">
                  PLES
                </span>
              </div>
            </Link>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              팬이 만드는 아티스트 플랫폼
            </p>

            {/* Social icons - larger with hover effects */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                className="group/social flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400 transition-all duration-300 hover:bg-gray-900 hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
                aria-label="Twitter"
              >
                <svg className="w-[18px] h-[18px] transition-transform duration-300 group-hover/social:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a
                href="#"
                className="group/social flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400 transition-all duration-300 hover:bg-gray-900 hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
                aria-label="Instagram"
              >
                <svg className="w-[18px] h-[18px] transition-transform duration-300 group-hover/social:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a
                href="#"
                className="group/social flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400 transition-all duration-300 hover:bg-gray-900 hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
                aria-label="YouTube"
              >
                <svg className="w-[18px] h-[18px] transition-transform duration-300 group-hover/social:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Service links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-900 mb-5">
              서비스
            </h3>
            <ul className="space-y-3">
              {SERVICE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group/link inline-flex items-center gap-1 text-sm text-gray-400 transition-colors duration-200 hover:text-gray-900"
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
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-900 mb-5">
              고객지원
            </h3>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group/link inline-flex items-center gap-1 text-sm text-gray-400 transition-colors duration-200 hover:text-gray-900"
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
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-900 mb-5">
              회사 정보
            </h3>
            <div className="space-y-2 text-sm text-gray-400 leading-relaxed">
              <p className="font-medium text-gray-500">(주) 플레스</p>
              <p>대표: 유리아</p>
              <p>사업자등록번호: 516-86-03447</p>
              <p className="pt-1">서울특별시 강남구 테헤란로82길 15, 1489호</p>
            </div>
          </div>
        </div>

        {/* Bottom bar with gradient line */}
        <div className="relative">
          {/* Gradient separator line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

          <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 tracking-wide">
              &copy; {new Date().getFullYear()} PLES. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <p className="text-xs text-gray-300 tracking-wide">
                팬이 만드는 아티스트 플랫폼
              </p>

              {/* Back to top button */}
              <button
                onClick={scrollToTop}
                className="group/top flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition-all duration-300 hover:border-gray-300 hover:bg-gray-900 hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/10"
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
