/**
 * Dexter - Cron Job Management
 * Scheduled monitoring job CRUD (no actual scheduling)
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { CronJob, CronSchedule } from './types';

const CRON_DIR = path.join('/home/z/my-project/workspaces', 'dexter');
const CRON_FILE = path.join(CRON_DIR, 'cron.json');

let cronCache: CronJob[] | null = null;

async function ensureDir(): Promise<void> {
  await fs.mkdir(CRON_DIR, { recursive: true });
}

async function loadCronJobs(): Promise<CronJob[]> {
  if (cronCache) return cronCache;
  try {
    await ensureDir();
    const data = await fs.readFile(CRON_FILE, 'utf-8');
    cronCache = JSON.parse(data) as CronJob[];
    return cronCache;
  } catch {
    cronCache = [];
    return [];
  }
}

async function saveCronJobs(jobs: CronJob[]): Promise<void> {
  cronCache = jobs;
  try {
    await ensureDir();
    const tempPath = `${CRON_FILE}.tmp.${Date.now()}`;
    await fs.writeFile(tempPath, JSON.stringify(jobs, null, 2), 'utf-8');
    await fs.rename(tempPath, CRON_FILE);
  } catch (error) {
    console.error('[Dexter Cron] Save failed:', error);
  }
}

/** List all cron jobs */
export async function listCronJobs(): Promise<CronJob[]> {
  return loadCronJobs();
}

/** Create a new cron job */
export async function createCronJob(request: {
  name: string;
  schedule: CronSchedule;
  message: string;
  model?: string;
  fulfillment?: CronJob['fulfillment'];
}): Promise<CronJob> {
  const jobs = await loadCronJobs();

  const job: CronJob = {
    id: `cron-${crypto.randomUUID().slice(0, 8)}`,
    name: request.name,
    enabled: true,
    schedule: request.schedule,
    message: request.message,
    model: request.model,
    fulfillment: request.fulfillment || 'keep',
    state: {
      consecutiveErrors: 0,
    },
    createdAt: new Date().toISOString(),
  };

  // Compute next run time
  job.state.nextRunAtMs = computeNextRun(job.schedule);

  jobs.push(job);
  await saveCronJobs(jobs);
  return job;
}

/** Delete a cron job */
export async function deleteCronJob(jobId: string): Promise<boolean> {
  const jobs = await loadCronJobs();
  const index = jobs.findIndex(j => j.id === jobId);
  if (index < 0) return false;
  jobs.splice(index, 1);
  await saveCronJobs(jobs);
  return true;
}

/** Toggle a cron job */
export async function toggleCronJob(jobId: string, enabled: boolean): Promise<CronJob | null> {
  const jobs = await loadCronJobs();
  const job = jobs.find(j => j.id === jobId);
  if (!job) return null;
  job.enabled = enabled;
  await saveCronJobs(jobs);
  return job;
}

/** Compute next run time based on schedule */
function computeNextRun(schedule: CronSchedule): number {
  const now = Date.now();
  switch (schedule.kind) {
    case 'every':
      return now + (schedule.everyMs || 3600000);
    case 'at': {
      const targetTime = new Date(schedule.at || '').getTime();
      return targetTime > now ? targetTime : now + 86400000;
    }
    case 'cron':
      // Simplified: next hour
      return now + 3600000;
    default:
      return now + 3600000;
  }
}
