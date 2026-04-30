// Shared store data accessor.
//
// Previously this had an in-memory cache (60s TTL), but in Next.js App Router
// each route handler may load this module in its own context, so cache state
// (and invalidation) is NOT reliably shared across route handlers. That caused
// stale vote counts: /api/vote/cast incremented the DB but /api/store served
// cached zeros for up to 60 seconds.
//
// Since base64 images were migrated to Supabase Storage, DB reads now take
// ~100-150ms — fast enough to skip the cache entirely.

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

export async function getCachedStoreData(): Promise<Record<string, any>> {
  const result = await readServerStore()
  if (result.error) {
    return { ...DEFAULTS }
  }
  if (!result.data) {
    const data = { ...DEFAULTS }
    await writeServerStore(data)
    return data
  }
  return result.data
}

// No-op: kept so existing callers compile. Cache is now disabled.
export function invalidateStoreCache() {
  // intentionally empty
}
