import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BUCKET = 'ples-images';

// Accepts { dataUrl: string, folder?: string } and uploads to Supabase Storage.
// Returns { url: string } — public URL that can be used in <img src>.
export async function POST(request: Request) {
  try {
    const { dataUrl, folder } = await request.json();
    if (!dataUrl || typeof dataUrl !== 'string') {
      return NextResponse.json({ error: 'dataUrl required' }, { status: 400 });
    }

    // Parse data URL
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: 'invalid data URL' }, { status: 400 });
    }
    const [, mimeType, b64] = match;

    // Determine extension
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg',
    };
    const ext = extMap[mimeType] || 'bin';

    // Build filename
    const folderPath = folder ? `${folder}/` : '';
    const filename = `${folderPath}${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;

    // Decode base64
    const buffer = Buffer.from(b64, 'base64');

    // Upload to Supabase
    const supabase = createServiceClient();
    const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, {
      contentType: mimeType,
      upsert: false,
    });

    if (error) {
      console.error('[upload] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Construct public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (e: any) {
    console.error('[upload] Error:', e);
    return NextResponse.json({ error: e?.message || 'upload failed' }, { status: 500 });
  }
}
