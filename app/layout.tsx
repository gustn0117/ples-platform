import type { Metadata } from 'next'
import Providers from '@/components/Providers'
import LayoutShell from '@/components/LayoutShell'
import './globals.css'

const SITE_URL = process.env.SITE_URL || 'https://ples.world'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PLES - 우리가 만드는 월드 아티스트',
    template: '%s | PLES',
  },
  description:
    'PLES는 우리가 직접 참여하여 아티스트를 응원하고 성장시키는 플랫폼입니다. 투표, 갤러리, 랭킹 등 다양한 기능을 통해 함께합니다.',
  keywords: ['PLES', '아티스트', '투표', '랭킹', 'K-POP', '월드 아티스트', '아이돌', '팬 투표', '아티스트 응원'],
  openGraph: {
    title: 'PLES - 우리가 만드는 월드 아티스트',
    description: '우리가 직접 참여하여 아티스트를 응원하고 성장시키는 플랫폼',
    type: 'website',
    url: SITE_URL,
    siteName: 'PLES',
    locale: 'ko_KR',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // 네이버 서치어드바이저 인증 코드를 여기에 입력하세요
    // other: { 'naver-site-verification': 'YOUR_NAVER_CODE_HERE' },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link rel="alternate" type="application/rss+xml" title="PLES RSS Feed" href="/api/feed" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'PLES',
              url: SITE_URL,
              description: 'PLES는 우리가 직접 참여하여 아티스트를 응원하고 성장시키는 플랫폼입니다.',
              inLanguage: 'ko',
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/artists?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'PLES',
              url: SITE_URL,
              sameAs: ['https://www.instagram.com/ples.lab/'],
              description: '우리가 직접 참여하여 아티스트를 응원하고 성장시키는 플랫폼',
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-white font-sans text-gray-900 antialiased">
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  )
}
