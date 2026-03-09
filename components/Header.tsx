'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const NAV_LINKS = [
  { href: '/vote', label: '투표' },
  { href: '/artists', label: '아티스트' },
  { href: '/artworks', label: '마켓' },
  { href: '/videos', label: '영상' },
  { href: '/ranking', label: '랭킹' },
  { href: '/about', label: '회사소개' },
]

export default function Header() {
  const pathname = usePathname()
  const { user, profile, loading, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
    setDropdownOpen(false)
  }, [pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold tracking-tight text-gray-900">
              PLES
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-[13px] tracking-wide transition-colors duration-300 ${
                  isActive(link.href)
                    ? 'font-medium text-gray-900'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {link.label}
                {isActive(link.href) ? (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-gray-900" />
                ) : (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] w-0 rounded-full bg-gray-900 transition-all duration-300 group-hover:w-full" />
                )}
                {/* Underline hover effect for inactive links */}
                {!isActive(link.href) && (
                  <span
                    className="absolute bottom-0 left-1/2 h-[1.5px] w-0 -translate-x-1/2 rounded-full bg-gray-400 transition-all duration-300"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-50" />
            ) : user && profile ? (
              <>
                {/* Points Badge */}
                <Link
                  href="/points"
                  className="flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-100 px-3.5 py-1.5 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-gray-100 hover:border-gray-200"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                  <svg className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <circle cx="10" cy="10" r="10" opacity="0.15" />
                    <circle cx="10" cy="10" r="7" opacity="0.25" />
                    <text x="10" y="14" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">P</text>
                  </svg>
                  <span>{profile.points.toLocaleString()}</span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-full p-0.5 transition-all duration-200 hover:bg-gray-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.nickname}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        profile.nickname.charAt(0).toUpperCase()
                      )}
                    </div>
                    <svg
                      className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-300 ${
                        dropdownOpen ? 'rotate-180' : ''
                      }`}
                      style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2.5 w-56 origin-top-right rounded-xl border border-gray-100 bg-white shadow-lg shadow-black/5 animate-fadeIn">
                      {/* User info */}
                      <div className="border-b border-gray-100 px-4 py-3.5">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {profile.nickname}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400 truncate">
                          {profile.email}
                        </p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1.5">
                        <Link
                          href="/mypage"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                        >
                          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          마이페이지
                        </Link>
                        <Link
                          href="/points"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                        >
                          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          포인트
                        </Link>
                        {profile.is_admin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                          >
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            관리자
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 py-1.5">
                        <button
                          onClick={logout}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors duration-200"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                          </svg>
                          로그아웃
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-gray-500 transition-colors duration-200 hover:text-gray-900"
                >
                  로그인
                </Link>
                <Link
                  href="/login?tab=signup"
                  className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-black hover:shadow-lg hover:shadow-black/10 hover:-translate-y-px"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                  시작하기
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            aria-label="메뉴 열기"
          >
            <span
              className={`block h-[1.5px] w-5 rounded-full bg-gray-800 transition-all duration-300 ${
                mobileOpen ? 'translate-y-[3px] rotate-45' : ''
              }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
            <span
              className={`block h-[1.5px] w-5 rounded-full bg-gray-800 transition-all duration-300 mt-1.5 ${
                mobileOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-[1.5px] w-5 rounded-full bg-gray-800 transition-all duration-300 mt-1.5 ${
                mobileOpen ? '-translate-y-[9px] -rotate-45' : ''
              }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[280px] bg-white border-l border-gray-100 shadow-xl shadow-black/5 transform transition-transform duration-500 md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-lg font-bold tracking-tight text-gray-900">
            PLES
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            aria-label="메뉴 닫기"
          >
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile user info */}
        {user && profile && (
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.nickname}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  profile.nickname.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {profile.nickname}
                </p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  {profile.points.toLocaleString()} P
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile nav links */}
        <nav className="px-3 py-4 space-y-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                isActive(link.href)
                  ? 'bg-gray-50 font-medium text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gray-900" />
              )}
            </Link>
          ))}
        </nav>

        {/* Mobile bottom actions */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-gray-100">
          {user && profile ? (
            <div className="space-y-0.5">
              <Link
                href="/mypage"
                className="flex items-center rounded-xl px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              >
                마이페이지
              </Link>
              <Link
                href="/points"
                className="flex items-center rounded-xl px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              >
                포인트
              </Link>
              {profile.is_admin && (
                <Link
                  href="/admin"
                  className="flex items-center rounded-xl px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                >
                  관리자
                </Link>
              )}
              <button
                onClick={logout}
                className="w-full text-left rounded-xl px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-500 transition-colors duration-200"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 px-2">
              <Link
                href="/login"
                className="block rounded-xl border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                로그인
              </Link>
              <Link
                href="/login?tab=signup"
                className="block rounded-xl bg-gray-900 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-black transition-all duration-300"
              >
                시작하기
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
