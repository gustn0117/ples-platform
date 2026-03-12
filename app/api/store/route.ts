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

export async function GET() {
  let data = await readServerStore();
  if (!data) {
    data = { ...DEFAULTS };
    await writeServerStore(data);
  }
  return NextResponse.json(data, {
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
