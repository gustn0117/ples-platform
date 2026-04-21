// Shared in-memory cache for /api/store GET requests.
// Separated from the route handler so other endpoints (e.g. /api/vote/cast)
// can invalidate it after mutations.

import { readServerStore, writeServerStore } from './server-store'
import {
  artists as defaultArtists,
  votes as defaultVotes,
  artworks as defaultArtworks,
  videos as defaultVideos,
  banners as defaultBanners,
} from './mock-data'

const DEFAULTS: Record<string, any> = {
  artists: defaultArtists,
  votes: defaultVotes,
  artworks: defaultArtworks,
  videos: defaultVideos,
  banners: defaultBanners,
  chargeRate: 1.2,
}

let cachedData: Record<string, any> | null = null
let cachedAt = 0
const CACHE_TTL_MS = 60 * 1000

export async function getCachedStoreData(): Promise<Record<string, any>> {
  const now = Date.now()
  if (cachedData && now - cachedAt < CACHE_TTL_MS) return cachedData
  const result = await readServerStore()
  let data: Record<string, any>
  if (result.error) {
    data = { ...DEFAULTS }
  } else if (!result.data) {
    data = { ...DEFAULTS }
    await writeServerStore(data)
  } else {
    data = result.data
  }
  cachedData = data
  cachedAt = now
  return data
}

export function invalidateStoreCache() {
  cachedData = null
  cachedAt = 0
}
