/**
 * justhireme - Job Matching Engine
 * AI-powered resume analysis and job matching
 */

import { chatCompletion, webSearch, askAI } from '@/lib/ai-sdk';
import { ok, isOk, type Result } from '@/lib/types';
import type { BaseWorkspaceState } from '@/lib/types';
import crypto from 'crypto';

export interface ResumeAnalysis {
  id: string;
  skills: string[];
  experience: number;
  education: string;
  strengths: string[];
  improvements: string[];
  summary: string;
}

export interface JobMatch {
  title: string;
  company: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  location: string;
  salary: string;
}

export interface JusthiremeWorkspaceState extends BaseWorkspaceState {
  toolId: 'justhireme';
}

/** Analyze a resume */
export async function analyzeResume(resumeText: string): Promise<Result<ResumeAnalysis>> {
  const result = await askAI(
    `Analyze this resume and extract key information:
${resumeText.slice(0, 3000)}

Return ONLY valid JSON:
{
  "skills": ["..."],
  "experience": 0,
  "education": "...",
  "strengths": ["..."],
  "improvements": ["..."],
  "summary": "..."
}`,
    'You are a career counselor. Be specific and helpful. Return only valid JSON.',
    'medium',
  );

  if (isOk(result)) {
    try {
      const text = result.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(text);
      return ok({ id: `resume-${crypto.randomUUID().slice(0, 8)}`, ...parsed });
    } catch {}
  }

  return ok({
    id: `resume-${crypto.randomUUID().slice(0, 8)}`,
    skills: [], experience: 0, education: 'Not specified',
    strengths: [], improvements: [], summary: 'Resume analysis could not be completed',
  });
}

/** Find job matches based on skills */
export async function findJobMatches(skills: string[], location?: string): Promise<Result<JobMatch[]>> {
  const searchResult = await webSearch({
    query: `jobs hiring ${skills.slice(0, 5).join(' ')} ${location || 'remote'} 2025`,
    num: 10,
  });

  const context = isOk(searchResult)
    ? searchResult.value.map(r => r.snippet).join('\n')
    : '';

  const result = await askAI(
    `Find job matches for someone with these skills: ${skills.join(', ')}
Location: ${location || 'Remote'}

Search results:
${context}

Return ONLY valid JSON array:
[{"title":"...","company":"...","matchScore":85,"matchingSkills":["..."],"missingSkills":["..."],"location":"...","salary":"..."}]`,
    'Job matching assistant. Return only valid JSON array.',
    'medium',
  );

  if (isOk(result)) {
    try {
      const text = result.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return ok(JSON.parse(text));
    } catch {}
  }

  return ok([]);
}
