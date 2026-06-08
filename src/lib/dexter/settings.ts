/**
 * Dexter - Settings Management
 * Provider and model configuration persistence
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { ProviderSettings } from './types';
import { DEFAULT_SETTINGS } from './types';

const SETTINGS_DIR = path.join('/home/z/my-project/workspaces', 'dexter');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json');

let settingsCache: ProviderSettings | null = null;

async function ensureDir(): Promise<void> {
  await fs.mkdir(SETTINGS_DIR, { recursive: true });
}

/** Load settings from disk */
export async function loadSettings(): Promise<ProviderSettings> {
  if (settingsCache) return settingsCache;
  try {
    await ensureDir();
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    settingsCache = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    return settingsCache;
  } catch {
    settingsCache = { ...DEFAULT_SETTINGS };
    return settingsCache;
  }
}

/** Save settings to disk */
export async function saveSettings(settings: ProviderSettings): Promise<void> {
  settingsCache = settings;
  try {
    await ensureDir();
    const tempPath = `${SETTINGS_FILE}.tmp.${Date.now()}`;
    await fs.writeFile(tempPath, JSON.stringify(settings, null, 2), 'utf-8');
    await fs.rename(tempPath, SETTINGS_FILE);
  } catch (error) {
    console.error('[Dexter Settings] Save failed:', error);
  }
}

/** Update specific settings */
export async function updateSettings(
  updates: Partial<ProviderSettings>,
): Promise<ProviderSettings> {
  const current = await loadSettings();
  const updated = { ...current, ...updates };
  await saveSettings(updated);
  return updated;
}
