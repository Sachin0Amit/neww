/**
 * DeerFlow - Skills Registry
 * Built-in and custom skill management for the agent system
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Skill, CreateSkillRequest } from './types';

// =================== Constants ===================

const SKILLS_DIR = path.join('/home/z/my-project/workspaces', 'deerflow', 'skills');

// =================== Built-in Skills ===================

const BUILT_IN_SKILLS: Skill[] = [
  {
    id: 'deep-research',
    name: 'Deep Research',
    description: 'Conduct comprehensive multi-source research on any topic with iterative deepening and source verification',
    prompt: `You are now in Deep Research mode. Your approach should be:
1. Decompose the research question into sub-questions
2. Search for each sub-question systematically
3. Cross-reference and verify findings across multiple sources
4. Identify contradictions and gaps in available information
5. Synthesize findings into a comprehensive report with citations
6. Rate confidence levels for each finding

Always cite your sources and distinguish between facts, opinions, and estimates.`,
    enabled: true,
    category: 'research',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'report-generation',
    name: 'Report Generation',
    description: 'Generate structured professional reports with executive summary, methodology, findings, and recommendations',
    prompt: `You are now in Report Generation mode. Structure your output as a professional report:
1. Executive Summary - Key findings and recommendations (1-2 paragraphs)
2. Methodology - How you approached the analysis
3. Findings - Detailed analysis organized by themes
4. Data & Evidence - Supporting data points and evidence
5. Recommendations - Actionable next steps
6. Appendix - Additional details and sources

Use clear headings, bullet points, and data tables where appropriate.
Be objective and evidence-based in your analysis.`,
    enabled: true,
    category: 'generation',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'slide-creation',
    name: 'Slide Creation',
    description: 'Create presentation slide content with clear structure, talking points, and visual suggestions',
    prompt: `You are now in Slide Creation mode. Design effective presentation content:
1. Each slide should have a clear title and 3-5 key points
2. Include speaker notes for each slide
3. Suggest visual elements (charts, diagrams, images)
4. Keep text minimal - use bullet points, not paragraphs
5. Include a title slide, agenda, content slides, and conclusion
6. Suggest transitions between slides

Format each slide as:
--- Slide N: [Title] ---
• Point 1
• Point 2
• Point 3
Speaker Notes: [Detailed talking points]
Visual Suggestion: [What visual to include]`,
    enabled: true,
    category: 'creative',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'image-generation',
    name: 'Image Generation',
    description: 'Generate and describe images based on detailed prompts with style and composition guidance',
    prompt: `You are now in Image Generation mode. When creating images:
1. Craft detailed, descriptive prompts for image generation
2. Specify style (photorealistic, illustration, diagram, etc.)
3. Include composition details (perspective, lighting, color palette)
4. Consider the target audience and use case
5. Provide alt-text descriptions for accessibility
6. Suggest variations and iterations

When describing what image to generate, be specific about:
- Subject and composition
- Art style and medium
- Color palette and mood
- Technical details (resolution, aspect ratio)`,
    enabled: true,
    category: 'creative',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'code-generation',
    name: 'Code Generation',
    description: 'Generate production-quality code with proper error handling, testing suggestions, and documentation',
    prompt: `You are now in Code Generation mode. Follow these principles:
1. Write clean, readable, and well-documented code
2. Include proper error handling and edge case management
3. Follow language-specific best practices and conventions
4. Add type annotations where applicable
5. Include usage examples and docstrings
6. Suggest test cases for critical functionality
7. Consider performance implications
8. Use descriptive variable and function names

Always provide complete, runnable code - not pseudocode.
Include import statements and necessary setup.`,
    enabled: true,
    category: 'code',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
  },
];

// =================== Custom Skills Storage ===================

let customSkillsCache: Skill[] | null = null;

async function ensureSkillsDir(): Promise<void> {
  await fs.mkdir(SKILLS_DIR, { recursive: true });
}

async function loadCustomSkills(): Promise<Skill[]> {
  if (customSkillsCache) return customSkillsCache;

  try {
    await ensureSkillsDir();
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
    await ensureSkillsDir();
    const tempPath = path.join(SKILLS_DIR, `custom-skills.json.tmp.${Date.now()}`);
    await fs.writeFile(tempPath, JSON.stringify(skills, null, 2), 'utf-8');
    await fs.rename(tempPath, path.join(SKILLS_DIR, 'custom-skills.json'));
  } catch (error) {
    console.error('[DeerFlow Skills] Failed to save custom skills:', error);
  }
}

// =================== Public API ===================

/**
 * List all available skills (built-in + custom).
 */
export async function listSkills(): Promise<Skill[]> {
  const custom = await loadCustomSkills();
  return [...BUILT_IN_SKILLS, ...custom];
}

/**
 * Get a specific skill by ID.
 */
export async function getSkill(skillId: string): Promise<Skill | null> {
  const all = await listSkills();
  return all.find(s => s.id === skillId) || null;
}

/**
 * Create a new custom skill.
 */
export async function createSkill(request: CreateSkillRequest): Promise<Skill> {
  const skill: Skill = {
    id: `custom-${crypto.randomUUID().slice(0, 8)}`,
    name: request.name,
    description: request.description,
    prompt: request.prompt,
    enabled: true,
    category: request.category,
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
  };

  const custom = await loadCustomSkills();
  custom.push(skill);
  await saveCustomSkills(custom);

  return skill;
}

/**
 * Toggle a skill's enabled state.
 */
export async function toggleSkill(skillId: string, enabled: boolean): Promise<Skill | null> {
  // Check built-in first
  const builtIn = BUILT_IN_SKILLS.find(s => s.id === skillId);
  if (builtIn) {
    builtIn.enabled = enabled;
    return builtIn;
  }

  // Check custom
  const custom = await loadCustomSkills();
  const skill = custom.find(s => s.id === skillId);
  if (skill) {
    skill.enabled = enabled;
    await saveCustomSkills(custom);
    return skill;
  }

  return null;
}

/**
 * Delete a custom skill (cannot delete built-in).
 */
export async function deleteSkill(skillId: string): Promise<boolean> {
  const custom = await loadCustomSkills();
  const index = custom.findIndex(s => s.id === skillId);
  if (index < 0) return false;

  custom.splice(index, 1);
  await saveCustomSkills(custom);
  return true;
}

/**
 * Get the combined system prompt modifier for a set of active skills.
 */
export async function getSkillsPrompt(skillIds: string[]): Promise<string> {
  const all = await listSkills();
  const active = all.filter(s => skillIds.includes(s.id) && s.enabled);

  if (active.length === 0) return '';

  const sections = active.map(s => `### ${s.name}\n${s.prompt}`);
  return `\n## Active Skills\nYou have the following skills active:\n\n${sections.join('\n\n')}\n`;
}

/**
 * Discover relevant skills for a given query.
 */
export async function discoverSkills(query: string): Promise<Skill[]> {
  const all = await listSkills();
  const queryLower = query.toLowerCase();

  return all.filter(skill => {
    const skillText = `${skill.name} ${skill.description} ${skill.category}`.toLowerCase();
    const queryWords = queryLower.split(/\s+/);
    return queryWords.some(w => w.length > 2 && skillText.includes(w));
  });
}
