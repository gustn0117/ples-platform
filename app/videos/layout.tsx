import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '미디어 리워드',
  description: '미디어를 시청하고 스타를 받으세요. PLES에서 아티스트의 영상 콘텐츠를 감상하고 리워드를 적립할 수 있습니다.',
  openGraph: {
    title: '미디어 리워드 | PLES',
    description: '미디어를 시청하고 스타를 받으세요.',
  },
}

export default function VideosLayout({ children }: { children: React.ReactNode }) {
  return children
}
