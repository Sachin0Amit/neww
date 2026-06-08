/**
 * Dexter - Heartbeat Monitoring
 * Periodic checklist for market monitoring
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { HeartbeatCheck } from './types';

const HEARTBEAT_DIR = path.join('/home/z/my-project/workspaces', 'dexter');
const HEARTBEAT_FILE = path.join(HEARTBEAT_DIR, 'heartbeat.json');

const DEFAULT_CHECKS: HeartbeatCheck[] = [
  {
    id: 'market-open',
    label: 'Market Open Check',
    query: 'Are US stock markets currently open? Any pre-market movements?',
    enabled: true,
  },
  {
    id: 'portfolio-watch',
    label: 'Portfolio Watchlist',
    query: 'Check AAPL, GOOGL, MSFT, NVDA for significant price movements (>2%)',
    enabled: true,
  },
  {
    id: 'crypto-alerts',
    label: 'Crypto Alerts',
    query: 'Check BTC and ETH for significant 24h price changes (>5%)',
    enabled: true,
  },
  {
    id: 'news-alerts',
    label: 'Breaking News',
    query: 'Any major market-moving news today? Fed announcements, earnings surprises, geopolitical events?',
    enabled: true,
  },
  {
    id: 'earnings-calendar',
    label: 'Earnings Calendar',
    query: 'Which major companies are reporting earnings this week?',
    enabled: false,
  },
  {
    id: 'economic-data',
    label: 'Economic Data',
    query: 'Any key economic data releases today (CPI, jobs, GDP)?',
    enabled: false,
  },
];

let heartbeatCache: HeartbeatCheck[] | null = null;

async function ensureDir(): Promise<void> {
  await fs.mkdir(HEARTBEAT_DIR, { recursive: true });
}

/** Load heartbeat checks */
export async function loadHeartbeat(): Promise<HeartbeatCheck[]> {
  if (heartbeatCache) return heartbeatCache;
  try {
    await ensureDir();
    const data = await fs.readFile(HEARTBEAT_FILE, 'utf-8');
    heartbeatCache = JSON.parse(data) as HeartbeatCheck[];
    return heartbeatCache;
  } catch {
    heartbeatCache = [...DEFAULT_CHECKS];
    return heartbeatCache;
  }
}

/** Save heartbeat checks */
export async function saveHeartbeat(checks: HeartbeatCheck[]): Promise<void> {
  heartbeatCache = checks;
  try {
    await ensureDir();
    const tempPath = `${HEARTBEAT_FILE}.tmp.${Date.now()}`;
    await fs.writeFile(tempPath, JSON.stringify(checks, null, 2), 'utf-8');
    await fs.rename(tempPath, HEARTBEAT_FILE);
  } catch (error) {
    console.error('[Dexter Heartbeat] Save failed:', error);
  }
}

/** Update a single heartbeat check */
export async function updateHeartbeatCheck(
  checkId: string,
  updates: Partial<HeartbeatCheck>,
): Promise<HeartbeatCheck | null> {
  const checks = await loadHeartbeat();
  const check = checks.find(c => c.id === checkId);
  if (!check) return null;

  Object.assign(check, updates);
  await saveHeartbeat(checks);
  return check;
}

/** Run all enabled heartbeat checks using AI */
export async function runHeartbeatChecks(): Promise<HeartbeatCheck[]> {
  const checks = await loadHeartbeat();
  const enabledChecks = checks.filter(c => c.enabled);

  // Use AI to briefly check each item
  const { askAI } = await import('@/lib/ai-sdk');
  const { isOk } = await import('@/lib/types');

  for (const check of enabledChecks) {
    const result = await askAI(
      check.query,
      'You are a financial monitoring agent. Provide a brief 1-2 sentence status update. Be factual.',
      'small',
    );

    check.lastChecked = new Date().toISOString();
    check.lastResult = isOk(result) ? result.value.text : 'Check failed';
  }

  await saveHeartbeat(checks);
  return checks;
}
