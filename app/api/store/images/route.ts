import { NextResponse } from 'next/server';
import { getCachedStoreData } from '@/lib/store-cache';

export const dynamic = 'force-dynamic';

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

  const data = await getCachedStoreData();
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
