'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-purple flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
            P
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PLES에 오신 것을 환영합니다</h1>
          <p className="text-gray-500 text-sm mt-2">참여하고 포인트를 적립하세요</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {/* Tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              회원가입
            </button>
          </div>

          {/* Social login */}
          <div className="flex flex-col gap-3 mb-6">
            <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#FEE500] text-[#191919] font-semibold text-sm hover:brightness-95 transition-all">
              <span className="text-lg">💬</span>
              카카오로 {tab === 'login' ? '로그인' : '시작하기'}
            </button>
            <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all">
              <span className="text-lg">G</span>
              Google로 {tab === 'login' ? '로그인' : '시작하기'}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">또는</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Login method toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setLoginMethod('email')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                loginMethod === 'email'
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              이메일
            </button>
            <button
              onClick={() => setLoginMethod('phone')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                loginMethod === 'phone'
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              휴대폰
            </button>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-3">
            {loginMethod === 'email' ? (
              <input
                type="email"
                placeholder="이메일 주소"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            ) : (
              <input
                type="tel"
                placeholder="휴대폰 번호"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            )}

            {tab === 'login' ? (
              <input
                type="password"
                placeholder="비밀번호"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            ) : (
              <>
                <input
                  type="password"
                  placeholder="비밀번호"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
                <input
                  type="password"
                  placeholder="비밀번호 확인"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
              </>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl gradient-purple text-white font-semibold text-sm hover:opacity-90 transition-opacity mt-2"
            >
              {tab === 'login' ? '로그인' : '회원가입'}
            </button>
          </form>

          {tab === 'login' && (
            <p className="text-center text-xs text-gray-400 mt-4">
              비밀번호를 잊으셨나요?{' '}
              <span className="text-purple-500 cursor-pointer hover:underline">
                비밀번호 찾기
              </span>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          1인 1계정 기준으로 운영됩니다. 중복 계정은 제한될 수 있습니다.
        </p>
      </div>
    </div>
  );
}
