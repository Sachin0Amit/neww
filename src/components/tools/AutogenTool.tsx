'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Settings, X, Send, Play, Users, Zap, Globe,
  MessageSquare, Cpu, Key, Shield, Network, Workflow,
  Plus, Trash2, Copy, Check, ExternalLink, Radio,
  Wifi, Server, Package, ArrowRight, ChevronRight,
  RefreshCw, Loader2, CheckCircle2, Sparkles, Layers
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// ─── Simulated Data ──────────────────────────────────────────────

const TOPOLOGIES = [
  { id: 'round_robin', name: 'RoundRobin', desc: 'Agents take turns in sequence', icon: '🔄' },
  { id: 'selector', name: 'Selector', desc: 'LLM picks the next agent', icon: '🎯' },
  { id: 'swarm', name: 'Swarm', desc: 'Agents hand off autonomously', icon: '🐝' },
  { id: 'graph_flow', name: 'GraphFlow', desc: 'Custom DAG workflow', icon: '🔀' },
]

const AGENT_TEMPLATES = [
  { id: 'research_team', name: 'Research Team', desc: 'Researcher + Writer + Critic', agents: 3, topology: 'RoundRobin', category: 'Research' },
  { id: 'coding_team', name: 'Coding Team', desc: 'Coder + Reviewer + Tester', agents: 3, topology: 'Selector', category: 'Development' },
  { id: 'data_pipeline', name: 'Data Pipeline', desc: 'Extractor + Analyst + Visualizer', agents: 3, topology: 'GraphFlow', category: 'Data' },
  { id: 'customer_support', name: 'Customer Support', desc: 'Triage + Expert + Escalation', agents: 3, topology: 'Swarm', category: 'Support' },
  { id: 'planning_team', name: 'Planning Team', desc: 'Planner + Executor + Validator', agents: 3, topology: 'Selector', category: 'Planning' },
  { id: 'creative_studio', name: 'Creative Studio', desc: 'Ideator + Designer + Refiner', agents: 3, topology: 'RoundRobin', category: 'Creative' },
]

const CHAT_MESSAGES = [
  { agent: 'Researcher', color: '#3b82f6', content: 'I\'ll start by gathering information about the latest trends in multi-agent systems.' },
  { agent: 'Researcher', color: '#3b82f6', content: 'Based on my analysis, the key areas are: 1) Autonomous orchestration, 2) Tool use, 3) Memory systems.', toolCall: { name: 'web_search', args: 'multi-agent frameworks 2025' } },
  { agent: 'Writer', color: '#10b981', content: 'Great research! Let me synthesize this into a structured report with clear sections for each finding.' },
  { agent: 'Critic', color: '#f59e0b', content: 'The report looks good overall, but section 2 needs more concrete examples. Also, the conclusion should be stronger.' },
  { agent: 'Writer', color: '#10b981', content: 'Good points. I\'ve expanded section 2 with code examples and revised the conclusion with actionable recommendations.' },
]

const BUILDER_AGENTS = [
  { id: 'agent-1', name: 'Researcher', role: 'Gathers and analyzes information', model: 'GPT-4o', tools: ['web_search', 'file_read'], color: '#3b82f6' },
  { id: 'agent-2', name: 'Writer', role: 'Creates content and reports', model: 'GPT-4o', tools: ['file_write', 'markdown'], color: '#10b981' },
  { id: 'agent-3', name: 'Critic', role: 'Reviews and provides feedback', model: 'Claude 3.5', tools: ['file_read'], color: '#f59e0b' },
]

const MCP_SERVERS = [
  { name: 'Filesystem MCP', status: 'connected', tools: 5, protocol: 'stdio' },
  { name: 'GitHub MCP', status: 'connected', tools: 12, protocol: 'stdio' },
  { name: 'Brave Search MCP', status: 'connected', tools: 3, protocol: 'stdio' },
  { name: 'Postgres MCP', status: 'connected', tools: 8, protocol: 'stdio' },
  { name: 'Puppeteer MCP', status: 'idle', tools: 6, protocol: 'stdio' },
  { name: 'Slack MCP', status: 'connected', tools: 4, protocol: 'ws' },
  { name: 'Memory MCP', status: 'connected', tools: 3, protocol: 'stdio' },
]

const MODEL_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'], configured: true, key: 'sk-***...abc' },
  { id: 'azure', name: 'Azure OpenAI', models: ['gpt-4o', 'gpt-4-turbo'], configured: true, key: 'az-***...def' },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-3.5-sonnet', 'claude-3-haiku'], configured: true, key: 'sk-ant-***...ghi' },
  { id: 'ollama', name: 'Ollama (Local)', models: ['llama3.1', 'mistral', 'codellama'], configured: true, key: 'http://localhost:11434' },
]

// ─── Main Component ──────────────────────────────────────────────

export default function AutogenTool({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('playground')
  const [chatInput, setChatInput] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('research_team')
  const [selectedTopology, setSelectedTopology] = useState('round_robin')
  const [messages, setMessages] = useState(CHAT_MESSAGES)
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [wsBridge, setWsBridge] = useState(true)

  const handleSend = useCallback(() => {
    if (!chatInput.trim()) return
    setMessages(prev => [...prev, { agent: 'User', color: '#a855f7', content: chatInput }])
    setChatInput('')
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      setMessages(prev => [...prev, { agent: 'Researcher', color: '#3b82f6', content: 'I\'ll look into that for you. Let me search for relevant information...' }])
    }, 1500)
  }, [chatInput])

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#08060D] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#a855f7]/20 bg-[#0C0A14]">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center">
            <Bot className="size-5 text-[#a855f7]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Autogen</h1>
            <p className="text-xs text-gray-500">Multi-Agent Framework by Microsoft</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-[#a855f7]/30 text-[#a855f7] text-[10px]">v0.4.7</Badge>
          <Badge variant="outline" className="border-purple-300/20 text-purple-300 text-[10px]">AG2</Badge>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-white hover:bg-[#a855f7]/10">
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-3">
          <TabsList className="bg-[#0E0C16] border border-[#a855f7]/10">
            <TabsTrigger value="playground" className="data-[state=active]:bg-[#a855f7]/20 data-[state=active]:text-[#a855f7]">
              <MessageSquare className="size-3.5 mr-1.5" /> Playground
            </TabsTrigger>
            <TabsTrigger value="builder" className="data-[state=active]:bg-[#a855f7]/20 data-[state=active]:text-[#a855f7]">
              <Workflow className="size-3.5 mr-1.5" /> Builder
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-[#a855f7]/20 data-[state=active]:text-[#a855f7]">
              <Package className="size-3.5 mr-1.5" /> Gallery
            </TabsTrigger>
            <TabsTrigger value="mcp" className="data-[state=active]:bg-[#a855f7]/20 data-[state=active]:text-[#a855f7]">
              <Server className="size-3.5 mr-1.5" /> MCP
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#a855f7]/20 data-[state=active]:text-[#a855f7]">
              <Settings className="size-3.5 mr-1.5" /> Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── Playground Tab ───────────────────────────────────── */}
        <TabsContent value="playground" className="flex-1 px-6 pb-6 overflow-hidden">
          <div className="h-full flex flex-col gap-4 lg:flex-row">
            {/* Chat */}
            <Card className="flex-1 bg-[#0E0C16] border border-[#a855f7]/10 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#a855f7]/10">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Team Chat</span>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger className="w-40 bg-[#0A0812] border-[#a855f7]/20 text-white text-[10px] h-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0812] border-[#a855f7]/20">
                      {AGENT_TEMPLATES.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#a855f7]/10 text-[#a855f7] text-[9px] border-0">
                    <Users className="size-3 mr-1" /> 3 agents
                  </Badge>
                  <Badge className="bg-green-500/10 text-green-400 text-[9px] border-0">
                    <Radio className="size-3 mr-1" /> Live
                  </Badge>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4" style={{ maxHeight: 'calc(100vh - 240px)' }}>
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="flex items-start gap-3">
                        <div className="size-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold" style={{ backgroundColor: `${msg.color}20`, color: msg.color, border: `1px solid ${msg.color}30` }}>
                          {msg.agent[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold" style={{ color: msg.color }}>{msg.agent}</span>
                            {'toolCall' in msg && msg.toolCall && (
                              <Badge variant="outline" className="text-[8px] border-amber-500/30 text-amber-400 h-4">
                                <Zap className="size-2.5 mr-0.5" /> {msg.toolCall.name}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{msg.content}</p>
                          {'toolCall' in msg && msg.toolCall && (
                            <div className="mt-1.5 p-2 rounded bg-[#0A0812] border border-[#a855f7]/10 text-[10px] font-mono text-gray-500">
                              <span className="text-[#a855f7]">{msg.toolCall.name}</span>({msg.toolCall.args})
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isRunning && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs text-[#a855f7]">
                      <Loader2 className="size-3.5 animate-spin" /> Agents are collaborating...
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-3 border-t border-[#a855f7]/10">
                <div className="flex gap-2">
                  <Input value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Send a message to the team..."
                    className="bg-[#0A0812] border-[#a855f7]/20 text-white text-sm" />
                  <Button onClick={handleSend} disabled={isRunning}
                    className="bg-[#a855f7] hover:bg-[#a855f7]/80 text-white shrink-0">
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Agent Status */}
            <div className="lg:w-64 shrink-0 space-y-3">
              <Card className="bg-[#0E0C16] border border-[#a855f7]/10 p-4">
                <h3 className="text-xs font-semibold text-white mb-3">Active Agents</h3>
                <div className="space-y-2">
                  {BUILDER_AGENTS.map(agent => (
                    <div key={agent.id} className="flex items-center gap-3 p-2.5 bg-[#0A0812] rounded-lg border border-[#a855f7]/5">
                      <div className="size-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${agent.color}20`, color: agent.color }}>
                        {agent.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white">{agent.name}</p>
                        <p className="text-[9px] text-gray-500">{agent.model}</p>
                      </div>
                      <span className="size-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="bg-[#0E0C16] border border-[#a855f7]/10 p-4">
                <h3 className="text-xs font-semibold text-white mb-3">Topology</h3>
                <div className="flex items-center gap-2 p-2.5 bg-[#0A0812] rounded-lg border border-[#a855f7]/10">
                  <span className="text-lg">{TOPOLOGIES.find(t => t.id === selectedTopology)?.icon}</span>
                  <div>
                    <p className="text-xs text-white">{TOPOLOGIES.find(t => t.id === selectedTopology)?.name}</p>
                    <p className="text-[9px] text-gray-500">{TOPOLOGIES.find(t => t.id === selectedTopology)?.desc}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ─── Builder Tab ──────────────────────────────────────── */}
        <TabsContent value="builder" className="flex-1 px-6 pb-6 overflow-hidden">
          <div className="h-full flex flex-col gap-4 lg:flex-row">
            {/* Visual Builder */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Topology Selector */}
              <Card className="bg-[#0E0C16] border border-[#a855f7]/10 p-4">
                <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                  <Network className="size-3.5 text-[#a855f7]" /> Team Topology
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {TOPOLOGIES.map(topo => (
                    <div key={topo.id} onClick={() => setSelectedTopology(topo.id)}
                      className={`p-3 rounded-lg border cursor-pointer text-center transition-all ${selectedTopology === topo.id ? 'border-[#a855f7]/50 bg-[#a855f7]/10' : 'border-[#a855f7]/10 bg-[#0A0812] hover:border-[#a855f7]/30'}`}>
                      <span className="text-xl block mb-1">{topo.icon}</span>
                      <p className="text-xs font-medium text-white">{topo.name}</p>
                      <p className="text-[9px] text-gray-500">{topo.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Agent Cards */}
              <Card className="flex-1 bg-[#0E0C16] border border-[#a855f7]/10 p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                    <Users className="size-3.5 text-[#a855f7]" /> Agent Cards
                  </h3>
                  <Button variant="outline" size="sm" className="h-6 text-[10px] border-[#a855f7]/20 text-[#a855f7] hover:bg-[#a855f7]/10">
                    <Plus className="size-3 mr-1" /> Add Agent
                  </Button>
                </div>
                <ScrollArea className="h-full" style={{ maxHeight: 'calc(100vh - 380px)' }}>
                  <div className="space-y-3">
                    {BUILDER_AGENTS.map((agent, i) => (
                      <motion.div key={agent.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                        <div className="p-4 bg-[#0A0812] rounded-lg border border-[#a855f7]/10 hover:border-[#a855f7]/30 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${agent.color}20`, color: agent.color, border: `1px solid ${agent.color}30` }}>
                                {agent.name[0]}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">{agent.name}</p>
                                <p className="text-[10px] text-gray-500">{agent.role}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-500 hover:text-red-400">
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                          <div className="mt-3 flex items-center gap-3 text-[10px]">
                            <Badge variant="outline" className="border-gray-700 text-gray-400 text-[9px]">{agent.model}</Badge>
                            <div className="flex gap-1">
                              {agent.tools.map(t => (
                                <span key={t} className="px-1.5 py-0.5 rounded bg-[#a855f7]/10 text-[#a855f7]/60 text-[8px]">{t}</span>
                              ))}
                            </div>
                          </div>
                          {i < BUILDER_AGENTS.length - 1 && (
                            <div className="flex justify-center mt-2">
                              <ArrowRight className="size-4 text-[#a855f7]/30 rotate-90" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ─── Gallery Tab ──────────────────────────────────────── */}
        <TabsContent value="gallery" className="flex-1 px-6 pb-6 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-3xl pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Team Templates</h3>
                <Badge variant="outline" className="text-[9px] border-[#a855f7]/20 text-[#a855f7]">{AGENT_TEMPLATES.length} templates</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AGENT_TEMPLATES.map(template => (
                  <motion.div key={template.id} whileHover={{ scale: 1.01 }}>
                    <Card className="bg-[#0E0C16] border border-[#a855f7]/10 p-4 hover:border-[#a855f7]/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{template.name}</h4>
                          <p className="text-[10px] text-gray-500">{template.desc}</p>
                        </div>
                        <Badge variant="outline" className="text-[8px] border-gray-700 text-gray-400">{template.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <Users className="size-3" />{template.agents} agents
                          <Separator orientation="vertical" className="h-3 bg-gray-700" />
                          <span>{template.topology}</span>
                        </div>
                        <Button size="sm" className="h-7 text-[10px] bg-[#a855f7]/20 text-[#a855f7] hover:bg-[#a855f7]/30 border-0">
                          <Play className="size-3 mr-1" /> Deploy
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ─── MCP Tab ──────────────────────────────────────────── */}
        <TabsContent value="mcp" className="flex-1 px-6 pb-6 overflow-y-auto">
          <div className="max-w-2xl space-y-5">
            {/* MCP Server Manager */}
            <Card className="bg-[#0E0C16] border border-[#a855f7]/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Server className="size-4 text-[#a855f7]" /> MCP Server Manager
                </h3>
                <Button variant="outline" size="sm" className="h-7 text-[10px] border-[#a855f7]/20 text-[#a855f7] hover:bg-[#a855f7]/10">
                  <Plus className="size-3 mr-1" /> Add Server
                </Button>
              </div>
              <div className="space-y-2">
                {MCP_SERVERS.map(srv => (
                  <div key={srv.name} className="flex items-center justify-between p-3 bg-[#0A0812] rounded-lg border border-[#a855f7]/5 hover:border-[#a855f7]/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`size-2 rounded-full ${srv.status === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                      <div>
                        <p className="text-xs text-white">{srv.name}</p>
                        <p className="text-[9px] text-gray-500">{srv.protocol} • {srv.tools} tools</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[8px] ${srv.status === 'connected' ? 'border-green-500/30 text-green-400' : 'border-gray-700 text-gray-500'}`}>
                        {srv.status}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-500 hover:text-white">
                        <Settings className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tool Discovery */}
            <Card className="bg-[#0E0C16] border border-[#a855f7]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="size-4 text-[#a855f7]" /> Tool Discovery
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {['web_search', 'file_read', 'file_write', 'code_exec', 'sql_query', 'http_request', 'browser_navigate', 'markdown_render'].map(tool => (
                  <div key={tool} className="p-2.5 bg-[#0A0812] rounded-lg border border-[#a855f7]/5 flex items-center gap-2">
                    <Zap className="size-3 text-[#a855f7]/40" />
                    <span className="text-[10px] font-mono text-gray-300">{tool}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* WebSocket Bridge */}
            <Card className="bg-[#0E0C16] border border-[#a855f7]/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Wifi className="size-4 text-[#a855f7]" /> WebSocket Bridge
                </h3>
                <Switch checked={wsBridge} onCheckedChange={setWsBridge} className="data-[state=checked]:bg-[#a855f7]" />
              </div>
              <div className="p-3 bg-[#0A0812] rounded-lg border border-[#a855f7]/5">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className={`size-2 rounded-full ${wsBridge ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
                  <span className="text-gray-400 font-mono">ws://localhost:8001/mcp</span>
                  <Badge variant="outline" className="text-[8px] border-gray-700 text-gray-500 ml-auto">{wsBridge ? 'Active' : 'Disabled'}</Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Settings Tab ─────────────────────────────────────── */}
        <TabsContent value="settings" className="flex-1 px-6 pb-6 overflow-y-auto">
          <div className="max-w-2xl space-y-5">
            {/* Model Providers */}
            <Card className="bg-[#0E0C16] border border-[#a855f7]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Cpu className="size-4 text-[#a855f7]" /> Model Providers
              </h3>
              <div className="space-y-3">
                {MODEL_PROVIDERS.map(provider => (
                  <div key={provider.id} className="p-4 bg-[#0A0812] rounded-lg border border-[#a855f7]/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${provider.configured ? 'bg-green-400' : 'bg-gray-500'}`} />
                        <span className="text-sm font-medium text-white">{provider.name}</span>
                      </div>
                      <Badge variant="outline" className={`text-[9px] ${provider.configured ? 'border-green-500/30 text-green-400' : 'border-gray-700 text-gray-500'}`}>
                        {provider.configured ? 'Configured' : 'Not Set'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="size-3 text-gray-600" />
                      <span className="text-[10px] font-mono text-gray-500">{provider.key}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {provider.models.map(m => (
                        <span key={m} className="px-2 py-0.5 rounded bg-[#a855f7]/10 text-[#a855f7]/60 text-[9px] font-mono">{m}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* API Keys */}
            <Card className="bg-[#0E0C16] border border-[#a855f7]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Key className="size-4 text-[#a855f7]" /> API Keys
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase mb-1 block">OpenAI API Key</label>
                  <Input defaultValue="sk-***...***abc" type="password" className="bg-[#0A0812] border-[#a855f7]/20 text-white font-mono text-xs h-8" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase mb-1 block">Anthropic API Key</label>
                  <Input defaultValue="sk-ant-***...***ghi" type="password" className="bg-[#0A0812] border-[#a855f7]/20 text-white font-mono text-xs h-8" />
                </div>
              </div>
            </Card>

            {/* Runtime Config */}
            <Card className="bg-[#0E0C16] border border-[#a855f7]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="size-4 text-[#a855f7]" /> Runtime Config
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 px-3 bg-[#0A0812] rounded-lg border border-[#a855f7]/5">
                  <span className="text-xs text-gray-400">Max Concurrent Agents</span>
                  <span className="text-xs text-white font-mono">10</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-[#0A0812] rounded-lg border border-[#a855f7]/5">
                  <span className="text-xs text-gray-400">Max Turns Per Conversation</span>
                  <span className="text-xs text-white font-mono">25</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-[#0A0812] rounded-lg border border-[#a855f7]/5">
                  <span className="text-xs text-gray-400">Timeout (seconds)</span>
                  <span className="text-xs text-white font-mono">300</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-[#0A0812] rounded-lg border border-[#a855f7]/5">
                  <span className="text-xs text-gray-400">Code Execution</span>
                  <Switch defaultChecked className="data-[state=checked]:bg-[#a855f7]" />
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-[#0A0812] rounded-lg border border-[#a855f7]/5">
                  <span className="text-xs text-gray-400">Docker Sandbox</span>
                  <Switch defaultChecked className="data-[state=checked]:bg-[#a855f7]" />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
