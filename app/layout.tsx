import type { Metadata } from 'next'
import Providers from '@/components/Providers'
import LayoutShell from '@/components/LayoutShell'
import './globals.css'

export const metadata: Metadata = {
  title: 'PLES - 우리가 만드는 월드 아티스트',
  description:
    'PLES는 우리가 직접 참여하여 아티스트를 응원하고 성장시키는 플랫폼입니다. 투표, 갤러리, 랭킹 등 다양한 기능을 통해 함께합니다.',
  keywords: ['PLES', '아티스트', '투표', '랭킹', 'K-POP', '월드 아티스트'],
  openGraph: {
    title: 'PLES - 우리가 만드는 월드 아티스트',
    description:
      '우리가 직접 참여하여 아티스트를 응원하고 성장시키는 플랫폼',
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
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  )
}
