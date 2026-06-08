'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, MessageSquare, Zap, Brain, Radio, Settings, Send, Cpu,
  BookOpen, FileText, Presentation, Globe, Code2, Image,
  Video, Music, PenTool, Bot, Plus, ChevronRight, Sparkles,
  Clock, User, Search, Filter, Heart, Star, Trash2, Copy,
  RotateCw, Check, AlertCircle, Activity, Plug, Server,
  Shield, Terminal, Layers, GitBranch, Eye, Mic, MicOff,
  Volume2, ArrowUpRight, Workflow, Database, MonitorSmartphone,
  Lock, Key
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const ACCENT = '#7c3aed'
const BG = '#07060B'
const CARD_BG = '#0D0B14'
const BORDER = '#1E1A2A'

const EXEC_MODES = [
  { id: 'flash', label: 'Flash', desc: 'Fast single-model response', time: '~5s', icon: Zap, color: '#f59e0b' },
  { id: 'standard', label: 'Standard', desc: 'Multi-step with planning', time: '~15s', icon: Brain, color: '#3b82f6' },
  { id: 'pro', label: 'Pro', desc: 'Deep research + sub-agents', time: '~45s', icon: Cpu, color: '#7c3aed' },
  { id: 'ultra', label: 'Ultra', desc: 'Full harness orchestration', time: '~2min', icon: Sparkles, color: '#ef4444' },
]

const CHAT_MESSAGES = [
  { id: 1, role: 'user' as const, text: 'Research the latest developments in RAG architectures and create a summary report', mode: 'pro' },
  { id: 2, role: 'agent' as const, text: 'I\'ll orchestrate a deep research task using multiple sub-agents. Here\'s my plan:\n\n1. **Research Agent** — Searching academic papers and tech blogs for latest RAG developments\n2. **Analysis Agent** — Comparing approaches and identifying key trends\n3. **Writing Agent** — Synthesizing findings into a structured report\n\nStarting execution...', mode: 'pro' },
  { id: 3, role: 'agent' as const, text: '## RAG Architecture Report — March 2025\n\n### Key Developments\n\n**1. GraphRAG (Microsoft)**\nGraph-enhanced retrieval using knowledge graphs for community-based summarization. Significantly outperforms naive RAG on global reasoning tasks.\n\n**2. Contextual Retrieval (Anthropic)**\nContext-aware chunking with contextual embeddings that preserve document structure and relationships.\n\n**3. Adaptive RAG**\nDynamic routing between different retrieval strategies based on query complexity classification.\n\n**4. CRAG (Corrective RAG)**\nSelf-correcting retrieval with web search fallback when retrieved context has low relevance scores.\n\n**5. Agentic RAG**\nTool-using agents that can decide when, how, and what to retrieve — moving beyond single-shot retrieval.\n\n### Recommendations\n- Start with GraphRAG for enterprise knowledge bases\n- Use CRAG for production systems needing reliability\n- Explore Agentic RAG for complex multi-hop reasoning', mode: 'pro' },
  { id: 4, role: 'user' as const, text: 'Can you also create a presentation based on this?', mode: 'standard' },
  { id: 5, role: 'agent' as const, text: 'Done! I\'ve created a 12-slide presentation covering all 5 RAG architectures with diagrams and key metrics. You can download it as PPTX from the output panel.', mode: 'standard' },
]

const SUB_AGENTS = [
  { name: 'Research Agent', status: 'completed', duration: '8.2s', icon: Search },
  { name: 'Analysis Agent', status: 'completed', duration: '12.4s', icon: Brain },
  { name: 'Writing Agent', status: 'running', duration: '5.1s', icon: PenTool },
  { name: 'Review Agent', status: 'queued', duration: '—', icon: Eye },
]

const SKILLS_LIST = [
  { id: 'research', name: 'Deep Research', desc: 'Multi-source research with citation tracking', icon: Search, category: 'Research', popular: true },
  { id: 'report', name: 'Report Generation', desc: 'Structured reports with tables and charts', icon: FileText, category: 'Writing', popular: true },
  { id: 'ppt', name: 'Presentation', desc: 'Professional slide decks with templates', icon: Presentation, category: 'Creative', popular: true },
  { id: 'webdev', name: 'Web Development', desc: 'Full-stack web app prototyping', icon: Code2, category: 'Development', popular: true },
  { id: 'podcast', name: 'Podcast Script', desc: 'Audio content and script writing', icon: Music, category: 'Creative', popular: false },
  { id: 'image', name: 'Image Generation', desc: 'AI image creation and editing', icon: Image, category: 'Creative', popular: true },
  { id: 'video', name: 'Video Script', desc: 'Video content planning and scripting', icon: Video, category: 'Creative', popular: false },
  { id: 'data', name: 'Data Analysis', desc: 'Statistical analysis and visualization', icon: Activity, category: 'Analysis', popular: true },
  { id: 'code', name: 'Code Generation', desc: 'Production-quality code in any language', icon: Terminal, category: 'Development', popular: true },
  { id: 'translate', name: 'Translation', desc: 'Multi-language translation with context', icon: Globe, category: 'Language', popular: false },
  { id: 'summarize', name: 'Summarization', desc: 'Intelligent document and content summarization', icon: BookOpen, category: 'Analysis', popular: true },
  { id: 'email', name: 'Email Drafting', desc: 'Professional email composition', icon: Send, category: 'Writing', popular: false },
  { id: 'sql', name: 'SQL Expert', desc: 'Database query generation and optimization', icon: Database, category: 'Development', popular: false },
  { id: 'diagram', name: 'Diagram Builder', desc: 'Architecture and flowchart diagrams', icon: GitBranch, category: 'Creative', popular: false },
  { id: 'review', name: 'Code Review', desc: 'Automated code review and suggestions', icon: Eye, category: 'Development', popular: true },
  { id: 'brainstorm', name: 'Brainstorming', desc: 'Creative ideation and mind mapping', icon: Sparkles, category: 'Creative', popular: false },
]

const MEMORY_ENTRIES = [
  { id: 1, type: 'preference', content: 'Prefers concise, technical explanations over verbose ones', timestamp: '2 hours ago', source: 'Learned from interactions', pinned: true },
  { id: 2, type: 'fact', content: 'Working on a Next.js project with TypeScript and Prisma', timestamp: '1 day ago', source: 'User mention', pinned: true },
  { id: 3, type: 'preference', content: 'Uses dark mode for all tools and editors', timestamp: '3 days ago', source: 'Behavior tracking', pinned: false },
  { id: 4, type: 'fact', content: 'Team uses GitHub Actions for CI/CD pipeline', timestamp: '5 days ago', source: 'User mention', pinned: false },
  { id: 5, type: 'skill', content: 'Strong proficiency in React, TypeScript, and system design', timestamp: '1 week ago', source: 'Profile analysis', pinned: true },
  { id: 6, type: 'preference', content: 'Prefers functional programming patterns over OOP', timestamp: '1 week ago', source: 'Code analysis', pinned: false },
  { id: 7, type: 'fact', content: 'Currently evaluating vector databases for RAG pipeline', timestamp: '2 weeks ago', source: 'User mention', pinned: false },
  { id: 8, type: 'preference', content: 'Uses English for technical content, Chinese for casual', timestamp: '3 weeks ago', source: 'Interaction pattern', pinned: false },
]

const IM_CHANNELS = [
  { name: 'Telegram', icon: Send, status: 'connected', webhook: 'Active', messages: 1247 },
  { name: 'Slack', icon: HashIcon, status: 'connected', webhook: 'Active', messages: 3421 },
  { name: 'Feishu', icon: MessageSquare, status: 'connected', webhook: 'Active', messages: 892 },
  { name: 'WeChat', icon: MessageSquare, status: 'disconnected', webhook: 'Not configured', messages: 0 },
  { name: 'DingTalk', icon: MessageSquare, status: 'connected', webhook: 'Active', messages: 567 },
  { name: 'Discord', icon: GamepadIcon, status: 'connected', webhook: 'Active', messages: 2156 },
]

function HashIcon(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  )
}

function GamepadIcon(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" /><line x1="15" y1="13" x2="15.01" y2="13" /><line x1="18" y1="11" x2="18.01" y2="11" /><rect x="2" y="6" width="20" height="12" rx="2" />
    </svg>
  )
}

const MODEL_PROVIDERS = [
  { name: 'OpenAI', models: ['GPT-4o', 'GPT-4o-mini', 'o1', 'o3-mini'], apiKey: 'sk-***...***abc', active: true },
  { name: 'Anthropic', models: ['Claude 3.5 Sonnet', 'Claude 3 Opus', 'Claude 3 Haiku'], apiKey: 'sk-ant-***...***xyz', active: true },
  { name: 'DeepSeek', models: ['DeepSeek V3', 'DeepSeek R1'], apiKey: 'dsk-***...***def', active: true },
  { name: 'Google AI', models: ['Gemini 2.0 Flash', 'Gemini 1.5 Pro'], apiKey: 'AIza***...***ghi', active: true },
  { name: 'vLLM', models: ['Custom'], apiKey: 'Local endpoint', active: false },
  { name: 'Ollama', models: ['Llama 3.1', 'Mistral', 'Qwen2.5'], apiKey: 'Local endpoint', active: false },
]

const MCP_SERVERS = [
  { name: 'Filesystem', status: 'connected', tools: 8, desc: 'Read, write, and manage local files' },
  { name: 'Web Search', status: 'connected', tools: 3, desc: 'Search the web and fetch content' },
  { name: 'GitHub', status: 'connected', tools: 15, desc: 'Repository management and code search' },
  { name: 'Database', status: 'connected', tools: 6, desc: 'Query and manage databases' },
  { name: 'Browser', status: 'disconnected', tools: 12, desc: 'Web browser automation' },
  { name: 'Slack', status: 'connected', tools: 8, desc: 'Read and send Slack messages' },
]

function ChatTab() {
  const [execMode, setExecMode] = useState('pro')
  const [inputText, setInputText] = useState('')

  return (
    <div className="flex flex-col h-full">
      {/* Execution Mode Selector */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider shrink-0">Mode:</span>
        <div className="flex gap-1 flex-1">
          {EXEC_MODES.map(mode => {
            const Icon = mode.icon
            return (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setExecMode(mode.id)}
                className={`flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[10px] font-medium transition-all ${
                  execMode === mode.id
                    ? 'border-[#7c3aed]/40 bg-[#7c3aed]/10 text-white'
                    : 'border-[#1E1A2A] text-gray-500 hover:border-[#7c3aed]/20 hover:text-gray-400'
                }`}
              >
                <Icon className="size-3" style={{ color: execMode === mode.id ? mode.color : undefined }} />
                <span>{mode.label}</span>
                <span className="text-[8px] text-gray-600 ml-auto">{mode.time}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 mb-3">
        <div className="space-y-3 pr-2">
          {CHAT_MESSAGES.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-white'
                  : 'bg-[#0D0B14] border border-[#1E1A2A] text-gray-300'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-xs leading-relaxed">{msg.text}</p>
                ) : (
                  <div className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                )}
                {msg.role === 'agent' && msg.mode && (
                  <Badge variant="outline" className="text-[8px] mt-1.5 border-[#7c3aed]/20 text-[#7c3aed]">
                    {EXEC_MODES.find(m => m.id === msg.mode)?.label} mode
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Sub-Agent Visualization */}
      <Card className="bg-[#0D0B14] border border-[#1E1A2A] p-2.5 mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] text-gray-500 uppercase tracking-wider">Active Sub-Agents</span>
          <Badge variant="outline" className="text-[8px] border-[#7c3aed]/20 text-[#7c3aed]">3/4 done</Badge>
        </div>
        <div className="flex gap-1.5">
          {SUB_AGENTS.map((agent) => {
            const AgentIcon = agent.icon
            return (
              <div key={agent.name} className={`flex-1 flex items-center gap-1.5 p-1.5 rounded border ${
                agent.status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/20' :
                agent.status === 'running' ? 'bg-[#7c3aed]/5 border-[#7c3aed]/20' :
                'bg-[#07060B] border-[#1E1A2A]'
              }`}>
                <AgentIcon className={`size-3 ${
                  agent.status === 'completed' ? 'text-emerald-400' :
                  agent.status === 'running' ? 'text-[#7c3aed] animate-pulse' :
                  'text-gray-600'
                }`} />
                <div className="min-w-0">
                  <div className="text-[9px] text-white truncate">{agent.name}</div>
                  <div className="text-[8px] text-gray-600 font-mono">{agent.duration}</div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Ask anything... (Shift+Enter for new line)"
            className="bg-[#0D0B14] border-[#1E1A2A] text-white text-xs min-h-10 max-h-32 resize-none focus:border-[#7c3aed] pr-10"
            rows={1}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Button variant="ghost" size="sm" className="size-6 p-0 text-gray-500 hover:text-[#7c3aed]">
              <Mic className="size-3" />
            </Button>
          </div>
        </div>
        <Button className="bg-[#7c3aed] hover:bg-[#7c3aed]/80 text-white shrink-0 self-end h-10">
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function SkillsTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [...new Set(SKILLS_LIST.map(s => s.category))]
  const filtered = SKILLS_LIST.filter(s =>
    (!selectedCategory || s.category === selectedCategory) &&
    (!searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Skills Library</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">{SKILLS_LIST.length} built-in skills + custom skill creator</p>
        </div>
        <Button size="sm" className="bg-[#7c3aed]/10 text-[#7c3aed] hover:bg-[#7c3aed]/20 border border-[#7c3aed]/20">
          <Plus className="size-3.5 mr-1" /> Create Skill
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search skills..."
            className="bg-[#0D0B14] border-[#1E1A2A] text-white text-xs h-8 pl-8 focus:border-[#7c3aed]"
          />
        </div>
        <div className="flex items-center gap-1">
          <Badge
            variant="outline"
            className={`text-[9px] cursor-pointer ${!selectedCategory ? 'border-[#7c3aed]/40 text-[#7c3aed]' : 'border-[#1E1A2A] text-gray-500'}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>
          {categories.map(cat => (
            <Badge
              key={cat}
              variant="outline"
              className={`text-[9px] cursor-pointer ${selectedCategory === cat ? 'border-[#7c3aed]/40 text-[#7c3aed]' : 'border-[#1E1A2A] text-gray-500 hover:border-[#7c3aed]/20'}`}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((skill) => {
          const SkillIcon = skill.icon
          return (
            <motion.div
              key={skill.id}
              whileHover={{ scale: 1.02 }}
              className="bg-[#0D0B14] rounded-lg p-4 border border-[#1E1A2A] hover:border-[#7c3aed]/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[#7c3aed]/10 border border-[#7c3aed]/20">
                    <SkillIcon className="size-4 text-[#7c3aed]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{skill.name}</h4>
                    <Badge variant="outline" className="text-[8px] border-[#1E1A2A] text-gray-500 h-3.5 px-1 mt-0.5">
                      {skill.category}
                    </Badge>
                  </div>
                </div>
                {skill.popular && (
                  <Star className="size-3 text-[#7c3aed] fill-[#7c3aed]" />
                )}
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">{skill.desc}</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-3 border-[#1E1A2A] text-gray-400 hover:text-[#7c3aed] hover:border-[#7c3aed]/30 h-7 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Use Skill <ArrowUpRight className="size-3 ml-1" />
              </Button>
            </motion.div>
          )
        })}
      </div>

      {/* Custom Skill Creator */}
      <Card className="bg-[#0D0B14] border border-[#7c3aed]/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-[#7c3aed]" />
          <h4 className="text-xs font-semibold text-white">Custom Skill Creator</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Skill Name</label>
            <Input placeholder="e.g., SQL Query Expert" className="bg-[#07060B] border-[#1E1A2A] text-white text-xs h-8 focus:border-[#7c3aed]" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
            <Select defaultValue="custom">
              <SelectTrigger className="bg-[#07060B] border-[#1E1A2A] text-white text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0D0B14] border-[#1E1A2A]">
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="writing">Writing</SelectItem>
                <SelectItem value="analysis">Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-3">
          <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">System Prompt</label>
          <Textarea
            placeholder="Define the skill behavior, knowledge, and output format..."
            className="bg-[#07060B] border-[#1E1A2A] text-white text-xs min-h-20 focus:border-[#7c3aed]"
          />
        </div>
        <Button size="sm" className="mt-3 bg-[#7c3aed] hover:bg-[#7c3aed]/80 text-white h-8 text-xs">
          <Plus className="size-3 mr-1" /> Create Skill
        </Button>
      </Card>
    </div>
  )
}

function MemoryTab() {
  const [filter, setFilter] = useState<string | null>(null)

  const filtered = MEMORY_ENTRIES.filter(e => !filter || e.type === filter)
  const pinned = filtered.filter(e => e.pinned)
  const unpinned = filtered.filter(e => !e.pinned)

  const typeConfig: Record<string, { color: string; icon: React.ElementType }> = {
    preference: { color: '#7c3aed', icon: Heart },
    fact: { color: '#3b82f6', icon: Database },
    skill: { color: '#10b981', icon: Zap },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Long-Term Memory</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">{MEMORY_ENTRIES.length} entries · {MEMORY_ENTRIES.filter(e => e.pinned).length} pinned</p>
        </div>
        <Button size="sm" variant="outline" className="border-[#1E1A2A] text-gray-400 hover:text-white h-7 text-[10px]">
          <Search className="size-3 mr-1" /> Search Memory
        </Button>
      </div>

      {/* Type Filters */}
      <div className="flex items-center gap-1.5">
        <Badge
          variant="outline"
          className={`text-[9px] cursor-pointer ${!filter ? 'border-[#7c3aed]/40 text-[#7c3aed]' : 'border-[#1E1A2A] text-gray-500'}`}
          onClick={() => setFilter(null)}
        >
          All ({MEMORY_ENTRIES.length})
        </Badge>
        {Object.entries(typeConfig).map(([type, config]) => (
          <Badge
            key={type}
            variant="outline"
            className={`text-[9px] cursor-pointer ${filter === type ? 'border-[#7c3aed]/40 text-[#7c3aed]' : 'border-[#1E1A2A] text-gray-500'}`}
            onClick={() => setFilter(filter === type ? null : type)}
          >
            {type} ({MEMORY_ENTRIES.filter(e => e.type === type).length})
          </Badge>
        ))}
      </div>

      {/* Pinned Memories */}
      {pinned.length > 0 && (
        <Card className="bg-[#0D0B14] border border-[#7c3aed]/20 p-4">
          <h4 className="text-[10px] text-[#7c3aed] uppercase tracking-wider font-semibold mb-2">Pinned</h4>
          <div className="space-y-2">
            {pinned.map(entry => {
              const config = typeConfig[entry.type]
              const TypeIcon = config?.icon || Database
              return (
                <div key={entry.id} className="flex items-start gap-2.5 p-2.5 bg-[#07060B] rounded-md border border-[#1E1A2A]/50">
                  <div className="p-1 rounded bg-[#7c3aed]/10 border border-[#7c3aed]/20 shrink-0 mt-0.5">
                    <TypeIcon className="size-3 text-[#7c3aed]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-300 leading-relaxed">{entry.content}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-[8px] border-[#1E1A2A] text-gray-500 h-3.5 px-1 capitalize">{entry.type}</Badge>
                      <span className="text-[9px] text-gray-600">{entry.source}</span>
                      <span className="text-[9px] text-gray-600">· {entry.timestamp}</span>
                    </div>
                  </div>
                  <Star className="size-3 text-[#7c3aed] fill-[#7c3aed] shrink-0 cursor-pointer" />
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* All Memories */}
      <Card className="bg-[#0D0B14] border border-[#1E1A2A] p-4">
        <h4 className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Recent</h4>
        <div className="space-y-2">
          {unpinned.map(entry => {
            const config = typeConfig[entry.type]
            const TypeIcon = config?.icon || Database
            return (
              <div key={entry.id} className="flex items-start gap-2.5 p-2.5 bg-[#07060B] rounded-md border border-[#1E1A2A]/50 hover:border-[#7c3aed]/10 transition-colors">
                <div className="p-1 rounded bg-[#1E1A2A] shrink-0 mt-0.5">
                  <TypeIcon className="size-3" style={{ color: config?.color || '#6b7280' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-400 leading-relaxed">{entry.content}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-[8px] border-[#1E1A2A] text-gray-500 h-3.5 px-1 capitalize">{entry.type}</Badge>
                    <span className="text-[9px] text-gray-600">{entry.source}</span>
                    <span className="text-[9px] text-gray-600">· {entry.timestamp}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-1 text-gray-600 hover:text-[#7c3aed] transition-colors"><Star className="size-3" /></button>
                  <button className="p-1 text-gray-600 hover:text-red-400 transition-colors"><Trash2 className="size-3" /></button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function ChannelsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">IM Integrations</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Connect DeerFlow to your favorite messaging platforms</p>
        </div>
      </div>

      {/* Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {IM_CHANNELS.map((channel) => {
          const ChannelIcon = channel.icon
          const isConnected = channel.status === 'connected'
          return (
            <Card key={channel.name} className="bg-[#0D0B14] border border-[#1E1A2A] p-4 hover:border-[#7c3aed]/20 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isConnected ? 'bg-[#7c3aed]/10 border border-[#7c3aed]/20' : 'bg-[#1E1A2A]'}`}>
                    <ChannelIcon className={`size-4 ${isConnected ? 'text-[#7c3aed]' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{channel.name}</h4>
                    <div className="flex items-center gap-1">
                      <span className={`size-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
                      <span className={`text-[9px] ${isConnected ? 'text-emerald-400' : 'text-gray-600'}`}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {isConnected ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500">Webhook</span>
                    <span className="text-emerald-400">{channel.webhook}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500">Messages processed</span>
                    <span className="text-white font-mono">{channel.messages.toLocaleString()}</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-2 border-[#1E1A2A] text-gray-400 hover:text-white h-7 text-[10px]">
                    <Settings className="size-3 mr-1" /> Configure
                  </Button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-[10px] text-gray-600 mb-2">Not configured yet</p>
                  <Button size="sm" className="bg-[#7c3aed]/10 text-[#7c3aed] hover:bg-[#7c3aed]/20 border border-[#7c3aed]/20 h-7 text-[10px]">
                    <Plug className="size-3 mr-1" /> Connect
                  </Button>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Channel Configuration */}
      <Card className="bg-[#0D0B14] border border-[#1E1A2A] p-4">
        <h4 className="text-xs font-semibold text-white mb-3">Channel Settings</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Auto-respond to mentions</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[#7c3aed]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Thread replies</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[#7c3aed]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">File attachment support</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[#7c3aed]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Rate limiting (10 msg/min)</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[#7c3aed]" />
          </div>
        </div>
      </Card>
    </div>
  )
}

function SettingsTabComponent() {
  return (
    <div className="space-y-4">
      {/* Model Providers */}
      <Card className="bg-[#0D0B14] border border-[#1E1A2A] p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Model Providers</h3>
        <div className="space-y-2">
          {MODEL_PROVIDERS.map((provider) => (
            <div key={provider.name} className="flex items-center gap-3 p-3 bg-[#07060B] rounded-lg border border-[#1E1A2A]/50 hover:border-[#7c3aed]/10 transition-colors">
              <div className={`size-2 rounded-full shrink-0 ${provider.active ? 'bg-emerald-400' : 'bg-gray-600'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-white">{provider.name}</h4>
                  <Badge variant="outline" className="text-[8px] border-[#1E1A2A] text-gray-500">
                    {provider.models.length} model{provider.models.length > 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {provider.models.map(model => (
                    <span key={model} className="text-[9px] text-gray-500 bg-[#1E1A2A] px-1.5 py-0.5 rounded">
                      {model}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] text-gray-600 font-mono">{provider.apiKey}</span>
                <Switch checked={provider.active} className="data-[state=checked]:bg-[#7c3aed] scale-75" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Default Model Selection */}
      <Card className="bg-[#0D0B14] border border-[#1E1A2A] p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Default Models</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Flash Mode</label>
            <Select defaultValue="gpt4o-mini">
              <SelectTrigger className="bg-[#07060B] border-[#1E1A2A] text-white text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0D0B14] border-[#1E1A2A]">
                <SelectItem value="gpt4o-mini">GPT-4o-mini</SelectItem>
                <SelectItem value="claude-haiku">Claude 3 Haiku</SelectItem>
                <SelectItem value="gemini-flash">Gemini 2.0 Flash</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Standard Mode</label>
            <Select defaultValue="gpt4o">
              <SelectTrigger className="bg-[#07060B] border-[#1E1A2A] text-white text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0D0B14] border-[#1E1A2A]">
                <SelectItem value="gpt4o">GPT-4o</SelectItem>
                <SelectItem value="claude-sonnet">Claude 3.5 Sonnet</SelectItem>
                <SelectItem value="deepseek-v3">DeepSeek V3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Pro Mode</label>
            <Select defaultValue="claude-sonnet">
              <SelectTrigger className="bg-[#07060B] border-[#1E1A2A] text-white text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0D0B14] border-[#1E1A2A]">
                <SelectItem value="claude-sonnet">Claude 3.5 Sonnet</SelectItem>
                <SelectItem value="gpt4o">GPT-4o</SelectItem>
                <SelectItem value="o1">o1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Ultra Mode</label>
            <Select defaultValue="o1">
              <SelectTrigger className="bg-[#07060B] border-[#1E1A2A] text-white text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0D0B14] border-[#1E1A2A]">
                <SelectItem value="o1">o1 (Reasoning)</SelectItem>
                <SelectItem value="claude-opus">Claude 3 Opus</SelectItem>
                <SelectItem value="deepseek-r1">DeepSeek R1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Sandbox Config */}
      <Card className="bg-[#0D0B14] border border-[#1E1A2A] p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Sandbox Configuration</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="size-3.5 text-gray-500" />
              <span className="text-xs text-gray-400">Code Execution Sandbox</span>
            </div>
            <Switch defaultChecked className="data-[state=checked]:bg-[#7c3aed]" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MonitorSmartphone className="size-3.5 text-gray-500" />
              <span className="text-xs text-gray-400">Browser Automation</span>
            </div>
            <Switch className="data-[state=checked]:bg-[#7c3aed]" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="size-3.5 text-gray-500" />
              <span className="text-xs text-gray-400">Network Isolation</span>
            </div>
            <Switch defaultChecked className="data-[state=checked]:bg-[#7c3aed]" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Sandbox Timeout</label>
            <Select defaultValue="120">
              <SelectTrigger className="bg-[#07060B] border-[#1E1A2A] text-white text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0D0B14] border-[#1E1A2A]">
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">60 seconds</SelectItem>
                <SelectItem value="120">2 minutes</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* MCP Servers */}
      <Card className="bg-[#0D0B14] border border-[#1E1A2A] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">MCP Servers</h3>
          <Button size="sm" variant="outline" className="border-[#1E1A2A] text-gray-400 hover:text-white h-7 text-[10px]">
            <Plus className="size-3 mr-1" /> Add Server
          </Button>
        </div>
        <div className="space-y-2">
          {MCP_SERVERS.map((server) => {
            const isConnected = server.status === 'connected'
            return (
              <div key={server.name} className="flex items-center gap-3 p-2.5 bg-[#07060B] rounded-md border border-[#1E1A2A]/50">
                <div className={`size-2 rounded-full shrink-0 ${isConnected ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[11px] font-medium text-white">{server.name}</h4>
                    <Badge variant="outline" className="text-[8px] border-[#1E1A2A] text-gray-500 h-3.5 px-1">
                      {server.tools} tools
                    </Badge>
                  </div>
                  <p className="text-[10px] text-gray-500">{server.desc}</p>
                </div>
                <Switch checked={isConnected} className="data-[state=checked]:bg-[#7c3aed] scale-75" />
              </div>
            )
          })}
        </div>
      </Card>

      {/* About */}
      <Card className="bg-[#0D0B14] border border-[#1E1A2A] p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20">
            <Cpu className="size-5 text-[#7c3aed]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">DeerFlow 2.0</h3>
            <p className="text-[10px] text-gray-500">by ByteDance — Super Agent Harness</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function DeerflowTool({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('chat')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: BG }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20">
            <Cpu className="size-5 text-[#7c3aed]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white">DeerFlow 2.0</h1>
              <Badge variant="outline" className="text-[9px] border-[#7c3aed]/30 text-[#7c3aed]">by ByteDance</Badge>
            </div>
            <p className="text-[10px] text-gray-500">Super Agent Harness</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-white hover:bg-[#7c3aed]/10">
          <X className="size-4" />
        </Button>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-2 border-b" style={{ borderColor: BORDER }}>
          <TabsList className="bg-transparent h-9 p-0 gap-1">
            {[
              { id: 'chat', label: 'Chat', icon: MessageSquare },
              { id: 'skills', label: 'Skills', icon: Zap },
              { id: 'memory', label: 'Memory', icon: Brain },
              { id: 'channels', label: 'Channels', icon: Radio },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-[#7c3aed]/10 data-[state=active]:text-[#7c3aed] text-gray-500 text-xs h-8 px-3 rounded-md data-[state=active]:shadow-none border border-transparent data-[state=active]:border-[#7c3aed]/20"
              >
                <tab.icon className="size-3.5 mr-1.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-4 py-4">
          <TabsContent value="chat" className="mt-0 h-full"><ChatTab /></TabsContent>
          <TabsContent value="skills" className="mt-0"><SkillsTab /></TabsContent>
          <TabsContent value="memory" className="mt-0"><MemoryTab /></TabsContent>
          <TabsContent value="channels" className="mt-0"><ChannelsTab /></TabsContent>
          <TabsContent value="settings" className="mt-0"><SettingsTabComponent /></TabsContent>
        </ScrollArea>
      </Tabs>
    </motion.div>
  )
}
