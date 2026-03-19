import { readServerStore } from '@/lib/server-store'
import {
  artists as defaultArtists,
  banners as defaultBanners,
} from '@/lib/mock-data'
import HomeClient from './HomeClient'

export const revalidate = 60 // ISR: 60초마다 재생성

export default async function Home() {
  const result = await readServerStore()
  const data = result.data

  const artists = (data?.artists ?? defaultArtists)
    .sort((a: any, b: any) => (b.likes ?? 0) - (a.likes ?? 0))
    .slice(0, 5)
    .map((a: any) => ({ id: String(a.id), name: a.name, genre: a.genre, likes: a.likes ?? 0 }))

  const banners = (data?.banners ?? defaultBanners)
    .filter((b: any) => b.isActive)
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))

  return <HomeClient initialArtists={artists} initialBanners={banners} />
}
