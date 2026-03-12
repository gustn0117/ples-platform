import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readServerStore(): Record<string, any> | null {
  try {
    ensureDir();
    if (!fs.existsSync(DATA_FILE)) return null;
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

export function writeServerStore(data: Record<string, any>) {
  ensureDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data), 'utf-8');
}

export function updateServerKey(key: string, value: any) {
  const data = readServerStore() || {};
  data[key] = value;
  writeServerStore(data);
}
