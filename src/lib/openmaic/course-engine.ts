/**
 * OpenMAIC - AI Course Generation Engine
 * Generate structured educational content
 */

import { chatCompletion, askAI } from '@/lib/ai-sdk';
import { ok, isOk, createTokenUsage, mergeTokenUsage, type Result, type TokenUsage } from '@/lib/types';
import type { BaseWorkspaceState } from '@/lib/types';
import crypto from 'crypto';

export interface Lesson {
  id: string;
  title: string;
  objectives: string[];
  content: string;
  activities: string[];
  assessment: string[];
  duration: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lessons: Lesson[];
  totalDuration: string;
  tokenUsage: TokenUsage;
  createdAt: string;
}

export interface OpenmaicWorkspaceState extends BaseWorkspaceState {
  toolId: 'openmaic';
}

/** Generate an AI course */
export async function generateCourse(
  topic: string,
  difficulty: string = 'intermediate',
  lessonCount: number = 5,
): Promise<Result<Course>> {
  const totalUsage = createTokenUsage();

  // Stage 1: Course outline
  const outlineResult = await askAI(
    `Create a course outline for "${topic}" at ${difficulty} level with ${lessonCount} lessons.
Return ONLY valid JSON:
{
  "title": "...",
  "description": "...",
  "targetAudience": "...",
  "lessons": [{"id":"lesson-1","title":"...","objectives":["..."],"duration":"30 min"}]
}`,
    'You are an instructional designer. Create engaging course outlines. Return only valid JSON.',
    'medium',
  );

  let outline: { title: string; description: string; targetAudience: string; lessons: Array<{ id: string; title: string; objectives: string[]; duration: string }> };

  if (isOk(outlineResult)) {
    try {
      const text = outlineResult.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      outline = JSON.parse(text);
      mergeTokenUsage(totalUsage, outlineResult.value.usage);
    } catch {
      outline = {
        title: topic,
        description: `A course about ${topic}`,
        targetAudience: `${difficulty} learners`,
        lessons: Array.from({ length: lessonCount }, (_, i) => ({
          id: `lesson-${i + 1}`,
          title: `Lesson ${i + 1}: ${topic} Part ${i + 1}`,
          objectives: [`Understand key concepts of ${topic}`],
          duration: '30 min',
        })),
      };
    }
  } else {
    outline = {
      title: topic,
      description: `A course about ${topic}`,
      targetAudience: `${difficulty} learners`,
      lessons: Array.from({ length: lessonCount }, (_, i) => ({
        id: `lesson-${i + 1}`,
        title: `Lesson ${i + 1}`,
        objectives: [`Learn about ${topic}`],
        duration: '30 min',
      })),
    };
  }

  // Stage 2: Generate content for each lesson
  const lessons: Lesson[] = [];
  for (const lessonOutline of outline.lessons) {
    const contentResult = await askAI(
      `Generate detailed content for a lesson titled "${lessonOutline.title}" in a course about "${topic}".
Objectives: ${lessonOutline.objectives.join(', ')}

Provide:
- Detailed lesson content (3-4 paragraphs)
- 2-3 learning activities
- 2-3 assessment questions

Return ONLY valid JSON:
{
  "content": "...",
  "activities": ["..."],
  "assessment": ["..."]
}`,
      'You are an expert educator. Create engaging, clear lesson content. Return only valid JSON.',
      'medium',
    );

    if (isOk(contentResult)) {
      mergeTokenUsage(totalUsage, contentResult.value.usage);
      try {
        const text = contentResult.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(text);
        lessons.push({
          ...lessonOutline,
          content: parsed.content || '',
          activities: parsed.activities || [],
          assessment: parsed.assessment || [],
        });
      } catch {
        lessons.push({
          ...lessonOutline,
          content: 'Content generation in progress',
          activities: [],
          assessment: [],
        });
      }
    } else {
      lessons.push({
        ...lessonOutline,
        content: 'Content generation in progress',
        activities: [],
        assessment: [],
      });
    }
  }

  return ok({
    id: `course-${crypto.randomUUID().slice(0, 8)}`,
    title: outline.title,
    description: outline.description,
    targetAudience: outline.targetAudience,
    difficulty: difficulty as Course['difficulty'],
    lessons,
    totalDuration: `${lessons.length * 30} minutes`,
    tokenUsage: totalUsage,
    createdAt: new Date().toISOString(),
  });
}
