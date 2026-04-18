// Upload a data URL (base64) to Supabase Storage and return a public URL.
// Falls back to the original data URL if upload fails (non-breaking).
export async function uploadDataUrl(dataUrl: string, folder: string): Promise<string> {
  if (!dataUrl.startsWith('data:')) return dataUrl;
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, folder }),
    });
    if (!res.ok) return dataUrl;
    const json = await res.json();
    return json.url || dataUrl;
  } catch {
    return dataUrl;
  }
}

// Read a file to a data URL.
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Read file and upload directly — returns public URL or data URL on failure.
export async function uploadFile(file: File, folder: string): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  return uploadDataUrl(dataUrl, folder);
}
