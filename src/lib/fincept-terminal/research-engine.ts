/**
 * Fincept Terminal - Research Engine
 * Web search + AI-powered financial research
 */

import { webSearch, askAI } from '@/lib/ai-sdk';
import { ok, err, isOk, type Result } from '@/lib/types';
import type { FundamentalData, TechnicalData, AnalystData } from './types';

async function searchAndParse<T>(query: string, parsePrompt: string, fallback: T): Promise<Result<T>> {
  try {
    const searchResult = await webSearch({ query, num: 8 });
    if (!isOk(searchResult)) return ok(fallback);

    const snippets = searchResult.value
      .map((r, i) => `[${i + 1}] ${r.name}: ${r.snippet}`)
      .join('\n');

    const parseResult = await askAI(
      `${parsePrompt}\n\nSearch results:\n${snippets}\n\nReturn ONLY valid JSON, no markdown.`,
      'Financial data parser. Return only valid JSON.',
      'small',
    );

    if (!isOk(parseResult)) return ok(fallback);

    try {
      const text = parseResult.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return ok(JSON.parse(text) as T);
    } catch {
      return ok(fallback);
    }
  } catch {
    return ok(fallback);
  }
}

export async function researchFundamentals(ticker: string): Promise<Result<FundamentalData>> {
  return searchAndParse<FundamentalData>(
    `${ticker} fundamental analysis market cap PE ratio ROE debt revenue growth 2024 2025`,
    `Extract fundamental data for ${ticker}. Return JSON: {"ticker":"${ticker}","marketCap":"...","pe":0,"pb":0,"roe":0,"debtToEquity":0,"revenue":"...","revenueGrowth":0,"netIncome":"...","eps":0,"dividend":0,"payoutRatio":0}`,
    { ticker, marketCap: 'N/A', pe: 0, pb: 0, roe: 0, debtToEquity: 0, revenue: 'N/A', revenueGrowth: 0, netIncome: 'N/A', eps: 0, dividend: 0, payoutRatio: 0 },
  );
}

export async function researchTechnicals(ticker: string): Promise<Result<TechnicalData>> {
  return searchAndParse<TechnicalData>(
    `${ticker} technical analysis RSI MACD support resistance trend 50-day 200-day moving average 2025`,
    `Extract technical data for ${ticker}. Return JSON: {"ticker":"${ticker}","price":0,"change50d":0,"change200d":0,"rsi":50,"macd":"...","support":0,"resistance":0,"trend":"neutral","volume":"..."}`,
    { ticker, price: 0, change50d: 0, change200d: 0, rsi: 50, macd: 'N/A', support: 0, resistance: 0, trend: 'neutral' as const, volume: 'N/A' },
  );
}

export async function researchAnalyst(ticker: string): Promise<Result<AnalystData>> {
  return searchAndParse<AnalystData>(
    `${ticker} analyst ratings consensus price target buy sell hold 2025`,
    `Extract analyst data for ${ticker}. Return JSON: {"ticker":"${ticker}","consensus":"hold","targetPrice":0,"currentPrice":0,"upside":0,"buyCount":0,"holdCount":0,"sellCount":0}`,
    { ticker, consensus: 'hold' as const, targetPrice: 0, currentPrice: 0, upside: 0, buyCount: 0, holdCount: 0, sellCount: 0 },
  );
}

export async function generateResearchReport(ticker: string): Promise<Result<string>> {
  const [fund, tech, analyst] = await Promise.all([
    researchFundamentals(ticker),
    researchTechnicals(ticker),
    researchAnalyst(ticker),
  ]);

  const fundData = isOk(fund) ? fund.value : null;
  const techData = isOk(tech) ? tech.value : null;
  const analystData = isOk(analyst) ? analyst.value : null;

  const result = await askAI(
    `Generate a comprehensive research report for ${ticker} based on:

Fundamentals: ${JSON.stringify(fundData)}
Technicals: ${JSON.stringify(techData)}
Analyst Consensus: ${JSON.stringify(analystData)}

Structure:
1. Executive Summary
2. Fundamental Analysis
3. Technical Analysis
4. Analyst Consensus
5. Risk Assessment
6. Conclusion & Recommendation

Be specific with numbers. Distinguish facts from opinions.`,
    'You are a senior financial analyst. Write a professional research report.',
    'medium',
  );

  return ok(isOk(result) ? result.value.text : 'Report generation failed');
}
