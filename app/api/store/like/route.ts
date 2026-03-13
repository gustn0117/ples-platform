import { NextResponse } from 'next/server';
import { readServerStore, updateServerKey } from '@/lib/server-store';
import { artists as defaultArtists, type Artist } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

// Lightweight endpoint for star sending — { artistId, delta: 1 | 2 | 3 }
export async function POST(request: Request) {
  try {
    const { artistId, delta } = await request.json();
    if (typeof artistId !== 'number' || ![1, 2, 3].includes(delta)) {
      return NextResponse.json({ error: 'invalid params' }, { status: 400 });
    }

    const result = await readServerStore();
    const artists: Artist[] = result.data?.artists || defaultArtists;

    const updated = artists.map((a) => {
      if (a.id === artistId) {
        return { ...a, likes: Math.max(0, a.likes + delta) };
      }
      return a;
    });

    await updateServerKey('artists', updated);

    const artist = updated.find((a) => a.id === artistId);
    return NextResponse.json({ success: true, likes: artist?.likes ?? 0 });
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
