'use client';

import Link from 'next/link';
import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

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

function useFadeInOnScroll() {
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
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

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
      icon: '\u{1F5F3}\uFE0F',
      title: '투표',
      desc: '매일 투표에 참여하고 포인트를 적립하세요',
      href: '/vote',
    },
    {
      icon: '\u{1F3A4}',
      title: '아티스트',
      desc: '좋아하는 아티스트에게 투자하고 응원하세요',
      href: '/artists',
    },
    {
      icon: '\u{1F6CD}\uFE0F',
      title: '마켓',
      desc: '한정판 아트워크와 굿즈를 만나보세요',
      href: '/artworks',
    },
    {
      icon: '\u{1F3AC}',
      title: '영상 리워드',
      desc: '영상을 시청하고 포인트를 받으세요',
      href: '/videos',
    },
    {
      icon: '\u{1F3C6}',
      title: '랭킹',
      desc: '인기 아티스트 순위를 확인하세요',
      href: '/ranking',
    },
    {
      icon: '\u{1F4B0}',
      title: '포인트',
      desc: '포인트를 충전하고 다양한 혜택을 누리세요',
      href: '/points',
    },
  ];

  return (
    <div className="overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-64px)] flex items-center">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        {/* Subtle top-to-bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              팬이 만드는
              <br />
              아티스트 플랫폼
            </h1>

            <p className="mt-8 text-lg text-gray-400 leading-relaxed max-w-lg">
              투표하고, 응원하고, 시청하면서 포인트를 쌓는
              <br />
              새로운 참여형 아티스트 플랫폼
            </p>

            <div className="mt-10 flex items-center gap-4">
              <Link
                href={user ? '/vote' : '/login'}
                className="inline-flex items-center justify-center px-7 py-3.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                지금 시작하기
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center px-7 py-3.5 bg-white text-gray-900 text-sm font-medium rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                더 알아보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div
            className={`grid grid-cols-1 sm:grid-cols-3 transition-all duration-700 ${
              statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {[
              { label: '아티스트 투표', value: voteCount.value, suffix: '+' },
              { label: '등록 아티스트', value: artistNum.value, suffix: '+' },
              { label: '포인트 지급', value: pointCount.value, suffix: '+' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`text-center py-8 ${
                  i < 2 ? 'sm:border-r sm:border-gray-100' : ''
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                  {stat.value.toLocaleString()}
                  <span className="text-gray-300">{stat.suffix}</span>
                </div>
                <p className="mt-2 text-sm text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div
          ref={featuresSection.ref}
          className={`max-w-5xl mx-auto px-6 sm:px-8 transition-all duration-700 ${
            featuresSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              플랫폼 기능
            </h2>
            <p className="mt-3 text-gray-400">
              팬과 아티스트를 연결하는 다양한 기능을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-md transition-all duration-300"
                style={{
                  transitionDelay: featuresSection.isVisible ? `${index * 50}ms` : '0ms',
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOT Artists Section */}
      <section className="py-20">
        <div
          ref={hotSection.ref}
          className={`max-w-5xl mx-auto px-6 sm:px-8 transition-all duration-700 ${
            hotSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                HOT 아티스트
              </h2>
              <p className="mt-3 text-gray-400">
                지금 가장 인기있는 아티스트를 만나보세요
              </p>
            </div>
            <Link
              href="/artists"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors"
            >
              전체보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {artistsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {hotArtists.map((artist, index) => (
                <Link
                  key={artist.id}
                  href="/artists"
                  className="group rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 bg-white"
                >
                  <div className="relative aspect-square bg-gray-50 flex items-center justify-center">
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                      {artist.emoji || '\u{1F3B5}'}
                    </span>
                    {index < 3 && (
                      <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm">{artist.name}</h3>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                        {artist.genre}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {artist.likes?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-2xl border border-gray-100 bg-gray-50">
              <p className="text-gray-400">아직 등록된 아티스트가 없습니다</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div
          ref={ctaSection.ref}
          className={`max-w-5xl mx-auto px-6 sm:px-8 text-center transition-all duration-700 ${
            ctaSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="py-16 rounded-3xl bg-gray-50 border border-gray-100">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              지금 바로 참여하세요
            </h2>
            <p className="mt-4 text-gray-400">
              가입하고 첫 투표에 참여하면 바로 포인트를 받을 수 있어요
            </p>
            <div className="mt-8">
              <Link
                href={user ? '/vote' : '/login'}
                className="inline-flex items-center justify-center px-8 py-3.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                무료로 시작하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
