import { NextResponse } from 'next/server';
import { readServerStore, writeServerStore, updateServerKey } from '@/lib/server-store';
import {
  artists as defaultArtists,
  votes as defaultVotes,
  artworks as defaultArtworks,
  videos as defaultVideos,
  banners as defaultBanners,
} from '@/lib/mock-data';

// Prevent Next.js from caching API responses
export const dynamic = 'force-dynamic';

const DEFAULTS: Record<string, any> = {
  artists: defaultArtists,
  votes: defaultVotes,
  artworks: defaultArtworks,
  videos: defaultVideos,
  banners: defaultBanners,
  chargeRate: 1.2,
};

// Strip base64 image data from response to reduce payload size
function stripImages(data: Record<string, any>): Record<string, any> {
  const result = { ...data };
  if (Array.isArray(result.artists)) {
    result.artists = result.artists.map((a: any) => ({ ...a, imageData: undefined, mediaData: undefined }));
  }
  if (Array.isArray(result.artworks)) {
    result.artworks = result.artworks.map((a: any) => ({ ...a, imageData: undefined, mediaData: undefined }));
  }
  if (Array.isArray(result.videos)) {
    result.videos = result.videos.map((v: any) => ({ ...v, thumbnailData: undefined }));
  }
  if (Array.isArray(result.banners)) {
    result.banners = result.banners.map((b: any) => ({ ...b, bgImage: undefined }));
  }
  return result;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lite = searchParams.get('lite') === '1';
  const keys = searchParams.get('keys'); // e.g. "artists,banners"

  const result = await readServerStore();

  let data: Record<string, any>;
  if (result.error) {
    console.warn('[GET /api/store] DB read failed, returning defaults (not writing to DB)');
    data = { ...DEFAULTS };
  } else if (!result.data) {
    data = { ...DEFAULTS };
    await writeServerStore(data);
  } else {
    data = result.data;
  }

  // Return only specific keys if requested
  if (keys) {
    const keyList = keys.split(',');
    const filtered: Record<string, any> = {};
    for (const k of keyList) {
      if (data[k] !== undefined) filtered[k] = data[k];
    }
    data = filtered;
  }

  return NextResponse.json(lite ? stripImages(data) : data, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function PUT(request: Request) {
  try {
    const { key, value } = await request.json();
    if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });
    await updateServerKey(key, value);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
}
