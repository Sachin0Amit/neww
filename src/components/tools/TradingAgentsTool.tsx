'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, BarChart3, Clock, Settings, X, Search,
  ArrowUpRight, ArrowDownRight, Minus, Activity, Brain,
  Newspaper, LineChart, Shield, Users, Briefcase,
  ChevronRight, Zap, Cpu, Globe, Database, AlertTriangle,
  CheckCircle2, XCircle, Play, RotateCcw, DollarSign,
  Percent, Target, Layers, Wifi
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const ACCENT = '#22c55e'

const ANALYSIS_RESULT = {
  ticker: 'NVDA',
  date: '2025-03-04',
  decision: 'BUY' as const,
  confidence: 87,
  price: 142.53,
  targetPrice: 165.00,
  stopLoss: 128.00,
  rationale: 'Strong AI infrastructure demand continues to drive revenue growth (+125.8% YoY). Data center revenue exceeding expectations. Gross margins expanding to 73.5%. Risk-reward favorable with 15.8% upside to target.',
  agents: [
    { name: 'Fundamental Analyst', verdict: 'BULLISH', confidence: 92, note: 'Revenue growth exceptional, margins expanding, PE justified by growth rate' },
    { name: 'Sentiment Analyst', verdict: 'BULLISH', confidence: 78, note: 'Social sentiment 72% positive, institutional buying increasing, analyst upgrades' },
    { name: 'News Analyst', verdict: 'BULLISH', confidence: 85, note: 'Positive AI infrastructure spending cycle, new product launches, partnership expansion' },
    { name: 'Technical Analyst', verdict: 'NEUTRAL', confidence: 55, note: 'RSI 62.4 near overbought, strong trend above SMA200, MACD bullish' },
    { name: 'Bull Researcher', verdict: 'BULLISH', confidence: 88, note: 'AI capex supercycle, Blackwell demand exceeds supply, software ecosystem lock-in' },
    { name: 'Bear Researcher', verdict: 'NEUTRAL', confidence: 62, note: 'Valuation stretched, China risk, potential demand normalization in H2' },
    { name: 'Risk Debaters', verdict: 'MODERATE', confidence: 70, note: 'Concentration risk high, geopolitical exposure manageable, position size 3-5%' },
  ]
}

const PIPELINE_AGENTS = [
  { id: 1, name: 'Fundamental Analyst', icon: BarChart3, status: 'complete', duration: '3.2s', output: 'Revenue +125.8% YoY, PE 33.4x' },
  { id: 2, name: 'Sentiment Analyst', icon: Brain, status: 'complete', duration: '2.8s', output: '72% positive sentiment' },
  { id: 3, name: 'News Analyst', icon: Newspaper, status: 'complete', duration: '4.1s', output: '14 positive, 2 negative articles' },
  { id: 4, name: 'Technical Analyst', icon: LineChart, status: 'complete', duration: '1.9s', output: 'RSI 62.4, above SMA200' },
  { id: 5, name: 'Bull Researcher', icon: TrendingUp, status: 'running', duration: '5.3s', output: 'Building bull case...' },
  { id: 6, name: 'Bear Researcher', icon: ArrowDownRight, status: 'pending', duration: '—', output: 'Waiting...' },
  { id: 7, name: 'Risk Debaters', icon: Shield, status: 'pending', duration: '—', output: 'Waiting...' },
  { id: 8, name: 'Portfolio Manager', icon: Briefcase, status: 'pending', duration: '—', output: 'Waiting...' },
]

const HISTORY = [
  { id: 1, date: '2025-03-03', ticker: 'AAPL', decision: 'BUY', entry: 213.45, exit: 218.20, return: '+2.22%', alpha: '+1.84%', status: 'closed' },
  { id: 2, date: '2025-03-01', ticker: 'MSFT', decision: 'HOLD', entry: 412.30, exit: 445.82, return: '+8.13%', alpha: '+5.92%', status: 'open' },
  { id: 3, date: '2025-02-28', ticker: 'TSLA', decision: 'SELL', entry: 295.40, exit: 268.15, return: '-9.22%', alpha: '+2.15%', status: 'closed' },
  { id: 4, date: '2025-02-27', ticker: 'NVDA', decision: 'BUY', entry: 125.80, exit: 142.53, return: '+13.27%', alpha: '+8.45%', status: 'open' },
  { id: 5, date: '2025-02-25', ticker: 'AMZN', decision: 'BUY', entry: 188.50, exit: 204.30, return: '+8.38%', alpha: '+4.21%', status: 'open' },
  { id: 6, date: '2025-02-24', ticker: 'META', decision: 'HOLD', entry: 505.20, exit: 528.90, return: '+4.69%', alpha: '+2.88%', status: 'closed' },
  { id: 7, date: '2025-02-21', ticker: 'GOOG', decision: 'BUY', entry: 142.80, exit: 156.40, return: '+9.52%', alpha: '+6.12%', status: 'closed' },
  { id: 8, date: '2025-02-20', ticker: 'JPM', decision: 'SELL', entry: 198.50, exit: 192.30, return: '-3.12%', alpha: '+1.05%', status: 'closed' },
]

const LLM_PROVIDERS = [
  { name: 'OpenAI', models: ['GPT-4o', 'GPT-4o-mini', 'o1', 'o3-mini'], active: true },
  { name: 'Anthropic', models: ['Claude 3.5 Sonnet', 'Claude 3 Opus', 'Claude 3 Haiku'], active: true },
  { name: 'Google', models: ['Gemini 2.0 Flash', 'Gemini 1.5 Pro'], active: true },
  { name: 'Meta', models: ['Llama 3.1 405B', 'Llama 3.1 70B'], active: true },
  { name: 'Mistral', models: ['Mistral Large', 'Mixtral 8x22B'], active: true },
  { name: 'DeepSeek', models: ['DeepSeek V3', 'DeepSeek R1'], active: false },
  { name: 'Cohere', models: ['Command R+', 'Command R'], active: true },
  { name: 'xAI', models: ['Grok 2', 'Grok 2 Mini'], active: false },
  { name: 'Together AI', models: ['Multiple models'], active: true },
  { name: 'Fireworks AI', models: ['Multiple models'], active: false },
  { name: 'Groq', models: ['Llama 3.1 70B', 'Mixtral'], active: true },
  { name: 'Local (Ollama)', models: ['Local models'], active: false },
]

const DATA_SOURCES = [
  { name: 'Yahoo Finance', status: 'active', calls: 12456 },
  { name: 'Alpha Vantage', status: 'active', calls: 3456 },
  { name: 'SEC EDGAR', status: 'active', calls: 2345 },
  { name: 'FRED Economic', status: 'active', calls: 1892 },
  { name: 'Bloomberg API', status: 'active', calls: 8901 },
  { name: 'Reuters News', status: 'active', calls: 5678 },
  { name: 'CoinGecko', status: 'active', calls: 1234 },
  { name: 'Twitter/X Sentiment', status: 'active', calls: 4567 },
  { name: 'Reddit Sentiment', status: 'active', calls: 2345 },
  { name: 'HuggingFace', status: 'idle', calls: 567 },
]

function AnalyzeTab() {
  const [ticker, setTicker] = useState('NVDA')
  const [date, setDate] = useState('2025-03-04')
  const [showResult, setShowResult] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setShowResult(false)
    setTimeout(() => { setIsAnalyzing(false); setShowResult(true) }, 1500)
  }

  return (
    <div className="space-y-4">
      {/* Input Bar */}
      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Ticker Symbol</label>
            <Input
              value={ticker}
              onChange={e => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g. NVDA"
              className="bg-[#111420] border-[#1E2230] text-white text-sm h-10 font-mono focus:border-[#22c55e]/50"
            />
          </div>
          <div className="w-40">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Analysis Date</label>
            <Input
              value={date}
              onChange={e => setDate(e.target.value)}
              type="date"
              className="bg-[#111420] border-[#1E2230] text-white text-sm h-10 font-mono focus:border-[#22c55e]/50"
            />
          </div>
          <Button onClick={handleAnalyze} disabled={isAnalyzing} className="h-10 px-6 text-sm font-semibold" style={{ backgroundColor: ACCENT, color: 'white' }}>
            {isAnalyzing ? <><Activity className="size-4 mr-2 animate-spin" />Analyzing...</> : <><Search className="size-4 mr-2" />Analyze</>}
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {showResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Decision Banner */}
            <Card className="bg-[#0C0E14] border-2 p-4" style={{ borderColor: `${ACCENT}50` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${ACCENT}15` }}>
                    {ANALYSIS_RESULT.decision === 'BUY' ? <ArrowUpRight className="size-6" style={{ color: ACCENT }} /> :
                     ANALYSIS_RESULT.decision === 'SELL' ? <ArrowDownRight className="size-6 text-red-400" /> :
                     <Minus className="size-6 text-yellow-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-white font-mono">{ANALYSIS_RESULT.ticker}</h2>
                      <Badge className="text-xs font-bold" style={{ backgroundColor: `${ACCENT}20`, color: ACCENT, borderColor: `${ACCENT}40` }}>
                        {ANALYSIS_RESULT.decision}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{ANALYSIS_RESULT.rationale.slice(0, 100)}...</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Confidence</p>
                      <p className="text-lg font-bold font-mono" style={{ color: ACCENT }}>{ANALYSIS_RESULT.confidence}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Target</p>
                      <p className="text-lg font-bold text-white font-mono">${ANALYSIS_RESULT.targetPrice}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Stop Loss</p>
                      <p className="text-lg font-bold text-red-400 font-mono">${ANALYSIS_RESULT.stopLoss}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="h-2 rounded-full bg-[#1E2230] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${ANALYSIS_RESULT.confidence}%`, backgroundColor: ACCENT }} />
                </div>
              </div>
            </Card>

            {/* Agent Votes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {ANALYSIS_RESULT.agents.map((agent, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="bg-[#0C0E14] border border-[#1E2230] p-3 hover:border-[#22c55e]/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[11px] text-white font-medium">{agent.name}</h4>
                      <Badge
                        variant="outline"
                        className={`text-[7px] ${
                          agent.verdict === 'BULLISH' ? 'border-emerald-500/30 text-emerald-400' :
                          agent.verdict === 'NEUTRAL' ? 'border-yellow-500/30 text-yellow-400' :
                          agent.verdict === 'MODERATE' ? 'border-blue-500/30 text-blue-400' :
                          'border-red-500/30 text-red-400'
                        }`}
                      >
                        {agent.verdict}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-[#1E2230] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${agent.confidence}%`, backgroundColor: ACCENT }} />
                      </div>
                      <span className="text-[9px] text-gray-400 font-mono w-7 text-right">{agent.confidence}%</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-tight">{agent.note}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PipelineTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Multi-agent analysis pipeline</p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] border-[#22c55e]/30 text-[#22c55e]">
            <span className="size-1.5 rounded-full bg-[#22c55e] mr-1.5 animate-pulse" />Running
          </Badge>
          <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1.5 border-[#22c55e]/30 text-[#22c55e]">
            <RotateCcw className="size-3" />Restart
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {PIPELINE_AGENTS.map((agent, i) => (
          <motion.div key={agent.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`bg-[#0C0E14] border p-4 transition-colors ${
              agent.status === 'running' ? 'border-[#22c55e]/50 bg-[#22c55e]/5' :
              agent.status === 'complete' ? 'border-[#1E2230]' : 'border-[#1E2230]/50 opacity-60'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${agent.status === 'running' ? 'bg-[#22c55e]/15' : agent.status === 'complete' ? 'bg-[#22c55e]/10' : 'bg-[#1E2230]'}`}>
                  <agent.icon className="size-4" style={{ color: agent.status === 'pending' ? '#4B5563' : ACCENT }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm text-white font-medium">{agent.name}</h4>
                    {agent.status === 'complete' && <CheckCircle2 className="size-3.5 text-[#22c55e]" />}
                    {agent.status === 'running' && <Activity className="size-3.5 text-[#22c55e] animate-spin" />}
                    {agent.status === 'pending' && <Clock className="size-3.5 text-gray-600" />}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">{agent.output}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 font-mono">{agent.duration}</span>
                  <Badge
                    variant="outline"
                    className={`text-[7px] ml-2 ${
                      agent.status === 'complete' ? 'border-emerald-500/30 text-emerald-400' :
                      agent.status === 'running' ? 'border-[#22c55e]/30 text-[#22c55e]' :
                      'border-gray-600/30 text-gray-500'
                    }`}
                  >
                    {agent.status}
                  </Badge>
                </div>
              </div>
              {agent.status === 'running' && (
                <div className="mt-3">
                  <Progress value={65} className="h-1 bg-[#1E2230]" />
                </div>
              )}
            </Card>
            {i < PIPELINE_AGENTS.length - 1 && (
              <div className="flex justify-center py-1">
                <div className="w-px h-4" style={{ backgroundColor: agent.status === 'complete' ? ACCENT : '#1E2230' }} />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pipeline Flow Visualization */}
      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <h4 className="text-xs font-semibold text-white mb-3">Agent Flow Diagram</h4>
        <div className="flex items-center justify-center gap-1 overflow-x-auto py-2">
          {['Fundamental', 'Sentiment', 'News', 'Technical'].map((name, i) => (
            <div key={name} className="flex items-center gap-1">
              <div className="px-2 py-1 rounded text-[9px] font-medium bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] whitespace-nowrap">{name}</div>
              {i < 3 && <ChevronRight className="size-3 text-gray-600" />}
            </div>
          ))}
          <ChevronRight className="size-3 text-gray-600" />
          <div className="flex flex-col gap-1">
            <div className="px-2 py-1 rounded text-[9px] font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 whitespace-nowrap">Bull</div>
            <div className="px-2 py-1 rounded text-[9px] font-medium bg-red-500/10 border border-red-500/30 text-red-400 whitespace-nowrap">Bear</div>
          </div>
          <ChevronRight className="size-3 text-gray-600" />
          <div className="px-2 py-1 rounded text-[9px] font-medium bg-blue-500/10 border border-blue-500/30 text-blue-400 whitespace-nowrap">Risk</div>
          <ChevronRight className="size-3 text-gray-600" />
          <div className="px-2 py-1 rounded text-[9px] font-medium bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 whitespace-nowrap">Portfolio Mgr</div>
        </div>
      </Card>
    </div>
  )
}

function HistoryTab() {
  const totalReturn = HISTORY.filter(h => h.status === 'closed').reduce((sum, h) => sum + parseFloat(h.return), 0)
  const winRate = Math.round(HISTORY.filter(h => h.status === 'closed' && !h.return.startsWith('-')).length / HISTORY.filter(h => h.status === 'closed').length * 100)

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Trades', value: HISTORY.length.toString(), icon: Briefcase },
          { label: 'Win Rate', value: `${winRate}%`, icon: Target },
          { label: 'Total Return', value: `+${totalReturn.toFixed(2)}%`, icon: TrendingUp },
          { label: 'Avg Alpha', value: '+3.83%', icon: Zap },
        ].map(stat => (
          <Card key={stat.label} className="bg-[#0C0E14] border border-[#1E2230] p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <stat.icon className="size-3" style={{ color: ACCENT }} />
              <span className="text-[9px] text-gray-500 uppercase">{stat.label}</span>
            </div>
            <span className="text-sm text-white font-mono font-semibold">{stat.value}</span>
          </Card>
        ))}
      </div>

      {/* History Table */}
      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-[#1E2230]">
                {['Date', 'Ticker', 'Decision', 'Entry', 'Current/Exit', 'Return', 'Alpha', 'Status'].map(h => (
                  <th key={h} className="text-left text-gray-500 font-medium uppercase tracking-wider py-2 px-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HISTORY.map(row => (
                <tr key={row.id} className="border-b border-[#1E2230]/50 hover:bg-[#22c55e]/5 transition-colors">
                  <td className="py-2 px-2 text-gray-300 font-mono">{row.date}</td>
                  <td className="py-2 px-2 text-white font-medium font-mono">{row.ticker}</td>
                  <td className="py-2 px-2">
                    <Badge variant="outline" className={`text-[8px] ${
                      row.decision === 'BUY' ? 'border-emerald-500/30 text-emerald-400' :
                      row.decision === 'SELL' ? 'border-red-500/30 text-red-400' :
                      'border-yellow-500/30 text-yellow-400'
                    }`}>{row.decision}</Badge>
                  </td>
                  <td className="py-2 px-2 text-gray-300 font-mono">${row.entry.toFixed(2)}</td>
                  <td className="py-2 px-2 text-gray-300 font-mono">${row.exit.toFixed(2)}</td>
                  <td className={`py-2 px-2 font-mono font-medium ${row.return.startsWith('+') ? 'text-[#22c55e]' : 'text-red-400'}`}>{row.return}</td>
                  <td className="py-2 px-2 text-[#22c55e] font-mono">{row.alpha}</td>
                  <td className="py-2 px-2">
                    <Badge variant="outline" className={`text-[7px] ${row.status === 'open' ? 'border-[#22c55e]/30 text-[#22c55e]' : 'border-gray-500/30 text-gray-400'}`}>{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function BacktestTab() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleRun = () => {
    setIsRunning(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setIsRunning(false); return 100 }
        return prev + Math.random() * 8
      })
    }, 400)
  }

  const backtestMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const backtestReturns = [2.1, 3.4, -1.2, 4.5, 1.8, -0.5, 5.2, 3.1, 2.7, -1.8, 4.2, 6.1]
  const maxReturn = Math.max(...backtestReturns.map(Math.abs))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Config */}
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <h4 className="text-xs font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="size-3.5" style={{ color: ACCENT }} />Configuration
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Universe</label>
              <Input defaultValue="S&P 500" className="bg-[#111420] border-[#1E2230] text-white text-sm h-9" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Start Date</label>
                <Input type="date" defaultValue="2024-01-01" className="bg-[#111420] border-[#1E2230] text-white text-sm h-9 font-mono" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">End Date</label>
                <Input type="date" defaultValue="2025-03-01" className="bg-[#111420] border-[#1E2230] text-white text-sm h-9 font-mono" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Initial Capital</label>
              <Input defaultValue="1,000,000" className="bg-[#111420] border-[#1E2230] text-white text-sm h-9 font-mono" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Rebalance Frequency</label>
              <Select defaultValue="weekly">
                <SelectTrigger className="bg-[#111420] border-[#1E2230] text-white text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111420] border-[#1E2230]">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Include Slippage</span>
              <Switch defaultChecked className="data-[state=checked]:bg-[#22c55e]" />
            </div>
            <Button onClick={handleRun} disabled={isRunning} className="w-full text-xs font-semibold" style={{ backgroundColor: ACCENT, color: 'white' }}>
              {isRunning ? <><Activity className="size-3.5 mr-2 animate-spin" />Running Backtest...</> : <><Play className="size-3.5 mr-2" />Run Backtest</>}
            </Button>
            {isRunning && <Progress value={Math.min(progress, 100)} className="h-1.5 bg-[#1E2230]" />}
          </div>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Total Return', value: '+29.4%', positive: true },
              { label: 'Sharpe Ratio', value: '2.14', positive: true },
              { label: 'Max Drawdown', value: '-8.7%', positive: false },
              { label: 'Win Rate', value: '68.2%', positive: true },
            ].map(kpi => (
              <Card key={kpi.label} className="bg-[#0C0E14] border border-[#1E2230] p-3">
                <p className="text-[9px] text-gray-500 uppercase">{kpi.label}</p>
                <p className={`text-sm font-mono font-semibold ${kpi.positive ? 'text-[#22c55e]' : 'text-red-400'}`}>{kpi.value}</p>
              </Card>
            ))}
          </div>

          {/* Returns Chart */}
          <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
            <h4 className="text-xs font-semibold text-white mb-4">Monthly Returns (2024)</h4>
            <div className="flex items-end gap-2 h-40">
              {backtestMonths.map((month, i) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-mono text-gray-400">{backtestReturns[i] > 0 ? `+${backtestReturns[i]}` : backtestReturns[i]}%</span>
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${(Math.abs(backtestReturns[i]) / maxReturn) * 100}%`,
                      minHeight: 4,
                      backgroundColor: backtestReturns[i] >= 0 ? ACCENT : '#ef4444'
                    }}
                  />
                  <span className="text-[9px] text-gray-500">{month}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <h4 className="text-xs font-semibold text-white mb-4 flex items-center gap-2">
          <Cpu className="size-3.5" style={{ color: ACCENT }} />LLM Provider Config
        </h4>
        <ScrollArea className="h-72">
          <div className="space-y-1.5">
            {LLM_PROVIDERS.map(provider => (
              <div key={provider.name} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#111420] border border-[#1E2230]/50 hover:border-[#22c55e]/20 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Switch checked={provider.active} className="data-[state=checked]:bg-[#22c55e]" />
                  <div>
                    <p className="text-[11px] text-white font-medium">{provider.name}</p>
                    <p className="text-[9px] text-gray-500">{provider.models.join(', ')}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[7px] ${provider.active ? 'border-emerald-500/30 text-emerald-400' : 'border-gray-600/30 text-gray-500'}`}>
                  {provider.active ? 'active' : 'disabled'}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <div className="space-y-4">
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <h4 className="text-xs font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="size-3.5" style={{ color: ACCENT }} />Data Sources
          </h4>
          <div className="space-y-1.5">
            {DATA_SOURCES.map(source => (
              <div key={source.name} className="flex items-center justify-between py-1.5 px-2.5 rounded bg-[#111420] border border-[#1E2230]/50">
                <div className="flex items-center gap-2">
                  <Wifi className="size-3 text-gray-500" />
                  <span className="text-[11px] text-gray-300">{source.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-gray-500 font-mono">{source.calls.toLocaleString()} calls</span>
                  <Badge variant="outline" className={`text-[7px] ${source.status === 'active' ? 'border-emerald-500/30 text-emerald-400' : 'border-yellow-500/30 text-yellow-400'}`}>
                    {source.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <h4 className="text-xs font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="size-3.5" style={{ color: ACCENT }} />Risk Parameters
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Max Position Size</label>
              <Input defaultValue="5%" className="bg-[#111420] border-[#1E2230] text-white text-sm h-9 font-mono" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Max Portfolio Beta</label>
              <Input defaultValue="1.5" className="bg-[#111420] border-[#1E2230] text-white text-sm h-9 font-mono" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Stop Loss Default</label>
              <Input defaultValue="-10%" className="bg-[#111420] border-[#1E2230] text-white text-sm h-9 font-mono" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Require Unanimous Risk Approval</span>
              <Switch defaultChecked className="data-[state=checked]:bg-[#22c55e]" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Auto-hedge on High Volatility</span>
              <Switch defaultChecked className="data-[state=checked]:bg-[#22c55e]" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function TradingAgentsTool({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#080A0F] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2230]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${ACCENT}15` }}>
            <TrendingUp className="size-5" style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">Trading Agents</h1>
            <p className="text-[10px] text-gray-500">Multi-agent trading framework</p>
          </div>
          <Badge className="text-[9px] ml-2" style={{ backgroundColor: `${ACCENT}20`, color: ACCENT, borderColor: `${ACCENT}40` }}>
            v4.1.0
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />8 Agents Active
          </Badge>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-[#1E2230]">
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="analyze" className="flex-1 flex flex-col h-[calc(100vh-65px)]">
        <div className="px-6 pt-3">
          <TabsList className="bg-[#111420] border border-[#1E2230]">
            <TabsTrigger value="analyze" className="text-xs data-[state=active]:text-white">
              <Search className="size-3.5 mr-1.5" />Analyze
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="text-xs data-[state=active]:text-white">
              <Layers className="size-3.5 mr-1.5" />Pipeline
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs data-[state=active]:text-white">
              <Clock className="size-3.5 mr-1.5" />History
            </TabsTrigger>
            <TabsTrigger value="backtest" className="text-xs data-[state=active]:text-white">
              <BarChart3 className="size-3.5 mr-1.5" />Backtest
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs data-[state=active]:text-white">
              <Settings className="size-3.5 mr-1.5" />Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-6 py-4">
          <TabsContent value="analyze"><AnalyzeTab /></TabsContent>
          <TabsContent value="pipeline"><PipelineTab /></TabsContent>
          <TabsContent value="history"><HistoryTab /></TabsContent>
          <TabsContent value="backtest"><BacktestTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
        </ScrollArea>
      </Tabs>
    </motion.div>
  )
}
