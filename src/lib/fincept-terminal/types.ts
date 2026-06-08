/**
 * Fincept Terminal - Type Definitions
 * AI-powered financial terminal types
 */

import type { BaseWorkspaceState, TokenUsage } from '@/lib/types';

// =================== Research Types ===================

export interface FundamentalData {
  ticker: string;
  marketCap: string;
  pe: number;
  pb: number;
  roe: number;
  debtToEquity: number;
  revenue: string;
  revenueGrowth: number;
  netIncome: string;
  eps: number;
  dividend: number;
  payoutRatio: number;
}

export interface TechnicalData {
  ticker: string;
  price: number;
  change50d: number;
  change200d: number;
  rsi: number;
  macd: string;
  support: number;
  resistance: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  volume: string;
}

export interface AnalystData {
  ticker: string;
  consensus: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  targetPrice: number;
  currentPrice: number;
  upside: number;
  buyCount: number;
  holdCount: number;
  sellCount: number;
}

// =================== Market Types ===================

export interface MarketOverview {
  indices: MarketIndex[];
  sectors: SectorPerformance[];
  topMovers: TopMover[];
  commodities: Commodity[];
  currencies: Currency[];
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface SectorPerformance {
  name: string;
  changePercent: number;
}

export interface TopMover {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  type: 'gainer' | 'loser';
}

export interface Commodity {
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface Currency {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
}

export interface NewsItem {
  title: string;
  summary: string;
  source: string;
  date: string;
  category: string;
}

// =================== Agent Types ===================

export interface AgentInfo {
  id: string;
  name: string;
  specialty: string;
  description: string;
  accuracy: number;
  totalCalls: number;
  status: 'active' | 'idle' | 'learning';
  lastActive: string;
  systemPrompt: string;
}

// =================== Trading Types ===================

export interface Position {
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
}

export interface Order {
  id: string;
  ticker: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  timestamp: string;
  status: 'filled' | 'pending' | 'cancelled';
}

export interface Account {
  balance: number;
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  positions: Position[];
  orders: Order[];
}

// =================== Workspace State ===================

export interface FinceptWorkspaceState extends BaseWorkspaceState {
  toolId: 'fincept-terminal';
  currentTicker?: string;
  account?: Account;
}
