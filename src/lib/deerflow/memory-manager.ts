/**
 * DeerFlow - Memory Manager
 * Per-thread persistent memory store with deduplication and relevance retrieval
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { MemoryEntry, MemoryStore } from './types';

// =================== Constants ===================

const MEMORY_DIR = path.join('/home/z/my-project/workspaces', 'deerflow', 'memory');

// =================== In-Memory Cache ===================

const memoryCache = new Map<string, MemoryStore>();

// =================== Core Operations ===================

/** Ensure the memory directory exists */
async function ensureMemoryDir(): Promise<void> {
  await fs.mkdir(MEMORY_DIR, { recursive: true });
}

/** Get the file path for a thread's memory store */
function memoryPath(threadId: string): string {
  return path.join(MEMORY_DIR, `${threadId}.json`);
}

/**
 * Load a memory store for a thread.
 * Uses in-memory cache first, then falls back to disk.
 */
async function loadStore(threadId: string): Promise<MemoryStore> {
  // Check cache
  const cached = memoryCache.get(threadId);
  if (cached) return cached;

  // Load from disk
  try {
    await ensureMemoryDir();
    const data = await fs.readFile(memoryPath(threadId), 'utf-8');
    const store = JSON.parse(data) as MemoryStore;
    memoryCache.set(threadId, store);
    return store;
  } catch {
    // Create new store
    const store: MemoryStore = {
      threadId,
      entries: [],
      updatedAt: new Date().toISOString(),
    };
    memoryCache.set(threadId, store);
    return store;
  }
}

/**
 * Save a memory store to disk and update cache.
 */
async function saveStore(store: MemoryStore): Promise<void> {
  store.updatedAt = new Date().toISOString();
  memoryCache.set(store.threadId, store);

  try {
    await ensureMemoryDir();
    const tempPath = `${memoryPath(store.threadId)}.tmp.${Date.now()}`;
    await fs.writeFile(tempPath, JSON.stringify(store, null, 2), 'utf-8');
    await fs.rename(tempPath, memoryPath(store.threadId));
  } catch (error) {
    console.error('[DeerFlow Memory] Failed to save memory store:', error);
  }
}

// =================== Public API ===================

/**
 * Store a memory entry for a thread.
 * Performs deduplication based on key similarity.
 */
export async function storeMemory(
  threadId: string,
  key: string,
  value: string,
  options?: {
    confidence?: number;
    source?: MemoryEntry['source'];
    tags?: string[];
  },
): Promise<MemoryEntry> {
  const store = await loadStore(threadId);

  // Deduplication: check if similar key already exists
  const existingIndex = store.entries.findIndex(
    e => e.key.toLowerCase() === key.toLowerCase() ||
         similarity(e.key, key) > 0.85
  );

  const entry: MemoryEntry = {
    key,
    value,
    confidence: options?.confidence ?? 0.8,
    timestamp: new Date().toISOString(),
    source: options?.source || 'agent',
    tags: options?.tags,
  };

  if (existingIndex >= 0) {
    // Update existing entry if new one has higher confidence
    const existing = store.entries[existingIndex];
    if (entry.confidence >= existing.confidence) {
      store.entries[existingIndex] = entry;
    }
  } else {
    store.entries.push(entry);
  }

  await saveStore(store);
  return entry;
}

/**
 * Retrieve all memory entries for a thread.
 */
export async function getMemory(threadId: string): Promise<MemoryEntry[]> {
  const store = await loadStore(threadId);
  return store.entries;
}

/**
 * Retrieve top-k most relevant memory entries for a query.
 * Uses simple keyword matching and recency scoring.
 */
export async function getRelevantMemory(
  threadId: string,
  query: string,
  topK: number = 5,
): Promise<MemoryEntry[]> {
  const store = await loadStore(threadId);

  if (store.entries.length === 0) return [];

  // Score each entry by relevance
  const scored = store.entries.map(entry => {
    const queryWords = query.toLowerCase().split(/\s+/);
    const keyWords = entry.key.toLowerCase().split(/\s+/);
    const valueWords = entry.value.toLowerCase().split(/\s+/);
    const allEntryWords = [...keyWords, ...valueWords];

    // Keyword overlap score
    const overlap = queryWords.filter(w =>
      allEntryWords.some(ew => ew.includes(w) || w.includes(ew))
    ).length;
    const keywordScore = overlap / Math.max(queryWords.length, 1);

    // Recency score (more recent = higher)
    const ageHours = (Date.now() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 1 - ageHours / 168); // 1 week decay

    // Confidence score
    const confidenceScore = entry.confidence;

    // Tag match bonus
    const tagBonus = entry.tags
      ? queryWords.filter(w => entry.tags!.some(t => t.toLowerCase().includes(w))).length * 0.1
      : 0;

    const totalScore = keywordScore * 0.5 + recencyScore * 0.2 + confidenceScore * 0.2 + tagBonus;

    return { entry, score: totalScore };
  });

  // Sort by score descending, take top-k
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(s => s.entry);
}

/**
 * Clear all memory for a thread.
 */
export async function clearMemory(threadId: string): Promise<boolean> {
  memoryCache.delete(threadId);

  try {
    await fs.unlink(memoryPath(threadId));
    return true;
  } catch {
    return false;
  }
}

/**
 * Build a memory context string for injection into agent prompts.
 */
export async function buildMemoryContext(
  threadId: string,
  query: string,
  maxEntries: number = 5,
): Promise<string> {
  const relevant = await getRelevantMemory(threadId, query, maxEntries);

  if (relevant.length === 0) return '';

  const lines = relevant.map(
    e => `- ${e.key}: ${e.value} (confidence: ${e.confidence.toFixed(2)})`
  );

  return `## Relevant Memory\nThe following are previously stored facts about the user and context:\n${lines.join('\n')}\n`;
}

/**
 * Extract and store memory entries from a conversation.
 * Uses AI to identify memorable facts.
 */
export async function extractAndStoreMemory(
  threadId: string,
  userMessage: string,
  assistantResponse: string,
): Promise<number> {
  const { chatCompletion } = await import('@/lib/ai-sdk');
  const { isErr } = await import('@/lib/types');

  const result = await chatCompletion({
    messages: [
      {
        role: 'system',
        content: `Extract key facts from this conversation that would be useful to remember for future interactions.
Output each fact as a JSON array of objects with "key", "value", and "tags" fields.
Only extract genuinely useful facts - preferences, context, important details.
If nothing is worth remembering, output an empty array [].

Example output:
[{"key": "user_preference_language", "value": "User prefers Python for coding tasks", "tags": ["preference", "coding"]}]`,
      },
      {
        role: 'user',
        content: `User: ${userMessage}\n\nAssistant: ${assistantResponse}`,
      },
    ],
    model: 'glm-4-flash',
    temperature: 0.1,
    maxTokens: 1024,
  });

  if (isErr(result)) return 0;

  try {
    const text = result.value.text.trim();
    // Extract JSON array from response
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
        await storeMemory(threadId, fact.key, fact.value, {
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

// =================== Utility ===================

/** Simple string similarity using Jaccard coefficient on character bigrams */
function similarity(a: string, b: string): number {
  const bigramsA = new Set(getBigrams(a.toLowerCase()));
  const bigramsB = new Set(getBigrams(b.toLowerCase()));
  const intersection = new Set([...bigramsA].filter(x => bigramsB.has(x)));
  const union = new Set([...bigramsA, ...bigramsB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function getBigrams(str: string): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.push(str.slice(i, i + 2));
  }
  return bigrams;
}
