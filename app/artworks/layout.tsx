import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '갤러리',
  description: 'PLES 갤러리에서 한정판 아트워크와 굿즈를 만나보세요. 앨범, 포스터, 포토카드 등 다양한 아트워크를 구매할 수 있습니다.',
  openGraph: {
    title: '갤러리 | PLES',
    description: 'PLES 갤러리에서 한정판 아트워크와 굿즈를 만나보세요.',
  },
}

export default function ArtworksLayout({ children }: { children: React.ReactNode }) {
  return children
}
