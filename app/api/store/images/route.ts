import { NextResponse } from 'next/server';
import { readServerStore } from '@/lib/server-store';

export const dynamic = 'force-dynamic';

// Same in-memory cache pattern as parent route
let cachedData: Record<string, any> | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60 * 1000;

async function getData(): Promise<Record<string, any>> {
  const now = Date.now();
  if (cachedData && now - cachedAt < CACHE_TTL_MS) return cachedData;
  const result = await readServerStore();
  const data = result.data || {};
  cachedData = data;
  cachedAt = now;
  return data;
}

// Returns image data only for the requested entity type and IDs
// GET /api/store/images?type=artists                    → all profile images only (small)
// GET /api/store/images?type=artists&ids=1              → all images for artist 1 (incl. description)
// GET /api/store/images?type=artists&include=desc       → also include description images
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const idsParam = searchParams.get('ids');
  const include = searchParams.get('include') || '';

  if (!type) {
    return NextResponse.json({ error: 'type required' }, { status: 400 });
  }

  const data = await getData();
  const items: any[] = Array.isArray(data[type]) ? data[type] : [];
  const ids = idsParam ? new Set(idsParam.split(',').map((s) => Number(s))) : null;
  const includeDesc = include.includes('desc') || !!ids;

  let result: Record<string, any> = {};

  if (type === 'artists') {
    for (const a of items) {
      if (ids && !ids.has(a.id)) continue;
      const entry: any = { imageData: a.imageData, mediaData: a.mediaData };
      if (includeDesc) entry.descriptionImages = a.descriptionImages;
      result[a.id] = entry;
    }
  } else if (type === 'artworks') {
    for (const a of items) {
      if (ids && !ids.has(a.id)) continue;
      result[a.id] = { imageData: a.imageData, mediaData: a.mediaData };
    }
  } else if (type === 'videos') {
    for (const v of items) {
      if (ids && !ids.has(v.id)) continue;
      result[v.id] = { thumbnailData: v.thumbnailData };
    }
  } else if (type === 'banners') {
    // Only active banners by default — homepage uses these
    const filteredItems = ids ? items : items.filter((b: any) => b.isActive);
    for (const b of filteredItems) {
      if (ids && !ids.has(b.id)) continue;
      result[b.id] = { bgImage: b.bgImage };
    }
  } else if (type === 'votes') {
    // Only active votes by default
    const filteredItems = ids ? items : items.filter((v: any) => v.isActive);
    for (const v of filteredItems) {
      if (ids && !ids.has(v.id)) continue;
      result[v.id] = {
        options: Array.isArray(v.options)
          ? v.options.map((o: any) => ({ id: o.id, mediaData: o.mediaData }))
          : [],
      };
    }
  }

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
