'use client';

import Link from 'next/link';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { initStore, getArtists, getActiveBanners } from '@/lib/store';
import type { Banner } from '@/lib/mock-data';
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
  IconStar,
} from '@/components/icons';

interface Artist {
  id: string;
  name: string;
  genre: string;
  likes: number;
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
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerPage, setBannerPage] = useState(0);

  const featuresSection = useFadeInOnScroll();
  const hotSection = useFadeInOnScroll();
  const ctaSection = useFadeInOnScroll();

  useEffect(() => {
    initStore();
    const allArtists = getArtists();
    const top5 = [...allArtists]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5)
      .map((a) => ({ id: String(a.id), name: a.name, genre: a.genre, likes: a.likes }));
    setHotArtists(top5);
    setArtistsLoading(false);

    // Fetch banners directly from server to avoid localStorage size limits
    fetch('/api/store')
      .then((res) => res.json())
      .then((data) => {
        const allBanners: Banner[] = data.banners ?? [];
        const active = allBanners
          .filter((b) => b.isActive)
          .sort((a, b) => a.order - b.order);
        setBanners(active);
      })
      .catch(() => {
        // Fallback to localStorage
        setBanners(getActiveBanners());
      });
  }, []);

  // Total pages (2 banners per page)
  const totalBannerPages = Math.ceil(banners.length / 2);

  // Auto-rotate banners
  useEffect(() => {
    if (totalBannerPages <= 1) return;
    const interval = setInterval(() => {
      setBannerPage((prev) => (prev + 1) % totalBannerPages);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalBannerPages]);

  const features = [
    {
      icon: IconVote,
      title: '투표',
      desc: '매일 투표에 참여하고 스타를 적립하세요',
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
      title: '갤러리',
      desc: '한정판 아트워크와 굿즈를 만나보세요',
      href: '/artworks',
      accent: 'from-gray-700 to-gray-500',
    },
    {
      icon: IconPlay,
      title: '미디어 리워드',
      desc: '미디어를 시청하고 스타를 받으세요',
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
      title: '스타',
      desc: '스타를 충전하고 다양한 혜택을 누리세요',
      href: '/points',
      accent: 'from-gray-700 to-gray-500',
    },
  ];

  const rankMedals = ['#111827', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'];

  return (
    <div className="overflow-hidden bg-white">
      {/* =============================================
          HERO SECTION — Split layout with glowing orb
          ============================================= */}
      <section className="relative min-h-[calc(100vh-64px)] flex flex-col overflow-hidden noise-overlay">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 mesh-gradient-1 pointer-events-none" />

        {/* ---- Banner Carousel (inside hero) ---- */}
        {banners.length > 0 && (
          <div className="relative z-20 pt-6 pb-2">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                  style={{ transform: `translateX(-${bannerPage * 100}%)` }}
                >
                  {Array.from({ length: totalBannerPages }).map((_, pageIdx) => {
                    const pageBanners = banners.slice(pageIdx * 2, pageIdx * 2 + 2);
                    return (
                      <div key={pageIdx} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full shrink-0">
                        {pageBanners.map((banner) => {
                          const isLight = banner.textColor === 'light';
                          const Wrapper = banner.link ? Link : 'div';
                          const wrapperProps = banner.link ? { href: banner.link } : {};
                          return (
                            <Wrapper
                              key={banner.id}
                              {...(wrapperProps as any)}
                              className="group relative rounded-2xl overflow-hidden p-7 sm:p-9 min-h-[200px] sm:min-h-[240px] flex flex-col justify-end transition-all duration-500 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                              style={{ backgroundColor: banner.bgColor }}
                            >
                              {banner.bgImage && (
                                <div
                                  className="absolute inset-0 bg-cover bg-center"
                                  style={{ backgroundImage: `url(${banner.bgImage})` }}
                                />
                              )}
                              {banner.bgImage && (
                                <div className={`absolute inset-0 ${isLight ? 'bg-gradient-to-t from-black/60 via-black/20 to-transparent' : 'bg-gradient-to-t from-white/80 via-white/40 to-transparent'}`} />
                              )}
                              {!banner.bgImage && <div className="absolute inset-0 dot-pattern opacity-[0.04] pointer-events-none" />}
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.04] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

                              <h3 className={`relative z-10 text-lg sm:text-xl font-bold leading-tight ${isLight ? 'text-white' : 'text-gray-900'}`}>
                                {banner.title}
                              </h3>
                              <p className={`relative z-10 mt-1.5 text-xs sm:text-sm leading-relaxed ${isLight ? 'text-white/60' : 'text-gray-500'}`}>
                                {banner.subtitle}
                              </p>
                              {banner.link && (
                                <div className={`relative z-10 mt-3 flex items-center gap-1.5 text-xs font-semibold ${isLight ? 'text-white/40 group-hover:text-white/70' : 'text-gray-400 group-hover:text-gray-700'} transition-colors duration-300`}>
                                  자세히 보기
                                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              )}
                            </Wrapper>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination dots */}
              {totalBannerPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  {Array.from({ length: totalBannerPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setBannerPage(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === bannerPage ? 'w-6 bg-gray-900' : 'w-1.5 bg-gray-200 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent z-10" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 flex-1 flex items-center">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Content */}
            <div>
              {/* Badge with animated border glow */}
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gray-50 border border-gray-200 mb-10 animate-fade-in-up animated-border-glow">
                <span className="relative w-2 h-2 rounded-full bg-gray-900">
                  <span className="absolute inset-0 rounded-full bg-gray-900 ring-pulse" />
                </span>
                <span className="text-xs font-semibold text-gray-600 tracking-wider uppercase">
                  우리가 만드는 월드 아티스트
                </span>
              </div>

              {/* Heading with glowing orb */}
              <div className="relative">
                {/* Glowing orb behind heading */}
                <div
                  className="absolute -top-20 -left-20 w-80 h-80 rounded-full pointer-events-none animate-pulse-glow"
                  style={{
                    background: 'radial-gradient(circle, rgba(17,24,39,0.06) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                  }}
                />
                <h1 className="relative text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                  <span className="whitespace-nowrap">우리가 만드는</span>
                  <br />
                  <span className="relative inline-block">
                    <span className="whitespace-nowrap">월드 아티스트</span>
                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-gray-300" viewBox="0 0 200 12" preserveAspectRatio="none">
                      <path d="M0 8 Q50 0, 100 8 Q150 16, 200 8" stroke="currentColor" strokeWidth="3" fill="none" />
                    </svg>
                  </span>
                </h1>
              </div>

              <p className="mt-10 text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed max-w-lg">
                투표하고, 응원하고, 시청하면서
                <br className="hidden sm:block" />
                스타를 쌓는 새로운 참여형 플랫폼
              </p>

              <div className="mt-12 flex flex-wrap items-center gap-3">
                <Link
                  href={user ? '/vote' : '/login'}
                  className="group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-all duration-300 hover:shadow-lg hover:shadow-black/15 hover:-translate-y-0.5 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.07] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative z-10 flex items-center gap-2">
                    지금 시작하기
                    <IconArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </span>
                </Link>
                <Link
                  href="#features"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-gray-500 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all duration-300"
                >
                  더 알아보기
                  <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 group-hover:translate-y-0.5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="w-9 h-9 rounded-full bg-gray-900 text-white text-xs font-semibold flex items-center justify-center border-2 border-white shadow-md"
                      style={{ zIndex: 4 - i }}
                    >
                      {letter}
                    </div>
                  ))}
                  <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold flex items-center justify-center border-2 border-white shadow-sm">
                    +99
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">1,000+</p>
                  <p className="text-xs text-gray-400">팬들이 참여 중</p>
                </div>
              </div>
            </div>

            {/* Right — Decorative abstract composition */}
            <div className="hidden lg:block relative h-[560px]">
              {/* Large dark circle with inner content */}
              <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-gray-900 animate-float-slow shadow-2xl overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/10 text-8xl font-black">P</span>
                </div>
              </div>

              {/* Floating card — Vote preview */}
              <div className="absolute top-20 right-72 w-48 bg-white rounded-2xl border border-gray-100 p-4 shadow-lg animate-float-reverse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center">
                    <IconVote className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">오늘의 투표</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gray-900 rounded-full" />
                </div>
                <p className="mt-2 text-[10px] text-gray-400">1,234명 참여</p>
              </div>

              {/* Floating card — Points preview */}
              <div className="absolute bottom-32 right-64 w-44 bg-white rounded-2xl border border-gray-100 p-4 shadow-lg animate-float">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center">
                    <IconCoin className="w-4 h-4 text-gray-700" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">적립 스타</span>
                    <span className="text-sm font-bold text-gray-900">2,500P</span>
                  </div>
                </div>
              </div>

              {/* Floating card — Top Artist preview */}
              <div className="absolute top-64 right-[22rem] w-40 bg-white rounded-2xl border border-gray-100 p-3 shadow-lg animate-float-slow" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    A
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-400 block">Top Artist</span>
                    <span className="text-xs font-bold text-gray-900 block truncate">Artist Name</span>
                  </div>
                  <div className="ml-auto shrink-0">
                    <IconTrophy className="w-3.5 h-3.5 text-gray-300" />
                  </div>
                </div>
              </div>

              {/* Small circle */}
              <div className="absolute top-72 right-8 w-32 h-32 rounded-full bg-gray-100 animate-float inner-shadow" />

              {/* Tall rounded rect */}
              <div className="absolute top-48 right-44 w-28 h-56 rounded-[2rem] bg-gray-900/80 animate-float-slow overflow-hidden">
                <div className="absolute inset-0 line-pattern opacity-30" />
              </div>

              {/* Tiny circles */}
              <div className="absolute top-8 right-[22rem] w-16 h-16 rounded-full bg-gray-100 animate-float inner-shadow" />
              <div className="absolute bottom-4 right-[22rem] w-20 h-20 rounded-full bg-gray-900/60 animate-float" />

              {/* Wide rounded rect */}
              <div className="absolute bottom-8 right-12 w-52 h-24 rounded-3xl bg-gray-200 animate-float-reverse inner-shadow overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-30" />
              </div>

              {/* Dot accents */}
              <div className="absolute top-36 right-2 w-4 h-4 rounded-full bg-gray-300 animate-float" />
              <div className="absolute bottom-28 right-0 w-3 h-3 rounded-full bg-gray-400 animate-float-reverse" />
              <div className="absolute top-4 right-36 w-2 h-2 rounded-full bg-gray-400 animate-float" />
            </div>
          </div>
        </div>

        {/* Scroll indicator with bounce */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 z-10 animate-scroll-bounce">
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-300 to-transparent" />
        </div>
      </section>

      {/* =============================================
          TRUSTED BY — Marquee brand logos
          ============================================= */}
      <section className="py-16 border-y border-gray-100 bg-gray-50/50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 mb-10">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-300">
            Trusted by leading partners
          </p>
        </div>
        <div className="relative marquee-container">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50/80 to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee whitespace-nowrap flex items-center gap-16">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex items-center gap-16 shrink-0">
                {['BRAND A', 'BRAND B', 'BRAND C', 'BRAND D', 'BRAND E', 'BRAND F', 'BRAND G', 'BRAND H'].map((brand) => (
                  <span
                    key={`${setIndex}-${brand}`}
                    className="text-xl sm:text-2xl font-black tracking-tight text-gray-200 hover:text-gray-400 transition-colors duration-300 select-none"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          FEATURES SECTION — Bento grid layout
          ============================================= */}
      <section id="features" className="relative py-28 bg-gray-50/50 overflow-hidden">
        {/* Decorative gradient blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-gray-200/30 to-gray-100/10 blur-3xl pointer-events-none" />

        <div
          ref={featuresSection.ref}
          className={`relative z-10 max-w-6xl mx-auto px-6 sm:px-8 transition-all duration-700 ${
            featuresSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-100 text-xs font-semibold text-gray-500 mb-6 shadow-sm">
              <IconSparkle className="w-3.5 h-3.5" />
              Features
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              팬과 아티스트를 연결하는
              <br className="hidden sm:block" />
              <span className="gradient-text-elegant">다양한 기능</span>
            </h2>
            <p className="mt-5 text-gray-400 max-w-md mx-auto text-lg">
              투표, 응원, 시청 등 다양한 활동으로 스타를 적립하세요
            </p>
          </div>

          {/* Bento Grid: first card spans 2 cols, last card spans 2 cols */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => {
              const isFirst = index === 0;
              const isLast = index === features.length - 1;
              const spanTwo = isFirst || isLast;

              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className={`group relative bg-white rounded-3xl border border-gray-100 hover:border-gray-200 transition-all duration-500 flex flex-col overflow-hidden shimmer-card ${
                    spanTwo ? 'lg:col-span-2 p-10 sm:p-12' : 'p-8'
                  }`}
                  style={{
                    transitionDelay: featuresSection.isVisible ? `${index * 100}ms` : '0ms',
                    opacity: featuresSection.isVisible ? 1 : 0,
                    transform: featuresSection.isVisible ? 'translateY(0) scale(1)' : 'translateY(2rem) scale(0.97)',
                    transition: `opacity 0.7s ease ${index * 100}ms, transform 0.7s ease ${index * 100}ms, box-shadow 0.5s ease, border-color 0.5s ease`,
                  }}
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50/0 via-transparent to-gray-100/0 group-hover:from-gray-50/80 group-hover:to-gray-100/40 transition-all duration-700 rounded-3xl" />

                  {/* Decorative line-pattern on hover */}
                  <div className="absolute inset-0 line-pattern opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl" />

                  {/* Inner shadow on hover */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.03)' }} />

                  <div className="relative z-10">
                    <div
                      className={`bg-gradient-to-br ${feature.accent} flex items-center justify-center group-hover:scale-110 transition-all duration-500 ${
                        spanTwo ? 'w-20 h-20 rounded-3xl mb-8' : 'w-14 h-14 rounded-2xl mb-6'
                      }`}
                      style={{
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      }}
                    >
                      <feature.icon className={spanTwo ? 'w-9 h-9 text-white' : 'w-6 h-6 text-white'} />
                    </div>
                    <h3 className={`font-bold text-gray-900 ${spanTwo ? 'text-2xl mb-3' : 'text-lg mb-2'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-gray-400 leading-relaxed flex-1 ${spanTwo ? 'text-base max-w-md' : 'text-sm'}`}>
                      {feature.desc}
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-sm text-gray-300 group-hover:text-gray-900 transition-colors duration-300">
                      <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        바로가기
                      </span>
                      <span className="w-7 h-7 rounded-lg bg-transparent group-hover:bg-gray-900 flex items-center justify-center transition-all duration-300">
                        <IconArrowRight className="w-4 h-4 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* =============================================
          HOT ARTISTS SECTION — Featured #1 + grid
          ============================================= */}
      <section className="py-28 relative">
        <div
          ref={hotSection.ref}
          className={`max-w-6xl mx-auto px-6 sm:px-8 transition-all duration-700 ${
            hotSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-500 mb-5">
                <IconTrendingUp className="w-3.5 h-3.5" />
                Trending Now
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                HOT 아티스트
              </h2>
              <p className="mt-3 text-gray-400 text-lg">
                지금 가장 인기있는 아티스트를 만나보세요
              </p>
            </div>
            <Link
              href="/artists"
              className="group hidden sm:inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-900 hover:text-white transition-all duration-300"
            >
              전체보기
              <IconArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
            </Link>
          </div>

          {artistsLoading ? (
            <div className="space-y-5">
              {/* Featured skeleton */}
              <div className="rounded-3xl border border-gray-100 overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-64 aspect-square sm:aspect-auto bg-gray-50 animate-pulse" />
                  <div className="flex-1 p-8 space-y-4">
                    <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-1/3" />
                    <div className="h-4 bg-gray-50 rounded-lg animate-pulse w-1/4" />
                    <div className="h-4 bg-gray-50 rounded-lg animate-pulse w-1/5" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="aspect-square bg-gray-50 animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-100 rounded-lg animate-pulse" />
                      <div className="h-3 bg-gray-50 rounded-lg animate-pulse w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : hotArtists.length > 0 ? (
            <div className="space-y-5">
              {/* Featured #1 Artist — Full width card */}
              {hotArtists[0] && (
                <Link
                  href="/artists"
                  className="group block rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-500 bg-white animated-gradient-border"
                  style={{
                    opacity: hotSection.isVisible ? 1 : 0,
                    transform: hotSection.isVisible ? 'translateY(0)' : 'translateY(1.5rem)',
                    transition: 'opacity 0.6s ease, transform 0.6s ease, box-shadow 0.5s ease, border-color 0.5s ease',
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-stretch">
                    {/* Large avatar area */}
                    <div className="relative w-full sm:w-72 shrink-0 bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center min-h-[200px] sm:min-h-[240px] overflow-hidden">
                      <div className="absolute inset-0 dot-pattern opacity-10" />
                      <div className="w-28 h-28 bg-white/10 backdrop-blur-sm text-white rounded-3xl flex items-center justify-center font-black text-5xl group-hover:scale-110 group-hover:rounded-2xl transition-all duration-500 border border-white/10">
                        {hotArtists[0].name?.charAt(0) || '?'}
                      </div>
                      {/* Gold rank medal for #1 */}
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black text-white shadow-lg"
                          style={{ background: 'linear-gradient(135deg, #b8a07e, #8a7560)' }}
                        >
                          1
                        </div>
                        <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Top Artist</span>
                      </div>
                    </div>
                    {/* Info area */}
                    <div className="flex-1 p-8 sm:p-10 flex flex-col justify-center">
                      <h3 className="font-bold text-gray-900 text-2xl sm:text-3xl group-hover:text-gray-700 transition-colors">
                        {hotArtists[0].name}
                      </h3>
                      <span className="inline-block mt-3 text-xs text-gray-400 bg-gray-50 border border-gray-100 px-4 py-1.5 rounded-full w-fit font-medium">
                        {hotArtists[0].genre}
                      </span>
                      <div className="mt-5 flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-400">
                          <IconStar className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-gray-600">{hotArtists[0].likes?.toLocaleString() || 0}</span>
                          <span className="text-gray-300 ml-1">likes</span>
                        </div>
                      </div>
                      <div className="mt-6 flex items-center gap-1.5 text-sm text-gray-300 group-hover:text-gray-600 transition-colors">
                        <span className="text-xs font-semibold">아티스트 보기</span>
                        <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid for remaining artists */}
              {hotArtists.length > 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  {hotArtists.slice(1).map((artist, index) => {
                    const rankIndex = index + 1;
                    return (
                      <Link
                        key={artist.id}
                        href="/artists"
                        className="group rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-500 bg-white hover:-translate-y-1"
                        style={{
                          opacity: hotSection.isVisible ? 1 : 0,
                          transform: hotSection.isVisible ? 'translateY(0)' : 'translateY(1.5rem)',
                          transition: `opacity 0.6s ease ${(rankIndex) * 100}ms, transform 0.6s ease ${(rankIndex) * 100}ms, box-shadow 0.5s ease, border-color 0.5s ease`,
                        }}
                      >
                        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                          {/* Subtle pattern */}
                          <div className="absolute inset-0 line-pattern opacity-40 pointer-events-none" />
                          {/* Letter avatar */}
                          <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-110 group-hover:rounded-xl transition-all duration-500">
                            {artist.name?.charAt(0) || '?'}
                          </div>
                          {/* Rank medal badge */}
                          <div
                            className="absolute top-3 left-3 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm"
                            style={{
                              backgroundColor: rankMedals[rankIndex] || '#e5e7eb',
                              color: rankIndex <= 2 ? '#fff' : '#6b7280',
                            }}
                          >
                            {rankIndex + 1}
                          </div>
                          {/* Ranking badge overlay on hover */}
                          <div className="rank-badge-overlay">
                            <div className="bg-gray-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                              Top {rankIndex + 1}
                            </div>
                          </div>
                          {/* Like count — more prominent */}
                          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-white backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-md border border-gray-100">
                            <IconStar className="w-3.5 h-3.5 text-gray-500" />
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
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 rounded-3xl border border-gray-100 bg-gray-50 inner-shadow">
              <p className="text-gray-400">아직 등록된 아티스트가 없습니다</p>
            </div>
          )}

          {/* Mobile view all link */}
          <div className="sm:hidden mt-8 text-center">
            <Link
              href="/artists"
              className="group inline-flex items-center justify-center gap-2 w-full max-w-xs px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-black shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              전체 아티스트 보기
              <IconArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* =============================================
          CTA SECTION — Full-bleed dark with particles
          ============================================= */}
      <section className="relative overflow-hidden">
        <div
          ref={ctaSection.ref}
          className={`relative transition-all duration-700 ${
            ctaSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="relative py-36 sm:py-44 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
            {/* Animated gradient background */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%, #f9fafb 100%)',
                backgroundSize: '400% 400%',
                animation: 'gradient-shift 8s ease infinite',
              }}
            />

            {/* Animated floating particles (small dots) */}
            {[
              { top: '10%', left: '8%', size: 3, delay: '0s' },
              { top: '20%', left: '85%', size: 2, delay: '1s' },
              { top: '35%', left: '15%', size: 4, delay: '0.5s' },
              { top: '55%', left: '90%', size: 2, delay: '1.5s' },
              { top: '70%', left: '5%', size: 3, delay: '2s' },
              { top: '80%', left: '75%', size: 2, delay: '0.8s' },
              { top: '15%', left: '45%', size: 2, delay: '1.2s' },
              { top: '60%', left: '30%', size: 3, delay: '0.3s' },
              { top: '45%', left: '70%', size: 2, delay: '1.8s' },
              { top: '85%', left: '50%', size: 3, delay: '0.7s' },
              { top: '25%', left: '60%', size: 2, delay: '2.2s' },
              { top: '75%', left: '20%', size: 4, delay: '1.1s' },
            ].map((particle, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-gray-900/[0.06] animate-float"
                style={{
                  top: particle.top,
                  left: particle.left,
                  width: particle.size,
                  height: particle.size,
                  animationDelay: particle.delay,
                  animationDuration: `${5 + i * 0.5}s`,
                }}
              />
            ))}

            {/* Floating decorative elements */}
            <div className="absolute top-12 left-[10%] w-32 h-32 rounded-full border border-gray-200/60 animate-float-slow" />
            <div className="absolute bottom-16 right-[8%] w-48 h-48 rounded-full border border-gray-200/40 animate-float-reverse" />
            <div className="absolute top-1/2 left-[5%] -translate-y-1/2 w-64 h-64 rounded-full bg-gray-200/20 blur-3xl animate-float" />
            <div className="absolute top-20 right-[20%] w-3 h-3 rounded-full bg-gray-300/40 animate-float" />
            <div className="absolute bottom-24 left-[25%] w-2 h-2 rounded-full bg-gray-300/40 animate-float-reverse" />
            <div className="absolute top-1/3 right-[12%] w-20 h-20 rounded-2xl border border-gray-200/50 rotate-12 animate-float-slow" />
            <div className="absolute top-[15%] left-[18%] w-6 h-6 border border-gray-200/60 animate-spin-slow" />
            <div className="absolute bottom-[20%] right-[15%] w-8 h-8 border border-gray-200/50 rotate-45 animate-spin-reverse-slow" />
            <div className="absolute top-[60%] right-[25%] w-4 h-4 border border-gray-300/50 animate-spin-slow" />
            <div className="absolute bottom-[35%] left-[12%] w-5 h-5 border border-gray-200/50 rotate-12 animate-spin-reverse-slow" />
            <div className="absolute top-[25%] right-[5%] w-24 h-24 rounded-full border border-gray-200/30 animate-float" />
            <div className="absolute bottom-[10%] left-[8%] w-16 h-16 rounded-full border border-gray-200/40 animate-float-reverse" />

            <div className="relative z-10 text-center px-6 sm:px-8">
              <div
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900/5 border border-gray-200 text-xs font-semibold text-gray-500 mb-12"
                style={{
                  opacity: ctaSection.isVisible ? 1 : 0,
                  transform: ctaSection.isVisible ? 'translateY(0)' : 'translateY(1rem)',
                  transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
                }}
              >
                <IconSparkle className="w-3.5 h-3.5" />
                Get Started
              </div>
              <h2
                className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-tight"
                style={{
                  opacity: ctaSection.isVisible ? 1 : 0,
                  transform: ctaSection.isVisible ? 'translateY(0)' : 'translateY(1.5rem)',
                  transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
                }}
              >
                <span
                  className="inline-block text-6xl sm:text-7xl lg:text-9xl"
                  style={{
                    background: 'linear-gradient(120deg, #374151 0%, #111827 40%, #6b7280 60%, #374151 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'text-shine-move 4s ease-in-out infinite',
                  }}
                >
                  지금 바로
                </span>
                <br />
                <span className="text-gray-900 inline-block" style={{ transform: 'translateX(0.15em)', marginTop: '0.1em' }}>참여하세요</span>
              </h2>
              <p
                className="mt-8 text-lg sm:text-xl text-gray-500 max-w-lg mx-auto leading-relaxed"
                style={{
                  opacity: ctaSection.isVisible ? 1 : 0,
                  transform: ctaSection.isVisible ? 'translateY(0)' : 'translateY(1rem)',
                  transition: 'opacity 0.6s ease 0.35s, transform 0.6s ease 0.35s',
                }}
              >
                가입하고 첫 투표에 참여하면 바로 스타를 받을 수 있어요
              </p>
              <div
                className="mt-14 flex flex-wrap items-center justify-center gap-4"
                style={{
                  opacity: ctaSection.isVisible ? 1 : 0,
                  transform: ctaSection.isVisible ? 'translateY(0)' : 'translateY(1rem)',
                  transition: 'opacity 0.6s ease 0.45s, transform 0.6s ease 0.45s',
                }}
              >
                <Link
                  href={user ? '/vote' : '/login'}
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/15 hover:-translate-y-0.5 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative z-10 flex items-center gap-2">
                    무료로 시작하기
                    <IconArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </span>
                </Link>
                <Link
                  href="/artists"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-gray-600 rounded-xl border border-gray-200 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300 hover:shadow-sm"
                >
                  아티스트 둘러보기
                  <IconArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
