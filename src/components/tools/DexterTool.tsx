'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, Search, BarChart3, FileText, Brain, Clock, Activity,
  DollarSign, Globe, MessageSquare, Zap, ChevronRight, ArrowUpRight,
  ArrowDownRight, RefreshCw, Send, Loader2, Settings, Bell, Timer,
  BookOpen, Cpu, Eye, Database, Filter, Play, X, type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

// =================== TYPES ===================

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  timestamp: number
  tools?: Array<{ name: string; status: string; duration?: string }>
}

interface MarketData {
  ticker: string
  price: number
  change: number
  changePercent: number
  marketCap: number
  pe: number
  volume: number
  sparkline: number[]
}

interface WatchlistItem {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface CronJob {
  id: string
  name: string
  schedule: { kind: string; everyMs?: number; expr?: string; tz?: string }
  message: string
  fulfillmentMode: string
  enabled: boolean
  lastRunAt?: string
  nextRunAt?: string
  alertCount: number
}

// =================== HELPERS ===================

function formatNumber(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  return `$${n.toLocaleString()}`
}

function formatPercent(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

function MiniSparkline({ data, color, width = 80, height = 24 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ')
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  )
}

// =================== MAIN COMPONENT ===================

interface DexterToolProps {
  onClose: () => void
}

export default function DexterTool({ onClose }: DexterToolProps) {
  const [activeTab, setActiveTab] = useState('chat')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [watchlist] = useState<WatchlistItem[]>([
    { ticker: 'AAPL', name: 'Apple Inc', price: 198.45, change: 1.20, changePercent: 0.61 },
    { ticker: 'NVDA', name: 'NVIDIA Corp', price: 131.28, change: 3.62, changePercent: 2.84 },
    { ticker: 'MSFT', name: 'Microsoft', price: 417.52, change: 3.72, changePercent: 0.90 },
    { ticker: 'GOOGL', name: 'Alphabet', price: 189.72, change: 1.13, changePercent: 0.60 },
    { ticker: 'TSLA', name: 'Tesla Inc', price: 342.15, change: 11.58, changePercent: 3.51 },
    { ticker: 'BTC', name: 'Bitcoin', price: 97842, change: 2198, changePercent: 2.30 },
  ])
  const [selectedTicker, setSelectedTicker] = useState('AAPL')
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [skills, setSkills] = useState<Array<{ id: string; name: string; description: string }>>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  // Fetch market data
  const fetchMarketData = useCallback(async (ticker: string) => {
    try {
      const type = ticker === 'BTC' ? 'crypto' : 'stock'
      const res = await fetch(`/api/dexter/market-data?ticker=${ticker}&type=${type}`)
      const data = await res.json()
      setMarketData(data)
    } catch { /* ignore */ }
  }, [])

  // Fetch cron jobs
  const fetchCronJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/dexter/cron')
      const data = await res.json()
      if (data.jobs) setCronJobs(data.jobs)
    } catch { /* ignore */ }
  }, [])

  // Fetch skills
  const fetchSkills = useCallback(async () => {
    try {
      const res = await fetch('/api/dexter/skills')
      const data = await res.json()
      if (data.skills) setSkills(data.skills)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchMarketData(selectedTicker)
    fetchCronJobs()
    fetchSkills()
  }, [selectedTicker, fetchMarketData, fetchCronJobs, fetchSkills])

  // Send message
  const handleSend = async () => {
    const text = inputValue.trim()
    if (!text || isProcessing) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    setChatMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsProcessing(true)

    try {
      const res = await fetch('/api/dexter/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      })
      const data = await res.json()

      if (data.success) {
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-res`,
          role: 'assistant',
          content: data.answer,
          timestamp: Date.now(),
          tools: data.tools,
        }
        setChatMessages(prev => [...prev, assistantMsg])
      }
    } catch { /* ignore */ }
    setIsProcessing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#0A0A0D]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-500/10 bg-black/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="size-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-emerald-100 flex items-center gap-2">
              Dexter
              <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-400/60 bg-emerald-500/5 font-mono">v2026.6.3</Badge>
              <Badge variant="outline" className="text-[9px] border-green-500/20 text-green-400/80 bg-green-500/5">MIT</Badge>
            </h1>
            <p className="text-[11px] text-emerald-400/50">Autonomous Financial Research Agent</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-400/80 bg-emerald-500/5 font-mono">
            <div className="size-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            gpt-5.5
          </Badge>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-emerald-400/60 hover:text-emerald-200 hover:bg-emerald-500/10">
            Close
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar - Watchlist */}
        <div className="w-56 border-r border-emerald-500/10 bg-black/30 hidden lg:flex flex-col">
          <div className="p-3 border-b border-emerald-500/10">
            <h3 className="text-xs font-medium text-emerald-300/60 flex items-center gap-1.5">
              <Eye className="size-3" /> Watchlist
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {watchlist.map(item => (
                <button
                  key={item.ticker}
                  onClick={() => setSelectedTicker(item.ticker)}
                  className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                    selectedTicker === item.ticker
                      ? 'border-emerald-500/30 bg-emerald-500/10'
                      : 'border-transparent hover:bg-emerald-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-emerald-200 font-mono">{item.ticker}</span>
                      <span className="text-[10px] text-emerald-400/40 ml-1.5">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-emerald-200 font-mono">
                        {item.ticker === 'BTC' ? `$${(item.price / 1000).toFixed(1)}K` : `$${item.price.toFixed(2)}`}
                      </div>
                      <div className={`text-[10px] font-mono ${item.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(item.changePercent)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
          {/* Market Summary */}
          <div className="p-3 border-t border-emerald-500/10 space-y-1.5">
            <h3 className="text-[10px] text-emerald-400/40 font-mono uppercase tracking-wider">Market</h3>
            {[
              { name: 'S&P 500', value: '5,892', change: '+0.4%' },
              { name: 'NASDAQ', value: '19,112', change: '+0.6%' },
              { name: 'DOW', value: '43,258', change: '+0.3%' },
              { name: '10Y', value: '4.28%', change: '-0.02' },
              { name: 'VIX', value: '14.2', change: '-1.5%' },
            ].map(idx => (
              <div key={idx.name} className="flex items-center justify-between text-[10px]">
                <span className="text-emerald-400/50">{idx.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-200 font-mono">{idx.value}</span>
                  <span className={`font-mono ${idx.change.startsWith('+') ? 'text-green-400' : idx.change.startsWith('-') ? 'text-red-400' : 'text-emerald-400/40'}`}>
                    {idx.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-4 pt-2 border-b border-emerald-500/10">
            <TabsList className="bg-transparent border-none h-9 p-0 gap-1">
              {[
                { id: 'chat', label: 'Research', icon: MessageSquare },
                { id: 'market', label: 'Market Data', icon: BarChart3 },
                { id: 'financials', label: 'Financials', icon: FileText },
                { id: 'filings', label: 'SEC Filings', icon: BookOpen },
                { id: 'screener', label: 'Screener', icon: Filter },
                { id: 'cron', label: 'Cron', icon: Timer },
                { id: 'skills', label: 'Skills', icon: Zap },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-200 text-emerald-400/50 text-xs h-8 px-3 rounded-md border border-transparent data-[state=active]:border-emerald-500/20 transition-all"
                >
                  <tab.icon className="size-3.5 mr-1.5" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* ====== CHAT / RESEARCH ====== */}
            <TabsContent value="chat" className="h-full m-0 flex flex-col">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="max-w-3xl mx-auto space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-12">
                      <Brain className="size-10 mx-auto mb-3 text-emerald-400/20" />
                      <h3 className="text-sm font-medium text-emerald-300/60 mb-1">Ask Dexter anything about finance</h3>
                      <p className="text-xs text-emerald-400/30 mb-4">I can research stocks, analyze financials, read SEC filings, and more</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          'Analyze AAPL financials',
                          'What is NVIDIA worth?',
                          'Compare TSLA vs F',
                          'Bitcoin on-chain analysis',
                          'Screen high-growth tech stocks',
                          'Read AAPL 10-K risk factors',
                        ].map(q => (
                          <button
                            key={q}
                            onClick={() => { setInputValue(q) }}
                            className="px-3 py-1.5 text-xs rounded-lg border border-emerald-500/10 text-emerald-300/50 hover:border-emerald-500/20 hover:text-emerald-200 hover:bg-emerald-500/5 transition-all"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <AnimatePresence initial={false}>
                    {chatMessages.map(msg => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-emerald-500/15 text-emerald-100 border border-emerald-500/20 px-4 py-2.5'
                            : msg.role === 'tool'
                            ? 'bg-amber-500/5 text-amber-200/70 border border-amber-500/10 px-3 py-2 text-xs'
                            : 'bg-black/40 text-emerald-200/80 border border-emerald-500/10 px-4 py-3'
                        }`}>
                          {msg.role === 'assistant' && msg.tools && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {msg.tools.map(t => (
                                <Badge key={t.name} variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-400/60 bg-emerald-500/5 font-mono">
                                  <Zap className="size-2.5 mr-0.5" />
                                  {t.name} ({t.duration})
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-black/40 border border-emerald-500/10 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2 text-emerald-300/50 text-sm">
                          <Loader2 className="size-4 animate-spin" />
                          Researching...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t border-emerald-500/10 bg-black/30">
                <div className="max-w-3xl mx-auto flex items-center gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder="Ask about stocks, financials, filings..."
                    disabled={isProcessing}
                    className="flex-1 bg-black/30 border-emerald-500/20 text-emerald-100 placeholder:text-emerald-500/30 focus-visible:border-emerald-500/40"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isProcessing || !inputValue.trim()}
                    className="bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-300 size-9 disabled:opacity-30"
                    size="icon"
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* ====== MARKET DATA ====== */}
            <TabsContent value="market" className="h-full m-0 overflow-y-auto">
              <div className="p-4 max-w-5xl mx-auto space-y-4">
                {/* Price Card */}
                <Card className="bg-black/40 border-emerald-500/10 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold text-emerald-100 font-mono">${marketData?.price?.toLocaleString() || '198.45'}</span>
                          <span className={`text-sm font-mono ${marketData?.changePercent ? marketData.changePercent >= 0 ? 'text-green-400' : 'text-red-400' : 'text-green-400'}`}>
                            {marketData?.changePercent ? formatPercent(marketData.changePercent) : '+0.61%'}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-400/40">{selectedTicker} · {marketData?.type === 'crypto' ? 'Cryptocurrency' : 'Stock'}</p>
                      </div>
                      {marketData?.sparkline && (
                        <MiniSparkline data={marketData.sparkline} color={marketData.changePercent >= 0 ? '#4ade80' : '#f87171'} width={120} height={40} />
                      )}
                    </div>

                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mt-6">
                      {[
                        { label: 'Market Cap', value: marketData?.marketCap ? formatNumber(marketData.marketCap) : '$3.08T' },
                        { label: 'P/E', value: marketData?.pe?.toFixed(1) || '32.4' },
                        { label: 'Volume', value: marketData?.volume ? (marketData.volume / 1e6).toFixed(0) + 'M' : '54M' },
                        { label: '52W High', value: marketData?.week52High?.toFixed(2) || '$199.62' },
                        { label: '52W Low', value: marketData?.week52Low?.toFixed(2) || '$164.08' },
                        { label: 'Beta', value: marketData?.beta?.toFixed(2) || '1.24' },
                      ].map(stat => (
                        <div key={stat.label}>
                          <p className="text-[10px] text-emerald-400/40 uppercase tracking-wider">{stat.label}</p>
                          <p className="text-sm font-mono text-emerald-200 mt-0.5">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Indices */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { name: 'S&P 500', value: '5,892', change: '+23.45', changePercent: '+0.40%', icon: TrendingUp },
                    { name: 'NASDAQ', value: '19,112', change: '+114.28', changePercent: '+0.60%', icon: Activity },
                    { name: 'DOW', value: '43,258', change: '+129.67', changePercent: '+0.30%', icon: BarChart3 },
                  ].map(idx => (
                    <Card key={idx.name} className="bg-black/40 border-emerald-500/10 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <idx.icon className="size-4 text-emerald-400" />
                          <span className="text-xs text-emerald-400/60">{idx.name}</span>
                        </div>
                        <div className="flex items-end justify-between">
                          <span className="text-xl font-bold text-emerald-100 font-mono">{idx.value}</span>
                          <span className="text-xs text-green-400 font-mono">{idx.changePercent}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ====== FINANCIALS ====== */}
            <TabsContent value="financials" className="h-full m-0 overflow-y-auto">
              <div className="p-4 max-w-5xl mx-auto space-y-4">
                <h2 className="text-sm font-medium text-emerald-200">Financial Statements — {selectedTicker}</h2>

                {/* Income Statement */}
                <Card className="bg-black/40 border-emerald-500/10 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-emerald-300/60 flex items-center gap-1.5">
                      <DollarSign className="size-3" /> Income Statement (Annual)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-emerald-500/10">
                            <th className="text-left py-2 text-emerald-400/40 font-mono">Metric</th>
                            <th className="text-right py-2 text-emerald-400/40 font-mono">FY2024</th>
                            <th className="text-right py-2 text-emerald-400/40 font-mono">FY2023</th>
                            <th className="text-right py-2 text-emerald-400/40 font-mono">FY2022</th>
                          </tr>
                        </thead>
                        <tbody className="font-mono">
                          {[
                            ['Revenue', '$391.0B', '$383.0B', '$394.0B'],
                            ['Gross Profit', '$181.0B', '$169.0B', '$171.0B'],
                            ['Operating Income', '$120.0B', '$115.0B', '$120.0B'],
                            ['Net Income', '$97.0B', '$95.0B', '$99.0B'],
                            ['EPS', '$6.12', '$5.95', '$6.15'],
                            ['Gross Margin', '46.2%', '44.1%', '43.4%'],
                            ['Operating Margin', '30.7%', '30.0%', '30.5%'],
                            ['Net Margin', '24.8%', '24.8%', '25.1%'],
                          ].map(([metric, ...vals]) => (
                            <tr key={metric} className="border-b border-emerald-500/5 hover:bg-emerald-500/5">
                              <td className="py-2 text-emerald-200">{metric}</td>
                              {vals.map((v, i) => (
                                <td key={i} className="text-right py-2 text-emerald-300/60">{v}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Ratios */}
                <Card className="bg-black/40 border-emerald-500/10 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-emerald-300/60 flex items-center gap-1.5">
                      <BarChart3 className="size-3" /> Key Ratios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {[
                        { label: 'P/E', value: '32.4x' },
                        { label: 'P/B', value: '42.1x' },
                        { label: 'P/S', value: '7.9x' },
                        { label: 'EV/EBITDA', value: '24.8x' },
                        { label: 'ROE', value: '129%' },
                        { label: 'ROIC', value: '38.4%' },
                        { label: 'D/E', value: '1.73' },
                        { label: 'Current Ratio', value: '1.08' },
                        { label: 'Gross Margin', value: '46.2%' },
                        { label: 'FCF Margin', value: '28.3%' },
                        { label: 'ROA', value: '26.5%' },
                        { label: 'Net Margin', value: '24.8%' },
                      ].map(r => (
                        <div key={r.label} className="p-2 rounded-lg border border-emerald-500/10 bg-emerald-500/5">
                          <p className="text-[10px] text-emerald-400/40">{r.label}</p>
                          <p className="text-sm font-mono text-emerald-200 font-medium">{r.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Segment Breakdown */}
                <Card className="bg-black/40 border-emerald-500/10 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-emerald-300/60 flex items-center gap-1.5">
                      <Database className="size-3" /> Revenue by Segment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { segment: 'iPhone', revenue: '$200.0B', margin: '38%', growth: '+3%', pct: 51 },
                        { segment: 'Services', revenue: '$85.0B', margin: '72%', growth: '+14%', pct: 22 },
                        { segment: 'Mac', revenue: '$30.0B', margin: '42%', growth: '+5%', pct: 8 },
                        { segment: 'Wearables', revenue: '$40.0B', margin: '35%', growth: '+4%', pct: 10 },
                        { segment: 'iPad', revenue: '$28.0B', margin: '36%', growth: '-2%', pct: 7 },
                        { segment: 'Other', revenue: '$8.0B', margin: '25%', growth: '+8%', pct: 2 },
                      ].map(seg => (
                        <div key={seg.segment} className="flex items-center gap-3">
                          <span className="text-xs text-emerald-200 w-20 shrink-0">{seg.segment}</span>
                          <div className="flex-1 h-5 bg-emerald-500/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500/20 rounded-full" style={{ width: `${seg.pct}%` }} />
                          </div>
                          <span className="text-xs text-emerald-300/60 font-mono w-16 text-right">{seg.revenue}</span>
                          <span className="text-[10px] text-emerald-400/30 font-mono w-10 text-right">M:{seg.margin}</span>
                          <span className={`text-[10px] font-mono w-10 text-right ${seg.growth.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{seg.growth}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ====== SEC FILINGS ====== */}
            <TabsContent value="filings" className="h-full m-0 overflow-y-auto">
              <div className="p-4 max-w-5xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-emerald-200">SEC Filings — {selectedTicker}</h2>
                  <Select value={selectedTicker} onValueChange={setSelectedTicker}>
                    <SelectTrigger className="bg-black/30 border-emerald-500/20 text-emerald-100 text-xs w-[120px] h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {watchlist.map(w => <SelectItem key={w.ticker} value={w.ticker}>{w.ticker}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* 10-K */}
                <Card className="bg-black/40 border-emerald-500/10 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-emerald-200 flex items-center gap-2">
                      <FileText className="size-3.5 text-emerald-400" />
                      10-K Annual Report — FY2024
                      <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-400/40 bg-emerald-500/5">Filed: Nov 1, 2024</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { item: 'Item 1', title: 'Business', summary: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories. The Company operates through five segments: iPhone, Mac, iPad, Services, and Wearables.' },
                      { item: 'Item 1A', title: 'Risk Factors', summary: 'Key risks include: dependence on iPhone for majority of revenue, competition in all product categories, supply chain concentration in China, regulatory pressure on App Store practices, and global economic conditions.' },
                      { item: 'Item 7', title: "MD&A", summary: 'FY2024 revenue grew 2.1% to $391B, driven by Services growth of 14%. Product revenue was flat. Gross margin improved to 46.2% from 44.1% due to favorable mix shift toward Services and lower component costs.' },
                      { item: 'Item 8', title: 'Financial Statements', summary: 'Total assets: $365B. Cash: $67B. Total debt: $130B. Equity: $75B. Operating cash flow: $125B. Free cash flow: $110.5B.' },
                    ].map(section => (
                      <div key={section.item} className="p-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-emerald-400/50 bg-emerald-500/10 px-1.5 py-0.5 rounded">{section.item}</span>
                          <span className="text-xs font-medium text-emerald-200">{section.title}</span>
                        </div>
                        <p className="text-xs text-emerald-300/50 leading-relaxed">{section.summary}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* 8-K */}
                <Card className="bg-black/40 border-emerald-500/10 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-emerald-200 flex items-center gap-2">
                      <FileText className="size-3.5 text-amber-400" />
                      8-K Current Report
                      <Badge variant="outline" className="text-[9px] border-amber-500/20 text-amber-400/60 bg-amber-500/5">Filed: Jan 30, 2025</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 rounded-lg border border-amber-500/10 bg-amber-500/5">
                      <p className="text-xs text-amber-200/60 leading-relaxed">
                        Q1 FY2025 results: Revenue of $124.3B, up 5.2% YoY. Diluted EPS of $2.35, up 10.8%.
                        Board declared cash dividend of $0.25/share. Authorized additional $90B share buyback program.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ====== SCREENER ====== */}
            <TabsContent value="screener" className="h-full m-0 overflow-y-auto">
              <div className="p-4 max-w-6xl mx-auto space-y-4">
                <h2 className="text-sm font-medium text-emerald-200">Stock Screener</h2>
                <Card className="bg-black/40 border-emerald-500/10 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-emerald-500/10">
                            <th className="text-left p-3 text-emerald-400/40">Ticker</th>
                            <th className="text-left p-3 text-emerald-400/40">Name</th>
                            <th className="text-left p-3 text-emerald-400/40">Sector</th>
                            <th className="text-right p-3 text-emerald-400/40">Mkt Cap</th>
                            <th className="text-right p-3 text-emerald-400/40">P/E</th>
                            <th className="text-right p-3 text-emerald-400/40">Rev Growth</th>
                            <th className="text-right p-3 text-emerald-400/40">Gross Margin</th>
                            <th className="text-right p-3 text-emerald-400/40">ROE</th>
                            <th className="text-right p-3 text-emerald-400/40">Price</th>
                            <th className="text-right p-3 text-emerald-400/40">Change</th>
                          </tr>
                        </thead>
                        <tbody className="font-mono">
                          {[
                            ['NVDA', 'NVIDIA Corp', 'Technology', '$3.2T', '52.3', '+122%', '75%', '115%', '$131.28', '+2.8%'],
                            ['MSFT', 'Microsoft Corp', 'Technology', '$3.1T', '35.8', '+16%', '70%', '38%', '$417.52', '+0.9%'],
                            ['META', 'Meta Platforms', 'Technology', '$1.6T', '28.1', '+22%', '82%', '35%', '$618.45', '+1.5%'],
                            ['GOOGL', 'Alphabet Inc', 'Technology', '$2.3T', '24.5', '+14%', '57%', '28%', '$189.72', '+0.6%'],
                            ['AMZN', 'Amazon.com', 'Consumer', '$2.4T', '42.1', '+11%', '48%', '22%', '$229.15', '-0.3%'],
                            ['LLY', 'Eli Lilly', 'Healthcare', '$820B', '85.2', '+32%', '80%', '65%', '$855.20', '+1.1%'],
                            ['VST', 'Vistra Corp', 'Utilities', '$42B', '22.8', '+18%', '35%', '42%', '$142.30', '+3.2%'],
                            ['COIN', 'Coinbase', 'Financial', '$48B', '38.5', '+95%', '85%', '25%', '$275.60', '+4.5%'],
                          ].map(([ticker, name, sector, mktCap, pe, revGrowth, gMargin, roe, price, change]) => (
                            <tr key={ticker} className="border-b border-emerald-500/5 hover:bg-emerald-500/5 cursor-pointer" onClick={() => setSelectedTicker(ticker)}>
                              <td className="p-3 text-emerald-200 font-medium">{ticker}</td>
                              <td className="p-3 text-emerald-300/60">{name}</td>
                              <td className="p-3 text-emerald-400/40">{sector}</td>
                              <td className="p-3 text-right text-emerald-300/60">{mktCap}</td>
                              <td className="p-3 text-right text-emerald-300/60">{pe}</td>
                              <td className="p-3 text-right text-green-400">{revGrowth}</td>
                              <td className="p-3 text-right text-emerald-300/60">{gMargin}</td>
                              <td className="p-3 text-right text-emerald-300/60">{roe}</td>
                              <td className="p-3 text-right text-emerald-200">{price}</td>
                              <td className={`p-3 text-right ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{change}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ====== CRON ====== */}
            <TabsContent value="cron" className="h-full m-0 overflow-y-auto">
              <div className="p-4 max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-emerald-200">Scheduled Tasks</h2>
                  <Button variant="outline" size="sm" className="border-emerald-500/20 text-emerald-300/60 h-7 text-[10px]">
                    <Plus className="size-3 mr-1" /> Add Job
                  </Button>
                </div>
                <div className="space-y-2">
                  {cronJobs.map(job => (
                    <Card key={job.id} className="bg-black/40 border-emerald-500/10 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-emerald-200">{job.name}</h3>
                              <Badge variant="outline" className={`text-[9px] ${job.enabled ? 'border-green-500/20 text-green-400/80 bg-green-500/5' : 'border-gray-500/20 text-gray-400/80 bg-gray-500/5'}`}>
                                {job.enabled ? 'active' : 'disabled'}
                              </Badge>
                              <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-400/40 bg-emerald-500/5">
                                {job.fulfillmentMode}
                              </Badge>
                            </div>
                            <p className="text-xs text-emerald-400/40 mt-1">{job.message}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-emerald-400/30 font-mono">
                              <span>Schedule: {job.schedule.kind === 'every' ? `Every ${Math.round((job.schedule.everyMs || 0) / 60000)}m` : job.schedule.kind === 'cron' ? job.schedule.expr : job.schedule.kind}</span>
                              <span>Alerts: {job.alertCount}</span>
                              {job.nextRunAt && <span>Next: {new Date(job.nextRunAt).toLocaleString()}</span>}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="size-7 text-emerald-400/40 hover:text-emerald-200">
                              <Play className="size-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Heartbeat */}
                <Card className="bg-black/40 border-emerald-500/10 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-emerald-200 flex items-center gap-2">
                      <Bell className="size-3.5 text-amber-400" />
                      Heartbeat Monitor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-emerald-300/60">Active — Every 10 min (Market Hours)</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] border-green-500/20 text-green-400/80 bg-green-500/5">Last: OK</Badge>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { item: 'S&P 500 > 2% move', status: '✓', value: '+0.4%' },
                        { item: 'NASDAQ > 2% move', status: '✓', value: '+0.6%' },
                        { item: 'Breaking news', status: '✓', value: 'None' },
                        { item: 'Portfolio alerts', status: '⚠', value: 'AAPL → $200' },
                      ].map(check => (
                        <div key={check.item} className="flex items-center justify-between text-xs">
                          <span className="text-emerald-300/40">{check.item}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-300/60 font-mono">{check.value}</span>
                            <span className={check.status === '⚠' ? 'text-amber-400' : 'text-green-400'}>{check.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ====== SKILLS ====== */}
            <TabsContent value="skills" className="h-full m-0 overflow-y-auto">
              <div className="p-4 max-w-4xl mx-auto space-y-4">
                <h2 className="text-sm font-medium text-emerald-200">Built-in Skills</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {skills.map(skill => (
                    <Card key={skill.id} className="bg-black/40 border-emerald-500/10 backdrop-blur-sm hover:border-emerald-500/20 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="size-4 text-emerald-400" />
                          <h3 className="text-sm font-medium text-emerald-200">{skill.name}</h3>
                        </div>
                        <p className="text-xs text-emerald-300/50 leading-relaxed">{skill.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ====== SETTINGS ====== */}
            <TabsContent value="settings" className="h-full m-0 overflow-y-auto">
              <div className="p-4 max-w-3xl mx-auto space-y-4">
                <h2 className="text-sm font-medium text-emerald-200">Configuration</h2>

                <Card className="bg-black/40 border-emerald-500/10 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-emerald-200">LLM Provider</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { id: 'openai', name: 'OpenAI', model: 'gpt-5.5', fast: 'gpt-5.4-mini', ctx: '1M', active: true },
                      { id: 'anthropic', name: 'Anthropic', model: 'claude-sonnet-4', fast: 'claude-haiku-4.5', ctx: '200K', active: false },
                      { id: 'google', name: 'Google', model: 'gemini-2.5-pro', fast: 'gemini-3-flash', ctx: '1M', active: false },
                      { id: 'xai', name: 'xAI', model: 'grok-4', fast: 'grok-4-1-fast', ctx: '131K', active: false },
                      { id: 'deepseek', name: 'DeepSeek', model: 'deepseek-v4-pro', fast: 'deepseek-v4-flash', ctx: '1M', active: false },
                      { id: 'ollama', name: 'Ollama (Local)', model: 'llama3', fast: 'llama3', ctx: '128K', active: false },
                    ].map(p => (
                      <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                        p.active ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-emerald-500/10 hover:border-emerald-500/20'
                      }`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-emerald-200">{p.name}</span>
                            {p.active && <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-400/80 bg-emerald-500/5">Active</Badge>}
                          </div>
                          <span className="text-[10px] text-emerald-400/40 font-mono">{p.model} · Fast: {p.fast} · Context: {p.ctx}</span>
                        </div>
                        <Cpu className="size-4 text-emerald-400/30" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-black/40 border-emerald-500/10 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-emerald-200">Search Providers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { name: 'Exa', key: 'EXASEARCH_API_KEY', active: true },
                      { name: 'Perplexity', key: 'PERPLEXITY_API_KEY', active: false },
                      { name: 'Tavily', key: 'TAVILY_API_KEY', active: false },
                      { name: 'LangSearch', key: 'LANGSEARCH_API_KEY', active: false },
                    ].map(sp => (
                      <div key={sp.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-emerald-500/5">
                        <div className="flex items-center gap-2">
                          <Search className="size-3 text-emerald-400/40" />
                          <span className="text-xs text-emerald-200">{sp.name}</span>
                        </div>
                        <Badge variant="outline" className={`text-[9px] ${sp.active ? 'border-green-500/20 text-green-400/80 bg-green-500/5' : 'border-gray-500/20 text-gray-400/60 bg-gray-500/5'}`}>
                          {sp.active ? 'configured' : 'not set'}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </motion.div>
  )
}
