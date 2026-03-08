'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const points = 1260;

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-purple flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
              PLES
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/vote', label: '투표' },
              { href: '/artists', label: '아티스트' },
              { href: '/artworks', label: '작품' },
              { href: '/videos', label: '영상' },
              { href: '/ranking', label: '랭킹' },
              { href: '/about', label: '회사소개' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-full">
                  <span className="text-purple-500 text-xs">P</span>
                  <span className="text-sm font-semibold text-purple-700">{points.toLocaleString()}</span>
                </div>
                <Link
                  href="/mypage"
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold"
                >
                  U
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white rounded-full gradient-purple hover:opacity-90 transition-opacity"
              >
                로그인
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-purple-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            <div className="flex flex-col gap-1 pt-3">
              {[
                { href: '/vote', label: '투표' },
                { href: '/artists', label: '아티스트' },
                { href: '/artworks', label: '작품' },
                { href: '/videos', label: '영상' },
                { href: '/ranking', label: '랭킹' },
                { href: '/about', label: '회사소개' },
                { href: '/mypage', label: '마이페이지' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
