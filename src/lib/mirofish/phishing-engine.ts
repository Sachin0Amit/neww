/**
 * MiroFish - Phishing Detection Engine
 * AI-powered phishing/URL analysis using web search + AI
 */

import { webSearch, askAI, chatCompletion } from '@/lib/ai-sdk';
import { ok, isOk, type Result } from '@/lib/types';
import type { BaseWorkspaceState } from '@/lib/types';

export interface PhishingAnalysis {
  url: string;
  riskScore: number; // 0-100
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  recommendations: string[];
  aiAnalysis: string;
}

export interface MiroFishWorkspaceState extends BaseWorkspaceState {
  toolId: 'mirofish';
}

/** Analyze a URL for phishing indicators */
export async function analyzeUrl(url: string): Promise<Result<PhishingAnalysis>> {
  const searchResult = await webSearch({
    query: `${url} phishing scam malware safety check reputation`,
    num: 8,
  });

  const context = isOk(searchResult)
    ? searchResult.value.map(r => r.snippet).join('\n')
    : '';

  const aiResult = await askAI(
    `Analyze this URL for phishing indicators: ${url}

Search context:
${context}

Evaluate:
1. Domain reputation and age
2. SSL certificate status
3. URL structure (suspicious characters, typosquatting)
4. Content patterns (urgency, credential harvesting)
5. Hosting location

Return ONLY valid JSON:
{
  "riskScore": 0-100,
  "riskLevel": "safe|low|medium|high|critical",
  "indicators": ["..."],
  "recommendations": ["..."],
  "aiAnalysis": "..."
}`,
    'You are a cybersecurity analyst specializing in phishing detection. Be thorough and specific. Return only valid JSON.',
    'medium',
  );

  if (isOk(aiResult)) {
    try {
      const text = aiResult.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(text);
      return ok({ url, ...parsed });
    } catch {
      // Fall through
    }
  }

  return ok({
    url,
    riskScore: 50,
    riskLevel: 'medium',
    indicators: ['Analysis incomplete'],
    recommendations: ['Exercise caution', 'Verify URL manually'],
    aiAnalysis: 'Automated analysis could not complete. Exercise caution with this URL.',
  });
}

/** Batch analyze multiple URLs */
export async function batchAnalyze(urls: string[]): Promise<PhishingAnalysis[]> {
  const results: PhishingAnalysis[] = [];
  for (const url of urls) {
    const result = await analyzeUrl(url);
    if (isOk(result)) results.push(result.value);
  }
  return results;
}
