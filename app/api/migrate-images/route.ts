import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { readServerStore, writeServerStore } from '@/lib/server-store';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min

const BUCKET = 'ples-images';
const ADMIN_SECRET = process.env.MIGRATE_SECRET || 'ples-migrate-2026';

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
    'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg',
    'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/wav': 'wav', 'audio/ogg': 'ogg',
  };
  return map[mime] || 'bin';
}

async function uploadDataUrl(dataUrl: string, folder: string): Promise<string | null> {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const [, mime, b64] = match;
  const ext = extFromMime(mime);
  const filename = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const buffer = Buffer.from(b64, 'base64');
  const supabase = createServiceClient();
  const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, {
    contentType: mime,
    upsert: false,
  });
  if (error) {
    console.error('[migrate] upload error:', error.message);
    return null;
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

async function convertIfBase64(val: any, folder: string): Promise<string | null> {
  if (typeof val !== 'string') return null;
  if (val.startsWith('data:')) {
    return await uploadDataUrl(val, folder);
  }
  return val; // already a URL
}

// POST /api/migrate-images?secret=... — migrates all base64 in DB to Storage
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const result = await readServerStore();
  if (result.error || !result.data) {
    return NextResponse.json({ error: 'DB read failed' }, { status: 500 });
  }

  const data = result.data;
  const stats = { artists: 0, artworks: 0, videos: 0, banners: 0, votes: 0 };

  // Artists: imageData, mediaData, descriptionImages[]
  if (Array.isArray(data.artists)) {
    for (const a of data.artists) {
      if (a.imageData?.startsWith?.('data:')) {
        const url = await convertIfBase64(a.imageData, 'artists');
        if (url) { a.imageData = url; stats.artists++; }
      }
      if (a.mediaData?.startsWith?.('data:')) {
        const url = await convertIfBase64(a.mediaData, 'artists');
        if (url) { a.mediaData = url; stats.artists++; }
      }
      if (Array.isArray(a.descriptionImages)) {
        const newImgs: string[] = [];
        for (const img of a.descriptionImages) {
          if (img?.startsWith?.('data:')) {
            const url = await convertIfBase64(img, 'artists/desc');
            if (url) { newImgs.push(url); stats.artists++; } else { newImgs.push(img); }
          } else {
            newImgs.push(img);
          }
        }
        a.descriptionImages = newImgs;
      }
    }
  }

  // Artworks
  if (Array.isArray(data.artworks)) {
    for (const a of data.artworks) {
      if (a.imageData?.startsWith?.('data:')) {
        const url = await convertIfBase64(a.imageData, 'artworks');
        if (url) { a.imageData = url; stats.artworks++; }
      }
      if (a.mediaData?.startsWith?.('data:')) {
        const url = await convertIfBase64(a.mediaData, 'artworks');
        if (url) { a.mediaData = url; stats.artworks++; }
      }
    }
  }

  // Videos: thumbnailData
  if (Array.isArray(data.videos)) {
    for (const v of data.videos) {
      if (v.thumbnailData?.startsWith?.('data:')) {
        const url = await convertIfBase64(v.thumbnailData, 'videos');
        if (url) { v.thumbnailData = url; stats.videos++; }
      }
    }
  }

  // Banners: bgImage
  if (Array.isArray(data.banners)) {
    for (const b of data.banners) {
      if (b.bgImage?.startsWith?.('data:')) {
        const url = await convertIfBase64(b.bgImage, 'banners');
        if (url) { b.bgImage = url; stats.banners++; }
      }
    }
  }

  // Votes: options[].mediaData
  if (Array.isArray(data.votes)) {
    for (const v of data.votes) {
      if (Array.isArray(v.options)) {
        for (const opt of v.options) {
          if (opt.mediaData?.startsWith?.('data:')) {
            const url = await convertIfBase64(opt.mediaData, 'votes');
            if (url) { opt.mediaData = url; stats.votes++; }
          }
        }
      }
    }
  }

  // Save back to DB
  await writeServerStore(data);

  return NextResponse.json({ success: true, migrated: stats });
}
