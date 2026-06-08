/**
 * Fincept Terminal - Research Agents
 * Specialized AI financial research agents
 */

import { chatCompletion, webSearch } from '@/lib/ai-sdk';
import { ok, isOk, type Result } from '@/lib/types';
import type { AgentInfo } from './types';

const BUILT_IN_AGENTS: AgentInfo[] = [
  {
    id: 'fundamental-analyst',
    name: 'Fundamental Analyst',
    specialty: 'Fundamental Analysis',
    description: 'Deep analysis of financial statements, valuation metrics, and business fundamentals',
    accuracy: 0.87,
    totalCalls: 0,
    status: 'idle',
    lastActive: new Date().toISOString(),
    systemPrompt: 'You are a fundamental analyst. Focus on financial statements, valuation metrics (PE, PB, DCF), competitive advantages, and business quality. Provide data-driven analysis with specific numbers.',
  },
  {
    id: 'technical-analyst',
    name: 'Technical Analyst',
    specialty: 'Technical Analysis',
    description: 'Chart patterns, indicators, support/resistance levels, and trend analysis',
    accuracy: 0.72,
    totalCalls: 0,
    status: 'idle',
    lastActive: new Date().toISOString(),
    systemPrompt: 'You are a technical analyst. Focus on price action, chart patterns, technical indicators (RSI, MACD, Bollinger Bands), support/resistance levels, and trend identification. Be specific with price levels.',
  },
  {
    id: 'risk-manager',
    name: 'Risk Manager',
    specialty: 'Risk Assessment',
    description: 'Portfolio risk analysis, position sizing, and risk-reward evaluation',
    accuracy: 0.91,
    totalCalls: 0,
    status: 'idle',
    lastActive: new Date().toISOString(),
    systemPrompt: 'You are a risk manager. Focus on downside scenarios, volatility assessment, correlation analysis, position sizing (Kelly criterion), and portfolio risk metrics (VaR, max drawdown). Always quantify risks.',
  },
  {
    id: 'macro-analyst',
    name: 'Macro Analyst',
    specialty: 'Macroeconomic Analysis',
    description: 'Economic indicators, monetary policy, geopolitical risks, and market cycles',
    accuracy: 0.78,
    totalCalls: 0,
    status: 'idle',
    lastActive: new Date().toISOString(),
    systemPrompt: 'You are a macroeconomic analyst. Focus on GDP, inflation, interest rates, employment data, central bank policy, and geopolitical risks. Explain how macro factors affect specific investments.',
  },
  {
    id: 'sentiment-analyst',
    name: 'Sentiment Analyst',
    specialty: 'Market Sentiment',
    description: 'Social media sentiment, news analysis, and contrarian indicators',
    accuracy: 0.65,
    totalCalls: 0,
    status: 'idle',
    lastActive: new Date().toISOString(),
    systemPrompt: 'You are a sentiment analyst. Focus on market sentiment indicators (VIX, put/call ratios), social media trends, news flow analysis, and contrarian signals. Assess crowd psychology.',
  },
  {
    id: 'sector-specialist',
    name: 'Sector Specialist',
    specialty: 'Sector Analysis',
    description: 'Industry trends, sector rotation, and comparative analysis',
    accuracy: 0.83,
    totalCalls: 0,
    status: 'idle',
    lastActive: new Date().toISOString(),
    systemPrompt: 'You are a sector specialist. Focus on industry dynamics, competitive landscape, regulatory changes, and sector rotation patterns. Compare companies within sectors.',
  },
];

/** List all agents */
export async function listAgents(): Promise<AgentInfo[]> {
  return BUILT_IN_AGENTS.map(a => ({ ...a }));
}

/** Get a specific agent */
export async function getAgent(agentId: string): Promise<AgentInfo | null> {
  return BUILT_IN_AGENTS.find(a => a.id === agentId) || null;
}

/** Run a specific agent with a query */
export async function runAgent(agentId: string, query: string): Promise<Result<{ response: string; agentId: string; agentName: string }>> {
  const agent = BUILT_IN_AGENTS.find(a => a.id === agentId);
  if (!agent) return ok({ response: 'Agent not found', agentId, agentName: 'Unknown' });

  // Search for context
  const searchResult = await webSearch({ query: `${query} finance market 2025`, num: 5 });
  const context = isOk(searchResult)
    ? searchResult.value.map(r => r.snippet).join('\n')
    : '';

  const result = await chatCompletion({
    messages: [
      { role: 'system', content: agent.systemPrompt },
      { role: 'user', content: `${query}\n\nResearch context:\n${context}` },
    ],
    temperature: 0.7,
    maxTokens: 2000,
  });

  if (isOk(result)) {
    agent.totalCalls++;
    agent.lastActive = new Date().toISOString();
    agent.status = 'idle';
    return ok({
      response: result.value.text,
      agentId: agent.id,
      agentName: agent.name,
    });
  }

  return ok({
    response: 'Agent execution failed',
    agentId,
    agentName: agent.name,
  });
}
