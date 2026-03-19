import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '랭킹',
  description: 'PLES 아티스트 인기 랭킹을 확인하세요. 실시간으로 업데이트되는 아티스트 순위를 확인할 수 있습니다.',
  openGraph: {
    title: '랭킹 | PLES',
    description: 'PLES 아티스트 인기 랭킹을 확인하세요.',
  },
}

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return children
}
