'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Settings, Play, BarChart3, X,
  Upload, Cpu, Gpu, Zap, Activity, Target, LineChart,
  ArrowUpRight, ArrowDownRight, RefreshCw, Clock,
  Database, Brain, Layers, Sliders, AlertTriangle, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// ─── Simulated Data ──────────────────────────────────────────────

const SYMBOLS = ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'SPY', 'QQQ', 'BTC-USD', 'ETH-USD', 'EUR/USD']
const TIMEFRAMES = ['1H', '4H', '1D', '1W', '1M']
const MODEL_SIZES = [
  { id: 'mini', name: 'Kronos-Mini', params: '50M', speed: '~2ms', gpu: '1.2 GB' },
  { id: 'small', name: 'Kronos-Small', params: '200M', speed: '~8ms', gpu: '3.5 GB' },
  { id: 'base', name: 'Kronos-Base', params: '700M', speed: '~25ms', gpu: '8 GB' },
]

// Simulated candlestick data
const CANDLE_DATA = Array.from({ length: 30 }, (_, i) => {
  const base = 180 + Math.sin(i * 0.3) * 15 + i * 1.2
  return {
    date: `Feb ${i + 1}`,
    open: base + (Math.random() - 0.5) * 5,
    high: base + Math.random() * 8,
    low: base - Math.random() * 6,
    close: base + (Math.random() - 0.5) * 6,
    volume: Math.floor(Math.random() * 50000000) + 10000000,
  }
})

// Forecast overlay
const FORECAST_DATA = Array.from({ length: 10 }, (_, i) => {
  const lastClose = CANDLE_DATA[CANDLE_DATA.length - 1].close
  return {
    date: `Mar ${i + 1}`,
    mean: lastClose + i * 1.5 + (Math.random() - 0.3) * 3,
    upper: lastClose + i * 2.5 + Math.random() * 5,
    lower: lastClose + i * 0.5 - Math.random() * 3,
  }
})

const BACKTEST_METRICS = [
  { label: 'Sharpe Ratio', value: '2.34', benchmark: '1.82', positive: true },
  { label: 'Max Drawdown', value: '-8.2%', benchmark: '-14.6%', positive: true },
  { label: 'Annual Return', value: '+32.4%', benchmark: '+18.7%', positive: true },
  { label: 'Win Rate', value: '64.2%', benchmark: '52.8%', positive: true },
  { label: 'Calmar Ratio', value: '3.95', benchmark: '1.28', positive: true },
  { label: 'Sortino Ratio', value: '3.12', benchmark: '2.21', positive: true },
]

const CUMULATIVE_RETURNS = Array.from({ length: 24 }, (_, i) => ({
  month: `2024-${String(i % 12 + 1).padStart(2, '0')}`,
  strategy: 100 * Math.pow(1.025, i) + (Math.random() - 0.5) * 5,
  benchmark: 100 * Math.pow(1.015, i) + (Math.random() - 0.5) * 3,
}))

// ─── Main Component ──────────────────────────────────────────────

export default function KronosTool({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('forecast')
  const [symbol, setSymbol] = useState('NVDA')
  const [timeframe, setTimeframe] = useState('1D')
  const [contextLength, setContextLength] = useState([512])
  const [predictionHorizon, setPredictionHorizon] = useState([10])
  const [temp, setTemp] = useState([0.7])
  const [topP, setTopP] = useState([0.95])
  const [mcPaths, setMcPaths] = useState([1000])
  const [modelSize, setModelSize] = useState('base')
  const [gpuConfig, setGpuConfig] = useState('auto')
  const [batchSize, setBatchSize] = useState([32])
  const [isForecasting, setIsForecasting] = useState(false)
  const [showForecast, setShowForecast] = useState(true)

  const handleForecast = useCallback(() => {
    setIsForecasting(true)
    setTimeout(() => { setIsForecasting(false); setShowForecast(true) }, 2500)
  }, [])

  const minV = (arr: number[]) => Math.min(...arr)
  const maxV = (arr: number[]) => Math.max(...arr)
  const allCloses = CANDLE_DATA.map(c => c.close)
  const allForecasts = FORECAST_DATA.map(f => [f.upper, f.lower]).flat()
  const chartMin = minV([...CANDLE_DATA.map(c => c.low), ...allForecasts]) * 0.98
  const chartMax = maxV([...CANDLE_DATA.map(c => c.high), ...allForecasts]) * 1.02
  const chartRange = chartMax - chartMin

  const toY = (v: number) => 100 - ((v - chartMin) / chartRange) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#08060D] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#d946ef]/20 bg-[#0C0A12]">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-[#d946ef]/10 border border-[#d946ef]/20 flex items-center justify-center">
            <LineChart className="size-5 text-[#d946ef]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Kronos</h1>
            <p className="text-xs text-gray-500">Financial Time Series Foundation Model</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-[#d946ef]/30 text-[#d946ef] text-[10px]">v3.2.0</Badge>
          <Badge variant="outline" className="border-fuchsia-300/20 text-fuchsia-300 text-[10px]">Foundation</Badge>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-white hover:bg-[#d946ef]/10">
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-3">
          <TabsList className="bg-[#0E0C16] border border-[#d946ef]/10">
            <TabsTrigger value="forecast" className="data-[state=active]:bg-[#d946ef]/20 data-[state=active]:text-[#d946ef]">
              <TrendingUp className="size-3.5 mr-1.5" /> Forecast
            </TabsTrigger>
            <TabsTrigger value="backtest" className="data-[state=active]:bg-[#d946ef]/20 data-[state=active]:text-[#d946ef]">
              <BarChart3 className="size-3.5 mr-1.5" /> Backtest
            </TabsTrigger>
            <TabsTrigger value="finetune" className="data-[state=active]:bg-[#d946ef]/20 data-[state=active]:text-[#d946ef]">
              <Brain className="size-3.5 mr-1.5" /> Fine-tune
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#d946ef]/20 data-[state=active]:text-[#d946ef]">
              <Settings className="size-3.5 mr-1.5" /> Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── Forecast Tab ─────────────────────────────────────── */}
        <TabsContent value="forecast" className="flex-1 px-6 pb-6 overflow-hidden">
          <div className="h-full flex flex-col gap-4 lg:flex-row">
            {/* Controls */}
            <div className="lg:w-72 space-y-3 shrink-0">
              <Card className="bg-[#0E0C16] border border-[#d946ef]/10 p-4 space-y-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase mb-1 block">Symbol</label>
                  <Select value={symbol} onValueChange={setSymbol}>
                    <SelectTrigger className="bg-[#0A0812] border-[#d946ef]/20 text-white text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0812] border-[#d946ef]/20">
                      {SYMBOLS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase mb-1 block">Timeframe</label>
                  <div className="flex gap-1">
                    {TIMEFRAMES.map(tf => (
                      <button key={tf} onClick={() => setTimeframe(tf)}
                        className={`flex-1 py-1.5 rounded text-[10px] font-mono transition-all ${timeframe === tf ? 'bg-[#d946ef]/20 text-[#d946ef] border border-[#d946ef]/30' : 'bg-[#0A0812] text-gray-500 border border-transparent hover:text-gray-300'}`}>
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Context Length: {contextLength[0]}</label>
                  <Slider value={contextLength} onValueChange={setContextLength} min={64} max={2048} step={64} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Prediction Horizon: {predictionHorizon[0]}</label>
                  <Slider value={predictionHorizon} onValueChange={setPredictionHorizon} min={1} max={60} step={1} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Temperature: {temp[0].toFixed(2)}</label>
                  <Slider value={temp} onValueChange={setTemp} min={0} max={2} step={0.05} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Top-P: {topP[0].toFixed(2)}</label>
                  <Slider value={topP} onValueChange={setTopP} min={0.1} max={1} step={0.05} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Monte Carlo Paths: {mcPaths[0]}</label>
                  <Slider value={mcPaths} onValueChange={setMcPaths} min={100} max={10000} step={100} />
                </div>
                <Button onClick={handleForecast} disabled={isForecasting}
                  className="w-full bg-[#d946ef] hover:bg-[#d946ef]/80 text-white text-xs h-9">
                  {isForecasting ? <><RefreshCw className="size-3.5 mr-1 animate-spin" /> Forecasting...</> : <><Play className="size-3.5 mr-1" /> Run Forecast</>}
                </Button>
              </Card>
            </div>

            {/* Chart */}
            <Card className="flex-1 bg-[#0E0C16] border border-[#d946ef]/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#d946ef]/10">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-semibold text-white">{symbol}</span>
                  <Badge variant="outline" className="text-[9px] border-[#d946ef]/20 text-[#d946ef]">{timeframe}</Badge>
                  <span className="text-sm font-mono text-green-400">
                    ${CANDLE_DATA[CANDLE_DATA.length - 1].close.toFixed(2)}
                    <ArrowUpRight className="size-3 inline ml-1" />
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <span>30D History</span>
                  {showForecast && <Badge className="bg-[#d946ef]/20 text-[#d946ef] text-[8px] border-0">+10D Forecast</Badge>}
                </div>
              </div>
              <div className="p-4">
                {/* SVG Candlestick Chart */}
                <svg viewBox="0 0 800 300" className="w-full h-64" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map(pct => (
                    <line key={pct} x1="0" y1={pct * 3} x2="800" y2={pct * 3} stroke="#1a1525" strokeWidth="0.5" />
                  ))}
                  {/* Candles */}
                  {CANDLE_DATA.map((c, i) => {
                    const x = 15 + i * 25
                    const isUp = c.close >= c.open
                    const color = isUp ? '#10b981' : '#ef4444'
                    const bodyTop = toY(Math.max(c.open, c.close))
                    const bodyBot = toY(Math.min(c.open, c.close))
                    return (
                      <g key={i}>
                        <line x1={x} y1={toY(c.high)} x2={x} y2={toY(c.low)} stroke={color} strokeWidth="1" />
                        <rect x={x - 5} y={bodyTop * 3} width="10" height={Math.max((bodyBot - bodyTop) * 3, 1)} fill={color} opacity="0.8" />
                      </g>
                    )
                  })}
                  {/* Forecast overlay */}
                  {showForecast && (
                    <>
                      <line x1={15 + 29 * 25} y1={toY(CANDLE_DATA[29].close) * 3} x2={15 + 38 * 25} y2={toY(FORECAST_DATA[9].mean) * 3}
                        stroke="#d946ef" strokeWidth="2" strokeDasharray="6 3" />
                      {FORECAST_DATA.map((f, i) => {
                        const x = 15 + (30 + i) * 25
                        return (
                          <g key={i}>
                            <line x1={x} y1={toY(f.upper) * 3} x2={x} y2={toY(f.lower) * 3} stroke="#d946ef" strokeWidth="3" opacity="0.2" />
                            <circle cx={x} cy={toY(f.mean) * 3} r="2.5" fill="#d946ef" />
                          </g>
                        )
                      })}
                    </>
                  )}
                </svg>
                {/* Legend */}
                <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-500">
                  <div className="flex items-center gap-1"><span className="size-2 rounded-full bg-green-500" /> Bullish</div>
                  <div className="flex items-center gap-1"><span className="size-2 rounded-full bg-red-500" /> Bearish</div>
                  {showForecast && <div className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#d946ef]" /> Forecast</div>}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Backtest Tab ─────────────────────────────────────── */}
        <TabsContent value="backtest" className="flex-1 px-6 pb-6 overflow-y-auto">
          <div className="space-y-4">
            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {BACKTEST_METRICS.map(m => (
                <Card key={m.label} className="bg-[#0E0C16] border border-[#d946ef]/10 p-4">
                  <span className="text-[10px] text-gray-500 uppercase">{m.label}</span>
                  <p className={`text-lg font-mono font-semibold ${m.positive ? 'text-green-400' : 'text-red-400'}`}>{m.value}</p>
                  <p className="text-[10px] text-gray-600">Benchmark: {m.benchmark}</p>
                </Card>
              ))}
            </div>

            {/* Cumulative Returns Chart */}
            <Card className="bg-[#0E0C16] border border-[#d946ef]/10 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Cumulative Returns</h3>
              <svg viewBox="0 0 800 200" className="w-full h-40" preserveAspectRatio="none">
                {[0, 25, 50, 75, 100].map(pct => (
                  <line key={pct} x1="0" y1={pct * 2} x2="800" y2={pct * 2} stroke="#1a1525" strokeWidth="0.5" />
                ))}
                <polyline
                  fill="none"
                  stroke="#d946ef"
                  strokeWidth="2"
                  points={CUMULATIVE_RETURNS.map((d, i) => `${(i / 23) * 800},${200 - (d.strategy / 180) * 200}`).join(' ')}
                />
                <polyline
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  points={CUMULATIVE_RETURNS.map((d, i) => `${(i / 23) * 800},${200 - (d.benchmark / 180) * 200}`).join(' ')}
                />
              </svg>
              <div className="flex items-center gap-4 mt-2 text-[10px]">
                <span className="flex items-center gap-1 text-[#d946ef]"><span className="w-3 h-0.5 bg-[#d946ef] inline-block" /> Kronos Strategy</span>
                <span className="flex items-center gap-1 text-gray-500"><span className="w-3 h-0.5 bg-gray-500 inline-block" style={{ borderBottom: '1px dashed #6b7280' }} /> Buy & Hold</span>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Fine-tune Tab ────────────────────────────────────── */}
        <TabsContent value="finetune" className="flex-1 px-6 pb-6 overflow-y-auto">
          <div className="max-w-2xl space-y-5">
            <Card className="bg-[#0E0C16] border border-[#d946ef]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Upload className="size-4 text-[#d946ef]" /> Training Data
              </h3>
              <div className="border-2 border-dashed border-[#d946ef]/20 rounded-lg p-8 text-center cursor-pointer hover:border-[#d946ef]/50 hover:bg-[#d946ef]/5 transition-all">
                <Database className="size-8 text-[#d946ef]/30 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Upload CSV/Parquet time series data</p>
                <p className="text-[10px] text-gray-600 mt-1">Supports OHLCV, macro indicators, alternative data</p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {['Qlib Format', 'QuantConnect', 'Custom CSV'].map(f => (
                  <div key={f} className="bg-[#0A0812] rounded-lg p-2.5 border border-[#d946ef]/10 text-center">
                    <span className="text-[10px] text-gray-400">{f}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-[#0E0C16] border border-[#d946ef]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Sliders className="size-4 text-[#d946ef]" /> Training Config
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase mb-1 block">Learning Rate</label>
                  <Input defaultValue="2e-5" className="bg-[#0A0812] border-[#d946ef]/20 text-white font-mono text-xs h-8" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Epochs: 50</label>
                  <Slider defaultValue={[50]} min={1} max={200} step={1} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Qlib Integration</span>
                  <Switch defaultChecked className="data-[state=checked]:bg-[#d946ef]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Early Stopping</span>
                  <Switch defaultChecked className="data-[state=checked]:bg-[#d946ef]" />
                </div>
              </div>
            </Card>

            <Button className="w-full bg-[#d946ef] hover:bg-[#d946ef]/80 text-white text-xs h-9">
              <Play className="size-3.5 mr-1" /> Start Fine-tuning
            </Button>
          </div>
        </TabsContent>

        {/* ─── Settings Tab ─────────────────────────────────────── */}
        <TabsContent value="settings" className="flex-1 px-6 pb-6 overflow-y-auto">
          <div className="max-w-2xl space-y-5">
            {/* Model Size */}
            <Card className="bg-[#0E0C16] border border-[#d946ef]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Layers className="size-4 text-[#d946ef]" /> Model Size
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {MODEL_SIZES.map(m => (
                  <div key={m.id} onClick={() => setModelSize(m.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      modelSize === m.id ? 'border-[#d946ef]/50 bg-[#d946ef]/10' : 'border-[#d946ef]/10 bg-[#0A0812] hover:border-[#d946ef]/30'
                    }`}>
                    <p className="text-xs font-medium text-white">{m.name}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{m.params} params</p>
                    <p className="text-[10px] text-gray-600">Speed: {m.speed} | GPU: {m.gpu}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* GPU Config */}
            <Card className="bg-[#0E0C16] border border-[#d946ef]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Gpu className="size-4 text-[#d946ef]" /> GPU Configuration
              </h3>
              <Select value={gpuConfig} onValueChange={setGpuConfig}>
                <SelectTrigger className="bg-[#0A0812] border-[#d946ef]/20 text-white text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0812] border-[#d946ef]/20">
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="cuda">NVIDIA CUDA</SelectItem>
                  <SelectItem value="metal">Apple Metal</SelectItem>
                  <SelectItem value="rocm">AMD ROCm</SelectItem>
                  <SelectItem value="cpu">CPU Only</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            {/* Batch Size */}
            <Card className="bg-[#0E0C16] border border-[#d946ef]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Cpu className="size-4 text-[#d946ef]" /> Batch Size
              </h3>
              <Slider value={batchSize} onValueChange={setBatchSize} min={1} max={128} step={1} />
              <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                <span>1 (Low VRAM)</span><span>{batchSize[0]}</span><span>128 (High VRAM)</span>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
