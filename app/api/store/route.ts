import { NextResponse } from 'next/server';
import { updateServerKey } from '@/lib/server-store';
import { getCachedStoreData, invalidateStoreCache } from '@/lib/store-cache';

export const dynamic = 'force-dynamic';

// Strip base64 image data from response to reduce payload size
function stripImages(data: Record<string, any>): Record<string, any> {
  const result = { ...data };
  if (Array.isArray(result.artists)) {
    result.artists = result.artists.map((a: any) => ({ ...a, imageData: undefined, mediaData: undefined, descriptionImages: undefined }));
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
  if (Array.isArray(result.votes)) {
    result.votes = result.votes.map((v: any) => ({
      ...v,
      options: Array.isArray(v.options)
        ? v.options.map((opt: any) => ({ ...opt, mediaData: undefined }))
        : v.options,
    }));
  }
  return result;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lite = searchParams.get('lite') === '1';
  const keys = searchParams.get('keys'); // e.g. "artists,banners"

  let data = await getCachedStoreData();

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
    invalidateStoreCache();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
}
