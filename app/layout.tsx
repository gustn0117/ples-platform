import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'PLES - 참여형 아티스트 플랫폼',
  description: '팬이 투표하고, 아티스트를 응원하고, 작품을 구매하고, 영상을 시청하면서 포인트를 쌓는 참여형 아티스트 플랫폼',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
