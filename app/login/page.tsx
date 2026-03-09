'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { IconVote, IconTrophy, IconCoin, IconCheck, IconSparkle, IconArrowRight } from '@/components/icons';

// Password strength helper
function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string; width: string } {
  if (!pw) return { level: 0, label: '', color: '', width: '0%' };
  if (pw.length < 6) return { level: 1, label: '약함', color: 'bg-gray-400', width: '33%' };
  if (pw.length < 10) return { level: 2, label: '보통', color: 'bg-gray-600', width: '66%' };
  return { level: 3, label: '강함', color: 'bg-gray-900', width: '100%' };
}

// Email validation
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const router = useRouter();
  const { login, signup } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errorKey, setErrorKey] = useState(0); // for shake re-trigger
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      setErrorKey((k) => k + 1);
      return;
    }

    setLoading(true);
    try {
      const { error: loginError } = await login(email, password);
      if (loginError) {
        setError(loginError);
        setErrorKey((k) => k + 1);
      } else {
        router.push('/');
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
      setErrorKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nickname || !email || !password || !passwordConfirm) {
      setError('모든 항목을 입력해주세요.');
      setErrorKey((k) => k + 1);
      return;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      setErrorKey((k) => k + 1);
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      setErrorKey((k) => k + 1);
      return;
    }

    setLoading(true);
    try {
      const { error: signupError } = await signup(email, password, nickname);
      if (signupError) {
        setError(signupError);
        setErrorKey((k) => k + 1);
      } else {
        // Auto login after signup
        const { error: loginError } = await login(email, password);
        if (loginError) {
          setSuccess('회원가입이 완료되었습니다! 로그인해주세요.');
          setTab('login');
          setEmail('');
          setPassword('');
          setPasswordConfirm('');
          setNickname('');
        } else {
          router.push('/');
        }
      }
    } catch {
      setError('회원가입 중 오류가 발생했습니다.');
      setErrorKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const panelFeatures = [
    {
      icon: IconVote,
      title: '매일 투표',
      desc: '아티스트에게 투표하고 순위를 올려주세요',
    },
    {
      icon: IconTrophy,
      title: '랭킹 시스템',
      desc: '실시간 인기 아티스트 순위를 확인하세요',
    },
    {
      icon: IconCoin,
      title: '포인트 리워드',
      desc: '활동할수록 쌓이는 포인트로 혜택을 누리세요',
    },
  ];

  const passwordStrength = getPasswordStrength(password);

  // Field validation states
  const emailValid = email.length > 0 && isValidEmail(email);
  const nicknameValid = nickname.length >= 2;
  const passwordValid = password.length >= 6;
  const confirmValid = passwordConfirm.length > 0 && password === passwordConfirm;

  const inputClass = "w-full px-4 py-3.5 text-sm bg-gray-50/50 border border-gray-200 rounded-2xl outline-none focus:border-gray-900 focus:ring-[3px] focus:ring-gray-900/[0.08] focus:bg-white transition-all duration-300 placeholder:text-gray-300 hover:border-gray-300";

  const inputGlowClass = "w-full px-4 py-3.5 text-sm bg-gray-50/50 border border-gray-200 rounded-2xl outline-none focus:border-gray-900 focus:bg-white transition-all duration-300 placeholder:text-gray-300 hover:border-gray-300";

  // Floating shapes data
  const floatingShapes = useMemo(() => [
    { className: 'w-3 h-3 rounded-sm border border-white/[0.08]', style: { top: '15%', left: '10%', animation: 'login-float-1 12s ease-in-out infinite' } },
    { className: 'w-4 h-4 rounded-full border border-white/[0.06]', style: { top: '25%', right: '15%', animation: 'login-float-2 15s ease-in-out infinite' } },
    { className: 'w-2 h-2 rounded-sm bg-white/[0.04]', style: { top: '60%', left: '20%', animation: 'login-float-3 10s ease-in-out infinite' } },
    { className: 'w-5 h-5 rounded-lg border border-white/[0.05]', style: { bottom: '20%', right: '10%', animation: 'login-float-4 14s ease-in-out infinite' } },
    { className: 'w-2.5 h-2.5 rounded-full bg-white/[0.03]', style: { top: '45%', left: '60%', animation: 'login-float-5 11s ease-in-out infinite' } },
    { className: 'w-3.5 h-3.5 rounded-md border border-white/[0.04]', style: { bottom: '35%', left: '40%', animation: 'login-float-1 16s ease-in-out infinite 2s' } },
  ], []);

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-white">
      {/* Left Panel - Desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glow */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gray-700/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-gray-700/10 rounded-full blur-3xl" />

        {/* Animated floating geometric shapes */}
        {floatingShapes.map((shape, i) => (
          <div
            key={i}
            className={`absolute ${shape.className}`}
            style={shape.style}
          />
        ))}

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-20 w-full">
          {/* Logo */}
          <Link href="/" className="inline-block mb-14">
            <span className="text-3xl font-bold tracking-tight text-white">PLES</span>
          </Link>

          {/* Tagline */}
          <h2 className="text-4xl xl:text-5xl font-bold text-white tracking-tight leading-tight">
            팬이 만드는
            <br />
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(90deg, #9ca3af, #e5e7eb, #9ca3af, #6b7280)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'tagline-gradient-flow 6s ease infinite',
              }}
            >
              아티스트 플랫폼
            </span>
          </h2>
          <p className="mt-5 text-gray-500 text-sm leading-relaxed max-w-sm">
            투표하고, 응원하고, 시청하면서 포인트를 쌓는 새로운 참여형 플랫폼
          </p>

          {/* Divider */}
          <div className="w-12 h-px bg-gray-700 my-12" />

          {/* Feature bullets with stagger animation */}
          <div className="space-y-4">
            {panelFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 group p-4 -mx-4 rounded-2xl hover:bg-white/[0.03] transition-colors duration-300"
                style={{
                  opacity: 0,
                  animation: mounted
                    ? `fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${300 + index * 120}ms forwards`
                    : 'none',
                }}
              >
                <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 group-hover:border-white/15 transition-all duration-300">
                  <feature.icon className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                    <span className="text-[10px] font-medium text-gray-600 bg-white/[0.06] px-2 py-0.5 rounded-full">
                      {index === 0 ? 'DAILY' : index === 1 ? 'LIVE' : 'REWARD'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-14 p-5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center gap-4">
              {/* Avatar stack with stagger animation */}
              <div className="flex -space-x-2">
                {['A', 'B', 'C', 'D'].map((l, i) => (
                  <div
                    key={l}
                    className="w-8 h-8 rounded-full bg-gray-700 text-gray-300 text-[10px] font-bold flex items-center justify-center border-2 border-gray-900 ring-1 ring-white/5"
                    style={{
                      zIndex: 4 - i,
                      opacity: 0,
                      animation: mounted
                        ? `avatar-pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${600 + i * 100}ms forwards`
                        : 'none',
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div>
                {/* Counter animation for 1,000+ */}
                <p
                  className="text-sm font-semibold text-white"
                  style={{
                    opacity: 0,
                    animation: mounted
                      ? 'counter-grow-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 1s forwards'
                      : 'none',
                  }}
                >
                  1,000+
                </p>
                <p className="text-xs text-gray-500">팬들이 참여 중</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                {/* Enhanced online indicator */}
                <div className="relative">
                  <div
                    className="w-2 h-2 rounded-full bg-emerald-400"
                    style={{ animation: 'online-indicator-pulse 2s ease-in-out infinite' }}
                  />
                </div>
                <span className="text-[11px] text-gray-500">실시간 활동 중</span>
              </div>
              <span className="text-gray-700">·</span>
              {/* Activity feed text with subtle animation */}
              <span
                className="text-[11px] text-gray-500"
                style={{ animation: 'activity-cycle 4s ease-in-out infinite' }}
              >
                오늘 <span className="text-gray-400 font-medium">128</span>명 참여
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-6 sm:px-8">
        <div className="w-full max-w-md">
          {/* Logo & Heading */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-block lg:hidden mb-8">
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                PLES
              </span>
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-xs font-medium text-gray-400 mb-5">
              <IconSparkle className="w-3 h-3" />
              {tab === 'login' ? 'Welcome back' : 'Join us'}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {tab === 'login' ? '로그인' : '회원가입'}
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              {tab === 'login'
                ? '계정에 로그인하여 시작하세요'
                : '새 계정을 만들어 시작하세요'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            {/* Tab Switcher with spring-like indicator */}
            <div className="flex mb-8 p-1.5 bg-gray-100/80 rounded-2xl relative">
              <div
                className="absolute top-1.5 h-[calc(100%-12px)] bg-white rounded-xl shadow-sm border border-gray-100 tab-spring-indicator"
                style={{
                  left: tab === 'login' ? '6px' : '50%',
                  width: 'calc(50% - 6px)',
                  background: tab === 'login'
                    ? 'linear-gradient(135deg, #ffffff, #fafafa)'
                    : 'linear-gradient(135deg, #ffffff, #fafafa)',
                }}
              />
              <button
                onClick={() => { setTab('login'); clearMessages(); }}
                className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 ${
                  tab === 'login' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-500'
                }`}
              >
                로그인
              </button>
              <button
                onClick={() => { setTab('register'); clearMessages(); }}
                className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 ${
                  tab === 'register' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-500'
                }`}
              >
                회원가입
              </button>
            </div>

            {/* Error Message with shake animation */}
            {error && (
              <div
                key={errorKey}
                className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-2"
                style={{ animation: 'shake-error 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both' }}
              >
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <IconCheck className="w-3 h-3 text-emerald-600" />
                </div>
                <p className="text-sm text-emerald-600">{success}</p>
              </div>
            )}

            {/* Login Form */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="flex flex-col gap-0">
                <div className="pb-5">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                    이메일
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className={inputGlowClass}
                      style={email && emailValid ? {} : {}}
                      onFocus={(e) => {
                        e.target.style.animation = 'input-glow-pulse 2s ease-in-out infinite';
                      }}
                      onBlur={(e) => {
                        e.target.style.animation = 'none';
                      }}
                    />
                    {/* Animated check mark on valid email */}
                    {emailValid && (
                      <div
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ animation: 'check-mark-draw 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
                      >
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <IconCheck className="w-3 h-3 text-gray-600" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className={inputGlowClass}
                    onFocus={(e) => {
                      e.target.style.animation = 'input-glow-pulse 2s ease-in-out infinite';
                    }}
                    onBlur={(e) => {
                      e.target.style.animation = 'none';
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full py-4 mt-7 bg-gray-900 text-white text-sm font-semibold rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/10 hover:-translate-y-px flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      로그인 중...
                    </>
                  ) : (
                    <>
                      로그인
                      <IconArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Signup Form */}
            {tab === 'register' && (
              <form onSubmit={handleSignup} className="flex flex-col gap-0">
                <div className="pb-5">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                    닉네임
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="사용할 닉네임을 입력하세요"
                      className={inputGlowClass}
                      onFocus={(e) => {
                        e.target.style.animation = 'input-glow-pulse 2s ease-in-out infinite';
                      }}
                      onBlur={(e) => {
                        e.target.style.animation = 'none';
                      }}
                    />
                    {nicknameValid && (
                      <div
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ animation: 'check-mark-draw 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
                      >
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <IconCheck className="w-3 h-3 text-gray-600" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-5 pb-5">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                    이메일
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className={inputGlowClass}
                      onFocus={(e) => {
                        e.target.style.animation = 'input-glow-pulse 2s ease-in-out infinite';
                      }}
                      onBlur={(e) => {
                        e.target.style.animation = 'none';
                      }}
                    />
                    {emailValid && (
                      <div
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ animation: 'check-mark-draw 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
                      >
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <IconCheck className="w-3 h-3 text-gray-600" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-5 pb-5">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                    비밀번호
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6자 이상 입력하세요"
                      className={inputGlowClass}
                      onFocus={(e) => {
                        e.target.style.animation = 'input-glow-pulse 2s ease-in-out infinite';
                      }}
                      onBlur={(e) => {
                        e.target.style.animation = 'none';
                      }}
                    />
                    {passwordValid && (
                      <div
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ animation: 'check-mark-draw 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
                      >
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <IconCheck className="w-3 h-3 text-gray-600" />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Password strength indicator */}
                  {password.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${passwordStrength.color}`}
                          style={{
                            width: passwordStrength.width,
                            animation: 'strength-bar-fill 0.4s ease-out forwards',
                          }}
                        />
                      </div>
                      <span className={`text-[10px] font-medium ${
                        passwordStrength.level === 3 ? 'text-gray-900' :
                        passwordStrength.level === 2 ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                    비밀번호 확인
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="비밀번호를 다시 입력하세요"
                      className={inputGlowClass}
                      onFocus={(e) => {
                        e.target.style.animation = 'input-glow-pulse 2s ease-in-out infinite';
                      }}
                      onBlur={(e) => {
                        e.target.style.animation = 'none';
                      }}
                    />
                    {confirmValid && (
                      <div
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ animation: 'check-mark-draw 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
                      >
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <IconCheck className="w-3 h-3 text-gray-600" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full py-4 mt-7 bg-gray-900 text-white text-sm font-semibold rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/10 hover:-translate-y-px flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      가입 중...
                    </>
                  ) : (
                    <>
                      회원가입
                      <IconArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">
                  이메일 확인 불필요, 바로 로그인됩니다
                </p>
              </form>
            )}
          </div>

          {/* Bottom note */}
          <p className="text-center text-xs text-gray-300 mt-6">
            1인 1계정 기준으로 운영됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
