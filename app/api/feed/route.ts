import { NextResponse } from 'next/server'
import { readServerStore } from '@/lib/server-store'
import { artists as defaultArtists } from '@/lib/mock-data'

const SITE_URL = process.env.SITE_URL || 'https://ples.world'

export const dynamic = 'force-dynamic'

export async function GET() {
  const result = await readServerStore()
  const artists = (result.data?.artists ?? defaultArtists) as Array<{
    id: number
    name: string
    genre: string
    likes: number
    description?: string
  }>

  const sortedArtists = [...artists].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))

  const items = sortedArtists.map((artist) => `    <item>
      <title>${escapeXml(artist.name)} - ${escapeXml(artist.genre)}</title>
      <link>${SITE_URL}/artists</link>
      <description>${escapeXml(artist.description || `${artist.name} 아티스트 - ${artist.genre}`)}</description>
      <guid>${SITE_URL}/artists/${artist.id}</guid>
    </item>`).join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PLES - 우리가 만드는 월드 아티스트</title>
    <link>${SITE_URL}</link>
    <description>PLES는 우리가 직접 참여하여 아티스트를 응원하고 성장시키는 플랫폼입니다.</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/feed" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
