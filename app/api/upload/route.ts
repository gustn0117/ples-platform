import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

const BUCKET = 'ples-images';
const MAX_SIZE = 100 * 1024 * 1024; // 100 MB hard cap

const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/mpeg3': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/wave': 'wav',
  'audio/ogg': 'ogg',
  'audio/aac': 'aac',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/flac': 'flac',
};

// Accepts either:
//  - multipart/form-data with fields: file (File), folder (string)  ← preferred, no size overhead
//  - application/json with { dataUrl, folder }                      ← legacy, kept for old callers
// Returns { url: string }.
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let buffer: Buffer;
    let mimeType: string;
    let folder = '';

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('file');
      folder = (form.get('folder') as string | null) || '';
      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'file field required' }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `파일이 너무 큽니다 (최대 ${MAX_SIZE / 1024 / 1024}MB)` }, { status: 413 });
      }
      mimeType = file.type || 'application/octet-stream';
      buffer = Buffer.from(await file.arrayBuffer());
    } else {
      // Legacy JSON path
      const body = await request.json();
      const dataUrl: string | undefined = body?.dataUrl;
      folder = body?.folder || '';
      if (!dataUrl || typeof dataUrl !== 'string') {
        return NextResponse.json({ error: 'dataUrl or file required' }, { status: 400 });
      }
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        return NextResponse.json({ error: 'invalid data URL' }, { status: 400 });
      }
      mimeType = match[1];
      buffer = Buffer.from(match[2], 'base64');
      if (buffer.byteLength > MAX_SIZE) {
        return NextResponse.json({ error: `파일이 너무 큽니다 (최대 ${MAX_SIZE / 1024 / 1024}MB)` }, { status: 413 });
      }
    }

    const ext = EXT_MAP[mimeType] || (mimeType.startsWith('audio/') ? 'audio' : 'bin');
    const folderPath = folder ? `${folder}/` : '';
    const filename = `${folderPath}${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;

    const supabase = createServiceClient();
    const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, {
      contentType: mimeType,
      upsert: false,
    });

    if (error) {
      console.error('[upload] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (e: any) {
    console.error('[upload] Error:', e);
    return NextResponse.json({ error: e?.message || 'upload failed' }, { status: 500 });
  }
}
