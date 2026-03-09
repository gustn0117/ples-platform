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
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-ples-dark/80 backdrop-blur-xl supports-[backdrop-filter]:bg-ples-dark/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-ples-silver to-gray-400 bg-clip-text text-transparent">
              PLES
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-gradient-to-r from-white to-ples-silver" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded-lg bg-white/10" />
            ) : user && profile ? (
              <>
                {/* Points Badge */}
                <Link
                  href="/points"
                  className="flex items-center gap-1.5 rounded-full bg-ples-gold/10 border border-ples-gold/30 px-3 py-1.5 text-sm font-semibold text-ples-gold transition-all hover:bg-ples-gold/20"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle cx="12" cy="12" r="10" opacity="0.3" />
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5.5h-2.84v1.26c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V18.5h2.84v-1.24c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-4.16-3.35z" />
                  </svg>
                  {profile.points.toLocaleString()}P
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-full p-1 transition-all hover:bg-white/10"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-ples-silver text-sm font-bold text-ples-dark">
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
                      className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                        dropdownOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-2xl animate-fadeIn">
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="text-sm font-semibold text-white truncate">
                          {profile.nickname}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {profile.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/mypage"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                            />
                          </svg>
                          마이페이지
                        </Link>
                        <Link
                          href="/points"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          포인트
                        </Link>
                        {profile.is_admin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            관리자
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-white/10 py-1">
                        <button
                          onClick={logout}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                            />
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
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:text-white hover:bg-white/5"
                >
                  로그인
                </Link>
                <Link
                  href="/login?tab=signup"
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-ples-dark transition-all hover:bg-gray-200 hover:shadow-lg hover:shadow-white/10"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="메뉴 열기"
          >
            <span
              className={`block h-0.5 w-5 rounded-full bg-white transition-all duration-300 ${
                mobileOpen ? 'translate-y-[3px] rotate-45' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-white transition-all duration-300 mt-1 ${
                mobileOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-white transition-all duration-300 mt-1 ${
                mobileOpen ? '-translate-y-[7px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-gray-900/98 backdrop-blur-xl border-l border-white/10 shadow-2xl transform transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-lg font-bold bg-gradient-to-r from-white to-ples-silver bg-clip-text text-transparent">
            PLES
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="메뉴 닫기"
          >
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Mobile user info */}
        {user && profile && (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-ples-silver text-sm font-bold text-ples-dark shrink-0">
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
                <p className="text-sm font-semibold text-white truncate">
                  {profile.nickname}
                </p>
                <p className="text-xs text-ples-gold font-medium">
                  {profile.points.toLocaleString()}P
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile nav links */}
        <nav className="p-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                isActive(link.href)
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile bottom actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          {user && profile ? (
            <div className="space-y-1">
              <Link
                href="/mypage"
                className="block rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                마이페이지
              </Link>
              <Link
                href="/points"
                className="block rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                포인트
              </Link>
              {profile.is_admin && (
                <Link
                  href="/admin"
                  className="block rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  관리자
                </Link>
              )}
              <button
                onClick={logout}
                className="w-full text-left rounded-lg px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                className="block rounded-lg border border-white/20 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-white/5 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/login?tab=signup"
                className="block rounded-lg bg-white px-4 py-2.5 text-center text-sm font-medium text-ples-dark hover:bg-gray-200 hover:shadow-lg hover:shadow-white/10 transition-all"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
