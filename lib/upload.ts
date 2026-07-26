// Upload a File to Supabase Storage via /api/upload and return a public URL.
// Uses multipart/form-data (no base64 overhead — supports large files).
// Throws on failure so callers can surface the error to the user.
export async function uploadFile(file: File, folder: string): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  if (folder) form.append('folder', folder);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: form, // browser sets multipart boundary automatically
  });

  if (!res.ok) {
    let message = `업로드 실패 (${res.status})`;
    try {
      const json = await res.json();
      if (json?.error) message = json.error;
    } catch {}
    throw new Error(message);
  }

  const { url } = await res.json();
  if (!url) throw new Error('업로드 응답이 비어 있습니다.');
  return url;
}

// Legacy helper — some old callers may still pass a data URL string.
// Kept for backwards compatibility; new code should use uploadFile.
export async function uploadDataUrl(dataUrl: string, folder: string): Promise<string> {
  if (!dataUrl.startsWith('data:')) return dataUrl;
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl, folder }),
  });
  if (!res.ok) {
    let message = `업로드 실패 (${res.status})`;
    try {
      const json = await res.json();
      if (json?.error) message = json.error;
    } catch {}
    throw new Error(message);
  }
  const { url } = await res.json();
  return url || dataUrl;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
