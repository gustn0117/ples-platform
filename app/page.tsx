'use client';

import Link from 'next/link';
import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import {
  IconVote,
  IconMicrophone,
  IconShoppingBag,
  IconPlay,
  IconTrophy,
  IconCoin,
  IconUsers,
  IconArrowRight,
  IconTrendingUp,
  IconSparkle,
  IconHeart,
} from '@/components/icons';

interface Artist {
  id: string;
  name: string;
  emoji: string;
  genre: string;
  likes: number;
}

function useAnimatedNumber(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  const start = useCallback(() => setStarted(true), []);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [started, target, duration]);

  return { value, start };
}

function useFadeInOnScroll(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

export default function Home() {
  const { user } = useAuth();
  const [hotArtists, setHotArtists] = useState<Artist[]>([]);
  const [artistsLoading, setArtistsLoading] = useState(true);

  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  const voteCount = useAnimatedNumber(15000, 2000);
  const artistNum = useAnimatedNumber(30, 1800);
  const pointCount = useAnimatedNumber(100000, 2500);

  const featuresSection = useFadeInOnScroll();
  const hotSection = useFadeInOnScroll();
  const ctaSection = useFadeInOnScroll();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          voteCount.start();
          artistNum.start();
          pointCount.start();
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function fetchHotArtists() {
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('id, name, emoji, genre, likes')
          .order('likes', { ascending: false })
          .limit(5);

        if (!error && data) {
          setHotArtists(data);
        }
      } catch (err) {
        console.error('아티스트 로딩 실패:', err);
      } finally {
        setArtistsLoading(false);
      }
    }

    fetchHotArtists();
  }, []);

  const features = [
    {
      icon: IconVote,
      title: '투표',
      desc: '매일 투표에 참여하고 포인트를 적립하세요',
      href: '/vote',
      accent: 'from-gray-900 to-gray-700',
    },
    {
      icon: IconMicrophone,
      title: '아티스트',
      desc: '좋아하는 아티스트에게 투자하고 응원하세요',
      href: '/artists',
      accent: 'from-gray-800 to-gray-600',
    },
    {
      icon: IconShoppingBag,
      title: '마켓',
      desc: '한정판 아트워크와 굿즈를 만나보세요',
      href: '/artworks',
      accent: 'from-gray-700 to-gray-500',
    },
    {
      icon: IconPlay,
      title: '영상 리워드',
      desc: '영상을 시청하고 포인트를 받으세요',
      href: '/videos',
      accent: 'from-gray-900 to-gray-700',
    },
    {
      icon: IconTrophy,
      title: '랭킹',
      desc: '인기 아티스트 순위를 확인하세요',
      href: '/ranking',
      accent: 'from-gray-800 to-gray-600',
    },
    {
      icon: IconCoin,
      title: '포인트',
      desc: '포인트를 충전하고 다양한 혜택을 누리세요',
      href: '/points',
      accent: 'from-gray-700 to-gray-500',
    },
  ];

  const statItems = [
    { label: '아티스트 투표', value: voteCount.value, suffix: '+', icon: IconVote },
    { label: '등록 아티스트', value: artistNum.value, suffix: '+', icon: IconUsers },
    { label: '포인트 지급', value: pointCount.value, suffix: '+', icon: IconCoin },
  ];

  return (
    <div className="overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center overflow-hidden">
        {/* Animated grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Floating decorative elements */}
        <div className="absolute top-1/4 right-[15%] w-64 h-64 rounded-full bg-gray-100/50 blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/3 left-[10%] w-48 h-48 rounded-full bg-gray-200/30 blur-3xl animate-float-reverse" />
        <div className="absolute top-[15%] left-[20%] w-2 h-2 rounded-full bg-gray-400/30 animate-float" />
        <div className="absolute top-[40%] right-[25%] w-1.5 h-1.5 rounded-full bg-gray-300/40 animate-float-slow" />
        <div className="absolute bottom-[30%] right-[15%] w-1 h-1 rounded-full bg-gray-400/20 animate-float-reverse" />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 py-20">
          <div className="max-w-3xl">
            {/* Label badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 mb-8 animate-fade-in-up">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-900 animate-pulse" />
              <span className="text-xs font-medium text-gray-500 tracking-wide">팬 참여형 아티스트 플랫폼</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight text-gray-900 leading-[1.05]">
              팬이 만드는
              <br />
              <span className="relative inline-block">
                아티스트
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-gray-200" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M0 8 Q50 0, 100 8 Q150 16, 200 8" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span>
              <br />
              <span className="gradient-text-elegant">플랫폼</span>
            </h1>

            <p className="mt-10 text-lg sm:text-xl text-gray-400 leading-relaxed max-w-lg">
              투표하고, 응원하고, 시청하면서 포인트를 쌓는
              <br className="hidden sm:block" />
              새로운 참여형 아티스트 플랫폼
            </p>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Link
                href={user ? '/vote' : '/login'}
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gray-900 text-white text-sm font-medium rounded-2xl hover:bg-black transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5"
              >
                지금 시작하기
                <IconArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 text-sm font-medium rounded-2xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm transition-all duration-300"
              >
                더 알아보기
                <svg className="w-4 h-4 text-gray-400 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-16 flex items-center gap-6">
              <div className="flex -space-x-2">
                {['A', 'B', 'C', 'D'].map((letter, i) => (
                  <div
                    key={letter}
                    className="w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-semibold flex items-center justify-center border-2 border-white"
                    style={{ zIndex: 4 - i }}
                  >
                    {letter}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold flex items-center justify-center border-2 border-white">
                  +99
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">1,000+</p>
                <p className="text-xs text-gray-400">팬들이 참여 중</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-300 to-transparent" />
        </div>
      </section>

      {/* Marquee Band */}
      <div className="py-6 bg-gray-50 border-y border-gray-100 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12">
          {[...Array(2)].map((_, setIndex) => (
            <div key={setIndex} className="flex items-center gap-12 shrink-0">
              {['투표', '아티스트', '마켓', '영상 리워드', '랭킹', '포인트', '커뮤니티', '응원'].map((text) => (
                <span key={`${setIndex}-${text}`} className="text-sm font-medium text-gray-300 flex items-center gap-3">
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <section ref={statsRef} className="py-28">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0 transition-all duration-700 ${
              statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {statItems.map((stat, i) => (
              <div
                key={stat.label}
                className={`text-center py-10 ${
                  i < 2 ? 'sm:border-r sm:border-gray-100' : ''
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="flex items-center justify-center mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight tabular-nums">
                  {stat.value.toLocaleString()}
                  <span className="text-gray-300 ml-0.5">{stat.suffix}</span>
                </div>
                <p className="mt-3 text-sm text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-28 bg-gray-50/50">
        <div
          ref={featuresSection.ref}
          className={`max-w-6xl mx-auto px-6 sm:px-8 transition-all duration-700 ${
            featuresSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-xs font-medium text-gray-500 mb-6">
              <IconSparkle className="w-3.5 h-3.5" />
              Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              팬과 아티스트를 연결하는
              <br className="hidden sm:block" />
              <span className="gradient-text-elegant">다양한 기능</span>
            </h2>
            <p className="mt-4 text-gray-400 max-w-md mx-auto">
              투표, 응원, 시청 등 다양한 활동으로 포인트를 적립하세요
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group relative bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-500 flex flex-col overflow-hidden"
                style={{
                  transitionDelay: featuresSection.isVisible ? `${index * 60}ms` : '0ms',
                }}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/0 to-gray-100/0 group-hover:from-gray-50/50 group-hover:to-gray-100/30 transition-all duration-500 rounded-2xl" />

                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.accent} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed flex-1">
                    {feature.desc}
                  </p>
                  <div className="mt-6 flex items-center gap-1 text-sm text-gray-300 group-hover:text-gray-600 transition-colors">
                    <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">바로가기</span>
                    <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOT Artists Section */}
      <section className="py-28">
        <div
          ref={hotSection.ref}
          className={`max-w-6xl mx-auto px-6 sm:px-8 transition-all duration-700 ${
            hotSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-xs font-medium text-gray-500 mb-5">
                <IconTrendingUp className="w-3.5 h-3.5" />
                Trending Now
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                HOT 아티스트
              </h2>
              <p className="mt-3 text-gray-400">
                지금 가장 인기있는 아티스트를 만나보세요
              </p>
            </div>
            <Link
              href="/artists"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300"
            >
              전체보기
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {artistsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="aspect-square bg-gray-50 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-3 bg-gray-50 rounded-lg animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : hotArtists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {hotArtists.map((artist, index) => (
                <Link
                  key={artist.id}
                  href="/artists"
                  className="group rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-500 bg-white hover:-translate-y-1"
                  style={{ transitionDelay: `${index * 60}ms` }}
                >
                  <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    {/* Letter avatar */}
                    <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-110 group-hover:rounded-xl transition-all duration-500">
                      {artist.name?.charAt(0) || '?'}
                    </div>
                    {/* Rank badge */}
                    <div className={`absolute top-3 left-3 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-gray-900 text-white' :
                      index < 3 ? 'bg-gray-200 text-gray-700' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    {/* Like count */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] text-gray-400 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <IconHeart className="w-3 h-3" />
                      {artist.likes?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm group-hover:text-gray-700 transition-colors">{artist.name}</h3>
                    <span className="inline-block mt-1.5 text-[11px] text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-full">
                      {artist.genre}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-2xl border border-gray-100 bg-gray-50">
              <p className="text-gray-400">아직 등록된 아티스트가 없습니다</p>
            </div>
          )}

          {/* Mobile view all link */}
          <div className="sm:hidden mt-6 text-center">
            <Link
              href="/artists"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
            >
              전체 아티스트 보기
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28">
        <div
          ref={ctaSection.ref}
          className={`max-w-5xl mx-auto px-6 sm:px-8 text-center transition-all duration-700 ${
            ctaSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="relative py-24 px-8 rounded-3xl bg-gray-900 overflow-hidden">
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gray-700/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-gray-300 mb-8">
                <IconSparkle className="w-3.5 h-3.5" />
                Get Started
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
                지금 바로
                <br />
                참여하세요
              </h2>
              <p className="mt-5 text-gray-400 max-w-md mx-auto">
                가입하고 첫 투표에 참여하면 바로 포인트를 받을 수 있어요
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={user ? '/vote' : '/login'}
                  className="group inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-white text-gray-900 text-sm font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
                >
                  무료로 시작하기
                  <IconArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/artists"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium text-gray-300 rounded-2xl border border-gray-700 hover:border-gray-500 hover:text-white transition-all duration-300"
                >
                  아티스트 둘러보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
