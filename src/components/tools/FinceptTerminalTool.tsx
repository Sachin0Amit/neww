'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BarChart3, ArrowLeftRight, Search, Brain, Globe,
  Landmark, Bitcoin, Settings, X, TrendingUp,
  Bell, ChevronRight, Activity, DollarSign, Percent,
  Send, Cpu, Wallet, Wifi, WifiOff, Eye, EyeOff, Plus, Trash2,
  FileText, Target, Terminal, Lock, Key,
  CalendarDays, Building2, Ship, CircleDot,
  Coins, Flame, Gem
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'

// ─── Simulated Data ──────────────────────────────────────────────

const MARKET_INDICES = [
  { symbol: 'S&P 500', value: 5892.47, change: +0.84, pct: +0.0143 },
  { symbol: 'NASDAQ', value: 19112.35, change: +127.63, pct: +0.672 },
  { symbol: 'DOW', value: 43821.09, change: -42.77, pct: -0.097 },
  { symbol: '10Y YIELD', value: 4.287, change: -0.034, pct: -0.787 },
  { symbol: 'VIX', value: 14.62, change: -1.18, pct: -7.47 },
  { symbol: 'BTC/USD', value: 104832.50, change: +2147.30, pct: +2.09 },
]

const KPI_DATA = [
  { label: 'Portfolio Value', value: '$2,847,392.15', change: '+3.24%', positive: true, icon: DollarSign },
  { label: 'Daily P&L', value: '+$89,234.67', change: '+1.28%', positive: true, icon: TrendingUp },
  { label: 'Active Positions', value: '47', change: '3 new', positive: true, icon: Target },
  { label: 'Win Rate', value: '68.4%', change: '+2.1%', positive: true, icon: Percent },
]

const RECENT_ALERTS = [
  { time: '14:32:18', type: 'TRADE', msg: 'Filled: BUY 200 AAPL @ $213.45 (Morgan Stanley)', severity: 'success' },
  { time: '14:28:05', type: 'ALERT', msg: 'VIX dropped below 15 — low volatility regime detected', severity: 'warning' },
  { time: '14:15:42', type: 'AI', msg: 'Buffett Agent: NVDA intrinsic value $185.20, margin of safety 12.3%', severity: 'info' },
  { time: '13:58:11', type: 'RISK', msg: 'Portfolio beta exceeded 1.5 threshold — consider hedging', severity: 'danger' },
  { time: '13:45:30', type: 'TRADE', msg: 'Filled: SELL 100 MSFT @ $445.82 (Interactive Brokers)', severity: 'success' },
  { time: '13:30:22', type: 'ECON', msg: 'CPI Report: Core CPI 3.2% YoY vs 3.3% expected', severity: 'info' },
  { time: '13:15:08', type: 'SYSTEM', msg: 'Data connector reconnected: Bloomberg Terminal (321/321 active)', severity: 'success' },
  { time: '12:58:44', type: 'ALERT', msg: 'Goldman Sachs upgrades AMZN to Conviction Buy, PT $265', severity: 'warning' },
]

const TOP_MOVERS = [
  { ticker: 'NVDA', name: 'NVIDIA Corp', price: 142.53, change: +8.34, pct: +6.22, volume: '312M' },
  { ticker: 'SMCI', name: 'Super Micro', price: 38.72, change: +5.18, pct: +15.45, volume: '89M' },
  { ticker: 'MSTR', name: 'MicroStrategy', price: 412.80, change: +22.15, pct: +5.67, volume: '24M' },
  { ticker: 'PLTR', name: 'Palantir Tech', price: 78.94, change: +3.42, pct: +4.53, volume: '67M' },
  { ticker: 'COIN', name: 'Coinbase', price: 285.30, change: -12.47, pct: -4.19, volume: '18M' },
  { ticker: 'NKE', name: 'Nike Inc', price: 72.15, change: -4.82, pct: -6.26, volume: '31M' },
  { ticker: 'PYPL', name: 'PayPal', price: 84.62, change: -5.13, pct: -5.72, volume: '22M' },
  { ticker: 'BA', name: 'Boeing Co', price: 178.34, change: -8.91, pct: -4.76, volume: '14M' },
]

const SECTOR_DATA = [
  { name: 'Technology', pct: +2.84, color: '#10b981' },
  { name: 'Healthcare', pct: +1.23, color: '#10b981' },
  { name: 'Financials', pct: +0.87, color: '#10b981' },
  { name: 'Consumer Disc.', pct: +0.45, color: '#10b981' },
  { name: 'Industrials', pct: -0.12, color: '#ef4444' },
  { name: 'Energy', pct: -0.89, color: '#ef4444' },
  { name: 'Materials', pct: -1.34, color: '#ef4444' },
  { name: 'Utilities', pct: -0.56, color: '#ef4444' },
  { name: 'Real Estate', pct: -2.11, color: '#ef4444' },
  { name: 'Comm. Services', pct: +1.67, color: '#10b981' },
  { name: 'Consumer Staples', pct: +0.22, color: '#10b981' },
]

const COMMODITIES = [
  { name: 'Gold', price: 2687.30, change: +12.40, unit: '/oz' },
  { name: 'Silver', price: 32.45, change: +0.87, unit: '/oz' },
  { name: 'Crude Oil WTI', price: 71.82, change: -1.34, unit: '/bbl' },
  { name: 'Natural Gas', price: 3.421, change: +0.087, unit: '/MMBtu' },
  { name: 'Copper', price: 4.523, change: +0.034, unit: '/lb' },
  { name: 'Platinum', price: 987.40, change: -8.20, unit: '/oz' },
  { name: 'Wheat', price: 589.25, change: -4.50, unit: '/bu' },
  { name: 'Corn', price: 432.75, change: +2.25, unit: '/bu' },
]

const MARKET_BREADTH = [
  { label: 'NYSE Advancing', value: '1,847', pct: 62 },
  { label: 'NYSE Declining', value: '1,134', pct: 38 },
  { label: 'New Highs', value: '187', pct: 0 },
  { label: 'New Lows', value: '42', pct: 0 },
  { label: 'NASD Advancing', value: '2,134', pct: 58 },
  { label: 'NASD Declining', value: '1,543', pct: 42 },
  { label: 'TRIN (NYSE)', value: '0.87', pct: 0 },
  { label: 'Advance/Decline', value: '1.63', pct: 0 },
]

const BROKERS = [
  { name: 'Interactive Brokers', status: 'connected', latency: '12ms' },
  { name: 'Morgan Stanley', status: 'connected', latency: '18ms' },
  { name: 'Goldman Sachs', status: 'connected', latency: '22ms' },
  { name: 'Charles Schwab', status: 'connected', latency: '15ms' },
  { name: 'Fidelity', status: 'connected', latency: '19ms' },
  { name: 'TD Ameritrade', status: 'connected', latency: '21ms' },
  { name: 'E*TRADE', status: 'connected', latency: '14ms' },
  { name: 'Robinhood', status: 'connected', latency: '28ms' },
  { name: 'Webull', status: 'connected', latency: '32ms' },
  { name: 'Alpaca', status: 'connected', latency: '9ms' },
  { name: 'Tradier', status: 'connected', latency: '16ms' },
  { name: 'TradeStation', status: 'disconnected', latency: '—' },
  { name: 'Tradovate', status: 'connected', latency: '24ms' },
  { name: 'FXCM', status: 'connected', latency: '31ms' },
  { name: 'OANDA', status: 'connected', latency: '27ms' },
  { name: 'Coinbase Prime', status: 'connected', latency: '45ms' },
  { name: 'Binance', status: 'connected', latency: '38ms' },
  { name: 'Kraken', status: 'connected', latency: '42ms' },
]

const OPEN_POSITIONS = [
  { ticker: 'AAPL', qty: 200, avg: 198.45, current: 213.45, pnl: '+$3,000.00', pnlPct: '+7.56%', side: 'long' },
  { ticker: 'NVDA', qty: 150, avg: 125.80, current: 142.53, pnl: '+$2,509.50', pnlPct: '+13.27%', side: 'long' },
  { ticker: 'MSFT', qty: 100, avg: 412.30, current: 445.82, pnl: '+$3,352.00', pnlPct: '+8.13%', side: 'long' },
  { ticker: 'TSLA', qty: 75, avg: 285.40, current: 268.15, pnl: '-$1,293.75', pnlPct: '-6.04%', side: 'long' },
  { ticker: 'SPY 450P', qty: -10, avg: 3.45, current: 2.12, pnl: '+$1,330.00', pnlPct: '+38.55%', side: 'short' },
  { ticker: 'AMZN', qty: 80, avg: 188.50, current: 204.30, pnl: '+$1,264.00', pnlPct: '+8.38%', side: 'long' },
]

const RECENT_ORDERS = [
  { time: '14:32:18', ticker: 'AAPL', side: 'BUY', qty: 200, price: 213.45, type: 'LIMIT', status: 'FILLED', broker: 'Morgan Stanley' },
  { time: '13:45:30', ticker: 'MSFT', side: 'SELL', qty: 100, price: 445.82, type: 'LIMIT', status: 'FILLED', broker: 'IBKR' },
  { time: '12:15:22', ticker: 'TSLA', side: 'BUY', qty: 75, price: 285.40, type: 'MARKET', status: 'FILLED', broker: 'Fidelity' },
  { time: '11:30:05', ticker: 'SPY', side: 'SELL', qty: 10, price: 3.45, type: 'LIMIT', status: 'FILLED', broker: 'Schwab' },
  { time: '10:45:18', ticker: 'NVDA', side: 'BUY', qty: 50, price: 138.20, type: 'STOP', status: 'CANCELLED', broker: 'IBKR' },
]

const AI_AGENTS = [
  { id: 'buffett', name: 'Warren Buffett', style: 'Value Investing', avatar: '🐂', status: 'active' },
  { id: 'graham', name: 'Benjamin Graham', style: 'Deep Value', avatar: '📖', status: 'active' },
  { id: 'lynch', name: 'Peter Lynch', style: 'Growth at Reasonable Price', avatar: '🔍', status: 'active' },
  { id: 'dalio', name: 'Ray Dalio', style: 'Macro/All Weather', avatar: '🌊', status: 'active' },
  { id: 'soros', name: 'George Soros', style: 'Reflexivity/Macro', avatar: '⚔️', status: 'active' },
  { id: 'wood', name: 'Cathie Wood', style: 'Disruptive Innovation', avatar: '🚀', status: 'idle' },
  { id: 'druckenmiller', name: 'Stan Druckenmiller', style: 'Macro/Concentration', avatar: '🎯', status: 'active' },
  { id: 'tepper', name: 'David Tepper', style: 'Distressed/Event', avatar: '🔥', status: 'active' },
  { id: 'ackman', name: 'Bill Ackman', style: 'Activist/Concentrated', avatar: '💪', status: 'idle' },
  { id: 'simons', name: 'Jim Simons', style: 'Quant/Systematic', avatar: '🧮', status: 'active' },
  { id: 'tudor', name: 'Paul Tudor Jones', style: 'Macro/Tactical', avatar: '⚡', status: 'active' },
  { id: 'fisher', name: 'Ken Fisher', style: 'Growth/Global', avatar: '🌍', status: 'active' },
  { id: 'greenblatt', name: 'Joel Greenblatt', style: 'Special Situations', avatar: '✨', status: 'idle' },
]

const LLM_PROVIDERS = [
  { name: 'OpenAI GPT-4o', model: 'gpt-4o-2024-08-06', status: 'active' },
  { name: 'Anthropic Claude 3.5', model: 'claude-3-5-sonnet-20241022', status: 'active' },
  { name: 'Google Gemini 2.0', model: 'gemini-2.0-flash', status: 'active' },
  { name: 'Meta Llama 3.1', model: 'llama-3.1-405b', status: 'active' },
  { name: 'Mistral Large', model: 'mistral-large-2411', status: 'active' },
  { name: 'DeepSeek V3', model: 'deepseek-chat', status: 'idle' },
  { name: 'Cohere Command R+', model: 'command-r-plus', status: 'active' },
  { name: 'xAI Grok 2', model: 'grok-2-1212', status: 'idle' },
]

const MCP_TOOLS = [
  { name: 'SEC EDGAR Filing Scanner', status: 'online', calls: 1247 },
  { name: 'FRED Economic Data', status: 'online', calls: 892 },
  { name: 'Bloomberg Terminal Bridge', status: 'online', calls: 3456 },
  { name: 'Reuters News Feed', status: 'online', calls: 2134 },
  { name: 'Yahoo Finance API', status: 'online', calls: 5678 },
  { name: 'Alpha Vantage', status: 'online', calls: 1567 },
  { name: 'CoinGecko Crypto', status: 'online', calls: 890 },
  { name: 'Polymarket Odds', status: 'online', calls: 345 },
  { name: 'FRED FRED API', status: 'online', calls: 678 },
  { name: 'World Bank Data', status: 'online', calls: 234 },
  { name: 'OECD Statistics', status: 'online', calls: 123 },
  { name: 'TradingView Charts', status: 'online', calls: 4567 },
]

const ECONOMIC_INDICATORS = [
  { name: 'GDP Growth (QoQ)', value: '2.8%', prior: '3.1%', forecast: '2.5%', trend: 'down' },
  { name: 'Core CPI (YoY)', value: '3.2%', prior: '3.3%', forecast: '3.3%', trend: 'down' },
  { name: 'Unemployment Rate', value: '3.7%', prior: '3.8%', forecast: '3.8%', trend: 'down' },
  { name: 'Fed Funds Rate', value: '5.25-5.50%', prior: '5.25-5.50%', forecast: '5.25-5.50%', trend: 'flat' },
  { name: '10Y-2Y Spread', value: '-0.42%', prior: '-0.38%', forecast: '—', trend: 'down' },
  { name: 'ISM Manufacturing', value: '48.7', prior: '46.8', forecast: '47.5', trend: 'up' },
  { name: 'Consumer Confidence', value: '102.6', prior: '99.1', forecast: '100.0', trend: 'up' },
  { name: 'Retail Sales (MoM)', value: '+0.7%', prior: '+0.3%', forecast: '+0.4%', trend: 'up' },
  { name: 'Housing Starts', value: '1.331M', prior: '1.289M', forecast: '1.310M', trend: 'up' },
  { name: 'Initial Jobless Claims', value: '218K', prior: '225K', forecast: '222K', trend: 'down' },
]

const CENTRAL_BANK_RATES = [
  { bank: 'Federal Reserve', rate: '5.25-5.50%', next: 'Mar 19', bias: 'Dovish' },
  { bank: 'ECB', rate: '4.50%', next: 'Mar 12', bias: 'Dovish' },
  { bank: 'Bank of Japan', rate: '0.25%', next: 'Mar 19', bias: 'Hawkish' },
  { bank: 'Bank of England', rate: '5.25%', next: 'Mar 20', bias: 'Neutral' },
  { bank: 'PBOC', rate: '3.45%', next: 'Ongoing', bias: 'Dovish' },
  { bank: 'RBA', rate: '4.35%', next: 'Mar 18', bias: 'Neutral' },
  { bank: 'Bank of Canada', rate: '5.00%', next: 'Mar 12', bias: 'Dovish' },
  { bank: 'SNB', rate: '1.75%', next: 'Mar 21', bias: 'Dovish' },
]

const ECON_CALENDAR = [
  { date: 'Mar 5', time: '08:30', event: 'Trade Balance', consensus: '-$68.2B', prior: '-$64.8B', impact: 'medium' },
  { date: 'Mar 6', time: '08:30', event: 'Initial Jobless Claims', consensus: '220K', prior: '215K', impact: 'high' },
  { date: 'Mar 7', time: '08:30', event: 'Non-Farm Payrolls', consensus: '+200K', prior: '+223K', impact: 'high' },
  { date: 'Mar 7', time: '08:30', event: 'Unemployment Rate', consensus: '3.8%', prior: '3.7%', impact: 'high' },
  { date: 'Mar 11', time: '08:30', event: 'CPI (MoM)', consensus: '+0.3%', prior: '+0.3%', impact: 'high' },
  { date: 'Mar 12', time: '08:30', event: 'Core CPI (YoY)', consensus: '3.2%', prior: '3.3%', impact: 'high' },
  { date: 'Mar 14', time: '08:30', event: 'PPI (MoM)', consensus: '+0.2%', prior: '+0.4%', impact: 'medium' },
  { date: 'Mar 15', time: '10:00', event: 'Consumer Sentiment', consensus: '77.0', prior: '76.9', impact: 'medium' },
]

const GEOPOL_EVENTS = [
  { id: 1, region: 'Middle East', event: 'Red Sea shipping disruptions continue', severity: 'high', impact: 'Energy/Shipping', updated: '2h ago' },
  { id: 2, region: 'Asia-Pacific', event: 'Taiwan Strait tension escalation', severity: 'high', impact: 'Semiconductors', updated: '4h ago' },
  { id: 3, region: 'Europe', event: 'EU AI Act enforcement begins', severity: 'medium', impact: 'Technology', updated: '6h ago' },
  { id: 4, region: 'Americas', event: 'US election policy uncertainty', severity: 'medium', impact: 'Markets broadly', updated: '1h ago' },
  { id: 5, region: 'Africa', event: 'Sahel region instability', severity: 'low', impact: 'Commodities', updated: '12h ago' },
  { id: 6, region: 'Global', event: 'OPEC+ production cut extension', severity: 'high', impact: 'Energy', updated: '30m ago' },
]

const COUNTRY_RISK = [
  { country: 'United States', score: 88, trend: 'stable', flag: '🇺🇸' },
  { country: 'Germany', score: 91, trend: 'stable', flag: '🇩🇪' },
  { country: 'Japan', score: 89, trend: 'up', flag: '🇯🇵' },
  { country: 'China', score: 62, trend: 'down', flag: '🇨🇳' },
  { country: 'Brazil', score: 58, trend: 'up', flag: '🇧🇷' },
  { country: 'India', score: 64, trend: 'up', flag: '🇮🇳' },
  { country: 'Russia', score: 28, trend: 'down', flag: '🇷🇺' },
  { country: 'UAE', score: 76, trend: 'stable', flag: '🇦🇪' },
]

const PREDICTION_MARKETS = [
  { platform: 'Polymarket', event: 'Fed rate cut by June 2025', yes: 72, no: 28, volume: '$2.4M' },
  { platform: 'Polymarket', event: 'US recession in 2025', yes: 18, no: 82, volume: '$1.8M' },
  { platform: 'Kalshi', event: 'S&P 500 above 6000 by Dec', yes: 61, no: 39, volume: '$890K' },
  { platform: 'Kalshi', event: 'Bitcoin above $150K by Dec', yes: 34, no: 66, volume: '$567K' },
  { platform: 'Polymarket', event: 'China invades Taiwan by 2026', yes: 8, no: 92, volume: '$3.2M' },
  { platform: 'Kalshi', event: 'Unemployment above 5% in 2025', yes: 12, no: 88, volume: '$234K' },
]

const MARITIME_DATA = [
  { vessel: 'Ever Given', type: 'Container', route: 'Shanghai-Rotterdam', status: 'Transiting', eta: 'Mar 15' },
  { vessel: 'MSC Zoe', type: 'Container', route: 'Suez-Dubai', status: 'Delayed', eta: 'Mar 18' },
  { vessel: 'Front Hendra', type: 'Crude Tanker', route: 'Strait of Hormuz', status: 'Anchored', eta: 'TBD' },
  { vessel: 'Pacific Voyager', type: 'Bulk', route: 'Australia-China', status: 'Transiting', eta: 'Mar 12' },
]

const CRYPTO_TOKENS = [
  { symbol: 'BTC', name: 'Bitcoin', balance: 2.4523, price: 104832.50, value: '$257,131.62', change24h: '+2.09%' },
  { symbol: 'ETH', name: 'Ethereum', balance: 18.743, price: 3847.20, value: '$72,105.48', change24h: '+1.87%' },
  { symbol: 'SOL', name: 'Solana', balance: 245.8, price: 178.34, value: '$43,822.97', change24h: '+5.42%' },
  { symbol: 'AVAX', name: 'Avalanche', balance: 890.5, price: 42.15, value: '$37,534.58', change24h: '+3.18%' },
  { symbol: 'LINK', name: 'Chainlink', balance: 1200.0, price: 18.92, value: '$22,704.00', change24h: '-1.23%' },
  { symbol: 'AAVE', name: 'Aave', balance: 45.2, price: 287.40, value: '$12,990.48', change24h: '+4.56%' },
  { symbol: 'USDC', name: 'USD Coin', balance: 50000, price: 1.00, value: '$50,000.00', change24h: '0.00%' },
]

const DEFI_PROTOCOLS = [
  { name: 'Aave V3', tvl: '$12.4B', apy: '4.2-8.7%', risk: 'Low', chain: 'Multi' },
  { name: 'Lido', tvl: '$28.7B', apy: '3.8%', risk: 'Low', chain: 'Ethereum' },
  { name: 'Uniswap V4', tvl: '$5.8B', apy: '12.4-28.7%', risk: 'Medium', chain: 'Multi' },
  { name: 'Curve Finance', tvl: '$3.2B', apy: '5.1-15.3%', risk: 'Low', chain: 'Multi' },
  { name: 'Compound V3', tvl: '$2.1B', apy: '3.8-7.2%', risk: 'Low', chain: 'Multi' },
  { name: 'GMX', tvl: '$890M', apy: '18.2-42.5%', risk: 'High', chain: 'Arbitrum' },
]

const STAKING_TIERS = [
  { tier: 'Bronze', minStake: '1,000 FCT', apy: '4.2%', benefits: 'Basic data access' },
  { tier: 'Silver', minStake: '10,000 FCT', apy: '6.8%', benefits: 'Advanced analytics + AI chat' },
  { tier: 'Gold', minStake: '50,000 FCT', apy: '9.5%', benefits: 'All brokers + priority support' },
  { tier: 'Platinum', minStake: '200,000 FCT', apy: '13.2%', benefits: 'Full platform + governance' },
  { tier: 'Diamond', minStake: '1,000,000 FCT', apy: '18.7%', benefits: 'Revenue share + custom agents' },
]

const BURN_STATS = {
  totalSupply: '100,000,000 FCT',
  circulatingSupply: '67,842,120 FCT',
  totalBurned: '12,157,880 FCT',
  buybackQTD: '$2.4M',
  burnRate: '0.8% quarterly',
  nextBurnDate: 'Mar 31, 2025',
}

const SETTINGS_PROVIDERS = [
  { name: 'OpenAI', key: 'sk-***...***abc', model: 'GPT-4o', active: true },
  { name: 'Anthropic', key: 'sk-ant-***...***xyz', model: 'Claude 3.5', active: true },
  { name: 'Google AI', key: 'AIza***...***def', model: 'Gemini 2.0', active: true },
  { name: 'Meta AI', key: 'Llama***...***ghi', model: 'Llama 3.1', active: true },
  { name: 'Mistral', key: 'mist-***...***jkl', model: 'Mistral Large', active: true },
  { name: 'DeepSeek', key: 'dsk-***...***mno', model: 'DeepSeek V3', active: false },
  { name: 'Cohere', key: 'chr-***...***pqr', model: 'Command R+', active: true },
  { name: 'xAI', key: 'xai-***...***stu', model: 'Grok 2', active: false },
  { name: 'Together AI', key: 'tog-***...***vwx', model: 'Multiple', active: true },
  { name: 'Anyscale', key: 'any-***...***yz1', model: 'Multiple', active: false },
]

const NOTIFICATION_PROVIDERS = [
  { name: 'Email (SMTP)', configured: true },
  { name: 'Slack', configured: true },
  { name: 'Discord', configured: true },
  { name: 'Telegram', configured: true },
  { name: 'Pushbullet', configured: false },
  { name: 'Twilio SMS', configured: true },
  { name: 'PagerDuty', configured: false },
  { name: 'Microsoft Teams', configured: true },
  { name: 'Webhook', configured: true },
  { name: 'Desktop Notify', configured: true },
  { name: 'Gotify', configured: false },
  { name: 'NTFY', configured: true },
  { name: 'Apprise', configured: false },
  { name: 'Custom API', configured: true },
]

const FUNDAMENTALS_DATA = {
  marketCap: '$3.34T', pe: '33.42', forwardPE: '28.15', peg: '1.34',
  eps: '$6.41', revenue: '$96.31B', revenueGrowth: '+125.8%', grossMargin: '73.5%',
  operatingMargin: '55.4%', netMargin: '48.2%', roe: '123.5%', roa: '28.7%',
  debtToEquity: '0.41', currentRatio: '4.12', divYield: '0.03%',
  beta: '1.72', shortInterest: '1.1%', avgVolume: '312M',
  '52wHigh': '$153.13', '52wLow': '$60.53', priceToBook: '42.18', priceToSales: '34.72',
}

const TECHNICAL_INDICATORS = [
  { name: 'RSI (14)', value: '62.4', signal: 'Neutral' },
  { name: 'MACD', value: '+3.28', signal: 'Bullish' },
  { name: 'SMA 20', value: '$138.45', signal: 'Above' },
  { name: 'SMA 50', value: '$132.87', signal: 'Above' },
  { name: 'SMA 200', value: '$108.92', signal: 'Above' },
  { name: 'Bollinger Upper', value: '$152.34', signal: 'Near' },
  { name: 'Bollinger Lower', value: '$124.56', signal: '—' },
  { name: 'ATR (14)', value: '$5.82', signal: 'High Vol' },
  { name: 'Stochastic %K', value: '78.3', signal: 'Overbought' },
  { name: 'ADX', value: '34.2', signal: 'Strong Trend' },
]

const PEER_COMPARISON = [
  { ticker: 'NVDA', mcap: '$3.34T', pe: '33.4', revGrowth: '+125.8%', margin: '73.5%' },
  { ticker: 'AMD', mcap: '$218B', pe: '112.3', revGrowth: '+18.2%', margin: '46.2%' },
  { ticker: 'INTC', mcap: '$108B', pe: '92.1', revGrowth: '-13.8%', margin: '29.8%' },
  { ticker: 'AVGO', mcap: '$798B', pe: '56.7', revGrowth: '+44.1%', margin: '65.4%' },
  { ticker: 'QCOM', mcap: '$192B', pe: '18.9', revGrowth: '+9.3%', margin: '55.7%' },
  { ticker: 'MRVL', mcap: '$82B', pe: '—', revGrowth: '+27.6%', margin: '51.3%' },
]

const SEC_FILINGS = [
  { type: '10-K', date: 'Feb 28, 2025', title: 'Annual Report FY2024', pages: 142 },
  { type: '10-Q', date: 'Nov 30, 2024', title: 'Quarterly Report Q3 FY2025', pages: 87 },
  { type: '8-K', date: 'Feb 26, 2025', title: 'Current Report — Earnings Release', pages: 12 },
  { type: 'DEF 14A', date: 'Apr 15, 2024', title: 'Proxy Statement', pages: 98 },
  { type: '4', date: 'Mar 1, 2025', title: 'Insider Sale — Jensen Huang', pages: 2 },
  { type: 'S-3', date: 'Jan 15, 2025', title: 'Shelf Registration', pages: 34 },
]

const ANALYST_RATINGS = [
  { firm: 'Goldman Sachs', rating: 'Buy', target: '$165', date: 'Mar 3, 2025' },
  { firm: 'Morgan Stanley', rating: 'Overweight', target: '$152', date: 'Feb 28, 2025' },
  { firm: 'JPMorgan', rating: 'Overweight', target: '$155', date: 'Feb 26, 2025' },
  { firm: 'Bank of America', rating: 'Buy', target: '$170', date: 'Feb 25, 2025' },
  { firm: 'UBS', rating: 'Buy', target: '$150', date: 'Feb 22, 2025' },
  { firm: 'Citigroup', rating: 'Neutral', target: '$135', date: 'Feb 20, 2025' },
  { firm: 'Bernstein', rating: 'Outperform', target: '$160', date: 'Feb 18, 2025' },
  { firm: 'Wells Fargo', rating: 'Overweight', target: '$145', date: 'Feb 15, 2025' },
]

// ─── Navigation items ──────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'markets', label: 'Markets', icon: BarChart3 },
  { id: 'trading', label: 'Trading', icon: ArrowLeftRight },
  { id: 'research', label: 'Research', icon: Search },
  { id: 'ai-lab', label: 'AI Lab', icon: Brain },
  { id: 'economics', label: 'Economics', icon: Landmark },
  { id: 'geopolitics', label: 'Geopolitics', icon: Globe },
  { id: 'crypto', label: 'Crypto Center', icon: Bitcoin },
  { id: 'settings', label: 'Settings', icon: Settings },
]

// ─── Sub-components ──────────────────────────────────────────────

function KpiCard({ label, value, change, positive, icon: Icon }: {
  label: string; value: string; change: string; positive: boolean; icon: React.ElementType
}) {
  return (
    <Card className="bg-[#0C0E14] border border-[#1E2230] p-4 hover:border-[#10b981]/30 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</span>
        <div className="p-1.5 rounded bg-[#10b981]/10">
          <Icon className="size-3.5 text-[#10b981]" />
        </div>
      </div>
      <div className="font-mono text-lg font-semibold text-white tracking-tight">{value}</div>
      <div className={`text-xs font-mono mt-1 ${positive ? 'text-[#10b981]' : 'text-red-400'}`}>
        {positive ? '▲' : '▼'} {change}
      </div>
    </Card>
  )
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'connected' || status === 'online' || status === 'active'
    ? 'bg-[#10b981]'
    : status === 'idle' ? 'bg-yellow-500' : 'bg-red-500'
  return <span className={`inline-block size-2 rounded-full ${color} ${status === 'connected' || status === 'online' || status === 'active' ? 'animate-pulse' : ''}`} />
}

function MonoNum({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-mono tabular-nums ${className}`}>{children}</span>
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function MiniTable({ headers, rows, colWidths }: {
  headers: string[]; rows: string[][]; colWidths?: string[]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-[#1E2230]">
            {headers.map((h, i) => (
              <th key={i} className={`text-left text-gray-500 font-medium uppercase tracking-wider py-2 px-2 ${colWidths?.[i] || ''}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-[#1E2230]/50 hover:bg-[#10b981]/5 transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className={`py-1.5 px-2 font-mono ${ci === 0 ? 'text-white font-medium' : 'text-gray-300'} ${colWidths?.[ci] || ''}`}>
                  {cell.startsWith('+') || cell.startsWith('▲') ? <span className="text-[#10b981]">{cell}</span> :
                   cell.startsWith('-') || cell.startsWith('▼') ? <span className="text-red-400">{cell}</span> :
                   cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Section Components ──────────────────────────────────────────

function DashboardSection() {
  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPI_DATA.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Market Indices Ticker */}
      <Card className="bg-[#0C0E14] border border-[#1E2230] p-3">
        <div className="flex items-center gap-1 mb-2">
          <Activity className="size-3.5 text-[#10b981] mr-1" />
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Live Market Data — 321 Connectors Active</span>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          {MARKET_INDICES.map((idx) => (
            <div key={idx.symbol} className="bg-[#111420] rounded-lg p-2.5 border border-[#1E2230]/50">
              <div className="text-[10px] text-gray-500 uppercase">{idx.symbol}</div>
              <MonoNum className="text-sm text-white font-semibold">{idx.value.toLocaleString()}</MonoNum>
              <MonoNum className={`text-[10px] ${idx.change >= 0 ? 'text-[#10b981]' : 'text-red-400'}`}>
                {idx.change >= 0 ? '+' : ''}{idx.change} ({idx.pct >= 0 ? '+' : ''}{idx.pct.toFixed(2)}%)
              </MonoNum>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Alerts */}
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <SectionHeader title="Recent Alerts" subtitle="Real-time system notifications" action={
            <Badge variant="outline" className="text-[9px] border-[#10b981]/30 text-[#10b981]">{RECENT_ALERTS.length} new</Badge>
          } />
          <ScrollArea className="h-64">
            <div className="space-y-1.5">
              {RECENT_ALERTS.map((alert, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5 px-2 rounded bg-[#111420] border border-[#1E2230]/30 hover:border-[#10b981]/20 transition-colors">
                  <span className={`shrink-0 mt-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    alert.severity === 'success' ? 'bg-[#10b981]/10 text-[#10b981]' :
                    alert.severity === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                    alert.severity === 'danger' ? 'bg-red-500/10 text-red-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>{alert.type}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-gray-300 leading-tight">{alert.msg}</p>
                    <span className="text-[9px] text-gray-600 font-mono">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Top Movers */}
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <SectionHeader title="Top Movers" subtitle="Intraday market leaders & laggards" />
          <MiniTable
            headers={['Ticker', 'Price', 'Change', 'Volume']}
            rows={TOP_MOVERS.map(m => [
              `${m.ticker}`,
              `$${m.price.toFixed(2)}`,
              `${m.change >= 0 ? '+' : ''}${m.change.toFixed(2)} (${m.pct >= 0 ? '+' : ''}${m.pct.toFixed(2)}%)`,
              m.volume
            ])}
          />
        </Card>
      </div>
    </div>
  )
}

function MarketsSection() {
  return (
    <div className="space-y-4">
      {/* Sector Heatmap */}
      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <SectionHeader title="Sector Heatmap" subtitle="S&P 500 sector performance" />
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          {SECTOR_DATA.map((sector) => (
            <motion.div
              key={sector.name}
              whileHover={{ scale: 1.03 }}
              className="rounded-lg p-3 border border-[#1E2230] text-center cursor-pointer"
              style={{ backgroundColor: sector.pct >= 0 ? `${sector.color}08` : `${sector.color}08` }}
            >
              <div className="text-[10px] text-gray-400 mb-1">{sector.name}</div>
              <MonoNum className={`text-sm font-semibold ${sector.pct >= 0 ? 'text-[#10b981]' : 'text-red-400'}`}>
                {sector.pct >= 0 ? '+' : ''}{sector.pct.toFixed(2)}%
              </MonoNum>
            </motion.div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Gainers / Losers */}
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <SectionHeader title="Top Gainers & Losers" subtitle="Sorted by absolute move" />
          <MiniTable
            headers={['Ticker', 'Name', 'Price', 'Change', 'Volume']}
            rows={TOP_MOVERS.map(m => [
              m.ticker,
              m.name,
              `$${m.price.toFixed(2)}`,
              `${m.pct >= 0 ? '+' : ''}${m.pct.toFixed(2)}%`,
              m.volume
            ])}
          />
        </Card>

        {/* Market Breadth */}
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <SectionHeader title="Market Breadth" subtitle="Advancing vs Declining issues" />
          <div className="space-y-2">
            {MARKET_BREADTH.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1 px-2 bg-[#111420] rounded">
                <span className="text-[11px] text-gray-400">{item.label}</span>
                <MonoNum className="text-[11px] text-white font-medium">{item.value}</MonoNum>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-[#1E2230]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400">NYSE Breadth</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-[#1E2230] overflow-hidden">
                    <div className="h-full bg-[#10b981] rounded-full" style={{ width: '62%' }} />
                  </div>
                  <MonoNum className="text-[11px] text-[#10b981]">62%</MonoNum>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[11px] text-gray-400">NASD Breadth</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-[#1E2230] overflow-hidden">
                    <div className="h-full bg-[#10b981] rounded-full" style={{ width: '58%' }} />
                  </div>
                  <MonoNum className="text-[11px] text-[#10b981]">58%</MonoNum>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Commodities */}
      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <SectionHeader title="Commodities Overview" subtitle="Global commodity prices" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {COMMODITIES.map((c) => (
            <div key={c.name} className="bg-[#111420] rounded-lg p-3 border border-[#1E2230]/50 hover:border-[#10b981]/20 transition-colors">
              <div className="text-[10px] text-gray-500">{c.name}</div>
              <MonoNum className="text-sm text-white font-semibold">${c.price.toLocaleString()}{c.unit}</MonoNum>
              <MonoNum className={`text-[10px] ${c.change >= 0 ? 'text-[#10b981]' : 'text-red-400'}`}>
                {c.change >= 0 ? '+' : ''}{c.change}
              </MonoNum>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function TradingSection() {
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY')
  const [orderTicker, setOrderTicker] = useState('AAPL')
  const [orderQty, setOrderQty] = useState('100')
  const [orderPrice, setOrderPrice] = useState('213.45')
  const [orderType, setOrderType] = useState('LIMIT')
  const [paperTrading, setPaperTrading] = useState(false)

  return (
    <div className="space-y-4">
      {/* Order Entry + Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Entry */}
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <div className="flex items-center justify-between mb-3">
            <SectionHeader title="Order Entry" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">PAPER</span>
              <Switch checked={paperTrading} onCheckedChange={setPaperTrading} className="data-[state=checked]:bg-[#10b981]" />
            </div>
          </div>

          {/* Buy/Sell Toggle */}
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setOrderSide('BUY')}
              className={`flex-1 py-2 rounded text-xs font-semibold transition-colors ${
                orderSide === 'BUY'
                  ? 'bg-[#10b981] text-white'
                  : 'bg-[#111420] text-gray-400 hover:text-gray-300 border border-[#1E2230]'
              }`}
            >
              BUY
            </button>
            <button
              onClick={() => setOrderSide('SELL')}
              className={`flex-1 py-2 rounded text-xs font-semibold transition-colors ${
                orderSide === 'SELL'
                  ? 'bg-red-500 text-white'
                  : 'bg-[#111420] text-gray-400 hover:text-gray-300 border border-[#1E2230]'
              }`}
            >
              SELL
            </button>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Ticker</label>
              <Input
                value={orderTicker}
                onChange={(e) => setOrderTicker(e.target.value.toUpperCase())}
                className="bg-[#111420] border-[#1E2230] text-white font-mono text-sm h-8 focus:border-[#10b981]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Quantity</label>
                <Input
                  value={orderQty}
                  onChange={(e) => setOrderQty(e.target.value)}
                  className="bg-[#111420] border-[#1E2230] text-white font-mono text-sm h-8 focus:border-[#10b981]"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Price</label>
                <Input
                  value={orderPrice}
                  onChange={(e) => setOrderPrice(e.target.value)}
                  className="bg-[#111420] border-[#1E2230] text-white font-mono text-sm h-8 focus:border-[#10b981]"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Order Type</label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger className="bg-[#111420] border-[#1E2230] text-white font-mono text-sm h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111420] border-[#1E2230]">
                  <SelectItem value="MARKET">MARKET</SelectItem>
                  <SelectItem value="LIMIT">LIMIT</SelectItem>
                  <SelectItem value="STOP">STOP</SelectItem>
                  <SelectItem value="STOP-LIMIT">STOP-LIMIT</SelectItem>
                  <SelectItem value="TRAILING-STOP">TRAILING STOP</SelectItem>
                  <SelectItem value="ICEBERG">ICEBERG</SelectItem>
                  <SelectItem value="TWAP">TWAP</SelectItem>
                  <SelectItem value="VWAP">VWAP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-[#111420] rounded-lg p-2.5 border border-[#1E2230]/50">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Estimated Total</span>
                <MonoNum className="text-white font-semibold">
                  ${orderSide === 'BUY' ? '' : ''}{(parseFloat(orderQty || '0') * parseFloat(orderPrice || '0')).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </MonoNum>
              </div>
            </div>
            <Button
              className={`w-full font-semibold text-xs h-9 ${
                orderSide === 'BUY'
                  ? 'bg-[#10b981] hover:bg-[#10b981]/80 text-white'
                  : 'bg-red-500 hover:bg-red-500/80 text-white'
              }`}
            >
              {orderSide} {orderQty} {orderTicker} {orderType !== 'MARKET' ? `@ $${orderPrice}` : '@ MARKET'}
            </Button>
          </div>
        </Card>

        {/* Open Positions */}
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4 lg:col-span-2">
          <SectionHeader title="Open Positions" subtitle={`${OPEN_POSITIONS.length} active positions`} action={
            <Badge variant="outline" className="text-[9px] border-[#10b981]/30 text-[#10b981]">
              <DollarSign className="size-3 mr-1" />$2,847,392 total
            </Badge>
          } />
          <ScrollArea className="max-h-80">
            <MiniTable
              headers={['Ticker', 'Qty', 'Avg Cost', 'Current', 'P&L', 'P&L %']}
              rows={OPEN_POSITIONS.map(p => [
                p.ticker,
                p.side === 'short' ? `-${p.qty}` : `${p.qty}`,
                `$${p.avg.toFixed(2)}`,
                `$${p.current.toFixed(2)}`,
                p.pnl,
                p.pnlPct
              ])}
            />
          </ScrollArea>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <SectionHeader title="Recent Orders" />
          <ScrollArea className="max-h-64">
            <MiniTable
              headers={['Time', 'Ticker', 'Side', 'Qty', 'Price', 'Type', 'Status']}
              rows={RECENT_ORDERS.map(o => [
                o.time,
                o.ticker,
                o.side,
                `${o.qty}`,
                `$${o.price.toFixed(2)}`,
                o.type,
                o.status
              ])}
            />
          </ScrollArea>
        </Card>

        {/* Broker Status */}
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <SectionHeader title="Broker Status" subtitle={`${BROKERS.filter(b => b.status === 'connected').length}/${BROKERS.length} connected`} />
          <ScrollArea className="max-h-64">
            <div className="space-y-1">
              {BROKERS.map((broker) => (
                <div key={broker.name} className="flex items-center justify-between py-1.5 px-2 rounded bg-[#111420] border border-[#1E2230]/30 hover:border-[#10b981]/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <StatusDot status={broker.status} />
                    <span className="text-[11px] text-white">{broker.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MonoNum className="text-[10px] text-gray-500">{broker.latency}</MonoNum>
                    <Badge variant="outline" className={`text-[8px] ${
                      broker.status === 'connected' ? 'border-[#10b981]/30 text-[#10b981]' : 'border-red-500/30 text-red-400'
                    }`}>
                      {broker.status === 'connected' ? <Wifi className="size-2.5 mr-1" /> : <WifiOff className="size-2.5 mr-1" />}
                      {broker.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}

function ResearchSection() {
  const [researchTicker, setResearchTicker] = useState('NVDA')
  const [researchTab, setResearchTab] = useState('fundamentals')

  return (
    <div className="space-y-4">
      {/* Ticker Search */}
      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Search className="size-4 text-[#10b981]" />
            <Input
              value={researchTicker}
              onChange={(e) => setResearchTicker(e.target.value.toUpperCase())}
              placeholder="Enter ticker symbol..."
              className="bg-[#111420] border-[#1E2230] text-white font-mono h-9 focus:border-[#10b981] max-w-xs"
            />
            <Button size="sm" className="bg-[#10b981] hover:bg-[#10b981]/80 text-white h-9">
              <Search className="size-3.5 mr-1" /> Analyze
            </Button>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Badge className="bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20 text-[10px]">NVIDIA Corp</Badge>
            <Badge variant="outline" className="text-[10px] border-[#1E2230] text-gray-400">NASDAQ: NVDA</Badge>
            <MonoNum className="text-lg text-white font-bold">$142.53</MonoNum>
            <MonoNum className="text-xs text-[#10b981]">+6.22%</MonoNum>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fundamentals */}
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <SectionHeader title="Fundamentals" subtitle={`${researchTicker} — Key financial metrics`} action={
            <div className="flex gap-1">
              {['fundamentals', 'technical', 'peers'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setResearchTab(tab)}
                  className={`px-2 py-1 rounded text-[9px] uppercase tracking-wider transition-colors ${
                    researchTab === tab ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30' : 'text-gray-500 hover:text-gray-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          } />

          {researchTab === 'fundamentals' && (
            <ScrollArea className="max-h-80">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {Object.entries(FUNDAMENTALS_DATA).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1 px-2 rounded hover:bg-[#111420]">
                    <span className="text-[10px] text-gray-500 uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <MonoNum className="text-[11px] text-white">{val}</MonoNum>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {researchTab === 'technical' && (
            <ScrollArea className="max-h-80">
              <MiniTable
                headers={['Indicator', 'Value', 'Signal']}
                rows={TECHNICAL_INDICATORS.map(t => [t.name, t.value, t.signal])}
              />
            </ScrollArea>
          )}

          {researchTab === 'peers' && (
            <ScrollArea className="max-h-80">
              <MiniTable
                headers={['Ticker', 'Mkt Cap', 'P/E', 'Rev Growth', 'Margin']}
                rows={PEER_COMPARISON.map(p => [p.ticker, p.mcap, p.pe, p.revGrowth, p.margin])}
              />
            </ScrollArea>
          )}
        </Card>

        {/* SEC Filings + Analyst Ratings */}
        <div className="space-y-4">
          <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
            <SectionHeader title="SEC Filings" subtitle="Recent filings from EDGAR" action={
              <Badge variant="outline" className="text-[9px] border-[#10b981]/30 text-[#10b981]">
                <FileText className="size-2.5 mr-1" />MCP Connected
              </Badge>
            } />
            <ScrollArea className="max-h-36">
              <div className="space-y-1">
                {SEC_FILINGS.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded bg-[#111420] border border-[#1E2230]/30 hover:border-[#10b981]/20 transition-colors cursor-pointer">
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[8px] shrink-0">{f.type}</Badge>
                    <span className="text-[11px] text-gray-300 flex-1 truncate">{f.title}</span>
                    <span className="text-[9px] text-gray-600 font-mono shrink-0">{f.date}</span>
                    <span className="text-[9px] text-gray-600 font-mono shrink-0">{f.pages}p</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
            <SectionHeader title="Analyst Ratings" subtitle="Latest Wall Street coverage" />
            <ScrollArea className="max-h-44">
              <MiniTable
                headers={['Firm', 'Rating', 'Target', 'Date']}
                rows={ANALYST_RATINGS.map(r => [r.firm, r.rating, r.target, r.date])}
              />
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AILabSection() {
  const [selectedAgent, setSelectedAgent] = useState('buffett')
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { role: 'agent', agent: 'buffett', content: 'Welcome. I\'ve been analyzing your portfolio. Your concentration in NVDA is concerning — while the moat is undeniable, the valuation assumes perfection. Consider trimming above $150 and reallocating to KO or JNJ for stability. Remember: rule #1, never lose money.' },
    { role: 'user', content: 'What do you think about the current market conditions? Should I increase my cash position?' },
    { role: 'agent', agent: 'buffett', content: 'The market\'s enthusiasm for AI is reminiscent of the dot-com era in certain pockets. However, unlike 2000, many of these companies have real earnings. My advice: maintain a 15% cash reserve. When others are fearful, we\'ll be greedy. Focus on businesses with durable competitive advantages trading below intrinsic value.' },
  ])

  const currentAgent = AI_AGENTS.find(a => a.id === selectedAgent)
  const currentModel = LLM_PROVIDERS.find(m => m.model.includes(selectedModel))

  const handleSend = useCallback(() => {
    if (!chatInput.trim()) return
    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }])
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: 'agent',
        agent: selectedAgent,
        content: `[${currentAgent?.name || 'AI Agent'} — analyzing...] Based on current market conditions and your portfolio composition, I recommend maintaining a disciplined approach. The key metrics I\'m tracking show mixed signals — proceed with conviction only where the margin of safety exceeds 20%.`
      }])
    }, 800)
    setChatInput('')
  }, [chatInput, selectedAgent, currentAgent])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat Interface */}
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="size-4 text-[#10b981]" />
              <span className="text-sm font-semibold text-white">AI Chat</span>
              <StatusDot status={currentAgent?.status || 'idle'} />
              <span className="text-[10px] text-gray-500">{currentAgent?.name} • {currentAgent?.style}</span>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="bg-[#111420] border-[#1E2230] text-white text-[11px] h-7 w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111420] border-[#1E2230]">
                  {AI_AGENTS.map(agent => (
                    <SelectItem key={agent.id} value={agent.id} className="text-[11px]">
                      {agent.avatar} {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-[#111420] border-[#1E2230] text-white text-[11px] h-7 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111420] border-[#1E2230]">
                  {LLM_PROVIDERS.map(p => (
                    <SelectItem key={p.model} value={p.model.split('-')[0]} className="text-[11px]">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="h-72 mb-3">
            <div className="space-y-2 pr-2">
              {chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    msg.role === 'user' ? 'bg-[#1E2230]' : 'bg-[#10b981]/10'
                  }`}>
                    {msg.role === 'user' ? '👤' : AI_AGENTS.find(a => a.id === msg.agent)?.avatar || '🤖'}
                  </div>
                  <div className={`max-w-[80%] rounded-lg p-2.5 text-[11px] leading-relaxed ${
                    msg.role === 'user' ? 'bg-[#1E2230] text-gray-200' : 'bg-[#111420] border border-[#1E2230] text-gray-300'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about markets, portfolio, or analysis..."
              className="bg-[#111420] border-[#1E2230] text-white text-sm h-9 focus:border-[#10b981]"
            />
            <Button size="sm" onClick={handleSend} className="bg-[#10b981] hover:bg-[#10b981]/80 text-white h-9 px-4">
              <Send className="size-3.5" />
            </Button>
          </div>
        </Card>

        {/* Agent & Tools Status */}
        <div className="space-y-4">
          <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
            <SectionHeader title="AI Agents" subtitle={`${AI_AGENTS.filter(a => a.status === 'active').length} active`} />
            <ScrollArea className="max-h-48">
              <div className="space-y-1">
                {AI_AGENTS.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`w-full flex items-center gap-2 py-1.5 px-2 rounded text-left transition-colors ${
                      selectedAgent === agent.id ? 'bg-[#10b981]/10 border border-[#10b981]/20' : 'bg-[#111420] border border-[#1E2230]/30 hover:border-[#10b981]/20'
                    }`}
                  >
                    <span className="text-sm">{agent.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-white truncate">{agent.name}</div>
                      <div className="text-[9px] text-gray-500 truncate">{agent.style}</div>
                    </div>
                    <StatusDot status={agent.status} />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>

          <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
            <SectionHeader title="MCP Tools" subtitle={`${MCP_TOOLS.filter(t => t.status === 'online').length} online`} action={
              <Badge variant="outline" className="text-[8px] border-[#10b981]/30 text-[#10b981]">
                <Cpu className="size-2.5 mr-1" />12 active
              </Badge>
            } />
            <ScrollArea className="max-h-32">
              <div className="space-y-0.5">
                {MCP_TOOLS.map(tool => (
                  <div key={tool.name} className="flex items-center justify-between py-1 px-1.5">
                    <div className="flex items-center gap-1.5">
                      <StatusDot status={tool.status} />
                      <span className="text-[10px] text-gray-300 truncate">{tool.name}</span>
                    </div>
                    <MonoNum className="text-[9px] text-gray-600">{tool.calls.toLocaleString()} calls</MonoNum>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Hedge Fund Agent System */}
          <Card className="bg-[#0C0E14] border border-[#10b981]/20 p-4">
            <SectionHeader title="Hedge Fund System" subtitle="Multi-agent orchestration" />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Orchestration</span>
                <Badge className="bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20 text-[8px]">ACTIVE</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Debate Mode</span>
                <Badge variant="outline" className="text-[8px] border-[#1E2230] text-gray-400">ENABLED</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Consensus Score</span>
                <MonoNum className="text-[11px] text-[#10b981]">0.82</MonoNum>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Risk Override</span>
                <Badge variant="outline" className="text-[8px] border-yellow-500/30 text-yellow-500">ENGAGED</Badge>
              </div>
              <div className="mt-2 pt-2 border-t border-[#1E2230]">
                <div className="text-[9px] text-gray-600 mb-1">Agent Agreement</div>
                <div className="flex gap-0.5">
                  {AI_AGENTS.slice(0, 8).map((_, i) => (
                    <div key={i} className={`flex-1 h-1.5 rounded-full ${i < 6 ? 'bg-[#10b981]' : 'bg-red-400'}`} />
                  ))}
                </div>
                <div className="text-[9px] text-gray-600 mt-1">6/8 agents bullish • 2/8 bearish</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function EconomicsSection() {
  return (
    <div className="space-y-4">
      {/* Economic Indicators */}
      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <SectionHeader title="Economic Indicators" subtitle="Key macroeconomic data — FRED connected" action={
          <Badge variant="outline" className="text-[9px] border-[#10b981]/30 text-[#10b981]">
            <Landmark className="size-2.5 mr-1" />FRED Live
          </Badge>
        } />
        <MiniTable
          headers={['Indicator', 'Latest', 'Prior', 'Forecast', 'Trend']}
          rows={ECONOMIC_INDICATORS.map(ind => [
            ind.name,
            ind.value,
            ind.prior,
            ind.forecast,
            ind.trend === 'up' ? '▲' : ind.trend === 'down' ? '▼' : '—'
          ])}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Central Bank Rates */}
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <SectionHeader title="Central Bank Rates" subtitle="Global monetary policy" />
          <MiniTable
            headers={['Central Bank', 'Rate', 'Next Meeting', 'Bias']}
            rows={CENTRAL_BANK_RATES.map(cb => [cb.bank, cb.rate, cb.next, cb.bias])}
          />
        </Card>

        {/* Economic Calendar */}
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <SectionHeader title="Economic Calendar" subtitle="Upcoming releases" action={
            <Badge variant="outline" className="text-[9px] border-[#1E2230] text-gray-400">
              <CalendarDays className="size-2.5 mr-1" />This Week
            </Badge>
          } />
          <ScrollArea className="max-h-64">
            <div className="space-y-1">
              {ECON_CALENDAR.map((evt, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded bg-[#111420] border border-[#1E2230]/30">
                  <div className={`shrink-0 w-1.5 h-8 rounded-full ${
                    evt.impact === 'high' ? 'bg-red-500' : evt.impact === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-white font-medium">{evt.event}</span>
                      <Badge variant="outline" className={`text-[8px] ${
                        evt.impact === 'high' ? 'border-red-500/30 text-red-400' :
                        evt.impact === 'medium' ? 'border-yellow-500/30 text-yellow-500' :
                        'border-blue-500/30 text-blue-400'
                      }`}>{evt.impact.toUpperCase()}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] text-gray-500 mt-0.5">
                      <span className="font-mono">{evt.date} {evt.time}</span>
                      <span>Cons: {evt.consensus}</span>
                      <span>Prev: {evt.prior}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}

function GeopoliticsSection() {
  return (
    <div className="space-y-4">
      {/* Event Tracker */}
      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <SectionHeader title="Geopolitical Event Tracker" subtitle="AI-monitored global risk events" action={
          <Badge variant="outline" className="text-[9px] border-[#10b981]/30 text-[#10b981]">
            <Globe className="size-2.5 mr-1" />37 AI Sources
          </Badge>
        } />
        <div className="space-y-2">
          {GEOPOL_EVENTS.map((evt) => (
            <motion.div
              key={evt.id}
              whileHover={{ x: 2 }}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-[#111420] border border-[#1E2230]/30 hover:border-[#10b981]/20 transition-colors cursor-pointer"
            >
              <div className={`shrink-0 w-2 h-2 rounded-full ${
                evt.severity === 'high' ? 'bg-red-500' : evt.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-white font-medium">{evt.event}</span>
                  <Badge className={`text-[8px] ${
                    evt.severity === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    evt.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>{evt.severity.toUpperCase()}</Badge>
                </div>
                <div className="flex items-center gap-3 text-[9px] text-gray-500 mt-0.5">
                  <span>{evt.region}</span>
                  <span>•</span>
                  <span>Impact: {evt.impact}</span>
                  <span>•</span>
                  <span>{evt.updated}</span>
                </div>
              </div>
              <ChevronRight className="size-3.5 text-gray-600" />
            </motion.div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Country Risk */}
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <SectionHeader title="Country Risk Scores" subtitle="Composite risk assessment" />
          <div className="space-y-2">
            {COUNTRY_RISK.map(c => (
              <div key={c.country} className="flex items-center gap-2 py-1.5 px-2 rounded bg-[#111420]">
                <span className="text-sm">{c.flag}</span>
                <span className="text-[11px] text-white flex-1">{c.country}</span>
                <div className="w-20 h-2 rounded-full bg-[#1E2230] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.score >= 80 ? 'bg-[#10b981]' : c.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
                <MonoNum className={`text-[11px] font-semibold ${c.score >= 80 ? 'text-[#10b981]' : c.score >= 60 ? 'text-yellow-500' : 'text-red-400'}`}>
                  {c.score}
                </MonoNum>
                <span className="text-[9px] text-gray-600">{c.trend === 'up' ? '↑' : c.trend === 'down' ? '↓' : '→'}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Prediction Markets */}
        <div className="space-y-4">
          <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
            <SectionHeader title="Prediction Markets" subtitle="Polymarket & Kalshi odds" action={
              <Badge variant="outline" className="text-[9px] border-[#10b981]/30 text-[#10b981]">
                <CircleDot className="size-2.5 mr-1" />LIVE
              </Badge>
            } />
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {PREDICTION_MARKETS.map((pm, i) => (
                  <div key={i} className="py-2 px-2.5 rounded bg-[#111420] border border-[#1E2230]/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-300 flex-1 pr-2">{pm.event}</span>
                      <Badge variant="outline" className="text-[8px] border-[#1E2230] text-gray-500 shrink-0">
                        {pm.platform}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-[#1E2230] overflow-hidden">
                        <div className="h-full bg-[#10b981] rounded-full transition-all" style={{ width: `${pm.yes}%` }} />
                      </div>
                      <MonoNum className="text-[10px] text-[#10b981] w-10 text-right">YES {pm.yes}%</MonoNum>
                      <MonoNum className="text-[10px] text-gray-500 w-10 text-right">NO {pm.no}%</MonoNum>
                    </div>
                    <div className="text-[8px] text-gray-600 mt-1">Volume: {pm.volume}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Maritime Tracking */}
          <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
            <SectionHeader title="Maritime Tracking" subtitle="Key vessel movements" action={
              <Badge variant="outline" className="text-[9px] border-[#10b981]/30 text-[#10b981]">
                <Ship className="size-2.5 mr-1" />AIS Live
              </Badge>
            } />
            <div className="space-y-1">
              {MARITIME_DATA.map((v, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded bg-[#111420] border border-[#1E2230]/30">
                  <Ship className="size-3 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-white">{v.vessel}</span>
                    <span className="text-[9px] text-gray-500 ml-2">({v.type})</span>
                  </div>
                  <Badge className={`text-[8px] ${
                    v.status === 'Transiting' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' :
                    v.status === 'Delayed' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>{v.status}</Badge>
                  <span className="text-[9px] text-gray-600 font-mono">ETA {v.eta}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function CryptoCenterSection() {
  const [walletConnected, setWalletConnected] = useState(true)
  const [showBalances, setShowBalances] = useState(true)

  return (
    <div className="space-y-4">
      {/* Wallet + Token Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <SectionHeader title="Wallet" subtitle="Multi-chain connected" action={
            <Button
              size="sm"
              variant="outline"
              className={`text-[10px] h-6 ${walletConnected ? 'border-[#10b981]/30 text-[#10b981]' : 'border-red-500/30 text-red-400'}`}
              onClick={() => setWalletConnected(!walletConnected)}
            >
              <Wallet className="size-3 mr-1" />
              {walletConnected ? '0x7a3f...e82d' : 'Connect'}
            </Button>
          } />
          <div className="space-y-3">
            <div className="bg-[#111420] rounded-lg p-3 border border-[#1E2230]/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500">Total Portfolio</span>
                <button onClick={() => setShowBalances(!showBalances)} className="text-gray-500 hover:text-gray-400">
                  {showBalances ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                </button>
              </div>
              <MonoNum className="text-xl text-white font-bold">
                {showBalances ? '$496,289.13' : '••••••'}
              </MonoNum>
              <MonoNum className="text-[11px] text-[#10b981]">+$8,342.17 (24h)</MonoNum>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-[#111420] rounded border border-[#1E2230]/30">
                <div className="text-[9px] text-gray-500">Ethereum</div>
                <div className="text-[10px] text-white font-mono">{showBalances ? '18.743' : '•••'}</div>
              </div>
              <div className="text-center p-2 bg-[#111420] rounded border border-[#1E2230]/30">
                <div className="text-[9px] text-gray-500">Solana</div>
                <div className="text-[10px] text-white font-mono">{showBalances ? '245.8' : '•••'}</div>
              </div>
              <div className="text-center p-2 bg-[#111420] rounded border border-[#1E2230]/30">
                <div className="text-[9px] text-gray-500">Avalanche</div>
                <div className="text-[10px] text-white font-mono">{showBalances ? '890.5' : '•••'}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4 lg:col-span-2">
          <SectionHeader title="Token Balances" subtitle={`${CRYPTO_TOKENS.length} tokens tracked`} action={
            <Badge variant="outline" className="text-[9px] border-[#10b981]/30 text-[#10b981]">
              <Coins className="size-2.5 mr-1" />Live Prices
            </Badge>
          } />
          <ScrollArea className="max-h-64">
            <MiniTable
              headers={['Symbol', 'Name', 'Balance', 'Price', 'Value', '24h']}
              rows={CRYPTO_TOKENS.map(t => [
                t.symbol,
                t.name,
                showBalances ? t.balance.toString() : '•••',
                `$${t.price.toLocaleString()}`,
                showBalances ? t.value : '•••',
                t.change24h
              ])}
            />
          </ScrollArea>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* DeFi Overview */}
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <SectionHeader title="DeFi Overview" subtitle="Top protocols by TVL" />
          <MiniTable
            headers={['Protocol', 'TVL', 'APY', 'Risk', 'Chain']}
            rows={DEFI_PROTOCOLS.map(p => [p.name, p.tvl, p.apy, p.risk, p.chain])}
          />
        </Card>

        {/* Staking Tiers + Burn Stats */}
        <div className="space-y-4">
          <Card className="bg-[#0C0E14] border border-[#10b981]/20 p-4">
            <SectionHeader title="FCT Staking Tiers" subtitle="Stake to unlock features" action={
              <Badge className="bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20 text-[9px]">
                <Gem className="size-2.5 mr-1" />SILVER
              </Badge>
            } />
            <ScrollArea className="max-h-36">
              <div className="space-y-1.5">
                {STAKING_TIERS.map(tier => (
                  <div key={tier.tier} className="flex items-center gap-2 py-1.5 px-2 rounded bg-[#111420] border border-[#1E2230]/30">
                    <span className="text-[11px] text-white font-medium w-20">{tier.tier}</span>
                    <MonoNum className="text-[10px] text-gray-300 flex-1">{tier.minStake}</MonoNum>
                    <MonoNum className="text-[10px] text-[#10b981] w-14">{tier.apy}</MonoNum>
                    <span className="text-[9px] text-gray-500 flex-1">{tier.benefits}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
            <SectionHeader title="Buyback & Burn" subtitle="Tokenomics dashboard" action={
              <Badge variant="outline" className="text-[9px] border-[#10b981]/30 text-[#10b981]">
                <Flame className="size-2.5 mr-1" />Active
              </Badge>
            } />
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(BURN_STATS).map(([key, val]) => (
                <div key={key} className="bg-[#111420] rounded p-2 border border-[#1E2230]/30">
                  <div className="text-[9px] text-gray-500 uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <MonoNum className="text-[11px] text-white font-medium">{val}</MonoNum>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SettingsSection() {
  const [settingsTab, setSettingsTab] = useState('providers')
  const [apiKeysVisible, setApiKeysVisible] = useState(false)

  return (
    <div className="space-y-4">
      {/* Settings Tabs */}
      <div className="flex gap-1">
        {[
          { id: 'providers', label: 'LLM Providers', icon: Brain },
          { id: 'brokers', label: 'Broker Credentials', icon: Building2 },
          { id: 'api', label: 'API Keys', icon: Key },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSettingsTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
              settingsTab === tab.id
                ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20'
                : 'text-gray-400 hover:text-gray-300 bg-[#111420] border border-[#1E2230]'
            }`}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Providers */}
      {settingsTab === 'providers' && (
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <SectionHeader title="LLM Provider Configuration" subtitle="Manage AI model connections" action={
            <Button size="sm" className="bg-[#10b981] hover:bg-[#10b981]/80 text-white h-7 text-[10px]">
              <Plus className="size-3 mr-1" />Add Provider
            </Button>
          } />
          <div className="space-y-2">
            {SETTINGS_PROVIDERS.map((provider) => (
              <div key={provider.name} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-[#111420] border border-[#1E2230]/30 hover:border-[#10b981]/20 transition-colors">
                <div className="flex items-center gap-2 flex-1">
                  <StatusDot status={provider.active ? 'active' : 'idle'} />
                  <span className="text-[12px] text-white font-medium">{provider.name}</span>
                  <Badge variant="outline" className="text-[9px] border-[#1E2230] text-gray-400">{provider.model}</Badge>
                </div>
                <MonoNum className="text-[10px] text-gray-500 font-mono">
                  {apiKeysVisible ? provider.key : provider.key.replace(/./g, '•').slice(0, 12) + '...'}
                </MonoNum>
                <Switch checked={provider.active} className="data-[state=checked]:bg-[#10b981]" onCheckedChange={() => {}} />
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-500 hover:text-white">
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setApiKeysVisible(!apiKeysVisible)}
              className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-400"
            >
              {apiKeysVisible ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
              {apiKeysVisible ? 'Hide' : 'Show'} API Keys
            </button>
          </div>
        </Card>
      )}

      {/* Broker Credentials */}
      {settingsTab === 'brokers' && (
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <SectionHeader title="Broker Credentials" subtitle={`${BROKERS.length} brokers configured`} action={
            <Button size="sm" className="bg-[#10b981] hover:bg-[#10b981]/80 text-white h-7 text-[10px]">
              <Plus className="size-3 mr-1" />Add Broker
            </Button>
          } />
          <div className="space-y-2">
            {BROKERS.map(broker => (
              <div key={broker.name} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#111420] border border-[#1E2230]/30">
                <StatusDot status={broker.status} />
                <span className="text-[11px] text-white flex-1">{broker.name}</span>
                <MonoNum className="text-[10px] text-gray-500">{broker.latency}</MonoNum>
                <Badge variant="outline" className={`text-[8px] ${
                  broker.status === 'connected' ? 'border-[#10b981]/30 text-[#10b981]' : 'border-red-500/30 text-red-400'
                }`}>
                  {broker.status.toUpperCase()}
                </Badge>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-gray-500 hover:text-white">
                  Configure
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* API Keys */}
      {settingsTab === 'api' && (
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <SectionHeader title="API Key Management" subtitle="External data source credentials" action={
            <Button size="sm" className="bg-[#10b981] hover:bg-[#10b981]/80 text-white h-7 text-[10px]">
              <Plus className="size-3 mr-1" />Add Key
            </Button>
          } />
          <div className="space-y-2">
            {[
              { name: 'Bloomberg Terminal', key: 'BB-***...***x7f', status: 'valid' },
              { name: 'Reuters Eikon', key: 'RE-***...***a3c', status: 'valid' },
              { name: 'SEC EDGAR', key: 'ED-***...***d92', status: 'valid' },
              { name: 'FRED API', key: 'FR-***...***b48', status: 'valid' },
              { name: 'Alpha Vantage', key: 'AV-***...***e17', status: 'valid' },
              { name: 'CoinGecko Pro', key: 'CG-***...***f63', status: 'expired' },
              { name: 'Polymarket', key: 'PM-***...***g29', status: 'valid' },
              { name: 'World Bank', key: 'WB-***...***h84', status: 'valid' },
            ].map(api => (
              <div key={api.name} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#111420] border border-[#1E2230]/30">
                <Lock className="size-3.5 text-gray-500" />
                <span className="text-[11px] text-white flex-1">{api.name}</span>
                <MonoNum className="text-[10px] text-gray-500 font-mono">{api.key}</MonoNum>
                <Badge className={`text-[8px] ${
                  api.status === 'valid' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>{api.status.toUpperCase()}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Notifications */}
      {settingsTab === 'notifications' && (
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <SectionHeader title="Notification Settings" subtitle={`${NOTIFICATION_PROVIDERS.filter(n => n.configured).length}/${NOTIFICATION_PROVIDERS.length} configured`} action={
            <Button size="sm" className="bg-[#10b981] hover:bg-[#10b981]/80 text-white h-7 text-[10px]">
              <Plus className="size-3 mr-1" />Add Channel
            </Button>
          } />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {NOTIFICATION_PROVIDERS.map(notif => (
              <div key={notif.name} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#111420] border border-[#1E2230]/30">
                <Bell className={`size-3.5 ${notif.configured ? 'text-[#10b981]' : 'text-gray-600'}`} />
                <span className="text-[11px] text-white flex-1">{notif.name}</span>
                <Badge className={`text-[8px] ${
                  notif.configured ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 'bg-[#1E2230] text-gray-500 border-[#1E2230]'
                }`}>{notif.configured ? 'CONFIGURED' : 'SETUP'}</Badge>
                <Switch checked={notif.configured} className="data-[state=checked]:bg-[#10b981]" onCheckedChange={() => {}} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────

export default function FinceptTerminalTool({ onClose }: { onClose: () => void }) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentTime, setCurrentTime] = useState('')


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardSection />
      case 'markets': return <MarketsSection />
      case 'trading': return <TradingSection />
      case 'research': return <ResearchSection />
      case 'ai-lab': return <AILabSection />
      case 'economics': return <EconomicsSection />
      case 'geopolitics': return <GeopoliticsSection />
      case 'crypto': return <CryptoCenterSection />
      case 'settings': return <SettingsSection />
      default: return <DashboardSection />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex bg-[#08090D] text-white overflow-hidden"
    >
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 56 : 200 }}
        transition={{ duration: 0.2 }}
        className="shrink-0 bg-[#0A0B10] border-r border-[#1E2230] flex flex-col"
      >
        {/* Logo */}
        <div className="h-14 flex items-center gap-2 px-3 border-b border-[#1E2230] shrink-0">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center">
            <Terminal className="size-4 text-[#10b981]" />
          </div>
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <div className="text-sm font-bold text-white tracking-tight">Fincept</div>
              <div className="text-[9px] text-gray-500 font-mono">Terminal v4.0.3</div>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-[#111420] border border-transparent'
                }`}
              >
                <item.icon className={`size-4 shrink-0 ${isActive ? 'text-[#10b981]' : ''}`} />
                {!sidebarCollapsed && (
                  <span className="text-[12px] font-medium truncate">{item.label}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-[#1E2230] shrink-0">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center py-1.5 rounded text-gray-500 hover:text-gray-400 transition-colors"
          >
            <ChevronRight className={`size-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 shrink-0 bg-[#0A0B10] border-b border-[#1E2230] flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-white">
              {NAV_ITEMS.find(n => n.id === activeSection)?.label || 'Dashboard'}
            </h1>
            <Badge className="bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20 text-[9px]">
              <StatusDot status="connected" /> LIVE
            </Badge>
            <Badge variant="outline" className="text-[9px] border-[#1E2230] text-gray-500">321 Connectors</Badge>
            <Badge variant="outline" className="text-[9px] border-[#1E2230] text-gray-500">16+ Brokers</Badge>
            <Badge variant="outline" className="text-[9px] border-[#1E2230] text-gray-500">37 AI Agents</Badge>
          </div>
          <div className="flex items-center gap-3">
            <MonoNum className="text-[11px] text-gray-400">{currentTime} UTC</MonoNum>
            <Separator orientation="vertical" className="h-5 bg-[#1E2230]" />
            <Badge variant="outline" className="text-[8px] border-[#1E2230] text-gray-500 font-mono">MIT License</Badge>
            <Separator orientation="vertical" className="h-5 bg-[#1E2230]" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-[#1E2230] transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer Status Bar */}
        <footer className="h-7 shrink-0 bg-[#0A0B10] border-t border-[#1E2230] flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <StatusDot status="connected" />
              <span className="text-[9px] text-gray-500 font-mono">CONNECTED</span>
            </div>
            <Separator orientation="vertical" className="h-3 bg-[#1E2230]" />
            <span className="text-[9px] text-gray-600 font-mono">Latency: 12ms</span>
            <Separator orientation="vertical" className="h-3 bg-[#1E2230]" />
            <span className="text-[9px] text-gray-600 font-mono">Data: 321/321</span>
            <Separator orientation="vertical" className="h-3 bg-[#1E2230]" />
            <span className="text-[9px] text-gray-600 font-mono">Brokers: 17/18</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-[#10b981] font-mono">● MARKET OPEN</span>
            <Separator orientation="vertical" className="h-3 bg-[#1E2230]" />
            <span className="text-[9px] text-gray-600 font-mono">Fincept Terminal v4.0.3</span>
            <Separator orientation="vertical" className="h-3 bg-[#1E2230]" />
            <span className="text-[9px] text-gray-600 font-mono">Qt6/C++ Engine</span>
          </div>
        </footer>
      </div>
    </motion.div>
  )
}
