/**
 * DeerFlow - Thread Manager
 * Thread and message persistence using file system storage.
 * Follows Shannon's workspace-manager pattern.
 *
 * Storage layout:
 *   /home/z/my-project/workspaces/deerflow/threads/{threadId}/thread.json
 *   /home/z/my-project/workspaces/deerflow/threads/{threadId}/messages.jsonl
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Thread, Message } from './types';

// =================== Constants ===================

const THREADS_DIR = path.join('/home/z/my-project/workspaces', 'deerflow', 'threads');

// =================== Helpers ===================

/** Ensure a directory exists */
async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/** Get the directory for a specific thread */
function threadDir(threadId: string): string {
  return path.join(THREADS_DIR, threadId);
}

/** Get the thread metadata file path */
function threadMetaPath(threadId: string): string {
  return path.join(threadDir(threadId), 'thread.json');
}

/** Get the messages JSONL file path */
function messagesPath(threadId: string): string {
  return path.join(threadDir(threadId), 'messages.jsonl');
}

/** Auto-generate a thread title from the first user message */
function generateTitle(message: string): string {
  const maxLen = 50;
  const trimmed = message.trim().replace(/\n/g, ' ');
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen - 3) + '...';
}

// =================== Thread CRUD ===================

/**
 * Create a new thread.
 * Optionally seeds it with an initial user message.
 */
export async function createThread(
  options?: { title?: string; initialMessage?: string; mode?: string },
): Promise<Thread> {
  const threadId = `thread-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  const title =
    options?.title ||
    (options?.initialMessage ? generateTitle(options.initialMessage) : `New Thread ${now.slice(0, 10)}`);

  const thread: Thread = {
    id: threadId,
    title,
    createdAt: now,
    updatedAt: now,
    messageCount: 0,
    status: 'active',
    metadata: options?.mode ? { mode: options.mode } : undefined,
  };

  // Create directory and write thread metadata
  await ensureDir(threadDir(threadId));
  await fs.writeFile(threadMetaPath(threadId), JSON.stringify(thread, null, 2), 'utf-8');
  await fs.writeFile(messagesPath(threadId), '', 'utf-8');

  // If there's an initial message, add it
  if (options?.initialMessage) {
    await appendMessage(threadId, {
      id: `msg-${crypto.randomUUID().slice(0, 8)}`,
      threadId,
      role: 'user',
      content: options.initialMessage,
      createdAt: now,
    });
  }

  return thread;
}

/**
 * Get a thread by ID. Returns null if not found.
 */
export async function getThread(threadId: string): Promise<Thread | null> {
  try {
    const data = await fs.readFile(threadMetaPath(threadId), 'utf-8');
    return JSON.parse(data) as Thread;
  } catch {
    return null;
  }
}

/**
 * List all threads, sorted by most recently updated first.
 */
export async function listThreads(): Promise<Thread[]> {
  await ensureDir(THREADS_DIR);

  try {
    const entries = await fs.readdir(THREADS_DIR, { withFileTypes: true });
    const threads: Thread[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const thread = await getThread(entry.name);
        if (thread) threads.push(thread);
      }
    }

    // Sort by updatedAt descending (most recent first)
    threads.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return threads;
  } catch {
    return [];
  }
}

/**
 * Update a thread's metadata. Returns the updated thread or null if not found.
 */
export async function updateThread(
  threadId: string,
  updates: Partial<Pick<Thread, 'title' | 'status' | 'metadata'>>,
): Promise<Thread | null> {
  const thread = await getThread(threadId);
  if (!thread) return null;

  const updated: Thread = {
    ...thread,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    const tempPath = `${threadMetaPath(threadId)}.tmp.${Date.now()}`;
    await fs.writeFile(tempPath, JSON.stringify(updated, null, 2), 'utf-8');
    await fs.rename(tempPath, threadMetaPath(threadId));
  } catch (error) {
    console.error('[DeerFlow ThreadManager] Failed to update thread:', error);
  }

  return updated;
}

/**
 * Delete a thread and all its messages. Returns true if deleted.
 */
export async function deleteThread(threadId: string): Promise<boolean> {
  try {
    await fs.rm(threadDir(threadId), { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

// =================== Message Operations ===================

/**
 * Append a message to a thread's JSONL file.
 * Also updates the thread's messageCount and updatedAt.
 */
export async function appendMessage(threadId: string, message: Message): Promise<void> {
  const dir = threadDir(threadId);
  await ensureDir(dir);

  try {
    await fs.appendFile(
      messagesPath(threadId),
      JSON.stringify(message) + '\n',
      'utf-8',
    );

    // Update thread metadata: increment messageCount and touch updatedAt
    const thread = await getThread(threadId);
    if (thread) {
      const updated: Thread = {
        ...thread,
        messageCount: thread.messageCount + 1,
        updatedAt: new Date().toISOString(),
      };

      const tempPath = `${threadMetaPath(threadId)}.tmp.${Date.now()}`;
      await fs.writeFile(tempPath, JSON.stringify(updated, null, 2), 'utf-8');
      await fs.rename(tempPath, threadMetaPath(threadId));
    }
  } catch (error) {
    console.error('[DeerFlow ThreadManager] Failed to append message:', error);
  }
}

/**
 * Append a new message, auto-generating ID and timestamp.
 */
export async function addMessage(
  threadId: string,
  role: Message['role'],
  content: string,
  extras?: { toolCalls?: Message['toolCalls']; artifacts?: Message['artifacts']; tokenUsage?: Message['tokenUsage'] },
): Promise<Message> {
  const message: Message = {
    id: `msg-${crypto.randomUUID().slice(0, 8)}`,
    threadId,
    role,
    content,
    createdAt: new Date().toISOString(),
    ...extras,
  };

  await appendMessage(threadId, message);
  return message;
}

/**
 * Get all messages for a thread, in chronological order.
 */
export async function getMessages(threadId: string, limit?: number): Promise<Message[]> {
  try {
    const data = await fs.readFile(messagesPath(threadId), 'utf-8');
    const lines = data.trim().split('\n').filter(Boolean);

    const messages = lines.map(line => {
      try {
        return JSON.parse(line) as Message;
      } catch {
        return null;
      }
    }).filter((m): m is Message => m !== null);

    // Apply limit (take from the end — most recent)
    if (limit && messages.length > limit) {
      return messages.slice(-limit);
    }

    return messages;
  } catch {
    return [];
  }
}

/**
 * Get a thread with its messages included.
 */
export async function getThreadWithMessages(
  threadId: string,
  messageLimit?: number,
): Promise<(Thread & { messages: Message[] }) | null> {
  const thread = await getThread(threadId);
  if (!thread) return null;

  const messages = await getMessages(threadId, messageLimit);
  return { ...thread, messages };
}

/**
 * Get recent messages from a thread as ChatMessage[] (for agent executor input).
 */
export async function getRecentChatMessages(
  threadId: string,
  limit: number = 20,
): Promise<Array<{ role: 'user' | 'assistant' | 'system'; content: string }>> {
  const messages = await getMessages(threadId, limit);
  return messages
    .filter(m => m.role === 'user' || m.role === 'assistant' || m.role === 'system')
    .map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }));
}

// =================== Utility ===================

/**
 * Check if a thread exists.
 */
export async function threadExists(threadId: string): Promise<boolean> {
  try {
    const stat = await fs.stat(threadDir(threadId));
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Get or create a thread. If threadId is provided and exists, returns it.
 * Otherwise creates a new thread.
 */
export async function getOrCreateThread(
  threadId?: string,
  options?: { title?: string; initialMessage?: string; mode?: string },
): Promise<Thread> {
  if (threadId) {
    const existing = await getThread(threadId);
    if (existing) return existing;
  }

  return createThread(options);
}
