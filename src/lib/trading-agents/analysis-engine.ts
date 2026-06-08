/**
 * Trading Agents - Type Definitions & Analysis Engine
 * Multi-agent trading analysis with voting consensus
 */

import { chatCompletion, webSearch, askAI } from '@/lib/ai-sdk';
import { ok, isOk, createTokenUsage, mergeTokenUsage, type Result, type TokenUsage } from '@/lib/types';
import type { BaseWorkspaceState } from '@/lib/types';

export interface TradingAgent {
  id: string;
  name: string;
  specialty: string;
  systemPrompt: string;
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  reasoning: string;
}

export interface AnalysisResult {
  ticker: string;
  agents: TradingAgent[];
  consensus: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  summary: string;
  tokenUsage: TokenUsage;
  timestamp: string;
}

export interface TradingAgentsWorkspaceState extends BaseWorkspaceState {
  toolId: 'trading-agents';
}

const AGENT_PROMPTS: Omit<TradingAgent, 'signal' | 'confidence' | 'reasoning'>[] = [
  {
    id: 'technical-analyst', name: 'Technical Analyst', specialty: 'Price patterns & indicators',
    systemPrompt: 'Analyze from a technical perspective. Focus on chart patterns, RSI, MACD, moving averages, support/resistance. Give a signal (bullish/bearish/neutral) with confidence (0-100) and reasoning.',
  },
  {
    id: 'fundamental-analyst', name: 'Fundamental Analyst', specialty: 'Valuation & financials',
    systemPrompt: 'Analyze from a fundamental perspective. Focus on PE ratio, earnings growth, revenue, margins, debt. Give a signal (bullish/bearish/neutral) with confidence (0-100) and reasoning.',
  },
  {
    id: 'sentiment-analyst', name: 'Sentiment Analyst', specialty: 'Market sentiment & news',
    systemPrompt: 'Analyze market sentiment. Focus on recent news, social media, analyst ratings. Give a signal (bullish/bearish/neutral) with confidence (0-100) and reasoning.',
  },
  {
    id: 'risk-analyst', name: 'Risk Analyst', specialty: 'Risk assessment',
    systemPrompt: 'Assess risk factors. Focus on volatility, downside scenarios, macro risks. Give a signal (bullish/bearish/neutral) with confidence (0-100) and reasoning. Tend toward caution.',
  },
  {
    id: 'momentum-analyst', name: 'Momentum Analyst', specialty: 'Trend & momentum',
    systemPrompt: 'Analyze momentum. Focus on price trends, volume, relative strength. Give a signal (bullish/bearish/neutral) with confidence (0-100) and reasoning.',
  },
  {
    id: 'value-investor', name: 'Value Investor', specialty: 'Intrinsic value & margin of safety',
    systemPrompt: 'Analyze as a value investor. Focus on intrinsic value, margin of safety, competitive advantages. Give a signal (bullish/bearish/neutral) with confidence (0-100) and reasoning.',
  },
  {
    id: 'growth-investor', name: 'Growth Investor', specialty: 'Growth potential & TAM',
    systemPrompt: 'Analyze as a growth investor. Focus on revenue growth, market opportunity, innovation. Give a signal (bullish/bearish/neutral) with confidence (0-100) and reasoning.',
  },
];

/** Run trading analysis with multiple agents */
export async function runTradingAnalysis(ticker: string): Promise<Result<AnalysisResult>> {
  const totalUsage = createTokenUsage();

  // Search for context
  const searchResult = await webSearch({ query: `${ticker} stock analysis price target outlook 2025`, num: 8 });
  const context = isOk(searchResult)
    ? searchResult.value.map(r => r.snippet).join('\n')
    : '';

  const agents: TradingAgent[] = [];

  for (const agentDef of AGENT_PROMPTS) {
    const result = await askAI(
      `Analyze ${ticker} and provide your trading signal.\n\nMarket context:\n${context}\n\nRespond in this exact format:\nSIGNAL: [bullish/bearish/neutral]\nCONFIDENCE: [0-100]\nREASONING: [your analysis in 2-3 sentences]`,
      agentDef.systemPrompt,
      'small',
    );

    if (isOk(result)) {
      const text = result.value.text;
      const signal = text.match(/SIGNAL:\s*(bullish|bearish|neutral)/i)?.[1]?.toLowerCase() as TradingAgent['signal'] || 'neutral';
      const confidence = parseInt(text.match(/CONFIDENCE:\s*(\d+)/)?.[1] || '50');
      const reasoning = text.match(/REASONING:\s*([\s\S]+?)(?:\n\n|$)/)?.[1]?.trim() || text;

      agents.push({ ...agentDef, signal, confidence, reasoning });
    } else {
      agents.push({ ...agentDef, signal: 'neutral', confidence: 0, reasoning: 'Analysis unavailable' });
    }
  }

  // Calculate consensus
  const bullish = agents.filter(a => a.signal === 'bullish').length;
  const bearish = agents.filter(a => a.signal === 'bearish').length;
  const neutral = agents.filter(a => a.signal === 'neutral').length;

  let consensus: TradingAgent['signal'] = 'neutral';
  if (bullish > bearish && bullish > neutral) consensus = 'bullish';
  else if (bearish > bullish && bearish > neutral) consensus = 'bearish';

  const avgConfidence = agents.reduce((sum, a) => sum + a.confidence, 0) / agents.length;

  const summary = await askAI(
    `Summarize this multi-agent analysis of ${ticker}:\n${agents.map(a => `${a.name} (${a.signal}, ${a.confidence}%): ${a.reasoning}`).join('\n')}\n\nConsensus: ${consensus}. Write a 2-3 sentence summary.`,
    'Financial analyst. Be concise.',
    'small',
  );

  return ok({
    ticker,
    agents,
    consensus,
    confidence: avgConfidence,
    summary: isOk(summary) ? summary.value.text : `${consensus.toUpperCase()} consensus on ${ticker}`,
    tokenUsage: totalUsage,
    timestamp: new Date().toISOString(),
  });
}

/** List available agents */
export async function listAgents(): Promise<Array<{ id: string; name: string; specialty: string }>> {
  return AGENT_PROMPTS.map(a => ({ id: a.id, name: a.name, specialty: a.specialty }));
}
