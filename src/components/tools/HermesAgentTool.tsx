'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, MessageSquare, Brain, Clock, Zap, Settings, X,
  Send, Undo2, RotateCcw, Sparkles, Plus, Search,
  ChevronRight, Check, Globe, Terminal, Cpu, BookOpen,
  MemoryStick, Calendar, Link, Shield, ToggleLeft,
  Hash, Star, ArrowUpRight, Copy, Pencil, Trash2, Play, Pause
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

const ACCENT = '#06b6d4'

const CHAT_MESSAGES = [
  { id: 1, role: 'user' as const, content: 'Analyze the market impact of the latest Fed rate decision', time: '14:30' },
  { id: 2, role: 'assistant' as const, content: 'The Federal Reserve maintained rates at 5.25-5.50% as expected. Key takeaways:\n\n1. **Dot Plot**: Median projection shows 3 cuts in 2025, down from 4 previously\n2. **Inflation Language**: Changed from "elevated" to "moderately elevated" — dovish signal\n3. **Balance Sheet**: QT pace unchanged at $60B/month but hinted at potential slowdown\n\nMarket reaction: S&P 500 +0.8%, 10Y yield -4bp to 4.28%, DXY -0.3%\n\nI recommend monitoring the 2-year yield for the clearest signal on rate expectations.', time: '14:30' },
  { id: 3, role: 'user' as const, content: 'What sectors benefit most from this?', time: '14:32' },
  { id: 4, role: 'assistant' as const, content: 'Based on historical rate-pause periods, these sectors tend to outperform:\n\n• **Technology** (+2.8% avg in 30 days post-pause) — lower discount rate benefits growth stocks\n• **Real Estate** (+2.1%) — reduced borrowing cost pressure\n• **Healthcare** (+1.9%) — defensive with rate-sensitive components\n• **Utilities** (+1.5%) — yield competition easing\n\nSectors to watch carefully:\n• **Financials** — net interest margin compression risk\n• **Energy** — dollar weakness partially offset by demand concerns', time: '14:32' },
]

const MODELS = [
  { id: 'hermes-3-405b', name: 'Hermes 3 405B', provider: 'NousResearch', ctx: '128K' },
  { id: 'hermes-3-70b', name: 'Hermes 3 70B', provider: 'NousResearch', ctx: '128K' },
  { id: 'hermes-3-8b', name: 'Hermes 3 8B', provider: 'NousResearch', ctx: '32K' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', ctx: '128K' },
  { id: 'claude-3.5', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', ctx: '200K' },
  { id: 'gemini-2', name: 'Gemini 2.0 Flash', provider: 'Google', ctx: '1M' },
  { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', provider: 'Meta', ctx: '128K' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', ctx: '128K' },
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', ctx: '128K' },
  { id: 'qwen-2.5-72b', name: 'Qwen 2.5 72B', provider: 'Alibaba', ctx: '128K' },
  { id: 'command-r+', name: 'Command R+', provider: 'Cohere', ctx: '128K' },
  { id: 'phi-4', name: 'Phi-4', provider: 'Microsoft', ctx: '16K' },
]

const SKILLS = [
  { id: 1, name: 'Market Analysis', desc: 'Analyze market conditions and trends', uses: 342, auto: true, status: 'active' },
  { id: 2, name: 'Code Generation', desc: 'Write and debug code in 30+ languages', uses: 891, auto: true, status: 'active' },
  { id: 3, name: 'Research Synthesis', desc: 'Synthesize research from multiple sources', uses: 234, auto: true, status: 'active' },
  { id: 4, name: 'Data Extraction', desc: 'Extract structured data from documents', uses: 567, auto: false, status: 'active' },
  { id: 5, name: 'Email Drafting', desc: 'Draft professional emails and responses', uses: 156, auto: false, status: 'active' },
  { id: 6, name: 'Summarization', desc: 'Summarize long documents and conversations', uses: 1023, auto: true, status: 'active' },
  { id: 7, name: 'Translation', desc: 'Translate text between 95 languages', uses: 89, auto: false, status: 'active' },
  { id: 8, name: 'SQL Query Builder', desc: 'Build and optimize SQL queries', uses: 445, auto: false, status: 'active' },
]

const MEMORY_ENTRIES = [
  { id: 1, key: 'Fed Rate Decision 2025-03', content: 'Fed maintained 5.25-5.50%, dot plot shows 3 cuts in 2025', timestamp: '2h ago', relevance: 0.95 },
  { id: 2, key: 'User Portfolio Preferences', content: 'Prefers growth stocks, risk tolerance: moderate-high', timestamp: '1d ago', relevance: 0.87 },
  { id: 3, key: 'NVDA Analysis', content: 'Intrinsic value $185.20, margin of safety 12.3%', timestamp: '3h ago', relevance: 0.82 },
  { id: 4, key: 'API Key Locations', content: 'OpenAI key in env, Anthropic key in vault', timestamp: '5d ago', relevance: 0.65 },
  { id: 5, key: 'Meeting Notes - Q1 Review', content: 'Revenue up 23%, focus on enterprise sales pipeline', timestamp: '2d ago', relevance: 0.78 },
  { id: 6, key: 'Python Env Setup', content: 'Using Python 3.12, venv at ~/projects/.venv', timestamp: '7d ago', relevance: 0.55 },
]

const AUTOMATIONS = [
  { id: 1, name: 'Morning Market Brief', schedule: '0 8 * * 1-5', status: 'active', lastRun: '8:00 AM today', nextRun: '8:00 AM tomorrow' },
  { id: 2, name: 'Portfolio Rebalance Check', schedule: '0 16 * * 5', status: 'active', lastRun: '4:00 PM Friday', nextRun: '4:00 PM Friday' },
  { id: 3, name: 'News Digest', schedule: '0 12 * * *', status: 'paused', lastRun: '12:00 PM yesterday', nextRun: '—' },
  { id: 4, name: 'SEC Filing Monitor', schedule: '*/30 9-17 * * 1-5', status: 'active', lastRun: '2:30 PM today', nextRun: '3:00 PM today' },
  { id: 5, name: 'Weekly Research Report', schedule: '0 9 * * 1', status: 'active', lastRun: '9:00 AM Monday', nextRun: '9:00 AM Monday' },
]

const PLATFORMS = [
  { name: 'Telegram', icon: Send, status: 'connected', chats: 12, messages: 1247 },
  { name: 'Discord', icon: Hash, status: 'connected', chats: 8, messages: 3456 },
  { name: 'Slack', icon: MessageSquare, status: 'connected', chats: 5, messages: 892 },
  { name: 'WhatsApp', icon: Globe, status: 'disconnected', chats: 0, messages: 0 },
  { name: 'Signal', icon: Shield, status: 'disconnected', chats: 0, messages: 0 },
  { name: 'Email', icon: Send, status: 'connected', chats: 3, messages: 156 },
]

function ChatTab() {
  const [messages, setMessages] = useState(CHAT_MESSAGES)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedModel, setSelectedModel] = useState('hermes-3-405b')
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleSend = () => {
    if (!input.trim()) return
    const newMsg = { id: Date.now(), role: 'user' as const, content: input, time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    setIsStreaming(true)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'assistant' as const,
        content: 'I\'ve analyzed your request. Based on the current data and my knowledge base, here\'s my assessment:\n\nThe key factors to consider are macroeconomic conditions, sector rotation patterns, and risk sentiment. I recommend a balanced approach with defensive positioning in uncertain areas.',
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
      }])
      setIsStreaming(false)
    }, 2000)
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      {/* Chat Controls */}
      <div className="flex items-center justify-between mb-3">
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-52 bg-[#111420] border-[#1E2230] text-white text-xs h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#111420] border-[#1E2230] max-h-60">
            {MODELS.map(m => (
              <SelectItem key={m.id} value={m.id} className="text-xs">
                {m.name} <span className="text-gray-500 ml-1">({m.ctx})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="size-7 text-gray-400 hover:text-white" title="Undo">
            <Undo2 className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 text-gray-400 hover:text-white" title="Retry">
            <RotateCcw className="size-3.5" />
          </Button>
          <Badge variant="outline" className="text-[8px] border-[#06b6d4]/30 text-[#06b6d4]">
            {MODELS.find(m => m.id === selectedModel)?.ctx} ctx
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-lg p-3 ${
              msg.role === 'user'
                ? 'bg-[#06b6d4]/15 border border-[#06b6d4]/20'
                : 'bg-[#111420] border border-[#1E2230]'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Bot className="size-3" style={{ color: ACCENT }} />
                  <span className="text-[9px] font-medium" style={{ color: ACCENT }}>Hermes</span>
                  <span className="text-[9px] text-gray-600">{msg.time}</span>
                </div>
              )}
              <div className="text-[12px] text-gray-200 leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              {msg.role === 'user' && (
                <div className="text-right mt-1"><span className="text-[9px] text-gray-600">{msg.time}</span></div>
              )}
            </div>
          </motion.div>
        ))}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-[#111420] border border-[#1E2230] rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Bot className="size-3" style={{ color: ACCENT }} />
                <span className="text-[10px] text-gray-400">Thinking...</span>
                <div className="flex gap-0.5">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="size-1.5 rounded-full" style={{ backgroundColor: ACCENT }}
                      animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Message Hermes..."
            className="bg-[#111420] border-[#1E2230] text-white text-sm h-10 pr-10 focus:border-[#06b6d4]/50"
          />
        </div>
        <Button onClick={handleSend} disabled={!input.trim() || isStreaming} size="icon" className="h-10 w-10" style={{ backgroundColor: ACCENT }}>
          <Send className="size-4 text-white" />
        </Button>
      </div>
    </div>
  )
}

function SkillsTab() {
  const [searchQuery, setSearchQuery] = useState('')
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search skills..."
            className="w-48 bg-[#111420] border-[#1E2230] text-white text-xs h-8"
          />
        </div>
        <Button size="sm" className="text-xs h-8 gap-1.5" style={{ backgroundColor: ACCENT, color: 'white' }}>
          <Plus className="size-3.5" />Create Skill
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {SKILLS.filter(s => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((skill, i) => (
          <motion.div key={skill.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-[#0C0E14] border border-[#1E2230] p-4 hover:border-[#06b6d4]/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="p-1.5 rounded" style={{ backgroundColor: `${ACCENT}15` }}>
                  <Zap className="size-3.5" style={{ color: ACCENT }} />
                </div>
                <div className="flex items-center gap-1.5">
                  {skill.auto && (
                    <Badge variant="outline" className="text-[7px] border-[#06b6d4]/30 text-[#06b6d4]">AUTO</Badge>
                  )}
                  <Badge variant="outline" className="text-[7px] border-emerald-500/30 text-emerald-400">{skill.status}</Badge>
                </div>
              </div>
              <h4 className="text-sm text-white font-medium mb-1">{skill.name}</h4>
              <p className="text-[11px] text-gray-400 mb-3">{skill.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-mono">{skill.uses.toLocaleString()} uses</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="size-6 text-gray-500 hover:text-white"><Pencil className="size-3" /></Button>
                  <Button variant="ghost" size="icon" className="size-6 text-gray-500 hover:text-white"><Play className="size-3" /></Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function MemoryTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const filtered = searchQuery
    ? MEMORY_ENTRIES.filter(m => m.key.toLowerCase().includes(searchQuery.toLowerCase()) || m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : MEMORY_ENTRIES

  return (
    <div className="space-y-4">
      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <div className="flex items-center gap-3 mb-3">
          <Search className="size-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="FTS5 search over past conversations..."
            className="flex-1 bg-[#111420] border-[#1E2230] text-white text-sm h-9 focus:border-[#06b6d4]/50"
          />
        </div>
        <p className="text-[10px] text-gray-500">Full-text search across all stored memories and conversation history</p>
      </Card>

      <div className="space-y-2">
        {filtered.map((entry, i) => (
          <motion.div key={entry.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-[#0C0E14] border border-[#1E2230] p-4 hover:border-[#06b6d4]/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MemoryStick className="size-3.5" style={{ color: ACCENT }} />
                  <h4 className="text-sm text-white font-medium">{entry.key}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[8px] font-mono border-[#06b6d4]/30 text-[#06b6d4]">
                    {Math.round(entry.relevance * 100)}% match
                  </Badge>
                  <span className="text-[9px] text-gray-600">{entry.timestamp}</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">{entry.content}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function AutomationsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Cron-based task scheduler</p>
        <Button size="sm" className="text-xs h-8 gap-1.5" style={{ backgroundColor: ACCENT, color: 'white' }}>
          <Plus className="size-3.5" />New Automation
        </Button>
      </div>

      <div className="space-y-2">
        {AUTOMATIONS.map((auto, i) => (
          <motion.div key={auto.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-[#0C0E14] border border-[#1E2230] p-4 hover:border-[#06b6d4]/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded" style={{ backgroundColor: `${ACCENT}15` }}>
                    <Calendar className="size-3.5" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <h4 className="text-sm text-white font-medium">{auto.name}</h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{auto.schedule}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">Last: {auto.lastRun}</p>
                    <p className="text-[10px] text-gray-500">Next: {auto.nextRun}</p>
                  </div>
                  <Badge variant="outline" className={`text-[8px] ${auto.status === 'active' ? 'border-emerald-500/30 text-emerald-400' : 'border-yellow-500/30 text-yellow-400'}`}>
                    {auto.status}
                  </Badge>
                  <Switch checked={auto.status === 'active'} className="data-[state=checked]:bg-[#06b6d4]" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function PlatformsTab() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Connect Hermes to your messaging platforms</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PLATFORMS.map((platform, i) => (
          <motion.div key={platform.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-[#0C0E14] border border-[#1E2230] p-4 hover:border-[#06b6d4]/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${ACCENT}15` }}>
                    <platform.icon className="size-4" style={{ color: ACCENT }} />
                  </div>
                  <h4 className="text-sm text-white font-medium">{platform.name}</h4>
                </div>
                <Badge variant="outline" className={`text-[8px] ${platform.status === 'connected' ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'}`}>
                  {platform.status}
                </Badge>
              </div>
              {platform.status === 'connected' && (
                <div className="flex items-center gap-4 text-[10px] text-gray-400">
                  <span>{platform.chats} chats</span>
                  <span>{platform.messages.toLocaleString()} messages</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 text-[10px] h-7"
                style={platform.status === 'disconnected' ? { borderColor: `${ACCENT}40`, color: ACCENT } : {}}
              >
                {platform.status === 'connected' ? 'Configure' : 'Connect'}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function SettingsTab() {
  const [selectedProvider, setSelectedProvider] = useState('nousresearch')
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <h4 className="text-xs font-semibold text-white mb-4 flex items-center gap-2">
          <Cpu className="size-3.5" style={{ color: ACCENT }} />Model Switching
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Active Provider</label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="bg-[#111420] border-[#1E2230] text-white text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111420] border-[#1E2230]">
                <SelectItem value="nousresearch">NousResearch</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google AI</SelectItem>
                <SelectItem value="together">Together AI</SelectItem>
                <SelectItem value="fireworks">Fireworks AI</SelectItem>
                <SelectItem value="groq">Groq</SelectItem>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
                <SelectItem value="local">Local (Ollama)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">API Key</label>
            <Input type="password" defaultValue="sk-nous-***...***xyz" className="bg-[#111420] border-[#1E2230] text-white text-sm h-9 font-mono" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Temperature</label>
            <Input type="number" defaultValue="0.7" step="0.1" className="bg-[#111420] border-[#1E2230] text-white text-sm h-9 font-mono" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">Streaming Mode</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[#06b6d4]" />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <h4 className="text-xs font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="size-3.5" style={{ color: ACCENT }} />Personality System
          </h4>
          <div className="space-y-2">
            {[
              { name: 'Professional Analyst', desc: 'Formal, data-driven, concise', active: true },
              { name: 'Creative Writer', desc: 'Expressive, narrative-focused', active: false },
              { name: 'Technical Expert', desc: 'Deep technical explanations', active: false },
              { name: 'Casual Assistant', desc: 'Friendly, approachable, helpful', active: false },
            ].map(p => (
              <div key={p.name} className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors cursor-pointer ${p.active ? 'border-[#06b6d4]/30 bg-[#06b6d4]/5' : 'border-[#1E2230] bg-[#111420] hover:border-[#06b6d4]/20'}`}>
                <div>
                  <p className="text-xs text-white font-medium">{p.name}</p>
                  <p className="text-[10px] text-gray-500">{p.desc}</p>
                </div>
                {p.active && <Check className="size-4" style={{ color: ACCENT }} />}
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <h4 className="text-xs font-semibold text-white mb-4 flex items-center gap-2">
            <Link className="size-3.5" style={{ color: ACCENT }} />MCP Integration
          </h4>
          <div className="space-y-2">
            {[
              { name: 'Filesystem', status: 'connected' },
              { name: 'Web Search', status: 'connected' },
              { name: 'Database', status: 'connected' },
              { name: 'Code Execution', status: 'connected' },
            ].map(mcp => (
              <div key={mcp.name} className="flex items-center justify-between py-1.5">
                <span className="text-[11px] text-gray-300">{mcp.name}</span>
                <Badge variant="outline" className="text-[8px] border-emerald-500/30 text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />{mcp.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function HermesAgentTool({ onClose }: { onClose: () => void }) {
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
            <Bot className="size-5" style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">Hermes Agent</h1>
            <p className="text-[10px] text-gray-500">by NousResearch — Self-improving AI agent</p>
          </div>
          <Badge className="text-[9px] ml-2" style={{ backgroundColor: `${ACCENT}20`, color: ACCENT, borderColor: `${ACCENT}40` }}>
            v3.2.0
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />Online
          </Badge>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-[#1E2230]">
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="chat" className="flex-1 flex flex-col h-[calc(100vh-65px)]">
        <div className="px-6 pt-3">
          <TabsList className="bg-[#111420] border border-[#1E2230]">
            <TabsTrigger value="chat" className="text-xs data-[state=active]:text-white">
              <MessageSquare className="size-3.5 mr-1.5" />Chat
            </TabsTrigger>
            <TabsTrigger value="skills" className="text-xs data-[state=active]:text-white">
              <Zap className="size-3.5 mr-1.5" />Skills
            </TabsTrigger>
            <TabsTrigger value="memory" className="text-xs data-[state=active]:text-white">
              <Brain className="size-3.5 mr-1.5" />Memory
            </TabsTrigger>
            <TabsTrigger value="automations" className="text-xs data-[state=active]:text-white">
              <Calendar className="size-3.5 mr-1.5" />Automations
            </TabsTrigger>
            <TabsTrigger value="platforms" className="text-xs data-[state=active]:text-white">
              <Globe className="size-3.5 mr-1.5" />Platforms
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs data-[state=active]:text-white">
              <Settings className="size-3.5 mr-1.5" />Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 px-6 py-4 overflow-hidden">
          <TabsContent value="chat" className="h-full"><ChatTab /></TabsContent>
          <TabsContent value="skills"><ScrollArea className="h-[calc(100vh-160px)]"><SkillsTab /></ScrollArea></TabsContent>
          <TabsContent value="memory"><ScrollArea className="h-[calc(100vh-160px)]"><MemoryTab /></ScrollArea></TabsContent>
          <TabsContent value="automations"><ScrollArea className="h-[calc(100vh-160px)]"><AutomationsTab /></ScrollArea></TabsContent>
          <TabsContent value="platforms"><ScrollArea className="h-[calc(100vh-160px)]"><PlatformsTab /></ScrollArea></TabsContent>
          <TabsContent value="settings"><ScrollArea className="h-[calc(100vh-160px)]"><SettingsTab /></ScrollArea></TabsContent>
        </div>
      </Tabs>
    </motion.div>
  )
}
