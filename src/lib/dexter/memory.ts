/**
 * Dexter - Memory System
 * Persistent memory with keyword search and AI extraction
 */

import { promises as fs } from 'fs';
import path from 'path';
import { askAI } from '@/lib/ai-sdk';
import { isOk } from '@/lib/types';
import type { MemoryEntry, MemorySearchResult } from './types';

const MEMORY_DIR = path.join('/home/z/my-project/workspaces', 'dexter', 'memory');
const MEMORY_FILE = path.join(MEMORY_DIR, 'memories.json');

let memoryCache: MemoryEntry[] | null = null;

async function ensureDir(): Promise<void> {
  await fs.mkdir(MEMORY_DIR, { recursive: true });
}

async function loadMemories(): Promise<MemoryEntry[]> {
  if (memoryCache) return memoryCache;
  try {
    await ensureDir();
    const data = await fs.readFile(MEMORY_FILE, 'utf-8');
    memoryCache = JSON.parse(data) as MemoryEntry[];
    return memoryCache;
  } catch {
    memoryCache = [];
    return [];
  }
}

async function saveMemories(entries: MemoryEntry[]): Promise<void> {
  memoryCache = entries;
  try {
    await ensureDir();
    const tempPath = `${MEMORY_FILE}.tmp.${Date.now()}`;
    await fs.writeFile(tempPath, JSON.stringify(entries, null, 2), 'utf-8');
    await fs.rename(tempPath, MEMORY_FILE);
  } catch (error) {
    console.error('[Dexter Memory] Save failed:', error);
  }
}

/** Store a memory entry */
export async function storeMemory(
  key: string,
  value: string,
  options?: {
    confidence?: number;
    source?: MemoryEntry['source'];
    tags?: string[];
  },
): Promise<MemoryEntry> {
  const entries = await loadMemories();

  const entry: MemoryEntry = {
    key,
    value,
    confidence: options?.confidence ?? 0.8,
    source: options?.source || 'agent',
    tags: options?.tags || [],
    timestamp: new Date().toISOString(),
  };

  // Deduplicate
  const existingIdx = entries.findIndex(
    e => e.key.toLowerCase() === key.toLowerCase(),
  );

  if (existingIdx >= 0) {
    if (entry.confidence >= entries[existingIdx].confidence) {
      entries[existingIdx] = entry;
    }
  } else {
    entries.push(entry);
  }

  await saveMemories(entries);
  return entry;
}

/** Search memories by query */
export async function searchMemories(
  query: string,
  topK: number = 5,
): Promise<MemorySearchResult[]> {
  const entries = await loadMemories();
  if (entries.length === 0) return [];

  const queryWords = query.toLowerCase().split(/\s+/);

  const scored = entries.map(entry => {
    const entryText = `${entry.key} ${entry.value} ${entry.tags.join(' ')}`.toLowerCase();
    const overlap = queryWords.filter(w => w.length > 2 && entryText.includes(w)).length;
    const keywordScore = overlap / Math.max(queryWords.length, 1);

    const ageHours = (Date.now() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 1 - ageHours / 168);

    const confidenceScore = entry.confidence;

    return {
      entry,
      score: keywordScore * 0.5 + recencyScore * 0.2 + confidenceScore * 0.3,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/** Get all memories */
export async function getAllMemories(): Promise<MemoryEntry[]> {
  return loadMemories();
}

/** Clear all memories */
export async function clearMemories(): Promise<void> {
  memoryCache = [];
  try {
    await ensureDir();
    await fs.writeFile(MEMORY_FILE, '[]', 'utf-8');
  } catch {
    // Ignore
  }
}

/** Build memory context for agent prompts */
export async function buildMemoryContext(query: string, maxEntries: number = 5): Promise<string> {
  const results = await searchMemories(query, maxEntries);
  if (results.length === 0) return '';

  const lines = results.map(
    r => `- ${r.entry.key}: ${r.entry.value} (confidence: ${r.entry.confidence.toFixed(2)})`,
  );

  return `## Relevant Memory\nPreviously stored facts:\n${lines.join('\n')}\n`;
}

/** Extract and store memories from a conversation using AI */
export async function extractAndStoreMemory(
  userMessage: string,
  assistantResponse: string,
): Promise<number> {
  const result = await askAI(
    `Extract key financial facts from this conversation worth remembering. Output JSON array of {"key":"...","value":"...","tags":["..."]}. Only extract genuinely useful facts. If nothing, output [].

User: ${userMessage}

Assistant: ${assistantResponse}`,
    'You are a financial memory extractor. Return only valid JSON array.',
    'small',
  );

  if (!isOk(result)) return 0;

  try {
    const text = result.value.text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return 0;

    const facts = JSON.parse(jsonMatch[0]) as Array<{
      key: string;
      value: string;
      tags?: string[];
    }>;

    let stored = 0;
    for (const fact of facts) {
      if (fact.key && fact.value) {
        await storeMemory(fact.key, fact.value, {
          confidence: 0.7,
          source: 'agent',
          tags: fact.tags,
        });
        stored++;
      }
    }
    return stored;
  } catch {
    return 0;
  }
}
