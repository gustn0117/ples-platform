import type { Metadata } from 'next'
import Providers from '@/components/Providers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'PLES - 팬이 만드는 아티스트 플랫폼',
  description:
    'PLES는 팬이 직접 참여하여 아티스트를 응원하고 성장시키는 플랫폼입니다. 투표, 마켓, 랭킹 등 다양한 기능을 통해 팬과 아티스트가 함께합니다.',
  keywords: ['PLES', '팬 플랫폼', '아티스트', '투표', '랭킹', 'K-POP'],
  openGraph: {
    title: 'PLES - 팬이 만드는 아티스트 플랫폼',
    description:
      '팬이 직접 참여하여 아티스트를 응원하고 성장시키는 플랫폼',
    type: 'website',
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
      </head>
      <body className="min-h-screen bg-white font-sans text-gray-900 antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
