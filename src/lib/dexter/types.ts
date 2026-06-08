/**
 * Dexter - Type Definitions
 * Autonomous financial research agent types
 */

import type { BaseWorkspaceState, TokenUsage } from '@/lib/types';

// =================== Financial Data Types ===================

export interface StockPrice {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  high52w: number;
  low52w: number;
  sparkline?: number[];
}

export interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  sparkline?: number[];
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface Sector {
  name: string;
  changePercent: number;
  topStocks: string[];
  marketCap: string;
}

export interface TopMover {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  type: 'gainer' | 'loser';
}

// =================== Financial Statement Types ===================

export interface IncomeStatement {
  ticker: string;
  period: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
  ebitda: number;
}

export interface BalanceSheet {
  ticker: string;
  period: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  cash: number;
  totalDebt: number;
  currentAssets: number;
  currentLiabilities: number;
}

export interface CashFlow {
  ticker: string;
  period: string;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
  dividendPayments: number;
  shareRepurchase: number;
  netBorrowing: number;
}

export interface KeyRatios {
  ticker: string;
  roe: number;
  roa: number;
  roic: number;
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  payoutRatio: number;
}

export interface Segment {
  name: string;
  revenue: number;
  operatingIncome: number;
  percentage: number;
}

export interface Earnings {
  ticker: string;
  date: string;
  epsActual: number;
  epsEstimate: number;
  epsSurprise: number;
  epsSurprisePercent: number;
  revenueActual: number;
  revenueEstimate: number;
}

// =================== Filing Types ===================

export interface Filing {
  ticker: string;
  type: string;
  date: string;
  title: string;
  summary: string;
  keyItems: FilingItem[];
}

export interface FilingItem {
  name: string;
  content: string;
}

// =================== Screener Types ===================

export interface ScreenerFilter {
  field: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'in';
  value: number | string | string[];
}

export interface ScreenerResult {
  ticker: string;
  name: string;
  sector: string;
  marketCap: string;
  price: number;
  pe: number;
  revenue: string;
  changePercent: number;
  matchScore: number;
}

// =================== Memory Types ===================

export interface MemoryEntry {
  key: string;
  value: string;
  confidence: number;
  source: 'user' | 'agent' | 'system';
  tags: string[];
  timestamp: string;
}

export interface MemorySearchResult {
  entry: MemoryEntry;
  score: number;
}

// =================== Skill Types ===================

export interface Skill {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: 'valuation' | 'research' | 'writing' | 'analysis';
  isBuiltIn: boolean;
  enabled: boolean;
  createdAt: string;
}

// =================== Settings Types ===================

export interface ProviderSettings {
  model: string;
  fastModel: string;
  searchProvider: string;
  memoryEnabled: boolean;
  autoCompact: boolean;
  maxIterations: number;
  temperature: number;
}

export const DEFAULT_SETTINGS: ProviderSettings = {
  model: 'glm-4-plus',
  fastModel: 'glm-4-flash',
  searchProvider: 'web',
  memoryEnabled: true,
  autoCompact: true,
  maxIterations: 10,
  temperature: 0.7,
};

// =================== Cron Types ===================

export interface CronSchedule {
  kind: 'at' | 'every' | 'cron';
  at?: string;
  everyMs?: number;
  expr?: string;
  tz?: string;
}

export interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: CronSchedule;
  message: string;
  model?: string;
  fulfillment: 'keep' | 'once' | 'ask';
  state: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastRunStatus?: 'success' | 'failed';
    consecutiveErrors: number;
  };
  createdAt: string;
}

// =================== Heartbeat Types ===================

export interface HeartbeatCheck {
  id: string;
  label: string;
  query: string;
  enabled: boolean;
  lastChecked?: string;
  lastResult?: string;
}

// =================== Query Types ===================

export interface QueryRequest {
  message: string;
  mode?: 'default' | 'research' | 'analysis';
  skills?: string[];
  context?: string;
}

export interface QueryResponse {
  response: string;
  mode: string;
  agentsInvoked: string[];
  toolCalls: ToolCallRecord[];
  artifacts: Artifact[];
  tokenUsage: TokenUsage;
  timestamp: string;
}

export interface ToolCallRecord {
  id: string;
  name: string;
  arguments: string;
  result?: string;
  status: 'pending' | 'completed' | 'failed';
  duration?: number;
}

export interface Artifact {
  id: string;
  type: 'text' | 'code' | 'data' | 'report';
  title: string;
  content: string;
  createdAt: string;
}

// =================== Workspace State ===================

export interface DexterWorkspaceState extends BaseWorkspaceState {
  toolId: 'dexter';
  currentQuery?: string;
  mode?: 'default' | 'research' | 'analysis';
  activeSkills?: string[];
  recentQueries?: string[];
}
