import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');
const BACKUP_FILE = path.join(DATA_DIR, 'store.backup.json');
const TEMP_FILE = path.join(DATA_DIR, 'store.tmp.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readServerStore(): Record<string, any> | null {
  try {
    ensureDir();
    // Try main file first
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      if (content.trim()) {
        return JSON.parse(content);
      }
    }
    // Main file missing or empty — try backup
    if (fs.existsSync(BACKUP_FILE)) {
      const backup = fs.readFileSync(BACKUP_FILE, 'utf-8');
      if (backup.trim()) {
        const data = JSON.parse(backup);
        // Restore main file from backup
        fs.writeFileSync(DATA_FILE, backup, 'utf-8');
        console.log('[server-store] Restored from backup');
        return data;
      }
    }
    return null;
  } catch {
    // Main file corrupt — try backup
    try {
      if (fs.existsSync(BACKUP_FILE)) {
        const backup = fs.readFileSync(BACKUP_FILE, 'utf-8');
        if (backup.trim()) {
          const data = JSON.parse(backup);
          fs.writeFileSync(DATA_FILE, backup, 'utf-8');
          console.log('[server-store] Restored from backup after corruption');
          return data;
        }
      }
    } catch {
      // Both files corrupt
    }
    return null;
  }
}

export function writeServerStore(data: Record<string, any>) {
  ensureDir();
  const json = JSON.stringify(data);
  // Atomic write: write to temp file, then rename (rename is atomic on Linux/macOS)
  fs.writeFileSync(TEMP_FILE, json, 'utf-8');
  fs.renameSync(TEMP_FILE, DATA_FILE);
  // Keep a backup copy
  try {
    fs.writeFileSync(BACKUP_FILE, json, 'utf-8');
  } catch {
    // Backup failure is non-critical
  }
}

export function updateServerKey(key: string, value: any) {
  const data = readServerStore() || {};
  data[key] = value;
  writeServerStore(data);
}
