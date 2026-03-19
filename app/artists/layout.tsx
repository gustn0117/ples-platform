import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '아티스트',
  description: 'PLES에서 활동하는 아티스트를 만나보세요. 좋아하는 아티스트에게 스타를 보내고 응원하세요.',
  openGraph: {
    title: '아티스트 | PLES',
    description: 'PLES에서 활동하는 아티스트를 만나보세요.',
  },
}

export default function ArtistsLayout({ children }: { children: React.ReactNode }) {
  return children
}
