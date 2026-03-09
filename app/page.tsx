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

  const artistCount = useAnimatedNumber(128, 2000);
  const voteCount = useAnimatedNumber(45230, 2500);
  const fanCount = useAnimatedNumber(3847, 2200);

  const featuresSection = useFadeInOnScroll();
  const hotSection = useFadeInOnScroll();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          artistCount.start();
          voteCount.start();
          fanCount.start();
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
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
      icon: '🗳️',
      title: '투표',
      desc: '매일 투표에 참여하고 포인트를 적립하세요',
      href: '/vote',
      gradient: 'from-gray-500 to-gray-700',
    },
    {
      icon: '🎤',
      title: '아티스트',
      desc: '좋아하는 아티스트에게 투자하고 응원하세요',
      href: '/artists',
      gradient: 'from-gray-400 to-gray-600',
    },
    {
      icon: '🛍️',
      title: '마켓',
      desc: '한정판 아트워크와 굿즈를 만나보세요',
      href: '/artworks',
      gradient: 'from-gray-500 to-gray-700',
    },
    {
      icon: '🎬',
      title: '영상 리워드',
      desc: '영상을 시청하고 포인트를 받으세요',
      href: '/videos',
      gradient: 'from-gray-400 to-gray-600',
    },
    {
      icon: '🏆',
      title: '랭킹',
      desc: '인기 아티스트 순위를 확인하세요',
      href: '/ranking',
      gradient: 'from-gray-500 to-gray-700',
    },
    {
      icon: '💰',
      title: '포인트',
      desc: '포인트를 충전하고 다양한 혜택을 누리세요',
      href: '/points',
      gradient: 'from-gray-400 to-gray-600',
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-ples-silver/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gray-400/5 rounded-full blur-[120px]" />
          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gray-400/40 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-ples-gold/30 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-ples-gold/20 rounded-full animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 section-container py-20 w-full">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-gray-300 mb-8 animate-slideUp">
              <span className="w-2 h-2 bg-ples-green rounded-full animate-pulse" />
              시즌 1 진행중
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold leading-tight mb-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              팬이 만드는{' '}
              <span className="gradient-text-primary">
                아티스트 플랫폼
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed animate-slideUp" style={{ animationDelay: '0.2s' }}>
              투표하고, 응원하고, 구매하고, 시청하면서
              <br />
              포인트를 쌓는 참여형 플랫폼 <span className="text-white font-semibold">PLES</span>
            </p>

            <div className="animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <Link
                href={user ? '/vote' : '/login'}
                className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg animate-pulse-glow"
              >
                지금 시작하기
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-white/40 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section ref={statsRef} className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
        <div className="relative section-container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: '총 아티스트', value: artistCount.value, suffix: '명', icon: '🎤' },
              { label: '누적 투표수', value: voteCount.value, suffix: '회', icon: '🗳️' },
              { label: '활동 팬 수', value: fanCount.value, suffix: '명', icon: '💜' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`text-center p-8 rounded-2xl glass card-hover transition-all duration-700 ${
                  statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="text-4xl mb-3 block">{stat.icon}</span>
                <div className="text-4xl font-bold gradient-text-primary mb-2">
                  {stat.value.toLocaleString()}
                  <span className="text-lg ml-1 text-gray-400">{stat.suffix}</span>
                </div>
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-20">
        <div
          ref={featuresSection.ref}
          className={`section-container transition-all duration-700 ${
            featuresSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">PLES의 핵심 기능</h2>
            <p className="text-gray-500">팬과 아티스트를 연결하는 다양한 기능을 제공합니다</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group relative glass rounded-2xl p-6 card-hover overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                <div className="mt-4 flex items-center text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  자세히 보기
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOT 아티스트 Section */}
      <section className="py-20">
        <div
          ref={hotSection.ref}
          className={`section-container transition-all duration-700 ${
            hotSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔥</span>
                <h2 className="text-3xl sm:text-4xl font-bold">HOT 아티스트</h2>
              </div>
              <p className="text-gray-500">지금 가장 인기있는 아티스트를 만나보세요</p>
            </div>
            <Link
              href="/artists"
              className="hidden sm:flex items-center gap-1 text-white font-medium text-sm hover:text-gray-400 transition-colors"
            >
              전체보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {artistsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden glass">
                  <div className="aspect-square bg-white/5 animate-pulse rounded-t-2xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 bg-white/5 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : hotArtists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {hotArtists.map((artist, index) => (
                <Link
                  key={artist.id}
                  href="/artists"
                  className="group glass rounded-2xl overflow-hidden card-hover"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative aspect-square bg-gradient-to-br from-white/10 via-ples-silver/5 to-ples-gold/5 flex items-center justify-center">
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                      {artist.emoji || '🎵'}
                    </span>
                    {index < 3 && (
                      <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {index + 1}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold group-hover:text-white transition-colors">{artist.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{artist.genre}</p>
                    <div className="flex items-center gap-1 text-sm text-ples-gold">
                      <span>💜</span>
                      <span className="font-semibold">{artist.likes?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass rounded-2xl">
              <span className="text-5xl mb-4 block">🎵</span>
              <p className="text-gray-500">아직 등록된 아티스트가 없습니다</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
          <div className="absolute bottom-10 right-20 w-48 h-48 bg-ples-silver/10 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">지금 바로 시작하세요</h2>
          <p className="text-gray-400 mb-8 text-lg">가입하고 첫 투표에 참여하면 바로 포인트를 받을 수 있어요</p>
          <Link
            href={user ? '/vote' : '/login'}
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg"
          >
            무료로 시작하기
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
