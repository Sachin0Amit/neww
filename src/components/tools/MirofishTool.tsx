'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Fish, Brain, Network, FileText, Settings, Upload, Play,
  Users, Activity, Zap, ChevronRight, MessageSquare, BarChart3,
  Cpu, Eye, Sparkles, ArrowRight, Circle, Check, Clock,
  Globe, Layers, TreePine, Target, Shield, Thermometer
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
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'

const ACCENT = '#14b8a6'
const BG = '#070A0D'
const CARD_BG = '#0C1015'
const BORDER = '#1A2328'

const SIM_STEPS = [
  { id: 'graph', label: 'Graph Build', icon: Network, desc: 'Construct knowledge graph from seed data' },
  { id: 'env', label: 'Environment', icon: Globe, desc: 'Define simulation environment & constraints' },
  { id: 'sim', label: 'Simulation', icon: Play, desc: 'Run swarm intelligence simulation' },
  { id: 'report', label: 'Report', icon: FileText, desc: 'Generate prediction report & insights' },
  { id: 'deep', label: 'Deep Interaction', icon: MessageSquare, desc: 'Interactive deep-dive with report agent' },
]

const AGENTS_DATA = [
  { id: 1, name: 'Alpha-7', personality: 'Analytical & Cautious', memory: 2847, relationships: 12, confidence: 0.87, color: '#14b8a6' },
  { id: 2, name: 'Beta-3', personality: 'Risk-Taking & Intuitive', memory: 1923, relationships: 8, confidence: 0.72, color: '#f59e0b' },
  { id: 3, name: 'Gamma-9', personality: 'Consensus-Driven', memory: 3241, relationships: 15, confidence: 0.91, color: '#8b5cf6' },
  { id: 4, name: 'Delta-1', personality: 'Contrarian & Deep-Thinker', memory: 4102, relationships: 6, confidence: 0.65, color: '#ef4444' },
  { id: 5, name: 'Epsilon-5', personality: 'Trend-Following', memory: 1567, relationships: 11, confidence: 0.79, color: '#3b82f6' },
  { id: 6, name: 'Zeta-2', personality: 'Data-Mining Specialist', memory: 5621, relationships: 9, confidence: 0.93, color: '#10b981' },
  { id: 7, name: 'Eta-8', personality: 'Sentiment Analyst', memory: 2234, relationships: 14, confidence: 0.81, color: '#ec4899' },
  { id: 8, name: 'Theta-4', personality: 'Scenario Planner', memory: 3890, relationships: 7, confidence: 0.76, color: '#f97316' },
]

const GRAPH_NODES = [
  { id: 'n1', label: 'Market Sentiment', type: 'concept', x: 35, y: 25, size: 28 },
  { id: 'n2', label: 'Fed Policy', type: 'event', x: 60, y: 15, size: 24 },
  { id: 'n3', label: 'Tech Sector', type: 'entity', x: 20, y: 45, size: 22 },
  { id: 'n4', label: 'Consumer Confidence', type: 'metric', x: 55, y: 40, size: 20 },
  { id: 'n5', label: 'Supply Chain', type: 'concept', x: 75, y: 35, size: 18 },
  { id: 'n6', label: 'Inflation Rate', type: 'metric', x: 40, y: 60, size: 26 },
  { id: 'n7', label: 'Geopolitics', type: 'event', x: 80, y: 55, size: 16 },
  { id: 'n8', label: 'Employment', type: 'metric', x: 25, y: 70, size: 20 },
  { id: 'n9', label: 'Housing Market', type: 'entity', x: 65, y: 65, size: 18 },
  { id: 'n10', label: 'Energy Prices', type: 'metric', x: 50, y: 80, size: 22 },
]

const GRAPH_EDGES = [
  { from: 'n1', to: 'n2', weight: 0.9 }, { from: 'n1', to: 'n3', weight: 0.7 },
  { from: 'n2', to: 'n6', weight: 0.95 }, { from: 'n3', to: 'n4', weight: 0.6 },
  { from: 'n4', to: 'n6', weight: 0.8 }, { from: 'n5', to: 'n3', weight: 0.5 },
  { from: 'n5', to: 'n10', weight: 0.7 }, { from: 'n7', to: 'n5', weight: 0.85 },
  { from: 'n7', to: 'n10', weight: 0.6 }, { from: 'n8', to: 'n6', weight: 0.75 },
  { from: 'n8', to: 'n1', weight: 0.5 }, { from: 'n9', to: 'n6', weight: 0.8 },
  { from: 'n9', to: 'n8', weight: 0.4 }, { from: 'n10', to: 'n2', weight: 0.65 },
]

const PREDICTION_REPORT = {
  title: 'Q2 2025 Market Trajectory Prediction',
  generatedAt: '2025-03-04 14:32 UTC',
  confidence: 0.847,
  horizon: '90 days',
  scenarios: [
    { name: 'Bullish (35%)', desc: 'Fed pivot accelerates, tech earnings exceed expectations. S&P 500 targets 6,200+', probability: 0.35, color: '#10b981' },
    { name: 'Base (45%)', desc: 'Gradual rate cuts, moderate growth continues. S&P 500 range 5,800-6,100.', probability: 0.45, color: '#14b8a6' },
    { name: 'Bearish (20%)', desc: 'Inflation resurgence delays cuts, recession risk rises. S&P 500 falls to 5,400.', probability: 0.20, color: '#ef4444' },
  ],
  keyDrivers: [
    { driver: 'Federal Reserve Policy', impact: 0.92, direction: 'Positive' },
    { driver: 'AI Capex Cycle', impact: 0.87, direction: 'Positive' },
    { driver: 'Consumer Spending', impact: 0.74, direction: 'Neutral' },
    { driver: 'Geopolitical Risk', impact: 0.68, direction: 'Negative' },
    { driver: 'Labor Market Tightness', impact: 0.61, direction: 'Positive' },
  ],
}

const CHAT_MESSAGES = [
  { role: 'agent', text: 'I\'ve completed the swarm simulation with 8 agents over 10,000 iterations. The consensus prediction favors a base-case scenario with 84.7% aggregate confidence. What aspect would you like to explore deeper?' },
  { role: 'user', text: 'What are the biggest risks to the bullish scenario?' },
  { role: 'agent', text: 'The bullish scenario (35% probability) faces three key risks: 1) Inflation running above 3.5% would force the Fed to delay cuts, 2) AI capex fatigue if enterprise adoption slows, and 3) Escalation in the Middle East disrupting energy markets. Agents Delta-1 and Theta-4 flagged these as their top concerns.' },
]

function SimulateTab() {
  const [currentStep, setCurrentStep] = useState(0)
  const [seedFile, setSeedFile] = useState('')
  const [simRounds, setSimRounds] = useState('10000')
  const [agentCount, setAgentCount] = useState('8')
  const [isRunning, setIsRunning] = useState(false)

  return (
    <div className="space-y-4">
      {/* Step Progress */}
      <Card className="bg-[#0C1015] border border-[#1A2328] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Simulation Workflow</h3>
          <Badge variant="outline" className="text-[10px] border-[#14b8a6]/40 text-[#14b8a6]">
            Step {currentStep + 1} of {SIM_STEPS.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {SIM_STEPS.map((step, i) => {
            const Icon = step.icon
            const isActive = i === currentStep
            const isDone = i < currentStep
            return (
              <motion.button
                key={step.id}
                onClick={() => setCurrentStep(i)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg border transition-all ${
                  isActive ? 'border-[#14b8a6]/50 bg-[#14b8a6]/10' :
                  isDone ? 'border-[#14b8a6]/20 bg-[#14b8a6]/5' :
                  'border-[#1A2328] bg-[#0C1015]'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`p-1.5 rounded ${isActive ? 'bg-[#14b8a6]/20' : isDone ? 'bg-[#14b8a6]/10' : 'bg-[#1A2328]'}`}>
                  {isDone ? <Check className="size-3.5 text-[#14b8a6]" /> : <Icon className={`size-3.5 ${isActive ? 'text-[#14b8a6]' : 'text-gray-500'}`} />}
                </div>
                <span className={`text-[9px] font-medium ${isActive ? 'text-[#14b8a6]' : isDone ? 'text-[#14b8a6]/70' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentStep === 0 && (
            <Card className="bg-[#0C1015] border border-[#1A2328] p-4">
              <h3 className="text-sm font-semibold text-white mb-1">Graph Build</h3>
              <p className="text-xs text-gray-500 mb-4">Upload seed data to construct the initial knowledge graph</p>
              <div className="space-y-3">
                <div
                  className="border-2 border-dashed border-[#1A2328] rounded-lg p-8 text-center hover:border-[#14b8a6]/40 transition-colors cursor-pointer"
                  onClick={() => setSeedFile('market_data_2025.csv')}
                >
                  <Upload className="size-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 mb-1">Drop seed data file or click to upload</p>
                  <p className="text-[10px] text-gray-600">CSV, JSON, or YAML supported</p>
                  {seedFile && (
                    <Badge variant="outline" className="mt-2 text-[10px] border-[#14b8a6]/30 text-[#14b8a6]">
                      {seedFile}
                    </Badge>
                  )}
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Or paste raw data</label>
                  <Textarea
                    placeholder="Paste market data, news articles, or research notes..."
                    className="bg-[#070A0D] border-[#1A2328] text-gray-300 text-xs min-h-24 focus:border-[#14b8a6]"
                  />
                </div>
              </div>
            </Card>
          )}

          {currentStep === 1 && (
            <Card className="bg-[#0C1015] border border-[#1A2328] p-4">
              <h3 className="text-sm font-semibold text-white mb-1">Environment Configuration</h3>
              <p className="text-xs text-gray-500 mb-4">Define simulation parameters and constraints</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Agent Count</label>
                  <Input value={agentCount} onChange={e => setAgentCount(e.target.value)} className="bg-[#070A0D] border-[#1A2328] text-white font-mono text-sm h-8 focus:border-[#14b8a6]" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Simulation Rounds</label>
                  <Input value={simRounds} onChange={e => setSimRounds(e.target.value)} className="bg-[#070A0D] border-[#1A2328] text-white font-mono text-sm h-8 focus:border-[#14b8a6]" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Time Horizon</label>
                  <Select defaultValue="90d">
                    <SelectTrigger className="bg-[#070A0D] border-[#1A2328] text-white text-sm h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0C1015] border-[#1A2328]">
                      <SelectItem value="30d">30 Days</SelectItem>
                      <SelectItem value="90d">90 Days</SelectItem>
                      <SelectItem value="180d">180 Days</SelectItem>
                      <SelectItem value="365d">365 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Convergence Threshold</label>
                  <Input defaultValue="0.001" className="bg-[#070A0D] border-[#1A2328] text-white font-mono text-sm h-8 focus:border-[#14b8a6]" />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Enable Agent Memory</span>
                  <Switch defaultChecked className="data-[state=checked]:bg-[#14b8a6]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Relationship Dynamics</span>
                  <Switch defaultChecked className="data-[state=checked]:bg-[#14b8a6]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Real-time Graph Updates</span>
                  <Switch className="data-[state=checked]:bg-[#14b8a6]" />
                </div>
              </div>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="bg-[#0C1015] border border-[#1A2328] p-4">
              <h3 className="text-sm font-semibold text-white mb-1">Run Simulation</h3>
              <p className="text-xs text-gray-500 mb-4">Launch swarm intelligence prediction engine</p>
              <div className="flex flex-col items-center py-6">
                <motion.div
                  className="relative"
                  animate={isRunning ? { rotate: 360 } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="size-24 rounded-full border-2 border-[#14b8a6]/30 flex items-center justify-center">
                    <div className="size-16 rounded-full border-2 border-[#14b8a6]/50 flex items-center justify-center">
                      <Fish className="size-6 text-[#14b8a6]" />
                    </div>
                  </div>
                </motion.div>
                <Button
                  className={`mt-4 ${isRunning ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' : 'bg-[#14b8a6] hover:bg-[#14b8a6]/80 text-white'}`}
                  onClick={() => setIsRunning(!isRunning)}
                >
                  {isRunning ? (
                    <><Activity className="size-3.5 mr-1.5 animate-pulse" /> Stop Simulation</>
                  ) : (
                    <><Play className="size-3.5 mr-1.5" /> Launch Swarm</>
                  )}
                </Button>
                {isRunning && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center">
                    <p className="text-xs text-gray-400 font-mono">Round 4,721 / {simRounds}</p>
                    <div className="w-48 h-1.5 bg-[#1A2328] rounded-full mt-2 overflow-hidden">
                      <motion.div className="h-full bg-[#14b8a6] rounded-full" initial={{ width: '0%' }} animate={{ width: '47%' }} transition={{ duration: 1 }} />
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1">Convergence: 0.0034 | Agents active: {agentCount}</p>
                  </motion.div>
                )}
              </div>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="bg-[#0C1015] border border-[#1A2328] p-4">
              <h3 className="text-sm font-semibold text-white mb-1">Prediction Report</h3>
              <p className="text-xs text-gray-500 mb-3">Generated from swarm consensus</p>
              <div className="space-y-2">
                <div className="bg-[#070A0D] rounded-lg p-3 border border-[#1A2328]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-white">Overall Confidence</span>
                    <span className="text-sm font-mono text-[#14b8a6] font-bold">84.7%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1A2328] rounded-full overflow-hidden">
                    <div className="h-full bg-[#14b8a6] rounded-full" style={{ width: '84.7%' }} />
                  </div>
                </div>
                {PREDICTION_REPORT.scenarios.map((s) => (
                  <div key={s.name} className="bg-[#070A0D] rounded-lg p-3 border border-[#1A2328] hover:border-[#14b8a6]/20 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-white">{s.name}</span>
                      <span className="text-xs font-mono" style={{ color: s.color }}>{(s.probability * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-[11px] text-gray-500">{s.desc}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="bg-[#0C1015] border border-[#1A2328] p-4">
              <h3 className="text-sm font-semibold text-white mb-1">Deep Interaction</h3>
              <p className="text-xs text-gray-500 mb-3">Chat with the report agent for deeper insights</p>
              <ScrollArea className="h-64 mb-3">
                <div className="space-y-3">
                  {CHAT_MESSAGES.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-[#14b8a6]'
                          : 'bg-[#070A0D] border border-[#1A2328] text-gray-300'
                      }`}>
                        {msg.role === 'agent' && <Brain className="size-3 text-[#14b8a6] mb-1.5" />}
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input placeholder="Ask about predictions, risks, or scenarios..." className="bg-[#070A0D] border-[#1A2328] text-white text-xs h-9 focus:border-[#14b8a6]" />
                <Button size="sm" className="bg-[#14b8a6] hover:bg-[#14b8a6]/80 text-white shrink-0">
                  <Sparkles className="size-3.5" />
                </Button>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="border-[#1A2328] text-gray-400 hover:text-white hover:border-[#14b8a6]/30"
        >
          Previous
        </Button>
        <Button
          size="sm"
          onClick={() => setCurrentStep(Math.min(SIM_STEPS.length - 1, currentStep + 1))}
          disabled={currentStep === SIM_STEPS.length - 1}
          className="bg-[#14b8a6] hover:bg-[#14b8a6]/80 text-white"
        >
          Next <ArrowRight className="size-3.5 ml-1" />
        </Button>
      </div>
    </div>
  )
}

function AgentsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Swarm Agents</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">8 active agents with unique personalities and memories</p>
        </div>
        <Button size="sm" className="bg-[#14b8a6]/10 text-[#14b8a6] hover:bg-[#14b8a6]/20 border border-[#14b8a6]/20">
          <Users className="size-3.5 mr-1.5" /> Generate New Agent
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {AGENTS_DATA.map((agent) => (
          <motion.div
            key={agent.id}
            whileHover={{ scale: 1.01 }}
            className="bg-[#0C1015] rounded-lg p-4 border border-[#1A2328] hover:border-[#14b8a6]/30 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${agent.color}15`, border: `1px solid ${agent.color}30` }}>
                  <Brain className="size-4" style={{ color: agent.color }} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{agent.name}</h4>
                  <p className="text-[10px] text-gray-500">{agent.personality}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px]" style={{ borderColor: `${agent.color}40`, color: agent.color }}>
                {(agent.confidence * 100).toFixed(0)}% conf
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-[#070A0D] rounded p-2 border border-[#1A2328]/50">
                <div className="text-[9px] text-gray-500 uppercase">Memory</div>
                <div className="text-xs font-mono text-white">{agent.memory.toLocaleString()} items</div>
              </div>
              <div className="bg-[#070A0D] rounded p-2 border border-[#1A2328]/50">
                <div className="text-[9px] text-gray-500 uppercase">Relationships</div>
                <div className="text-xs font-mono text-white">{agent.relationships} links</div>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full h-1 bg-[#1A2328] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${agent.confidence * 100}%`, backgroundColor: agent.color }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function GraphTab() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Knowledge Graph</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">{GRAPH_NODES.length} entities, {GRAPH_EDGES.length} relationships</p>
        </div>
        <div className="flex items-center gap-2">
          {['concept', 'event', 'entity', 'metric'].map(type => (
            <Badge key={type} variant="outline" className="text-[9px] border-[#1A2328] text-gray-400 capitalize">
              <Circle className="size-2 mr-1" style={{ color: type === 'concept' ? '#14b8a6' : type === 'event' ? '#f59e0b' : type === 'entity' ? '#8b5cf6' : '#3b82f6' }} />
              {type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Graph Visualization */}
      <Card className="bg-[#0C1015] border border-[#1A2328] p-4 overflow-hidden">
        <div className="relative h-72 bg-[#070A0D] rounded-lg border border-[#1A2328] overflow-hidden">
          <svg className="w-full h-full">
            {/* Edges */}
            {GRAPH_EDGES.map((edge, i) => {
              const from = GRAPH_NODES.find(n => n.id === edge.from)!
              const to = GRAPH_NODES.find(n => n.id === edge.to)!
              return (
                <line
                  key={i}
                  x1={`${from.x}%`} y1={`${from.y}%`}
                  x2={`${to.x}%`} y2={`${to.y}%`}
                  stroke={ACCENT} strokeOpacity={edge.weight * 0.4} strokeWidth={edge.weight * 2}
                />
              )
            })}
            {/* Nodes */}
            {GRAPH_NODES.map((node) => (
              <g key={node.id} onClick={() => setSelectedNode(node.id)} className="cursor-pointer">
                <circle
                  cx={`${node.x}%`} cy={`${node.y}%`}
                  r={node.size / 3}
                  fill={node.type === 'concept' ? '#14b8a6' : node.type === 'event' ? '#f59e0b' : node.type === 'entity' ? '#8b5cf6' : '#3b82f6'}
                  fillOpacity={selectedNode === node.id ? 0.4 : 0.15}
                  stroke={node.type === 'concept' ? '#14b8a6' : node.type === 'event' ? '#f59e0b' : node.type === 'entity' ? '#8b5cf6' : '#3b82f6'}
                  strokeWidth={selectedNode === node.id ? 2 : 1}
                  strokeOpacity={selectedNode === node.id ? 0.8 : 0.4}
                />
                <text
                  x={`${node.x}%`} y={`${node.y + 5}%`}
                  textAnchor="middle"
                  className="text-[8px] fill-gray-400"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </Card>

      {/* Entity Details */}
      {selectedNode && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-[#0C1015] border border-[#1A2328] p-4">
            {(() => {
              const node = GRAPH_NODES.find(n => n.id === selectedNode)!
              const connections = GRAPH_EDGES.filter(e => e.from === selectedNode || e.to === selectedNode).length
              return (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-white">{node.label}</h4>
                    <Badge variant="outline" className="text-[9px] border-[#14b8a6]/30 text-[#14b8a6] capitalize">{node.type}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#070A0D] rounded p-2 border border-[#1A2328]/50 text-center">
                      <div className="text-[9px] text-gray-500">Connections</div>
                      <div className="text-xs font-mono text-white">{connections}</div>
                    </div>
                    <div className="bg-[#070A0D] rounded p-2 border border-[#1A2328]/50 text-center">
                      <div className="text-[9px] text-gray-500">Centrality</div>
                      <div className="text-xs font-mono text-white">0.{node.size}</div>
                    </div>
                    <div className="bg-[#070A0D] rounded p-2 border border-[#1A2328]/50 text-center">
                      <div className="text-[9px] text-gray-500">Influence</div>
                      <div className="text-xs font-mono text-[#14b8a6]">{(node.size / 28 * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </Card>
        </motion.div>
      )}
    </div>
  )
}

function ReportTab() {
  return (
    <div className="space-y-4">
      {/* Report Header */}
      <Card className="bg-[#0C1015] border border-[#1A2328] p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">{PREDICTION_REPORT.title}</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Generated: {PREDICTION_REPORT.generatedAt} | Horizon: {PREDICTION_REPORT.horizon}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-mono font-bold text-[#14b8a6]">{(PREDICTION_REPORT.confidence * 100).toFixed(1)}%</div>
            <div className="text-[9px] text-gray-500">Confidence</div>
          </div>
        </div>
        <div className="w-full h-2 bg-[#1A2328] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-500 via-[#14b8a6] to-emerald-400 rounded-full" style={{ width: `${PREDICTION_REPORT.confidence * 100}%` }} />
        </div>
      </Card>

      {/* Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PREDICTION_REPORT.scenarios.map((scenario) => (
          <Card key={scenario.name} className="bg-[#0C1015] border border-[#1A2328] p-4 hover:border-[#14b8a6]/20 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-3 rounded-full" style={{ backgroundColor: scenario.color }} />
              <span className="text-xs font-semibold text-white">{scenario.name}</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">{scenario.desc}</p>
            <div className="mt-3 w-full h-1.5 bg-[#1A2328] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${scenario.probability * 100}%`, backgroundColor: scenario.color }} />
            </div>
            <span className="text-[10px] font-mono mt-1 block" style={{ color: scenario.color }}>
              {(scenario.probability * 100).toFixed(0)}% probability
            </span>
          </Card>
        ))}
      </div>

      {/* Key Drivers */}
      <Card className="bg-[#0C1015] border border-[#1A2328] p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Key Drivers</h3>
        <div className="space-y-2">
          {PREDICTION_REPORT.keyDrivers.map((driver, i) => (
            <div key={i} className="flex items-center gap-3 py-2 px-3 bg-[#070A0D] rounded-lg border border-[#1A2328]/50">
              <div className="w-8 h-1.5 bg-[#1A2328] rounded-full overflow-hidden shrink-0">
                <div className="h-full bg-[#14b8a6] rounded-full" style={{ width: `${driver.impact * 100}%` }} />
              </div>
              <span className="text-xs text-gray-300 flex-1">{driver.driver}</span>
              <Badge variant="outline" className={`text-[9px] ${driver.direction === 'Positive' ? 'border-emerald-500/30 text-emerald-400' : driver.direction === 'Negative' ? 'border-red-500/30 text-red-400' : 'border-gray-500/30 text-gray-400'}`}>
                {driver.direction}
              </Badge>
              <span className="text-xs font-mono text-gray-500 w-10 text-right">{(driver.impact * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="space-y-4">
      {/* LLM Config */}
      <Card className="bg-[#0C1015] border border-[#1A2328] p-4">
        <h3 className="text-sm font-semibold text-white mb-3">LLM Configuration</h3>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Primary Model</label>
            <Select defaultValue="gpt4o">
              <SelectTrigger className="bg-[#070A0D] border-[#1A2328] text-white text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0C1015] border-[#1A2328]">
                <SelectItem value="gpt4o">GPT-4o (OpenAI)</SelectItem>
                <SelectItem value="claude35">Claude 3.5 Sonnet (Anthropic)</SelectItem>
                <SelectItem value="deepseek">DeepSeek V3</SelectItem>
                <SelectItem value="llama">Llama 3.1 405B</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">API Key</label>
            <Input type="password" defaultValue="sk-***...***abc" className="bg-[#070A0D] border-[#1A2328] text-white text-sm h-9 focus:border-[#14b8a6]" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Temperature: 0.7</label>
            <Slider defaultValue={[0.7]} max={1} step={0.1} className="[&_[role=slider]]:bg-[#14b8a6]" />
          </div>
        </div>
      </Card>

      {/* Simulation Parameters */}
      <Card className="bg-[#0C1015] border border-[#1A2328] p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Simulation Parameters</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Max Iterations</label>
              <Input defaultValue="10000" className="bg-[#070A0D] border-[#1A2328] text-white font-mono text-sm h-9 focus:border-[#14b8a6]" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Convergence Delta</label>
              <Input defaultValue="0.001" className="bg-[#070A0D] border-[#1A2328] text-white font-mono text-sm h-9 focus:border-[#14b8a6]" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Enable Agent Memory Decay</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[#14b8a6]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Adaptive Graph Pruning</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[#14b8a6]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Cross-Agent Communication</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[#14b8a6]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Debug Mode (Verbose Logging)</span>
            <Switch className="data-[state=checked]:bg-[#14b8a6]" />
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="bg-[#0C1015] border border-[#1A2328] p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#14b8a6]/10 border border-[#14b8a6]/20">
            <Fish className="size-5 text-[#14b8a6]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">MiroFish v2.4.1</h3>
            <p className="text-[10px] text-gray-500">Swarm Intelligence Prediction Engine</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function MirofishTool({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('simulate')

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
          <div className="p-1.5 rounded-lg bg-[#14b8a6]/10 border border-[#14b8a6]/20">
            <Fish className="size-5 text-[#14b8a6]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white">MiroFish</h1>
              <Badge variant="outline" className="text-[9px] border-[#14b8a6]/30 text-[#14b8a6]">v2.4.1</Badge>
            </div>
            <p className="text-[10px] text-gray-500">Swarm Intelligence Prediction Engine</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-white hover:bg-[#14b8a6]/10">
          <X className="size-4" />
        </Button>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-2 border-b" style={{ borderColor: BORDER }}>
          <TabsList className="bg-transparent h-9 p-0 gap-1">
            {[
              { id: 'simulate', label: 'Simulate', icon: Play },
              { id: 'agents', label: 'Agents', icon: Users },
              { id: 'graph', label: 'Graph', icon: Network },
              { id: 'report', label: 'Report', icon: FileText },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-[#14b8a6]/10 data-[state=active]:text-[#14b8a6] text-gray-500 text-xs h-8 px-3 rounded-md data-[state=active]:shadow-none border border-transparent data-[state=active]:border-[#14b8a6]/20"
              >
                <tab.icon className="size-3.5 mr-1.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-4 py-4">
          <TabsContent value="simulate" className="mt-0"><SimulateTab /></TabsContent>
          <TabsContent value="agents" className="mt-0"><AgentsTab /></TabsContent>
          <TabsContent value="graph" className="mt-0"><GraphTab /></TabsContent>
          <TabsContent value="report" className="mt-0"><ReportTab /></TabsContent>
          <TabsContent value="settings" className="mt-0"><SettingsTab /></TabsContent>
        </ScrollArea>
      </Tabs>
    </motion.div>
  )
}
