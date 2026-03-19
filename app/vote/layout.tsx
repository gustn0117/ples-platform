import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '투표',
  description: '매일 투표에 참여하고 스타를 적립하세요. PLES에서 아티스트를 위한 투표에 참여할 수 있습니다.',
  openGraph: {
    title: '투표 | PLES',
    description: '매일 투표에 참여하고 스타를 적립하세요.',
  },
}

export default function VoteLayout({ children }: { children: React.ReactNode }) {
  return children
}
