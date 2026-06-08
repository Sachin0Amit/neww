/**
 * OSIRIS - AI-Powered Analysis Engine
 *
 * Generates AIAnalysis, CompositeThreatScore, and deep intelligence reports
 * from reconnaissance results using the z-ai-web-dev-sdk.
 */

import { askAI, chatCompletion } from '@/lib/ai-sdk';
import { ok, err, isOk, isErr } from '@/lib/types';
import type { Result, ChatMessage } from '@/lib/types';
import type {
  ReconResult,
  AIAnalysis,
  CompositeThreatScore,
  ThreatScoreComponent,
  ThreatLevel,
  ThreatIntel,
  IntelEntity,
  IntelDomain,
} from './types';

// =================== Constants ===================

/** Weight distribution for threat score components */
const COMPONENT_WEIGHTS: Record<string, number> = {
  dns_lookup: 0.08,
  whois_lookup: 0.07,
  ip_intelligence: 0.12,
  cert_lookup: 0.06,
  bgp_lookup: 0.06,
  cve_lookup: 0.15,
  shodan_lookup: 0.12,
  network_sweep: 0.08,
  sanctions_search: 0.10,
  threat_intelligence: 0.10,
  phone_lookup: 0.02,
  mac_lookup: 0.02,
  github_intel: 0.01,
  leak_detection: 0.08,
};

/** Map numeric score to threat level */
function scoreToThreatLevel(score: number): ThreatLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'ELEVATED';
  if (score >= 20) return 'LOW';
  return 'NONE';
}

/** Clamp a number between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// =================== Surface Analysis ===================

/**
 * Surface analysis: Quick summary of findings.
 * Fast, uses small model, minimal tokens.
 */
export async function surfaceAnalysis(
  target: string,
  reconResults: ReconResult[],
  domain?: IntelDomain,
): Promise<Result<AIAnalysis>> {
  try {
    const dataSummary = reconResults
      .map(r => `[${r.tool}] ${r.error ? `ERROR: ${r.error}` : JSON.stringify(r.results).slice(0, 500)}`)
      .join('\n');

    const prompt = `Provide a brief intelligence summary for target "${target}"${domain ? ` in ${domain} domain` : ''}.

Reconnaissance data:
${dataSummary}

Return ONLY valid JSON with this exact structure:
{
  "summary": "2-3 sentence overview",
  "bluf": "Bottom Line Up Front - one critical sentence",
  "key_findings": ["finding1", "finding2", "finding3"],
  "recommendations": ["rec1", "rec2"],
  "confidence": 75,
  "threat_assessment": "LOW|ELEVATED|HIGH|CRITICAL",
  "risk_matrix": {"likelihood": 50, "impact": 50, "risk_score": 50},
  "sources_evaluated": ${reconResults.length}
}`;

    const result = await askAI(
      prompt,
      'You are a senior intelligence analyst. Be concise and factual. Return only valid JSON.',
      'small',
    );

    if (isErr(result)) return err(result.error);

    const parsed = parseAIResponse(result.value.text, target, reconResults.length, 'surface');
    return ok(parsed);
  } catch (error) {
    return ok(fallbackAnalysis(target, reconResults.length, 'surface', error));
  }
}

// =================== Moderate Analysis ===================

/**
 * Moderate analysis: Summary + threat scoring + recommendations.
 * Uses medium model for balanced quality and speed.
 */
export async function moderateAnalysis(
  target: string,
  reconResults: ReconResult[],
  domain?: IntelDomain,
): Promise<Result<AIAnalysis>> {
  try {
    const dataSummary = reconResults
      .map(r => {
        const data = r.error
          ? `ERROR: ${r.error}`
          : JSON.stringify(r.results, null, 2).slice(0, 800);
        return `=== ${r.tool} (queried: ${r.query}) ===\n${data}`;
      })
      .join('\n\n');

    const prompt = `Conduct a moderate-depth intelligence analysis for target "${target}"${domain ? ` in ${domain} domain` : ''}.

Reconnaissance data from ${reconResults.length} tools:
${dataSummary}

Provide:
1. A comprehensive summary (3-5 sentences)
2. Bottom Line Up Front (BLUF) - the single most critical takeaway
3. Key findings (5-8 specific, factual findings with data references)
4. Actionable recommendations (3-5 prioritized)
5. Confidence level (0-100, based on data quality and coverage)
6. Threat assessment (NONE/LOW/ELEVATED/HIGH/CRITICAL)
7. Risk matrix (likelihood 0-100, impact 0-100, risk_score 0-100)
8. Related entities (domains, IPs, organizations mentioned)

Return ONLY valid JSON:
{
  "summary": "...",
  "bluf": "...",
  "key_findings": ["..."],
  "recommendations": ["..."],
  "confidence": 75,
  "threat_assessment": "ELEVATED",
  "risk_matrix": {"likelihood": 50, "impact": 60, "risk_score": 55},
  "related_entities": ["entity1"],
  "sources_evaluated": ${reconResults.length}
}`;

    const result = await askAI(
      prompt,
      'You are a senior intelligence analyst with 20 years of OSINT experience. Analyze critically, cite specific data points, be factual. Return only valid JSON.',
      'medium',
    );

    if (isErr(result)) return err(result.error);

    const parsed = parseAIResponse(result.value.text, target, reconResults.length, 'moderate');
    return ok(parsed);
  } catch (error) {
    return ok(fallbackAnalysis(target, reconResults.length, 'moderate', error));
  }
}

// =================== Deep Analysis ===================

/**
 * Deep analysis: Full AIAnalysis with risk matrix, confidence scores, related entities.
 * Uses multi-turn chat with the large model for maximum depth.
 */
export async function deepAnalysis(
  target: string,
  reconResults: ReconResult[],
  domain?: IntelDomain,
): Promise<Result<AIAnalysis>> {
  try {
    const dataSummary = reconResults
      .map(r => {
        const data = r.error
          ? `ERROR: ${r.error}`
          : JSON.stringify(r.results, null, 2).slice(0, 1200);
        return `=== ${r.tool} (queried: ${r.query}, timestamp: ${r.timestamp}) ===\n${data}`;
      })
      .join('\n\n');

    // First pass: detailed analysis via chatCompletion
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an elite intelligence analyst with expertise in cyber threat intelligence, OSINT, and risk assessment. You have 25+ years of experience in intelligence community operations. Analyze the provided reconnaissance data with maximum depth, citing specific data points, cross-referencing findings, and identifying hidden patterns. Be thorough, factual, and precise.`,
      },
      {
        role: 'user',
        content: `Conduct a comprehensive deep intelligence analysis for target "${target}"${domain ? ` in ${domain} domain` : ''}.

Data from ${reconResults.length} reconnaissance tools:
${dataSummary}

Phase 1: Identify all key findings, anomalies, and patterns.
Phase 2: Assess threat level with justification.
Phase 3: Build risk matrix with detailed reasoning.
Phase 4: Generate prioritized recommendations with implementation guidance.
Phase 5: Identify all related entities and their significance.

Return ONLY valid JSON:
{
  "summary": "5-8 sentence comprehensive overview",
  "bluf": "Bottom Line Up Front - the single most critical strategic insight",
  "key_findings": ["8-12 detailed findings with data citations"],
  "recommendations": ["5-8 prioritized recommendations with rationale"],
  "confidence": 80,
  "threat_assessment": "HIGH",
  "risk_matrix": {"likelihood": 70, "impact": 80, "risk_score": 76},
  "related_entities": ["all domains, IPs, orgs, threat actors mentioned"],
  "sources_evaluated": ${reconResults.length}
}`,
      },
    ];

    const chatResult = await chatCompletion({
      messages,
      model: undefined, // uses default medium model
      temperature: 0.3,
    });

    if (isErr(chatResult)) {
      // Fallback to moderate analysis if deep fails
      return moderateAnalysis(target, reconResults, domain);
    }

    // Second pass: refinement and validation
    const refineResult = await askAI(
      `Review and refine this intelligence analysis. Ensure the threat assessment is calibrated, the risk matrix is internally consistent, and recommendations are actionable:

${chatResult.value.text}

Return the REFINED analysis as ONLY valid JSON with the same structure. Ensure confidence is realistic (not artificially high), threat_assessment matches the data, and risk_score = sqrt(likelihood * impact).`,
      'You are a senior intelligence reviewer. Validate and refine analyses. Return only valid JSON.',
      'small',
    );

    const finalText = isOk(refineResult) ? refineResult.value.text : chatResult.value.text;
    const parsed = parseAIResponse(finalText, target, reconResults.length, 'deep');
    return ok(parsed);
  } catch (error) {
    return ok(fallbackAnalysis(target, reconResults.length, 'deep', error));
  }
}

// =================== Composite Threat Scoring ===================

/**
 * Calculate a CompositeThreatScore from multiple recon result sources.
 * Each tool contributes a weighted score based on its findings.
 */
export async function calculateCompositeThreatScore(
  target: string,
  reconResults: ReconResult[],
): Promise<Result<CompositeThreatScore>> {
  try {
    // First, get AI to score each component
    const dataSummary = reconResults
      .map(r => `[${r.tool}] ${r.error ? 'ERROR' : JSON.stringify(r.results).slice(0, 300)}`)
      .join('\n');

    const scoringResult = await askAI(
      `Score the threat level for each intelligence source about target "${target}".
Each source should be scored 0-100 where 0=no threat, 100=critical threat.

Data:
${dataSummary}

Return ONLY valid JSON array:
[
  {"source": "dns_lookup", "score": 25, "reasoning": "brief reason"},
  {"source": "whois_lookup", "score": 15, "reasoning": "brief reason"},
  ...
]

Score ONLY the tools that have actual data. For tools with errors, skip them.`,
      'You are a threat scoring analyst. Score objectively based on actual findings. Return only valid JSON array.',
      'small',
    );

    let componentScores: Array<{ source: string; score: number; reasoning: string }> = [];

    if (isOk(scoringResult)) {
      try {
        const cleaned = scoringResult.value.text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        componentScores = JSON.parse(cleaned);
      } catch {
        // Fallback: generate scores from error/non-error status
        componentScores = reconResults
          .filter(r => !r.error)
          .map(r => ({ source: r.tool, score: 30, reasoning: 'Automated baseline score' }));
      }
    }

    // Calculate weighted scores
    const components: ThreatScoreComponent[] = [];
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const cs of componentScores) {
      const weight = COMPONENT_WEIGHTS[cs.source] ?? 0.05;
      const score = clamp(cs.score, 0, 100);
      const weightedScore = score * weight;

      components.push({
        source: cs.source,
        score,
        weight,
        weighted_score: Math.round(weightedScore * 100) / 100,
        reasoning: cs.reasoning,
      });

      totalWeightedScore += weightedScore;
      totalWeight += weight;
    }

    // Normalize to 0-100
    const overallScore = totalWeight > 0
      ? Math.round((totalWeightedScore / totalWeight) * 100) / 100
      : 0;

    const normalizedScore = clamp(Math.round(overallScore), 0, 100);

    // Calculate risk matrix
    const highImpactTools = ['cve_lookup', 'shodan_lookup', 'threat_intelligence', 'leak_detection', 'sanctions_search'];
    const highImpactResults = components.filter(c => highImpactTools.includes(c.source));
    const likelihood = components.length > 0
      ? Math.round(components.reduce((sum, c) => sum + c.score, 0) / components.length)
      : 0;
    const impact = highImpactResults.length > 0
      ? Math.round(highImpactResults.reduce((sum, c) => sum + c.score, 0) / highImpactResults.length)
      : Math.round(likelihood * 0.7);

    const riskScore = Math.round(Math.sqrt(likelihood * impact));

    // Determine quadrant
    let quadrant: CompositeThreatScore['risk_matrix']['quadrant'];
    if (likelihood >= 50 && impact >= 50) quadrant = 'high-high';
    else if (likelihood < 50 && impact >= 50) quadrant = 'low-high';
    else if (likelihood >= 50 && impact < 50) quadrant = 'high-low';
    else quadrant = 'low-low';

    // Confidence based on data coverage
    const toolCoverage = reconResults.filter(r => !r.error).length / Math.max(reconResults.length, 1);
    const confidence = Math.round(toolCoverage * 80 + (componentScores.length > 0 ? 20 : 0));

    const compositeScore: CompositeThreatScore = {
      overall_score: normalizedScore,
      threat_level: scoreToThreatLevel(normalizedScore),
      components,
      risk_matrix: {
        likelihood: clamp(likelihood, 0, 100),
        impact: clamp(impact, 0, 100),
        quadrant,
      },
      confidence: clamp(confidence, 0, 100),
      timestamp: new Date().toISOString(),
    };

    return ok(compositeScore);
  } catch (error) {
    // Fallback: basic score from error rates
    const errorCount = reconResults.filter(r => r.error).length;
    const score = Math.round((errorCount / Math.max(reconResults.length, 1)) * 50);

    return ok({
      overall_score: score,
      threat_level: scoreToThreatLevel(score),
      components: [],
      risk_matrix: {
        likelihood: score,
        impact: Math.round(score * 0.7),
        quadrant: score >= 50 ? 'high-low' : 'low-low',
      },
      confidence: 20,
      timestamp: new Date().toISOString(),
    });
  }
}

// =================== Entity Extraction ===================

/**
 * Extract IntelEntity objects from recon results using AI.
 */
export async function extractEntities(
  target: string,
  reconResults: ReconResult[],
): Promise<Result<IntelEntity[]>> {
  try {
    const dataSummary = reconResults
      .filter(r => !r.error)
      .map(r => `[${r.tool}] ${JSON.stringify(r.results).slice(0, 500)}`)
      .join('\n');

    const result = await askAI(
      `Extract all intelligence entities from this data about "${target}":

${dataSummary}

Entities can be: domains, IP addresses, organizations, persons, ASNs, CVEs, threat actors.

Return ONLY valid JSON array:
[
  {
    "id": "unique-id",
    "name": "Entity Name",
    "domain": "CYBER",
    "type": "TRACK",
    "threat": "LOW",
    "location": null,
    "metadata": {},
    "lastSeen": "2024-01-01T00:00:00Z",
    "sources": ["tool_name"]
  }
]`,
      'You are an intelligence entity extraction specialist. Extract only factual entities found in the data. Return only valid JSON array.',
      'small',
    );

    if (isErr(result)) return ok([]);

    try {
      const cleaned = result.value.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      return ok(JSON.parse(cleaned) as IntelEntity[]);
    } catch {
      return ok([]);
    }
  } catch {
    return ok([]);
  }
}

// =================== Threat Intel Extraction ===================

/**
 * Extract ThreatIntel indicators from recon results.
 */
export async function extractThreatIntel(
  target: string,
  reconResults: ReconResult[],
): Promise<Result<ThreatIntel[]>> {
  try {
    const dataSummary = reconResults
      .filter(r => !r.error)
      .map(r => `[${r.tool}] ${JSON.stringify(r.results).slice(0, 500)}`)
      .join('\n');

    const result = await askAI(
      `Extract threat intelligence indicators from this data about "${target}":

${dataSummary}

Return ONLY valid JSON array:
[
  {
    "id": "ti-unique-id",
    "type": "indicator_type",
    "severity": "low|medium|high|critical",
    "source": "tool_name",
    "description": "Brief description",
    "indicators": ["IOC1", "IOC2"],
    "domain": "CYBER",
    "timestamp": "2024-01-01T00:00:00Z",
    "confidence": 75,
    "tlp": "WHITE",
    "tags": ["tag1"]
  }
]`,
      'You are a threat intelligence analyst. Extract only verified indicators from the data. Return only valid JSON array.',
      'small',
    );

    if (isErr(result)) return ok([]);

    try {
      const cleaned = result.value.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      return ok(JSON.parse(cleaned) as ThreatIntel[]);
    } catch {
      return ok([]);
    }
  } catch {
    return ok([]);
  }
}

// =================== Full Analysis Pipeline ===================

/**
 * Run the complete analysis pipeline at the specified depth.
 */
export async function runAnalysisPipeline(
  target: string,
  reconResults: ReconResult[],
  depth: 'surface' | 'moderate' | 'deep' = 'moderate',
  domain?: IntelDomain,
): Promise<Result<{
  analysis: AIAnalysis;
  threatScore: CompositeThreatScore;
  entities: IntelEntity[];
  threatIntel: ThreatIntel[];
}>> {
  // Run all analyses in parallel where possible
  const analysisPromise = depth === 'surface'
    ? surfaceAnalysis(target, reconResults, domain)
    : depth === 'deep'
      ? deepAnalysis(target, reconResults, domain)
      : moderateAnalysis(target, reconResults, domain);

  const [analysisResult, threatScoreResult, entitiesResult, threatIntelResult] = await Promise.all([
    analysisPromise,
    calculateCompositeThreatScore(target, reconResults),
    depth !== 'surface' ? extractEntities(target, reconResults) : Promise.resolve(ok([])),
    depth !== 'surface' ? extractThreatIntel(target, reconResults) : Promise.resolve(ok([])),
  ]);

  if (isErr(analysisResult)) return err(analysisResult.error);
  if (isErr(threatScoreResult)) return err(threatScoreResult.error);

  return ok({
    analysis: analysisResult.value,
    threatScore: threatScoreResult.value,
    entities: isOk(entitiesResult) ? entitiesResult.value : [],
    threatIntel: isOk(threatIntelResult) ? threatIntelResult.value : [],
  });
}

// =================== Helpers ===================

/** Parse AI response text into AIAnalysis, with fallback defaults */
function parseAIResponse(
  text: string,
  target: string,
  sourcesEvaluated: number,
  depth: 'surface' | 'moderate' | 'deep',
): AIAnalysis {
  try {
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    const likelihood = clamp(parsed.risk_matrix?.likelihood ?? 50, 0, 100);
    const impact = clamp(parsed.risk_matrix?.impact ?? 50, 0, 100);
    const riskScore = clamp(
      parsed.risk_matrix?.risk_score ?? Math.round(Math.sqrt(likelihood * impact)),
      0, 100,
    );

    return {
      summary: parsed.summary || `Analysis of ${target} completed with ${sourcesEvaluated} sources.`,
      bluf: parsed.bluf || `Intelligence assessment for ${target} based on ${sourcesEvaluated} data sources.`,
      key_findings: Array.isArray(parsed.key_findings) ? parsed.key_findings : ['Analysis completed'],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ['Continue monitoring'],
      confidence: clamp(parsed.confidence ?? 50, 0, 100),
      threat_assessment: validateThreatLevel(parsed.threat_assessment),
      risk_matrix: { likelihood, impact, risk_score: riskScore },
      related_entities: Array.isArray(parsed.related_entities) ? parsed.related_entities : undefined,
      sources_evaluated: sourcesEvaluated,
      analysis_depth: depth,
      generated_at: new Date().toISOString(),
    };
  } catch {
    return fallbackAnalysis(target, sourcesEvaluated, depth);
  }
}

/** Validate and normalize a threat level string */
function validateThreatLevel(level: string): ThreatLevel {
  const valid: ThreatLevel[] = ['NONE', 'LOW', 'ELEVATED', 'HIGH', 'CRITICAL'];
  const upper = String(level).toUpperCase();
  return valid.includes(upper as ThreatLevel) ? (upper as ThreatLevel) : 'ELEVATED';
}

/** Fallback analysis when AI fails */
function fallbackAnalysis(
  target: string,
  sourcesEvaluated: number,
  depth: 'surface' | 'moderate' | 'deep',
  error?: unknown,
): AIAnalysis {
  const errorMsg = error instanceof Error ? error.message : 'Analysis engine unavailable';

  return {
    summary: `Automated analysis of ${target} based on ${sourcesEvaluated} intelligence sources. AI analysis was unavailable (${errorMsg}); this is a baseline assessment.`,
    bluf: `Intelligence gathered from ${sourcesEvaluated} sources for ${target}. Full AI analysis pending.`,
    key_findings: [
      `Reconnaissance completed with ${sourcesEvaluated} tool(s)`,
      'AI-powered analysis temporarily unavailable',
      'Manual review of raw data recommended',
    ],
    recommendations: [
      'Review raw reconnaissance data manually',
      'Re-run analysis when AI services are available',
      'Cross-reference findings with external threat databases',
    ],
    confidence: 20,
    threat_assessment: 'ELEVATED',
    risk_matrix: { likelihood: 40, impact: 50, risk_score: 45 },
    sources_evaluated: sourcesEvaluated,
    analysis_depth: depth,
    generated_at: new Date().toISOString(),
  };
}
