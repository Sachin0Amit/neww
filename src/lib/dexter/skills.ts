/**
 * Dexter - Skills System
 * Built-in and custom financial skills
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Skill } from './types';

const SKILLS_DIR = path.join('/home/z/my-project/workspaces', 'dexter', 'skills');

const BUILT_IN_SKILLS: Skill[] = [
  {
    id: 'dcf-valuation',
    name: 'DCF Valuation',
    description: 'Discounted Cash Flow analysis with WACC calculation and sensitivity tables',
    prompt: `You are now in DCF Valuation mode. Your approach:
1. Collect financial data (revenue, EBITDA, capex, working capital changes)
2. Project free cash flows for 5-10 years
3. Calculate WACC using CAPM (risk-free rate, beta, equity risk premium)
4. Calculate terminal value using Gordon Growth Model or exit multiple
5. Discount FCFs and terminal value to present value
6. Build sensitivity tables for WACC ±1% and growth ±0.5%
7. Compare implied share price to current market price

Always show your calculations step by step. State assumptions clearly.`,
    category: 'valuation',
    isBuiltIn: true,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'write-memo',
    name: 'Investment Memo',
    description: 'Generate professional investment memorandums with thesis, risks, and valuation',
    prompt: `You are now in Investment Memo mode. Structure as:
1. Executive Summary - Investment thesis in 3 sentences
2. Company Overview - Business model, competitive positioning
3. Investment Thesis - 3-5 key reasons to invest
4. Financial Analysis - Revenue trends, margins, cash flow quality
5. Valuation - Multiple methodologies, price target
6. Risks - Key risk factors and mitigants
7. Catalysts - Near-term events that could drive the stock
8. Conclusion - Conviction level and recommended position size

Be specific with numbers. Distinguish between facts and opinions.`,
    category: 'writing',
    isBuiltIn: true,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'x-research',
    name: 'X/Twitter Research',
    description: 'Research sentiment and discussions from X/Twitter about stocks and markets',
    prompt: `You are now in X/Twitter Research mode. When analyzing social media:
1. Search for recent discussions about the target
2. Identify key opinion leaders and their views
3. Gauge overall sentiment (bullish/bearish/neutral)
4. Find notable claims and verify them independently
5. Track trending topics and narratives
6. Identify potential market-moving posts
7. Assess credibility of information sources

Always cross-reference social media claims with verified data sources. Note when sentiment diverges from fundamentals.`,
    category: 'research',
    isBuiltIn: true,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'deep-analysis',
    name: 'Deep Analysis',
    description: 'Comprehensive multi-source analysis with iterative deepening and verification',
    prompt: `You are now in Deep Analysis mode. Your approach:
1. Decompose the question into sub-questions
2. Search for each sub-question systematically
3. Cross-reference findings across multiple sources
4. Identify contradictions and gaps
5. Conduct additional searches to fill gaps
6. Verify key claims independently
7. Rate confidence for each finding
8. Synthesize into a comprehensive analysis

Be thorough and skeptical. Distinguish between strong evidence and speculation. Cite sources.`,
    category: 'analysis',
    isBuiltIn: true,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
];

let customSkillsCache: Skill[] | null = null;

async function ensureDir(): Promise<void> {
  await fs.mkdir(SKILLS_DIR, { recursive: true });
}

async function loadCustomSkills(): Promise<Skill[]> {
  if (customSkillsCache) return customSkillsCache;
  try {
    await ensureDir();
    const data = await fs.readFile(path.join(SKILLS_DIR, 'custom-skills.json'), 'utf-8');
    customSkillsCache = JSON.parse(data) as Skill[];
    return customSkillsCache;
  } catch {
    customSkillsCache = [];
    return [];
  }
}

async function saveCustomSkills(skills: Skill[]): Promise<void> {
  customSkillsCache = skills;
  try {
    await ensureDir();
    const tempPath = path.join(SKILLS_DIR, `custom-skills.json.tmp.${Date.now()}`);
    await fs.writeFile(tempPath, JSON.stringify(skills, null, 2), 'utf-8');
    await fs.rename(tempPath, path.join(SKILLS_DIR, 'custom-skills.json'));
  } catch (error) {
    console.error('[Dexter Skills] Save failed:', error);
  }
}

/** List all skills (built-in + custom) */
export async function listSkills(): Promise<Skill[]> {
  const custom = await loadCustomSkills();
  return [...BUILT_IN_SKILLS, ...custom];
}

/** Get a skill by ID */
export async function getSkill(skillId: string): Promise<Skill | null> {
  const all = await listSkills();
  return all.find(s => s.id === skillId) || null;
}

/** Create a custom skill */
export async function createSkill(request: {
  name: string;
  description: string;
  prompt: string;
  category: Skill['category'];
}): Promise<Skill> {
  const skill: Skill = {
    id: `custom-${crypto.randomUUID().slice(0, 8)}`,
    name: request.name,
    description: request.description,
    prompt: request.prompt,
    category: request.category,
    isBuiltIn: false,
    enabled: true,
    createdAt: new Date().toISOString(),
  };

  const custom = await loadCustomSkills();
  custom.push(skill);
  await saveCustomSkills(custom);
  return skill;
}

/** Toggle a skill */
export async function toggleSkill(skillId: string, enabled: boolean): Promise<Skill | null> {
  const builtIn = BUILT_IN_SKILLS.find(s => s.id === skillId);
  if (builtIn) {
    builtIn.enabled = enabled;
    return builtIn;
  }

  const custom = await loadCustomSkills();
  const skill = custom.find(s => s.id === skillId);
  if (skill) {
    skill.enabled = enabled;
    await saveCustomSkills(custom);
    return skill;
  }

  return null;
}

/** Delete a custom skill */
export async function deleteSkill(skillId: string): Promise<boolean> {
  const custom = await loadCustomSkills();
  const index = custom.findIndex(s => s.id === skillId);
  if (index < 0) return false;
  custom.splice(index, 1);
  await saveCustomSkills(custom);
  return true;
}

/** Get combined prompt modifier for active skills */
export async function getSkillsPrompt(skillIds: string[]): Promise<string> {
  const all = await listSkills();
  const active = all.filter(s => skillIds.includes(s.id) && s.enabled);
  if (active.length === 0) return '';

  const sections = active.map(s => `### ${s.name}\n${s.prompt}`);
  return `\n## Active Skills\nYou have these skills active:\n\n${sections.join('\n\n')}\n`;
}
