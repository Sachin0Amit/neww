/**
 * Fincept Terminal - Market Data
 * Web search-powered market overview
 */

import { webSearch, askAI } from '@/lib/ai-sdk';
import { ok, isOk, type Result } from '@/lib/types';
import type { MarketOverview } from './types';

export async function getMarketOverview(): Promise<Result<MarketOverview>> {
  const [indicesResult, sectorsResult, moversResult, commoditiesResult, currenciesResult] = await Promise.all([
    searchMarketData<MarketOverview['indices']>(
      'US stock market indices today S&P 500 Dow Jones NASDAQ Russell 2000 current value change 2025',
      'Extract market index data. Return JSON array: [{"name":"S&P 500","value":0,"change":0,"changePercent":0}]',
      [],
    ),
    searchMarketData<MarketOverview['sectors']>(
      'stock market sector performance today technology healthcare energy financials 2025',
      'Extract sector data. Return JSON array: [{"name":"Technology","changePercent":0}]',
      [],
    ),
    searchMarketData<MarketOverview['topMovers']>(
      'stock market top gainers losers today 2025',
      'Extract top movers. Return JSON array: [{"ticker":"AAPL","name":"Apple","price":0,"changePercent":0,"type":"gainer"}]',
      [],
    ),
    searchMarketData<MarketOverview['commodities']>(
      'commodity prices today gold oil silver natural gas copper 2025',
      'Extract commodity data. Return JSON array: [{"name":"Gold","price":0,"change":0,"changePercent":0}]',
      [],
    ),
    searchMarketData<MarketOverview['currencies']>(
      'currency exchange rates today EUR USD GBP JPY 2025',
      'Extract currency data. Return JSON array: [{"pair":"EUR/USD","rate":0,"change":0,"changePercent":0}]',
      [],
    ),
  ]);

  return ok({
    indices: isOk(indicesResult) ? indicesResult.value : [],
    sectors: isOk(sectorsResult) ? sectorsResult.value : [],
    topMovers: isOk(moversResult) ? moversResult.value : [],
    commodities: isOk(commoditiesResult) ? commoditiesResult.value : [],
    currencies: isOk(currenciesResult) ? currenciesResult.value : [],
  });
}

export async function getNews(category?: string): Promise<Result<Array<{ title: string; summary: string; source: string; date: string; category: string }>>> {
  return searchMarketData(
    `${category || 'finance'} market news today latest headlines 2025`,
    'Extract news. Return JSON array: [{"title":"...","summary":"...","source":"...","date":"...","category":"..."}]',
    [],
  );
}

async function searchMarketData<T>(query: string, parsePrompt: string, fallback: T): Promise<Result<T>> {
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
