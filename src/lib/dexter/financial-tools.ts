/**
 * Dexter - Financial Data Tools
 * Web search + AI-powered financial data retrieval
 */

import { webSearch, askAI } from '@/lib/ai-sdk';
import { ok, err, isOk, type Result } from '@/lib/types';
import type {
  StockPrice,
  CryptoPrice,
  MarketIndex,
  Sector,
  TopMover,
  IncomeStatement,
  BalanceSheet,
  CashFlow,
  KeyRatios,
  Earnings,
  Filing,
  ScreenerFilter,
  ScreenerResult,
} from './types';

// =================== Helper ===================

async function searchAndParse<T>(
  searchQuery: string,
  parsePrompt: string,
  fallback: T,
): Promise<Result<T>> {
  try {
    const searchResult = await webSearch({ query: searchQuery, num: 8 });
    if (!isOk(searchResult)) return err(searchResult.error);

    const snippets = searchResult.value
      .map((r, i) => `[${i + 1}] ${r.name}: ${r.snippet}`)
      .join('\n');

    const parseResult = await askAI(
      `${parsePrompt}\n\nSearch results:\n${snippets}\n\nReturn ONLY valid JSON, no markdown fences.`,
      'You are a financial data parser. Extract precise numerical data. Return only valid JSON.',
      'small',
    );

    if (!isOk(parseResult)) return ok(fallback);

    try {
      const text = parseResult.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(text) as T;
      return ok(parsed);
    } catch {
      return ok(fallback);
    }
  } catch (error) {
    return ok(fallback);
  }
}

// =================== Market Data Tools ===================

/** Get current stock price data */
export async function getStockPrice(ticker: string): Promise<Result<StockPrice>> {
  const fallback: StockPrice = {
    ticker, name: ticker, price: 0, change: 0, changePercent: 0,
    volume: 0, marketCap: 0, pe: 0, high52w: 0, low52w: 0,
  };

  return searchAndParse<StockPrice>(
    `${ticker} stock price today current quote market cap PE ratio 52 week high low 2025`,
    `Extract stock price data for ${ticker}. Return JSON: {"ticker":"${ticker}","name":"...","price":0,"change":0,"changePercent":0,"volume":0,"marketCap":0,"pe":0,"high52w":0,"low52w":0}`,
    fallback,
  );
}

/** Get current crypto price data */
export async function getCryptoPrice(symbol: string): Promise<Result<CryptoPrice>> {
  const fallback: CryptoPrice = {
    symbol, name: symbol, price: 0, change24h: 0, changePercent24h: 0,
    volume24h: 0, marketCap: 0,
  };

  return searchAndParse<CryptoPrice>(
    `${symbol} crypto price today 24h change volume market cap 2025`,
    `Extract crypto price data for ${symbol}. Return JSON: {"symbol":"${symbol}","name":"...","price":0,"change24h":0,"changePercent24h":0,"volume24h":0,"marketCap":0}`,
    fallback,
  );
}

/** Get market indices data */
export async function getMarketIndices(): Promise<Result<MarketIndex[]>> {
  return searchAndParse<MarketIndex[]>(
    'US stock market indices today S&P 500 Dow Jones NASDAQ Russell 2000 current value change 2025',
    `Extract market index data. Return JSON array: [{"name":"S&P 500","value":0,"change":0,"changePercent":0}]`,
    [],
  );
}

/** Get sector performance */
export async function getSectorPerformance(): Promise<Result<Sector[]>> {
  return searchAndParse<Sector[]>(
    'stock market sector performance today technology healthcare energy financials 2025',
    `Extract sector performance data. Return JSON array: [{"name":"Technology","changePercent":0,"topStocks":["AAPL"],"marketCap":"$0T"}]`,
    [],
  );
}

/** Get top market movers */
export async function getTopMovers(): Promise<Result<TopMover[]>> {
  return searchAndParse<TopMover[]>(
    'stock market top gainers losers today biggest movers 2025',
    `Extract top market movers. Return JSON array: [{"ticker":"AAPL","name":"Apple","price":0,"changePercent":0,"volume":0,"type":"gainer"}]`,
    [],
  );
}

/** Get company news */
export async function getCompanyNews(ticker: string): Promise<Result<Array<{ title: string; summary: string; date: string; source: string }>>> {
  return searchAndParse(
    `${ticker} stock news latest headlines today 2025`,
    `Extract recent news for ${ticker}. Return JSON array: [{"title":"...","summary":"...","date":"...","source":"..."}]`,
    [],
  );
}

/** Get insider trading data */
export async function getInsiderTrades(ticker: string): Promise<Result<Array<{ insider: string; title: string; transaction: string; shares: number; date: string }>>> {
  return searchAndParse(
    `${ticker} insider trading activity buys sells recent 2025`,
    `Extract insider trading data for ${ticker}. Return JSON array: [{"insider":"...","title":"...","transaction":"Buy","shares":0,"date":"..."}]`,
    [],
  );
}

// =================== Financial Statement Tools ===================

/** Get income statement */
export async function getIncomeStatement(ticker: string): Promise<Result<IncomeStatement[]>> {
  return searchAndParse<IncomeStatement[]>(
    `${ticker} income statement revenue earnings annual quarterly financial results 2024 2025`,
    `Extract income statement data for ${ticker}. Return JSON array: [{"ticker":"${ticker}","period":"FY2024","revenue":0,"costOfRevenue":0,"grossProfit":0,"operatingIncome":0,"netIncome":0,"eps":0,"ebitda":0}]`,
    [],
  );
}

/** Get balance sheet */
export async function getBalanceSheet(ticker: string): Promise<Result<BalanceSheet[]>> {
  return searchAndParse<BalanceSheet[]>(
    `${ticker} balance sheet total assets liabilities equity cash debt 2024 2025`,
    `Extract balance sheet data for ${ticker}. Return JSON array: [{"ticker":"${ticker}","period":"FY2024","totalAssets":0,"totalLiabilities":0,"totalEquity":0,"cash":0,"totalDebt":0,"currentAssets":0,"currentLiabilities":0}]`,
    [],
  );
}

/** Get cash flow statement */
export async function getCashFlow(ticker: string): Promise<Result<CashFlow[]>> {
  return searchAndParse<CashFlow[]>(
    `${ticker} cash flow statement operating free cash flow capex 2024 2025`,
    `Extract cash flow data for ${ticker}. Return JSON array: [{"ticker":"${ticker}","period":"FY2024","operatingCashFlow":0,"capitalExpenditure":0,"freeCashFlow":0,"dividendPayments":0,"shareRepurchase":0,"netBorrowing":0}]`,
    [],
  );
}

/** Get key financial ratios */
export async function getKeyRatios(ticker: string): Promise<Result<KeyRatios>> {
  const fallback: KeyRatios = {
    ticker, roe: 0, roa: 0, roic: 0, debtToEquity: 0,
    currentRatio: 0, quickRatio: 0, grossMargin: 0,
    operatingMargin: 0, netMargin: 0, payoutRatio: 0,
  };

  return searchAndParse<KeyRatios>(
    `${ticker} financial ratios ROE ROA debt to equity current ratio margins 2024`,
    `Extract key financial ratios for ${ticker}. Return JSON: {"ticker":"${ticker}","roe":0,"roa":0,"roic":0,"debtToEquity":0,"currentRatio":0,"quickRatio":0,"grossMargin":0,"operatingMargin":0,"netMargin":0,"payoutRatio":0}`,
    fallback,
  );
}

/** Get earnings data */
export async function getEarnings(ticker: string): Promise<Result<Earnings[]>> {
  return searchAndParse<Earnings[]>(
    `${ticker} earnings report EPS actual estimate surprise quarterly 2024 2025`,
    `Extract earnings data for ${ticker}. Return JSON array: [{"ticker":"${ticker}","date":"...","epsActual":0,"epsEstimate":0,"epsSurprise":0,"epsSurprisePercent":0,"revenueActual":0,"revenueEstimate":0}]`,
    [],
  );
}

// =================== SEC Filings Tool ===================

/** Get SEC filings */
export async function getFilings(ticker: string, type: string = '10-K'): Promise<Result<Filing[]>> {
  return searchAndParse<Filing[]>(
    `${ticker} SEC filing ${type} annual report quarterly 2024 2025 site:sec.gov`,
    `Extract SEC filing data for ${ticker} ${type}. Return JSON array: [{"ticker":"${ticker}","type":"${type}","date":"...","title":"...","summary":"...","keyItems":[{"name":"...","content":"..."}]}]`,
    [],
  );
}

// =================== Stock Screener Tool ===================

/** Screen stocks based on criteria */
export async function screenStocks(filters: ScreenerFilter[]): Promise<Result<ScreenerResult[]>> {
  const filterDesc = filters.map(f => `${f.field} ${f.operator} ${f.value}`).join(', ');

  return searchAndParse<ScreenerResult[]>(
    `stock screener ${filterDesc} best stocks matching criteria 2025`,
    `Find stocks matching these criteria: ${filterDesc}. Return JSON array: [{"ticker":"...","name":"...","sector":"...","marketCap":"...","price":0,"pe":0,"revenue":"...","changePercent":0,"matchScore":0}]`,
    [],
  );
}

// =================== Tool Registry ===================

export interface FinancialToolDef {
  id: string;
  name: string;
  description: string;
  category: string;
  execute: (args: Record<string, unknown>) => Promise<string>;
}

const financialTools: FinancialToolDef[] = [
  {
    id: 'get_stock_price',
    name: 'Get Stock Price',
    description: 'Get current stock price, change, volume, market cap, PE ratio, 52-week range',
    category: 'market',
    execute: async (args) => {
      const ticker = args.ticker as string;
      const result = await getStockPrice(ticker);
      return isOk(result) ? JSON.stringify(result.value) : `Error: ${result.error.message}`;
    },
  },
  {
    id: 'get_crypto_price',
    name: 'Get Crypto Price',
    description: 'Get cryptocurrency price, 24h change, volume, market cap',
    category: 'market',
    execute: async (args) => {
      const symbol = args.symbol as string;
      const result = await getCryptoPrice(symbol);
      return isOk(result) ? JSON.stringify(result.value) : `Error: ${result.error.message}`;
    },
  },
  {
    id: 'get_market_data',
    name: 'Get Market Data',
    description: 'Get market indices, sector performance, top movers',
    category: 'market',
    execute: async () => {
      const [indices, sectors, movers] = await Promise.all([
        getMarketIndices(),
        getSectorPerformance(),
        getTopMovers(),
      ]);
      return JSON.stringify({
        indices: isOk(indices) ? indices.value : [],
        sectors: isOk(sectors) ? sectors.value : [],
        movers: isOk(movers) ? movers.value : [],
      });
    },
  },
  {
    id: 'get_income_statement',
    name: 'Get Income Statement',
    description: 'Get revenue, earnings, EPS, EBITDA for a company',
    category: 'financials',
    execute: async (args) => {
      const ticker = args.ticker as string;
      const result = await getIncomeStatement(ticker);
      return isOk(result) ? JSON.stringify(result.value) : `Error: ${result.error.message}`;
    },
  },
  {
    id: 'get_balance_sheet',
    name: 'Get Balance Sheet',
    description: 'Get assets, liabilities, equity, cash, debt for a company',
    category: 'financials',
    execute: async (args) => {
      const ticker = args.ticker as string;
      const result = await getBalanceSheet(ticker);
      return isOk(result) ? JSON.stringify(result.value) : `Error: ${result.error.message}`;
    },
  },
  {
    id: 'get_cash_flow',
    name: 'Get Cash Flow',
    description: 'Get operating cash flow, free cash flow, capex for a company',
    category: 'financials',
    execute: async (args) => {
      const ticker = args.ticker as string;
      const result = await getCashFlow(ticker);
      return isOk(result) ? JSON.stringify(result.value) : `Error: ${result.error.message}`;
    },
  },
  {
    id: 'get_key_ratios',
    name: 'Get Key Ratios',
    description: 'Get ROE, ROA, margins, debt ratios for a company',
    category: 'financials',
    execute: async (args) => {
      const ticker = args.ticker as string;
      const result = await getKeyRatios(ticker);
      return isOk(result) ? JSON.stringify(result.value) : `Error: ${result.error.message}`;
    },
  },
  {
    id: 'get_earnings',
    name: 'Get Earnings',
    description: 'Get EPS actual vs estimate, surprises, revenue for a company',
    category: 'financials',
    execute: async (args) => {
      const ticker = args.ticker as string;
      const result = await getEarnings(ticker);
      return isOk(result) ? JSON.stringify(result.value) : `Error: ${result.error.message}`;
    },
  },
  {
    id: 'get_filings',
    name: 'Get SEC Filings',
    description: 'Get SEC filings (10-K, 10-Q, 8-K) for a company',
    category: 'filings',
    execute: async (args) => {
      const ticker = args.ticker as string;
      const type = (args.type as string) || '10-K';
      const result = await getFilings(ticker, type);
      return isOk(result) ? JSON.stringify(result.value) : `Error: ${result.error.message}`;
    },
  },
  {
    id: 'screen_stocks',
    name: 'Screen Stocks',
    description: 'Screen stocks based on financial criteria (PE, market cap, sector, etc.)',
    category: 'screener',
    execute: async (args) => {
      const filters = (args.filters as ScreenerFilter[]) || [];
      const result = await screenStocks(filters);
      return isOk(result) ? JSON.stringify(result.value) : `Error: ${result.error.message}`;
    },
  },
  {
    id: 'get_company_news',
    name: 'Get Company News',
    description: 'Get recent news headlines for a company',
    category: 'market',
    execute: async (args) => {
      const ticker = args.ticker as string;
      const result = await getCompanyNews(ticker);
      return isOk(result) ? JSON.stringify(result.value) : `Error: ${result.error.message}`;
    },
  },
  {
    id: 'get_insider_trades',
    name: 'Get Insider Trades',
    description: 'Get recent insider buying/selling activity for a company',
    category: 'market',
    execute: async (args) => {
      const ticker = args.ticker as string;
      const result = await getInsiderTrades(ticker);
      return isOk(result) ? JSON.stringify(result.value) : `Error: ${result.error.message}`;
    },
  },
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Search the web for any information',
    category: 'search',
    execute: async (args) => {
      const query = args.query as string;
      const result = await webSearch({ query, num: 5 });
      if (!isOk(result)) return `Search failed: ${result.error.message}`;
      return result.value.map((r, i) => `[${i + 1}] ${r.name}\n${r.snippet}\nURL: ${r.url}`).join('\n\n');
    },
  },
];

export const FINANCIAL_TOOLS = financialTools;

export function getToolById(id: string): FinancialToolDef | undefined {
  return financialTools.find(t => t.id === id);
}
