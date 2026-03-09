'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { IconVote, IconTrophy, IconCoin, IconCheck } from '@/components/icons';

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const { error: loginError } = await login(email, password);
      if (loginError) {
        setError(loginError);
      } else {
        router.push('/');
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
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
      return;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const { error: signupError } = await signup(email, password, nickname);
      if (signupError) {
        setError(signupError);
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

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-white">
      {/* Left Panel - Desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-20 w-full">
          {/* Logo */}
          <Link href="/" className="inline-block mb-12">
            <span className="text-3xl font-bold tracking-tight text-white">PLES</span>
          </Link>

          {/* Tagline */}
          <h2 className="text-3xl xl:text-4xl font-bold text-white tracking-tight leading-snug">
            팬이 만드는
            <br />
            아티스트 플랫폼
          </h2>
          <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-sm">
            투표하고, 응원하고, 시청하면서 포인트를 쌓는 새로운 참여형 플랫폼
          </p>

          {/* Divider */}
          <div className="w-10 h-px bg-gray-700 my-10" />

          {/* Feature bullets */}
          <div className="space-y-6">
            {panelFeatures.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-6 sm:px-8">
        <div className="w-full max-w-md">
          {/* Logo & Heading */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-block lg:hidden">
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                PLES
              </span>
            </Link>
            <h1 className="mt-6 lg:mt-0 text-2xl font-bold text-gray-900">
              {tab === 'login' ? '로그인' : '회원가입'}
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              {tab === 'login'
                ? '계정에 로그인하여 시작하세요'
                : '새 계정을 만들어 시작하세요'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {/* Tab Switcher */}
            <div className="flex mb-8 border-b border-gray-100 relative">
              {/* Animated tab indicator */}
              <div
                className="absolute bottom-0 h-0.5 bg-gray-900 transition-all duration-300 ease-out"
                style={{
                  left: tab === 'login' ? '0%' : '50%',
                  width: '50%',
                }}
              />
              <button
                onClick={() => { setTab('login'); clearMessages(); }}
                className={`flex-1 pb-3 text-sm font-medium transition-colors duration-200 ${
                  tab === 'login'
                    ? 'text-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                로그인
              </button>
              <button
                onClick={() => { setTab('register'); clearMessages(); }}
                className={`flex-1 pb-3 text-sm font-medium transition-colors duration-200 ${
                  tab === 'register'
                    ? 'text-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                회원가입
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-100">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-3.5 rounded-xl bg-green-50 border border-green-100 flex items-center gap-2">
                <IconCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Login Form */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full px-4 py-3.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 placeholder:text-gray-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 mt-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
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
                    '로그인'
                  )}
                </button>
              </form>
            )}

            {/* Signup Form */}
            {tab === 'register' && (
              <form onSubmit={handleSignup} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    닉네임
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="사용할 닉네임을 입력하세요"
                    className="w-full px-4 py-3.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6자 이상 입력하세요"
                    className="w-full px-4 py-3.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    className="w-full px-4 py-3.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 placeholder:text-gray-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 mt-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
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
                    '회원가입'
                  )}
                </button>
                <p className="text-center text-xs text-gray-400">
                  이메일 확인 불필요, 바로 로그인됩니다
                </p>
              </form>
            )}
          </div>

          {/* Bottom note */}
          <p className="text-center text-xs text-gray-400 mt-6">
            1인 1계정 기준으로 운영됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
