'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Play, Square, Terminal, Users, Wrench, Brain, Settings,
  ChevronRight, ChevronDown, Plus, Search, Send, Clock, CheckCircle2,
  XCircle, Loader2, AlertTriangle, Globe, Lock, Unlock, Zap, Eye,
  Server, Cpu, FileText, BarChart3, Activity, Database, Upload,
  RefreshCw, Trash2, ArrowRight, ExternalLink, Copy, X, MessageSquare,
  Layers, GitBranch, Radio, Wifi, Container, HardDrive, Key,
  Fingerprint, ScanLine, Target, Crosshair, Bug, ShieldAlert,
  ShieldCheck, Globe2, Code, Link2, BookOpen, HelpCircle, Tag,
  Network, Bot, Cog, Gauge, Monitor, Command, History, ArrowUpRight,
  CircleDot, Timer, FolderOpen, Save, Download, UploadCloud, Info,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'


// =================== TYPES ===================

type TabId = 'flows' | 'terminal' | 'agents' | 'tools' | 'knowledge' | 'settings'

interface Flow {
  id: string
  name: string
  target: string
  objective: string
  scope: string[]
  status: 'planning' | 'running' | 'paused' | 'completed' | 'failed'
  progress: number
  createdAt: string
  agents: string[]
  subtasks: Subtask[]
  findings: number
}

interface Subtask {
  id: string
  name: string
  agent: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  output?: string
  duration?: string
}

interface Agent {
  id: string
  name: string
  role: string
  status: 'idle' | 'busy' | 'error' | 'offline'
  model: string
  tasksCompleted: number
  currentTask?: string
  icon: LucideIcon
  description: string
}

interface ToolDef {
  id: string
  name: string
  category: 'Barrier' | 'Delegation' | 'Environment' | 'Search' | 'VectorStore' | 'Result'
  description: string
  usageCount: number
  icon: LucideIcon
}

interface KnowledgeEntry {
  id: string
  type: 'document' | 'qa' | 'graph'
  title: string
  content: string
  tags: string[]
  timestamp: string
  similarity?: number
}

interface TerminalLine {
  id: number
  type: 'input' | 'output' | 'error' | 'system'
  content: string
  timestamp: string
}

// =================== CONSTANTS ===================

const PINK = '#ec4899'

const AGENTS: Agent[] = [
  { id: 'primary_agent', name: 'Primary Agent', role: 'Orchestrator', status: 'busy', model: 'gpt-4o', tasksCompleted: 47, currentTask: 'Coordinating recon phase', icon: Bot, description: 'Main orchestrator that plans and delegates tasks across the agent network' },
  { id: 'pentester', name: 'Pentester', role: 'Exploitation', status: 'busy', model: 'claude-3.5-sonnet', tasksCompleted: 32, currentTask: 'Testing SQL injection vectors', icon: ShieldAlert, description: 'Executes penetration testing techniques and validates vulnerabilities' },
  { id: 'coder', name: 'Coder', role: 'Development', status: 'idle', model: 'gpt-4o', tasksCompleted: 28, icon: Code, description: 'Writes exploit code, scripts, and custom tooling for assessments' },
  { id: 'installer', name: 'Installer', role: 'Setup', status: 'idle', model: 'gpt-4o-mini', tasksCompleted: 15, icon: HardDrive, description: 'Manages tool installation and environment configuration' },
  { id: 'searcher', name: 'Searcher', role: 'OSINT', status: 'busy', model: 'gpt-4o', tasksCompleted: 63, currentTask: 'Querying Shodan for subdomains', icon: Search, description: 'Performs open-source intelligence gathering across multiple search engines' },
  { id: 'adviser', name: 'Adviser', role: 'Strategy', status: 'idle', model: 'claude-3.5-sonnet', tasksCompleted: 19, icon: HelpCircle, description: 'Provides strategic guidance and methodology recommendations' },
  { id: 'memorist', name: 'Memorist', role: 'Memory', status: 'idle', model: 'gpt-4o-mini', tasksCompleted: 41, icon: Database, description: 'Manages vector memory storage and retrieval for context persistence' },
  { id: 'generator', name: 'Generator', role: 'Content', status: 'idle', model: 'gpt-4o', tasksCompleted: 22, icon: FileText, description: 'Generates reports, summaries, and documentation' },
  { id: 'refiner', name: 'Refiner', role: 'Optimization', status: 'idle', model: 'claude-3.5-sonnet', tasksCompleted: 17, icon: RefreshCw, description: 'Refines and improves outputs from other agents' },
  { id: 'enricher', name: 'Enricher', role: 'Enhancement', status: 'idle', model: 'gpt-4o', tasksCompleted: 24, icon: Zap, description: 'Enriches findings with additional context and cross-references' },
  { id: 'reporter', name: 'Reporter', role: 'Reporting', status: 'idle', model: 'gpt-4o', tasksCompleted: 11, icon: BarChart3, description: 'Compiles final assessment reports with findings and remediation' },
  { id: 'reflector', name: 'Reflector', role: 'Analysis', status: 'idle', model: 'claude-3.5-sonnet', tasksCompleted: 8, icon: Eye, description: 'Reflects on agent performance and suggests improvements' },
  { id: 'tool_call_fixer', name: 'Tool Call Fixer', role: 'Repair', status: 'idle', model: 'gpt-4o-mini', tasksCompleted: 14, icon: Wrench, description: 'Fixes malformed tool calls and recovers from execution errors' },
  { id: 'assistant', name: 'Assistant', role: 'Support', status: 'idle', model: 'gpt-4o-mini', tasksCompleted: 36, icon: MessageSquare, description: 'General-purpose assistant for auxiliary tasks and user interaction' },
]

const TOOLS: ToolDef[] = [
  // Barrier category
  { id: 'terminal', name: 'Terminal', category: 'Barrier', description: 'Execute shell commands in Docker sandbox', usageCount: 342, icon: Terminal },
  { id: 'browser', name: 'Browser', category: 'Barrier', description: 'Web browser for navigation and interaction', usageCount: 218, icon: Globe },
  { id: 'file_read', name: 'File Read', category: 'Barrier', description: 'Read files from the workspace', usageCount: 156, icon: FileText },
  { id: 'file_write', name: 'File Write', category: 'Barrier', description: 'Write files to the workspace', usageCount: 89, icon: Save },
  { id: 'edit_asset', name: 'Edit Asset', category: 'Barrier', description: 'Edit existing assets and configurations', usageCount: 67, icon: Wrench },
  { id: 'list_assets', name: 'List Assets', category: 'Barrier', description: 'List all workspace assets', usageCount: 45, icon: FolderOpen },
  { id: 'download', name: 'Download', category: 'Barrier', description: 'Download files from URLs', usageCount: 78, icon: Download },
  { id: 'upload', name: 'Upload', category: 'Barrier', description: 'Upload files to workspace', usageCount: 34, icon: UploadCloud },
  // Delegation category
  { id: 'delegate_agent', name: 'Delegate Agent', category: 'Delegation', description: 'Delegate tasks to specific agents', usageCount: 194, icon: Users },
  { id: 'send_message', name: 'Send Message', category: 'Delegation', description: 'Send messages between agents', usageCount: 312, icon: Send },
  { id: 'broadcast', name: 'Broadcast', category: 'Delegation', description: 'Broadcast message to all agents', usageCount: 56, icon: Radio },
  { id: 'wait_for_response', name: 'Wait Response', category: 'Delegation', description: 'Wait for agent response', usageCount: 87, icon: Clock },
  // Environment category
  { id: 'docker_exec', name: 'Docker Exec', category: 'Environment', description: 'Execute commands in Docker container', usageCount: 267, icon: Container },
  { id: 'docker_status', name: 'Docker Status', category: 'Environment', description: 'Check Docker container status', usageCount: 123, icon: Monitor },
  { id: 'docker_logs', name: 'Docker Logs', category: 'Environment', description: 'Retrieve container logs', usageCount: 98, icon: History },
  { id: 'port_scan', name: 'Port Scan', category: 'Environment', description: 'Scan target ports and services', usageCount: 145, icon: ScanLine },
  { id: 'network_info', name: 'Network Info', category: 'Environment', description: 'Gather network information', usageCount: 76, icon: Wifi },
  // Search category
  { id: 'google_search', name: 'Google Search', category: 'Search', description: 'Search via Google Custom Search API', usageCount: 189, icon: Search },
  { id: 'bing_search', name: 'Bing Search', category: 'Search', description: 'Search via Bing Web Search API', usageCount: 67, icon: Search },
  { id: 'duckduckgo', name: 'DuckDuckGo', category: 'Search', description: 'Search via DuckDuckGo', usageCount: 45, icon: Search },
  { id: 'shodan', name: 'Shodan', category: 'Search', description: 'IoT/device search via Shodan API', usageCount: 134, icon: Globe2 },
  { id: 'censys', name: 'Censys', category: 'Search', description: 'Internet-wide scanning via Censys', usageCount: 78, icon: Crosshair },
  { id: 'virustotal', name: 'VirusTotal', category: 'Search', description: 'Malware/domain analysis via VirusTotal', usageCount: 56, icon: Shield },
  { id: 'nvd', name: 'NVD Search', category: 'Search', description: 'National Vulnerability Database lookup', usageCount: 43, icon: Bug },
  // VectorStore category
  { id: 'vector_search', name: 'Vector Search', category: 'VectorStore', description: 'Semantic search in vector store', usageCount: 156, icon: Database },
  { id: 'vector_store', name: 'Vector Store', category: 'VectorStore', description: 'Store embeddings in vector DB', usageCount: 89, icon: Database },
  { id: 'vector_delete', name: 'Vector Delete', category: 'VectorStore', description: 'Delete entries from vector store', usageCount: 12, icon: Trash2 },
  { id: 'knowledge_graph', name: 'Knowledge Graph', category: 'VectorStore', description: 'Query and update knowledge graph', usageCount: 67, icon: Network },
  { id: 'embedding_query', name: 'Embedding Query', category: 'VectorStore', description: 'Generate and query embeddings', usageCount: 98, icon: Layers },
  // Result category
  { id: 'report_generate', name: 'Report Generate', category: 'Result', description: 'Generate assessment report', usageCount: 34, icon: FileText },
  { id: 'finding_create', name: 'Finding Create', category: 'Result', description: 'Create a new finding entry', usageCount: 78, icon: AlertTriangle },
  { id: 'evidence_store', name: 'Evidence Store', category: 'Result', description: 'Store evidence for findings', usageCount: 56, icon: Lock },
  { id: 'export_data', name: 'Export Data', category: 'Result', description: 'Export assessment data', usageCount: 23, icon: Download },
]

const LLM_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1', 'o1-mini', 'o3-mini'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-3.5-sonnet', 'claude-3.5-haiku', 'claude-3-opus'] },
  { id: 'google', name: 'Google', models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'] },
  { id: 'mistral', name: 'Mistral', models: ['mistral-large', 'mistral-medium', 'mistral-small', 'codestral'] },
  { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-reasoner'] },
  { id: 'ollama', name: 'Ollama (Local)', models: ['llama3.1', 'qwen2.5', 'codellama', 'mixtral'] },
  { id: 'together', name: 'Together AI', models: ['meta-llama/Llama-3.1-70B', 'Qwen/Qwen2.5-72B'] },
  { id: 'groq', name: 'Groq', models: ['llama-3.1-70b', 'llama-3.1-8b', 'mixtral-8x7b'] },
  { id: 'azure', name: 'Azure OpenAI', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-35-turbo'] },
  { id: 'aws', name: 'AWS Bedrock', models: ['claude-3.5-sonnet', 'claude-3-haiku', 'llama3.1-70b'] },
]

const SEARCH_ENGINES = [
  { id: 'google', name: 'Google Custom Search', apiRequired: true },
  { id: 'bing', name: 'Bing Web Search', apiRequired: true },
  { id: 'duckduckgo', name: 'DuckDuckGo', apiRequired: false },
  { id: 'shodan', name: 'Shodan', apiRequired: true },
  { id: 'censys', name: 'Censys', apiRequired: true },
  { id: 'virustotal', name: 'VirusTotal', apiRequired: true },
  { id: 'nvd', name: 'NVD', apiRequired: false },
]

const SAMPLE_FLOWS: Flow[] = [
  {
    id: 'flow-001',
    name: 'Web App Assessment - Staging',
    target: 'https://staging.target-app.com',
    objective: 'Full security assessment of the staging environment including authentication bypass, injection testing, and privilege escalation',
    scope: ['staging.target-app.com', 'api.staging.target-app.com', 'admin.staging.target-app.com'],
    status: 'running',
    progress: 67,
    createdAt: '2026-06-07 14:30 UTC',
    agents: ['primary_agent', 'pentester', 'searcher', 'coder'],
    findings: 12,
    subtasks: [
      { id: 'st-1', name: 'Passive Reconnaissance', agent: 'searcher', status: 'completed', output: 'Identified 47 subdomains, 3 exposed APIs', duration: '8m 32s' },
      { id: 'st-2', name: 'Port Scanning', agent: 'pentester', status: 'completed', output: 'Found 6 open ports: 80, 443, 8080, 8443, 3000, 5432', duration: '4m 15s' },
      { id: 'st-3', name: 'Web Fingerprinting', agent: 'searcher', status: 'completed', output: 'Nginx 1.24, Node.js backend, PostgreSQL', duration: '2m 48s' },
      { id: 'st-4', name: 'Authentication Testing', agent: 'pentester', status: 'running', output: 'Testing JWT implementation...', duration: '12m ongoing' },
      { id: 'st-5', name: 'SQL Injection Testing', agent: 'pentester', status: 'pending' },
      { id: 'st-6', name: 'XSS Testing', agent: 'pentester', status: 'pending' },
      { id: 'st-7', name: 'API Fuzzing', agent: 'coder', status: 'pending' },
      { id: 'st-8', name: 'Report Generation', agent: 'reporter', status: 'pending' },
    ],
  },
  {
    id: 'flow-002',
    name: 'API Security Audit',
    target: 'https://api.prod.example.com/v2',
    objective: 'Comprehensive API security audit focusing on BOLA, rate limiting, and data exposure',
    scope: ['api.prod.example.com'],
    status: 'completed',
    progress: 100,
    createdAt: '2026-06-06 09:15 UTC',
    agents: ['primary_agent', 'pentester', 'coder'],
    findings: 8,
    subtasks: [
      { id: 'st-1', name: 'API Discovery', agent: 'searcher', status: 'completed', output: 'Discovered 23 endpoints', duration: '6m 12s' },
      { id: 'st-2', name: 'Auth Bypass Testing', agent: 'pentester', status: 'completed', output: 'Found 2 auth bypass vectors', duration: '15m 44s' },
      { id: 'st-3', name: 'BOLA Testing', agent: 'pentester', status: 'completed', output: 'IDOR found on /users/{id}', duration: '11m 23s' },
      { id: 'st-4', name: 'Rate Limit Check', agent: 'coder', status: 'completed', output: 'No rate limiting on login endpoint', duration: '3m 56s' },
      { id: 'st-5', name: 'Report Generation', agent: 'reporter', status: 'completed', output: '8 findings documented', duration: '4m 30s' },
    ],
  },
  {
    id: 'flow-003',
    name: 'Network Penetration Test',
    target: '10.0.0.0/24',
    objective: 'Internal network penetration test with lateral movement simulation',
    scope: ['10.0.0.0/24'],
    status: 'planning',
    progress: 0,
    createdAt: '2026-06-08 02:00 UTC',
    agents: ['primary_agent'],
    findings: 0,
    subtasks: [
      { id: 'st-1', name: 'Network Discovery', agent: 'searcher', status: 'pending' },
      { id: 'st-2', name: 'Service Enumeration', agent: 'pentester', status: 'pending' },
      { id: 'st-3', name: 'Vulnerability Scanning', agent: 'pentester', status: 'pending' },
      { id: 'st-4', name: 'Exploitation', agent: 'coder', status: 'pending' },
      { id: 'st-5', name: 'Lateral Movement', agent: 'pentester', status: 'pending' },
    ],
  },
  {
    id: 'flow-004',
    name: 'OAuth2 Flow Review',
    target: 'https://auth.example.com',
    objective: 'Review OAuth2 implementation for common vulnerabilities',
    scope: ['auth.example.com', 'app.example.com'],
    status: 'failed',
    progress: 35,
    createdAt: '2026-06-05 18:45 UTC',
    agents: ['primary_agent', 'pentester'],
    findings: 2,
    subtasks: [
      { id: 'st-1', name: 'Flow Mapping', agent: 'searcher', status: 'completed', output: 'Authorization code + implicit flows found', duration: '5m 10s' },
      { id: 'st-2', name: 'Token Validation', agent: 'pentester', status: 'failed', output: 'Error: Docker container OOM killed during fuzzing' },
      { id: 'st-3', name: 'Redirect URI Check', agent: 'pentester', status: 'pending' },
    ],
  },
]

const TOOL_EXEC_LOG = [
  { time: '14:32:01', agent: 'searcher', tool: 'google_search', input: '"staging.target-app.com" site:shodan.io', status: 'success', duration: '2.1s' },
  { time: '14:32:04', agent: 'searcher', tool: 'shodan', input: 'hostname:staging.target-app.com', status: 'success', duration: '3.4s' },
  { time: '14:32:08', agent: 'pentester', tool: 'terminal', input: 'nmap -sV staging.target-app.com', status: 'success', duration: '4m 15s' },
  { time: '14:36:25', agent: 'pentester', tool: 'browser', input: 'Navigate to https://staging.target-app.com/login', status: 'success', duration: '1.8s' },
  { time: '14:36:28', agent: 'pentester', tool: 'docker_exec', input: 'sqlmap -u "https://staging.target-app.com/api/search?q=test"', status: 'running', duration: '45s+' },
  { time: '14:37:13', agent: 'searcher', tool: 'censys', input: 'services.tls.certificates.leaf.names:staging.target-app.com', status: 'success', duration: '4.2s' },
  { time: '14:37:18', agent: 'primary_agent', tool: 'delegate_agent', input: 'Delegate auth testing to pentester', status: 'success', duration: '0.3s' },
  { time: '14:37:20', agent: 'memorist', tool: 'vector_store', input: 'Store finding: JWT algorithm confusion', status: 'success', duration: '0.8s' },
  { time: '14:38:01', agent: 'pentester', tool: 'terminal', input: 'curl -H "Authorization: Bearer <tampered_jwt>" https://staging.target-app.com/api/admin', status: 'success', duration: '1.2s' },
  { time: '14:38:05', agent: 'pentester', tool: 'finding_create', input: 'Auth bypass via JWT algorithm confusion', status: 'success', duration: '0.4s' },
  { time: '14:38:10', agent: 'coder', tool: 'terminal', input: 'python3 exploit_jwt.py --target staging.target-app.com', status: 'running', duration: '12s+' },
  { time: '14:38:22', agent: 'tool_call_fixer', tool: 'terminal', input: 'Retry: fix malformed JSON in previous command', status: 'success', duration: '0.9s' },
]

const KNOWLEDGE_DATA: KnowledgeEntry[] = [
  { id: 'k-1', type: 'document', title: 'OWASP Top 10 2025 Reference', content: 'Comprehensive mapping of OWASP Top 10 vulnerabilities with testing methodology...', tags: ['owasp', 'methodology', 'reference'], timestamp: '2026-06-07' },
  { id: 'k-2', type: 'document', title: 'JWT Attack Vectors Cheat Sheet', content: 'Algorithm confusion, weak secrets, none algorithm, jku injection, kid path traversal...', tags: ['jwt', 'authentication', 'cheatsheet'], timestamp: '2026-06-07' },
  { id: 'k-3', type: 'qa', title: 'How to test for IDOR?', content: 'Q: How to test for Insecure Direct Object Reference?\nA: 1) Identify object references in API endpoints 2) Test with different user contexts 3) Check sequential IDs 4) Verify authorization on server side', tags: ['idor', 'authorization', 'testing'], timestamp: '2026-06-06' },
  { id: 'k-4', type: 'qa', title: 'SSRF mitigation strategies?', content: 'Q: What are SSRF mitigation strategies?\nA: 1) URL allowlisting 2) Disable redirects 3) Block private IPs 4) Use DNS pinning 5) Network segmentation', tags: ['ssrf', 'mitigation', 'defense'], timestamp: '2026-06-06' },
  { id: 'k-5', type: 'graph', title: 'Attack Chain: Auth Bypass → Lateral Movement', content: 'JWT confusion → Admin API access → Service account token → Internal API → Database credentials → Data exfiltration', tags: ['attack-chain', 'lateral-movement', 'auth-bypass'], timestamp: '2026-06-07' },
  { id: 'k-6', type: 'document', title: 'Docker Escape Techniques', content: 'Container breakout methods including privileged containers, mount escapes, cgroup exploits...', tags: ['docker', 'container', 'escape'], timestamp: '2026-06-05' },
  { id: 'k-7', type: 'graph', title: 'Network Topology: Target Infrastructure', content: 'Load Balancer (nginx) → Web Servers (Node.js) → API Gateway → Microservices → PostgreSQL → Redis Cache', tags: ['infrastructure', 'topology', 'recon'], timestamp: '2026-06-07' },
  { id: 'k-8', type: 'qa', title: 'SQL Injection bypass WAF?', content: 'Q: How to bypass WAF for SQL injection?\nA: 1) Case variation 2) Comments 3) Encoding 4) Whitespace alternatives 5) HTTP parameter pollution', tags: ['sqli', 'waf-bypass', 'evasion'], timestamp: '2026-06-05' },
]

// =================== SUB-COMPONENTS ===================

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    running: 'bg-green-500 animate-pulse',
    busy: 'bg-pink-500 animate-pulse',
    idle: 'bg-zinc-500',
    error: 'bg-red-500',
    failed: 'bg-red-500',
    offline: 'bg-zinc-700',
    completed: 'bg-green-500',
    planning: 'bg-yellow-500 animate-pulse',
    paused: 'bg-yellow-600',
    pending: 'bg-zinc-600',
    success: 'bg-green-500',
  }
  return <div className={`size-2 rounded-full shrink-0 ${colors[status] || 'bg-zinc-600'}`} />
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e', info: '#3b82f6' }
  const color = colors[severity] || '#6b7280'
  return (
    <Badge variant="outline" className="text-[10px] font-mono uppercase" style={{ borderColor: `${color}40`, color, backgroundColor: `${color}10` }}>
      {severity}
    </Badge>
  )
}

function KPICard({ title, value, subtitle, icon: Icon, color }: {
  title: string; value: string | number; subtitle?: string; icon: LucideIcon; color: string
}) {
  return (
    <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">{title}</p>
            <p className="text-xl font-bold mt-0.5" style={{ color }}>{value}</p>
            {subtitle && <p className="text-[10px] text-zinc-600 mt-0.5">{subtitle}</p>}
          </div>
          <div className="size-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Icon className="size-3.5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// =================== FLOWS TAB ===================

function FlowsTab() {
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTarget, setNewTarget] = useState('')
  const [newObjective, setNewObjective] = useState('')
  const [newScope, setNewScope] = useState('')
  const [newName, setNewName] = useState('')

  const flow = selectedFlow ? SAMPLE_FLOWS.find(f => f.id === selectedFlow) : null

  if (showCreateForm) {
    return (
      <div className="p-4 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
            <Plus className="size-4" style={{ color: PINK }} />
            New Pentest Flow
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)} className="text-zinc-500 hover:text-zinc-200 hover:bg-white/5 text-xs">
            Cancel
          </Button>
        </div>
        <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200">Target Configuration</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Define the target and assessment parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs">Flow Name</Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g., Web App Assessment - Production" className="bg-black/30 border-white/10 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-pink-500/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs">Target URL *</Label>
              <Input value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="https://target.example.com" className="bg-black/30 border-white/10 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-pink-500/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs">Objective</Label>
              <Textarea value={newObjective} onChange={e => setNewObjective(e.target.value)} placeholder="Describe the assessment objective, methodology, and any specific areas of concern..." className="bg-black/30 border-white/10 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-pink-500/40 min-h-[80px]" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs">Scope (one per line)</Label>
              <Textarea value={newScope} onChange={e => setNewScope(e.target.value)} placeholder={"staging.target.com\napi.staging.target.com"} className="bg-black/30 border-white/10 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-pink-500/40 min-h-[60px] font-mono text-xs" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button size="sm" style={{ backgroundColor: PINK }} className="text-white hover:opacity-90 text-xs">
                <Play className="size-3 mr-1.5" /> Launch Flow
              </Button>
              <Button variant="outline" size="sm" className="border-white/10 text-zinc-400 hover:text-zinc-200 text-xs">
                Save as Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (flow) {
    return (
      <div className="p-4 max-w-5xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedFlow(null)} className="text-zinc-500 hover:text-zinc-200 hover:bg-white/5 text-xs h-7 px-2">
            <ChevronRight className="size-3 rotate-180 mr-1" /> Flows
          </Button>
          <ChevronRight className="size-3 text-zinc-600" />
          <span className="text-xs text-zinc-300 font-mono">{flow.name}</span>
        </div>

        {/* Flow Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
              <Target className="size-4" style={{ color: PINK }} />
              {flow.name}
              <Badge variant="outline" className="text-[9px] font-mono" style={{ borderColor: `${PINK}40`, color: PINK, backgroundColor: `${PINK}10` }}>
                {flow.status}
              </Badge>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">{flow.target}</p>
          </div>
          <div className="flex gap-2">
            {flow.status === 'running' && (
              <Button variant="outline" size="sm" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-xs h-7">
                <Square className="size-3 mr-1" /> Pause
              </Button>
            )}
            <Button variant="outline" size="sm" className="border-white/10 text-zinc-400 hover:text-zinc-200 text-xs h-7">
              <FileText className="size-3 mr-1" /> Report
            </Button>
          </div>
        </div>

        {/* Progress */}
        <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400">Progress</span>
              <span className="text-xs font-mono" style={{ color: PINK }}>{flow.progress}%</span>
            </div>
            <Progress value={flow.progress} className="h-2 bg-white/5" />
            <div className="flex items-center gap-4 mt-2 text-[10px] text-zinc-500 font-mono">
              <span>Created: {flow.createdAt}</span>
              <span>Findings: {flow.findings}</span>
              <span>Agents: {flow.agents.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Subtasks / Execution Timeline */}
        <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
              <GitBranch className="size-4" style={{ color: PINK }} />
              Execution Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {flow.subtasks.map((st, i) => (
                <div key={st.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <div className="flex flex-col items-center mt-1">
                    <StatusDot status={st.status} />
                    {i < flow.subtasks.length - 1 && <div className="w-px h-6 bg-white/10 mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-200 font-medium">{st.name}</span>
                      <Badge variant="outline" className="text-[9px] border-white/10 text-zinc-500 bg-transparent font-mono">
                        {st.agent}
                      </Badge>
                      {st.duration && (
                        <span className="text-[10px] text-zinc-600 font-mono flex items-center gap-1">
                          <Timer className="size-2.5" /> {st.duration}
                        </span>
                      )}
                    </div>
                    {st.output && (
                      <p className="text-[11px] text-zinc-500 mt-0.5 font-mono truncate">{st.output}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {st.status === 'completed' && <CheckCircle2 className="size-3.5 text-green-500" />}
                    {st.status === 'running' && <Loader2 className="size-3.5 text-pink-500 animate-spin" />}
                    {st.status === 'failed' && <XCircle className="size-3.5 text-red-500" />}
                    {st.status === 'pending' && <Clock className="size-3.5 text-zinc-600" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scope */}
        <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
              <Crosshair className="size-4" style={{ color: PINK }} />
              Scope
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {flow.scope.map(s => (
                <Badge key={s} variant="outline" className="text-[10px] font-mono border-white/10 text-zinc-400 bg-white/[0.02]">
                  <Globe className="size-2.5 mr-1" /> {s}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Findings Summary */}
        {flow.findings > 0 && (
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                <AlertTriangle className="size-4" style={{ color: PINK }} />
                Findings ({flow.findings})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                  <div className="text-lg font-bold text-red-400">3</div>
                  <div className="text-[10px] text-red-400/60 uppercase font-mono">Critical</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-orange-500/5 border border-orange-500/10">
                  <div className="text-lg font-bold text-orange-400">4</div>
                  <div className="text-[10px] text-orange-400/60 uppercase font-mono">High</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                  <div className="text-lg font-bold text-yellow-400">3</div>
                  <div className="text-[10px] text-yellow-400/60 uppercase font-mono">Medium</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <div className="text-lg font-bold text-blue-400">2</div>
                  <div className="text-[10px] text-blue-400/60 uppercase font-mono">Low</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <KPICard title="Active Flows" value={1} icon={Activity} color={PINK} />
        <KPICard title="Completed" value={1} icon={CheckCircle2} color="#22c55e" />
        <KPICard title="Planning" value={1} icon={Clock} color="#eab308" />
        <KPICard title="Failed" value={1} icon={XCircle} color="#ef4444" />
        <KPICard title="Total Findings" value={22} icon={AlertTriangle} color="#f97316" />
      </div>

      {/* Active Flows List */}
      <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
              <Layers className="size-4" style={{ color: PINK }} />
              Flows
            </CardTitle>
            <Button size="sm" style={{ backgroundColor: PINK }} className="text-white hover:opacity-90 text-xs h-7" onClick={() => setShowCreateForm(true)}>
              <Plus className="size-3 mr-1" /> New Flow
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {SAMPLE_FLOWS.map(f => (
              <div
                key={f.id}
                onClick={() => setSelectedFlow(f.id)}
                className="flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] cursor-pointer transition-all"
              >
                <StatusDot status={f.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-200 font-medium truncate">{f.name}</span>
                    <Badge variant="outline" className="text-[9px] font-mono shrink-0" style={{
                      borderColor: f.status === 'running' ? `${PINK}40` : f.status === 'completed' ? '#22c55e40' : f.status === 'failed' ? '#ef444440' : '#eab30840',
                      color: f.status === 'running' ? PINK : f.status === 'completed' ? '#22c55e' : f.status === 'failed' ? '#ef4444' : '#eab308',
                      backgroundColor: f.status === 'running' ? `${PINK}10` : f.status === 'completed' ? '#22c55e10' : f.status === 'failed' ? '#ef444410' : '#eab30810',
                    }}>
                      {f.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5 truncate">{f.target}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono" style={{ color: PINK }}>{f.progress}%</div>
                  <div className="text-[10px] text-zinc-600 font-mono">{f.findings} findings</div>
                </div>
                <ChevronRight className="size-4 text-zinc-600 shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =================== TERMINAL TAB ===================

function TerminalTab() {
  const [input, setInput] = useState('')
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 1, type: 'system', content: 'PentAGI Terminal v2.4.0 — Docker sandboxed environment', timestamp: '14:30:00' },
    { id: 2, type: 'system', content: 'Container: pentagi-sandbox-01 (Alpine Linux 3.19, Python 3.12, Go 1.22)', timestamp: '14:30:00' },
    { id: 3, type: 'system', content: 'Tools: nmap 7.94, sqlmap 1.8, nikto 2.5, gobuster 3.6, httpx 1.6', timestamp: '14:30:00' },
    { id: 4, type: 'system', content: '───────────────────────────────────────────────────', timestamp: '14:30:00' },
    { id: 5, type: 'input', content: 'nmap -sV -p 80,443,8080,8443,3000,5432 staging.target-app.com', timestamp: '14:32:08' },
    { id: 6, type: 'output', content: 'Starting Nmap 7.94 ( https://nmap.org )', timestamp: '14:32:08' },
    { id: 7, type: 'output', content: 'Nmap scan report for staging.target-app.com (10.0.1.50)', timestamp: '14:34:22' },
    { id: 8, type: 'output', content: 'PORT     STATE SERVICE  VERSION', timestamp: '14:34:22' },
    { id: 9, type: 'output', content: '80/tcp   open  http     nginx 1.24.0', timestamp: '14:34:22' },
    { id: 10, type: 'output', content: '443/tcp  open  ssl/http nginx 1.24.0', timestamp: '14:34:22' },
    { id: 11, type: 'output', content: '3000/tcp open  http     Node.js Express', timestamp: '14:34:22' },
    { id: 12, type: 'output', content: '5432/tcp filtered postgresql', timestamp: '14:34:22' },
    { id: 13, type: 'output', content: 'Service detection performed.', timestamp: '14:34:22' },
    { id: 14, type: 'input', content: 'sqlmap -u "https://staging.target-app.com/api/search?q=test" --dbs --batch', timestamp: '14:36:25' },
    { id: 15, type: 'output', content: '[*] starting @ 14:36:25 /2026', timestamp: '14:36:25' },
    { id: 16, type: 'output', content: '[14:36:28] [INFO] testing connection to the target URL', timestamp: '14:36:28' },
    { id: 17, type: 'output', content: '[14:36:30] [INFO] testing if the target URL content is stable', timestamp: '14:36:30' },
    { id: 18, type: 'output', content: '[14:36:33] [INFO] testing for SQL injection on parameter \'q\'', timestamp: '14:36:33' },
    { id: 19, type: 'output', content: '[14:36:45] [WARNING] GET parameter \'q\' appears to be \'AND boolean-based blind\' injectable', timestamp: '14:36:45' },
    { id: 20, type: 'error', content: '[14:37:01] [CRITICAL] connection timed out to the target URL', timestamp: '14:37:01' },
  ])
  const [containerStatus] = useState({
    name: 'pentagi-sandbox-01',
    image: 'pentagi/sandbox:latest',
    status: 'Running',
    cpu: '23.4%',
    memory: '412MB / 2GB',
    network: '12.3MB In / 8.7MB Out',
    uptime: '2h 15m',
  })
  const scrollRef = useRef<HTMLDivElement>(null)
  const lineIdRef = useRef(21)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const handleCommand = useCallback(() => {
    if (!input.trim()) return
    const newLine: TerminalLine = { id: lineIdRef.current++, type: 'input', content: input, timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) }
    const outputLine: TerminalLine = { id: lineIdRef.current++, type: 'output', content: `$ ${input}: command executed in Docker sandbox`, timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) }
    setLines(prev => [...prev, newLine, outputLine])
    setInput('')
  }, [input])

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Terminal */}
        <div className="lg:col-span-3">
          <Card className="bg-black/60 border-white/5 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-black/40">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-red-500/60" />
                <div className="size-2.5 rounded-full bg-yellow-500/60" />
                <div className="size-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-[10px] text-zinc-500 font-mono ml-2">pentagi@sandbox:~$</span>
              <div className="ml-auto flex gap-2">
                <Badge variant="outline" className="text-[9px] border-green-500/20 text-green-400/80 bg-green-500/5 font-mono h-5">
                  <div className="size-1.5 rounded-full bg-green-500 mr-1 animate-pulse" /> Connected
                </Badge>
              </div>
            </div>
            <div className="h-[420px] overflow-y-auto" ref={scrollRef}>
              <div className="p-3 font-mono text-xs space-y-0.5">
                {lines.map(line => (
                  <div key={line.id} className="flex gap-2">
                    <span className="text-zinc-700 shrink-0 select-none">{line.timestamp}</span>
                    <span className={
                      line.type === 'input' ? 'text-pink-400' :
                      line.type === 'output' ? 'text-zinc-300' :
                      line.type === 'error' ? 'text-red-400' :
                      'text-cyan-400'
                    }>
                      {line.type === 'input' && <span className="text-pink-500 mr-1">$</span>}
                      {line.type === 'error' && <span className="text-red-500 mr-1">!</span>}
                      {line.type === 'system' && <span className="text-cyan-500 mr-1">*</span>}
                      {line.content}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border-t border-white/5 bg-black/40">
              <span className="text-pink-500 font-mono text-xs">$</span>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCommand() }}
                placeholder="Enter command..."
                className="flex-1 bg-transparent text-zinc-200 font-mono text-xs outline-none placeholder:text-zinc-700"
              />
              <Button size="sm" variant="ghost" onClick={handleCommand} className="text-zinc-500 hover:text-zinc-200 hover:bg-white/5 h-6 px-2 text-xs">
                <Send className="size-3" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Docker Container Status */}
        <div className="space-y-4">
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                <Container className="size-4" style={{ color: PINK }} />
                Container
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[
                { label: 'Name', value: containerStatus.name },
                { label: 'Image', value: containerStatus.image },
                { label: 'Status', value: containerStatus.status },
                { label: 'CPU', value: containerStatus.cpu },
                { label: 'Memory', value: containerStatus.memory },
                { label: 'Network', value: containerStatus.network },
                { label: 'Uptime', value: containerStatus.uptime },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">{item.label}</span>
                  <span className="text-[11px] text-zinc-300 font-mono">{item.value}</span>
                </div>
              ))}
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">CPU</span>
                <span className="text-[11px] text-zinc-300 font-mono">23.4%</span>
              </div>
              <Progress value={23.4} className="h-1.5 bg-white/5" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Memory</span>
                <span className="text-[11px] text-zinc-300 font-mono">412/2048 MB</span>
              </div>
              <Progress value={20} className="h-1.5 bg-white/5" />
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                <History className="size-4" style={{ color: PINK }} />
                Command History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[140px]">
                <div className="space-y-1">
                  {[
                    { cmd: 'nmap -sV staging.target-app.com', time: '14:32' },
                    { cmd: 'sqlmap -u "https://.../api/search?q=test"', time: '14:36' },
                    { cmd: 'curl -H "Authorization: Bearer ..." /api/admin', time: '14:38' },
                    { cmd: 'python3 exploit_jwt.py --target ...', time: '14:38' },
                    { cmd: 'nikto -h https://staging.target-app.com', time: '14:41' },
                    { cmd: 'gobuster dir -u https://... -w /usr/share/wordlists/common.txt', time: '14:45' },
                    { cmd: 'httpx -l subdomains.txt -status-code -title', time: '14:50' },
                    { cmd: 'nuclei -u https://staging.target-app.com -t cves/', time: '14:55' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/[0.02] cursor-pointer group">
                      <span className="text-[10px] text-zinc-600 font-mono shrink-0">{item.time}</span>
                      <span className="text-[11px] text-zinc-400 font-mono truncate group-hover:text-zinc-200 transition-colors">{item.cmd}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// =================== AGENTS TAB ===================

function AgentsTab() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [delegationTarget, setDelegationTarget] = useState('')
  const [delegationTask, setDelegationTask] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'agent'; content: string; timestamp: string }>>([
    { role: 'agent', content: 'Primary Agent reporting. Currently coordinating the recon phase for staging.target-app.com. The searcher has identified 47 subdomains and 3 exposed API endpoints.', timestamp: '14:32:00' },
    { role: 'user', content: 'What are the most critical findings so far?', timestamp: '14:33:15' },
    { role: 'agent', content: 'Critical findings: 1) JWT algorithm confusion vulnerability on auth endpoint, 2) Exposed PostgreSQL port (5432) filtered but detected, 3) Admin panel accessible at /admin with default credentials potential. The pentester agent is currently validating these.', timestamp: '14:33:22' },
  ])

  const agent = selectedAgent ? AGENTS.find(a => a.id === selectedAgent) : null

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return
    setChatMessages(prev => [...prev, { role: 'user', content: chatMessage, timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) }])
    setChatMessage('')
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'agent', content: 'Processing your request. I\'ll delegate this to the appropriate agent and report back with findings.', timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) }])
    }, 1000)
  }

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <KPICard title="Active" value={3} icon={Users} color={PINK} />
        <KPICard title="Idle" value={10} icon={Clock} color="#6b7280" />
        <KPICard title="Error" value={1} icon={XCircle} color="#ef4444" />
        <KPICard title="Tasks Done" value={356} icon={CheckCircle2} color="#22c55e" />
        <KPICard title="Delegations" value={94} icon={Send} color="#06b6d4" />
        <KPICard title="Avg Response" value="2.3s" icon={Gauge} color="#eab308" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Agent Cards Grid */}
        <div className="lg:col-span-2">
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                <Users className="size-4" style={{ color: PINK }} />
                Agent Network ({AGENTS.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AGENTS.map(a => {
                  const AgentIcon = a.icon
                  const isSelected = selectedAgent === a.id
                  return (
                    <div
                      key={a.id}
                      onClick={() => setSelectedAgent(isSelected ? null : a.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-pink-500/30 bg-pink-500/5'
                          : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${PINK}15` }}>
                          <AgentIcon className="size-4" style={{ color: PINK }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-200 font-medium truncate">{a.name}</span>
                            <StatusDot status={a.status} />
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-zinc-500 font-mono">{a.role}</span>
                            <span className="text-[10px] text-zinc-600">·</span>
                            <span className="text-[10px] text-zinc-600 font-mono">{a.model}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-600 font-mono shrink-0">{a.tasksCompleted} tasks</span>
                      </div>
                      {a.currentTask && (
                        <div className="mt-2 pl-10">
                          <div className="flex items-center gap-1.5">
                            <Loader2 className="size-3 text-pink-500 animate-spin" />
                            <span className="text-[10px] text-zinc-400 truncate">{a.currentTask}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Detail / Delegation / Chat */}
        <div className="space-y-4">
          {/* Agent Detail */}
          {agent && (
            <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                  <agent.icon className="size-4" style={{ color: PINK }} />
                  {agent.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <p className="text-[11px] text-zinc-400">{agent.description}</p>
                <Separator className="bg-white/5" />
                {[
                  { label: 'Status', value: agent.status },
                  { label: 'Model', value: agent.model },
                  { label: 'Role', value: agent.role },
                  { label: 'Tasks Completed', value: String(agent.tasksCompleted) },
                  { label: 'Current Task', value: agent.currentTask || 'None' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono">{item.label}</span>
                    <span className="text-[11px] text-zinc-300 font-mono text-right max-w-[60%] truncate">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Agent Delegation */}
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                <Send className="size-4" style={{ color: PINK }} />
                Delegate Task
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-[10px] uppercase font-mono">Target Agent</Label>
                <Select value={delegationTarget} onValueChange={setDelegationTarget}>
                  <SelectTrigger className="bg-black/30 border-white/10 text-zinc-200 text-xs h-8">
                    <SelectValue placeholder="Select agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENTS.map(a => (
                      <SelectItem key={a.id} value={a.id} className="text-xs">{a.name} ({a.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-[10px] uppercase font-mono">Task Description</Label>
                <Textarea value={delegationTask} onChange={e => setDelegationTask(e.target.value)} placeholder="Describe the task to delegate..." className="bg-black/30 border-white/10 text-zinc-200 placeholder:text-zinc-600 text-xs min-h-[60px]" />
              </div>
              <Button size="sm" style={{ backgroundColor: PINK }} className="text-white hover:opacity-90 text-xs w-full">
                <Send className="size-3 mr-1.5" /> Delegate
              </Button>
            </CardContent>
          </Card>

          {/* Agent Chat */}
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                <MessageSquare className="size-4" style={{ color: PINK }} />
                Agent Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[160px] mb-3">
                <div className="space-y-2">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`size-5 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-500/20' : ''}`} style={msg.role === 'agent' ? { backgroundColor: `${PINK}20` } : {}}>
                        {msg.role === 'agent' ? <Bot className="size-3" style={{ color: PINK }} /> : <Users className="size-3 text-blue-400" />}
                      </div>
                      <div className={`max-w-[80%] p-2 rounded-lg text-[11px] ${msg.role === 'user' ? 'bg-blue-500/10 text-blue-200' : 'bg-white/5 text-zinc-300'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSendMessage() }}
                  placeholder="Ask the agents..."
                  className="bg-black/30 border-white/10 text-zinc-200 placeholder:text-zinc-600 text-xs h-8"
                />
                <Button size="sm" variant="ghost" onClick={handleSendMessage} className="text-zinc-500 hover:text-zinc-200 hover:bg-white/5 h-8 px-2">
                  <Send className="size-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Assignments */}
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                <Fingerprint className="size-4" style={{ color: PINK }} />
                Current Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[140px]">
                <div className="space-y-2">
                  {AGENTS.filter(a => a.currentTask).map(a => (
                    <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                      <StatusDot status={a.status} />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] text-zinc-300 font-medium">{a.name}</span>
                        <p className="text-[10px] text-zinc-500 truncate">{a.currentTask}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// =================== TOOLS TAB ===================

function ToolsTab() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const categories = ['all', ...Array.from(new Set(TOOLS.map(t => t.category)))]

  const filteredTools = selectedCategory === 'all' ? TOOLS : TOOLS.filter(t => t.category === selectedCategory)

  const categoryColors: Record<string, string> = {
    Barrier: '#ef4444',
    Delegation: '#06b6d4',
    Environment: '#22c55e',
    Search: '#eab308',
    VectorStore: '#8b5cf6',
    Result: PINK,
  }

  const totalUsage = TOOLS.reduce((sum, t) => sum + t.usageCount, 0)

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <KPICard title="Total Tools" value={TOOLS.length} icon={Wrench} color={PINK} />
        <KPICard title="Total Usage" value={totalUsage.toLocaleString()} icon={BarChart3} color="#06b6d4" />
        <KPICard title="Categories" value={categories.length - 1} icon={Layers} color="#22c55e" />
        <KPICard title="Most Used" value="Terminal" icon={Command} color="#eab308" />
        <KPICard title="Active Now" value={2} icon={Activity} color="#ef4444" />
        <KPICard title="Avg/Session" value="47" icon={Gauge} color="#8b5cf6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tool Cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-all ${
                  selectedCategory === cat
                    ? 'border-pink-500/30 bg-pink-500/10 text-pink-300'
                    : 'border-white/5 bg-white/[0.02] text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                }`}
              >
                {cat === 'all' ? 'All Tools' : cat}
                {cat !== 'all' && (
                  <span className="ml-1 text-[9px] opacity-60">({TOOLS.filter(t => t.category === cat).length})</span>
                )}
              </button>
            ))}
          </div>

          {/* Tool Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredTools.map(tool => {
              const ToolIcon = tool.icon
              const catColor = categoryColors[tool.category] || PINK
              return (
                <div key={tool.id} className="p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02] transition-all group">
                  <div className="flex items-start gap-2.5">
                    <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${catColor}15` }}>
                      <ToolIcon className="size-3.5" style={{ color: catColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-200 font-medium group-hover:text-white transition-colors">{tool.name}</span>
                        <Badge variant="outline" className="text-[8px] font-mono h-4 px-1" style={{ borderColor: `${catColor}30`, color: catColor, backgroundColor: `${catColor}08` }}>
                          {tool.category}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2">{tool.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] text-zinc-600 font-mono flex items-center gap-1">
                          <Activity className="size-2.5" /> {tool.usageCount} uses
                        </span>
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min((tool.usageCount / 350) * 100, 100)}%`, backgroundColor: catColor }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tool Usage Stats & Execution Log */}
        <div className="space-y-4">
          {/* Usage by Category */}
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                <BarChart3 className="size-4" style={{ color: PINK }} />
                Usage by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from(new Set(TOOLS.map(t => t.category))).map(cat => {
                const catTools = TOOLS.filter(t => t.category === cat)
                const catTotal = catTools.reduce((s, t) => s + t.usageCount, 0)
                const catColor = categoryColors[cat] || PINK
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono" style={{ color: catColor }}>{cat}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{catTotal} calls ({catTools.length} tools)</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(catTotal / totalUsage) * 100}%`, backgroundColor: catColor }} />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Execution Log */}
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                <History className="size-4" style={{ color: PINK }} />
                Execution Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-1.5">
                  {TOOL_EXEC_LOG.map((entry, i) => (
                    <div key={i} className="p-2 rounded border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] text-zinc-600 font-mono">{entry.time}</span>
                        <Badge variant="outline" className="text-[8px] font-mono h-4 px-1" style={{ borderColor: `${PINK}30`, color: PINK }}>
                          {entry.agent}
                        </Badge>
                        <Badge variant="outline" className="text-[8px] font-mono h-4 px-1 border-white/10 text-zinc-400">
                          {entry.tool}
                        </Badge>
                        <span className="ml-auto">
                          {entry.status === 'success' ? (
                            <CheckCircle2 className="size-3 text-green-500" />
                          ) : (
                            <Loader2 className="size-3 text-pink-500 animate-spin" />
                          )}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">{entry.input}</p>
                      <span className="text-[9px] text-zinc-600 font-mono">{entry.duration}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// =================== KNOWLEDGE TAB ===================

function KnowledgeTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<'browse' | 'search' | 'graph' | 'upload' | 'qa'>('browse')

  const entry = selectedEntry ? KNOWLEDGE_DATA.find(k => k.id === selectedEntry) : null

  const filteredEntries = searchQuery
    ? KNOWLEDGE_DATA.filter(k =>
        k.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : KNOWLEDGE_DATA

  const typeIcons: Record<string, LucideIcon> = {
    document: FileText,
    qa: HelpCircle,
    graph: Network,
  }

  const typeColors: Record<string, string> = {
    document: '#06b6d4',
    qa: '#22c55e',
    graph: '#8b5cf6',
  }

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <KPICard title="Documents" value={KNOWLEDGE_DATA.filter(k => k.type === 'document').length} icon={FileText} color="#06b6d4" />
        <KPICard title="Q&A Pairs" value={KNOWLEDGE_DATA.filter(k => k.type === 'qa').length} icon={HelpCircle} color="#22c55e" />
        <KPICard title="Graph Nodes" value={KNOWLEDGE_DATA.filter(k => k.type === 'graph').length} icon={Network} color="#8b5cf6" />
        <KPICard title="Embeddings" value={1247} icon={Layers} color={PINK} />
        <KPICard title="Vector Size" value="1536d" icon={Database} color="#eab308" />
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-black/40 rounded-lg border border-white/5 p-1 w-fit">
        {(['browse', 'search', 'graph', 'upload', 'qa'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-mono transition-all ${
              activeSubTab === tab
                ? 'text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            style={activeSubTab === tab ? { backgroundColor: `${PINK}20`, color: PINK } : {}}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {activeSubTab === 'browse' && (
            <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                    <BookOpen className="size-4" style={{ color: PINK }} />
                    Vector Store Browser
                  </CardTitle>
                  <div className="relative w-48">
                    <Search className="size-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <Input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Filter entries..."
                      className="bg-black/30 border-white/10 text-zinc-200 placeholder:text-zinc-600 text-xs h-7 pl-8"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredEntries.map(k => {
                    const KIcon = typeIcons[k.type] || FileText
                    const kColor = typeColors[k.type] || PINK
                    const isSelected = selectedEntry === k.id
                    return (
                      <div
                        key={k.id}
                        onClick={() => setSelectedEntry(isSelected ? null : k.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-pink-500/20 bg-pink-500/5'
                            : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="size-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${kColor}15` }}>
                            <KIcon className="size-3.5" style={{ color: kColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-zinc-200 font-medium">{k.title}</span>
                              <Badge variant="outline" className="text-[8px] font-mono h-4 px-1" style={{ borderColor: `${kColor}30`, color: kColor }}>
                                {k.type}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2">{k.content}</p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {k.tags.map(tag => (
                                <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500 font-mono">
                                  {tag}
                                </span>
                              ))}
                              <span className="text-[9px] text-zinc-600 font-mono ml-auto">{k.timestamp}</span>
                            </div>
                          </div>
                          {k.similarity !== undefined && (
                            <span className="text-[10px] font-mono shrink-0" style={{ color: PINK }}>{(k.similarity * 100).toFixed(1)}%</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSubTab === 'search' && (
            <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                  <Search className="size-4" style={{ color: PINK }} />
                  Semantic Search
                </CardTitle>
                <CardDescription className="text-zinc-500 text-xs">Search the knowledge base using natural language queries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="How to test for SQL injection bypasses?" className="bg-black/30 border-white/10 text-zinc-200 placeholder:text-zinc-600 text-xs flex-1" />
                  <Button size="sm" style={{ backgroundColor: PINK }} className="text-white hover:opacity-90 text-xs">
                    <Search className="size-3 mr-1.5" /> Search
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Recent Queries</p>
                  {['JWT attack vectors', 'SSRF mitigation strategies', 'Docker escape techniques', 'IDOR testing methodology'].map(q => (
                    <div key={q} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] cursor-pointer transition-colors">
                      <Search className="size-3 text-zinc-600" />
                      <span className="text-[11px] text-zinc-400">{q}</span>
                      <ArrowUpRight className="size-3 text-zinc-600 ml-auto" />
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-lg bg-pink-500/5 border border-pink-500/10">
                  <p className="text-[10px] text-zinc-400 mb-1 font-mono">Search Configuration</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500">Embedding Model</span>
                      <span className="text-[10px] text-zinc-300 font-mono">text-embedding-3-small</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500">Distance Metric</span>
                      <span className="text-[10px] text-zinc-300 font-mono">cosine</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500">Top K Results</span>
                      <span className="text-[10px] text-zinc-300 font-mono">5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500">Min Similarity</span>
                      <span className="text-[10px] text-zinc-300 font-mono">0.75</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSubTab === 'graph' && (
            <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                  <Network className="size-4" style={{ color: PINK }} />
                  Knowledge Graph
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-[400px] bg-black/20 rounded-lg border border-white/5 overflow-hidden">
                  {/* Simplified graph visualization */}
                  <svg width="100%" height="100%" viewBox="0 0 600 400" className="absolute inset-0">
                    {/* Edges */}
                    <line x1="300" y1="80" x2="150" y2="180" stroke="#ec489930" strokeWidth="1.5" />
                    <line x1="300" y1="80" x2="450" y2="180" stroke="#ec489930" strokeWidth="1.5" />
                    <line x1="150" y1="180" x2="100" y2="300" stroke="#8b5cf630" strokeWidth="1" />
                    <line x1="150" y1="180" x2="220" y2="300" stroke="#8b5cf630" strokeWidth="1" />
                    <line x1="450" y1="180" x2="380" y2="300" stroke="#06b6d630" strokeWidth="1" />
                    <line x1="450" y1="180" x2="520" y2="300" stroke="#06b6d630" strokeWidth="1" />
                    <line x1="300" y1="80" x2="300" y2="200" stroke="#ec489930" strokeWidth="1" />
                    <line x1="300" y1="200" x2="300" y2="320" stroke="#22c55e30" strokeWidth="1" />
                    <line x1="150" y1="180" x2="300" y2="200" stroke="#ec489920" strokeWidth="1" strokeDasharray="4" />
                    <line x1="450" y1="180" x2="300" y2="200" stroke="#ec489920" strokeWidth="1" strokeDasharray="4" />
                    {/* Nodes */}
                    <circle cx="300" cy="80" r="24" fill="#ec489920" stroke="#ec4899" strokeWidth="1.5" />
                    <text x="300" y="84" textAnchor="middle" fill="#ec4899" fontSize="8" fontFamily="monospace">Target</text>
                    <circle cx="150" cy="180" r="20" fill="#8b5cf620" stroke="#8b5cf6" strokeWidth="1" />
                    <text x="150" y="184" textAnchor="middle" fill="#8b5cf6" fontSize="7" fontFamily="monospace">Auth</text>
                    <circle cx="450" cy="180" r="20" fill="#06b6d620" stroke="#06b6d6" strokeWidth="1" />
                    <text x="450" y="184" textAnchor="middle" fill="#06b6d6" fontSize="7" fontFamily="monospace">Infra</text>
                    <circle cx="100" cy="300" r="16" fill="#ef444420" stroke="#ef4444" strokeWidth="1" />
                    <text x="100" y="304" textAnchor="middle" fill="#ef4444" fontSize="6" fontFamily="monospace">JWT</text>
                    <circle cx="220" cy="300" r="16" fill="#ef444420" stroke="#ef4444" strokeWidth="1" />
                    <text x="220" y="304" textAnchor="middle" fill="#ef4444" fontSize="6" fontFamily="monospace">IDOR</text>
                    <circle cx="380" cy="300" r="16" fill="#22c55e20" stroke="#22c55e" strokeWidth="1" />
                    <text x="380" y="304" textAnchor="middle" fill="#22c55e" fontSize="6" fontFamily="monospace">Nginx</text>
                    <circle cx="520" cy="300" r="16" fill="#22c55e20" stroke="#22c55e" strokeWidth="1" />
                    <text x="520" y="304" textAnchor="middle" fill="#22c55e" fontSize="6" fontFamily="monospace">PGSQL</text>
                    <circle cx="300" cy="200" r="18" fill="#eab30820" stroke="#eab308" strokeWidth="1" />
                    <text x="300" y="204" textAnchor="middle" fill="#eab308" fontSize="7" fontFamily="monospace">Attack</text>
                    <circle cx="300" cy="320" r="16" fill="#ef444420" stroke="#ef4444" strokeWidth="1" />
                    <text x="300" y="324" textAnchor="middle" fill="#ef4444" fontSize="6" fontFamily="monospace">Escape</text>
                  </svg>
                  {/* Legend */}
                  <div className="absolute bottom-2 right-2 p-2 rounded bg-black/80 border border-white/10">
                    <div className="text-[8px] text-zinc-500 uppercase font-mono mb-1">Legend</div>
                    {[
                      { color: '#ec4899', label: 'Target' },
                      { color: '#8b5cf6', label: 'Vulnerability' },
                      { color: '#06b6d6', label: 'Infrastructure' },
                      { color: '#ef4444', label: 'Finding' },
                      { color: '#22c55e', label: 'Service' },
                      { color: '#eab308', label: 'Attack Chain' },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className="size-2 rounded-full" style={{ backgroundColor: l.color }} />
                        <span className="text-[9px] text-zinc-400 font-mono">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSubTab === 'upload' && (
            <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                  <UploadCloud className="size-4" style={{ color: PINK }} />
                  Document Upload
                </CardTitle>
                <CardDescription className="text-zinc-500 text-xs">Upload documents to the knowledge base for RAG retrieval</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-pink-500/30 transition-colors cursor-pointer">
                  <UploadCloud className="size-8 mx-auto mb-3 text-zinc-600" />
                  <p className="text-xs text-zinc-400">Drop files here or click to upload</p>
                  <p className="text-[10px] text-zinc-600 mt-1">Supports: PDF, TXT, MD, JSON, CSV</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Upload Settings</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-zinc-400 text-[10px]">Chunk Size</Label>
                      <Input defaultValue="512" className="bg-black/30 border-white/10 text-zinc-200 text-xs h-8" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-zinc-400 text-[10px]">Chunk Overlap</Label>
                      <Input defaultValue="64" className="bg-black/30 border-white/10 text-zinc-200 text-xs h-8" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-zinc-400 text-[10px]">Embedding Model</Label>
                      <Select defaultValue="text-embedding-3-small">
                        <SelectTrigger className="bg-black/30 border-white/10 text-zinc-200 text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
                          <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
                          <SelectItem value="local-all-minilm">local-all-minilm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-zinc-400 text-[10px]">Auto-tag</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Recent Uploads</p>
                  {[
                    { name: 'owasp-top10-2025.pdf', size: '2.4 MB', status: 'indexed', chunks: 47 },
                    { name: 'jwt-attacks.md', size: '156 KB', status: 'indexed', chunks: 12 },
                    { name: 'docker-security.txt', size: '89 KB', status: 'processing', chunks: 8 },
                  ].map(f => (
                    <div key={f.name} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                      <FileText className="size-3.5 text-zinc-600" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] text-zinc-300 font-mono truncate block">{f.name}</span>
                        <span className="text-[9px] text-zinc-600 font-mono">{f.size} · {f.chunks} chunks</span>
                      </div>
                      {f.status === 'indexed' ? (
                        <CheckCircle2 className="size-3.5 text-green-500" />
                      ) : (
                        <Loader2 className="size-3.5 text-pink-500 animate-spin" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSubTab === 'qa' && (
            <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                  <HelpCircle className="size-4" style={{ color: PINK }} />
                  Q&A Pairs
                </CardTitle>
                <CardDescription className="text-zinc-500 text-xs">Manage question-answer pairs for knowledge retrieval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {KNOWLEDGE_DATA.filter(k => k.type === 'qa').map(k => (
                    <div key={k.id} className="p-3 rounded-lg border border-white/5 bg-white/[0.01]">
                      <div className="flex items-center gap-2 mb-2">
                        <HelpCircle className="size-3.5" style={{ color: '#22c55e' }} />
                        <span className="text-xs text-zinc-200 font-medium">{k.title}</span>
                      </div>
                      <div className="pl-5.5 space-y-1">
                        {k.content.split('\n').map((line, i) => (
                          <p key={i} className={`text-[11px] font-mono ${line.startsWith('Q:') ? 'text-cyan-400' : line.startsWith('A:') ? 'text-green-400' : 'text-zinc-500'}`}>
                            {line}
                          </p>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 pl-5.5">
                        {k.tags.map(tag => (
                          <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500 font-mono">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="border-dashed border-white/10 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 text-xs w-full">
                    <Plus className="size-3 mr-1.5" /> Add Q&A Pair
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Side Panel - Entry Detail */}
        <div className="space-y-4">
          {entry && (
            <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                    {(() => { const EIcon = typeIcons[entry.type]; return <EIcon className="size-4" style={{ color: typeColors[entry.type] }} /> })()}
                    Entry Detail
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(null)} className="text-zinc-500 hover:text-zinc-200 h-6 w-6 p-0">
                    <X className="size-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Title</span>
                  <p className="text-xs text-zinc-200 mt-0.5">{entry.title}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Type</span>
                  <div className="mt-0.5">
                    <Badge variant="outline" className="text-[9px] font-mono" style={{ borderColor: `${typeColors[entry.type]}30`, color: typeColors[entry.type] }}>
                      {entry.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Content</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5 font-mono whitespace-pre-wrap">{entry.content}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Tags</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {entry.tags.map(tag => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500 font-mono">{tag}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Timestamp</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">{entry.timestamp}</p>
                </div>
                <Separator className="bg-white/5" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-white/10 text-zinc-400 hover:text-zinc-200 text-xs flex-1 h-7">
                    <Copy className="size-3 mr-1" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs h-7 px-2">
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vector Store Stats */}
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                <Database className="size-4" style={{ color: PINK }} />
                Store Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[
                { label: 'Total Vectors', value: '1,247' },
                { label: 'Dimensions', value: '1536' },
                { label: 'Index Type', value: 'IVFFlat' },
                { label: 'Backend', value: 'pgvector' },
                { label: 'Database', value: 'PostgreSQL 16' },
                { label: 'Last Sync', value: '2 min ago' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">{item.label}</span>
                  <span className="text-[11px] text-zinc-300 font-mono">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// =================== SETTINGS TAB ===================

function SettingsTab() {
  const [activeSection, setActiveSection] = useState<'llm' | 'docker' | 'search' | 'oauth' | 'embedding'>('llm')
  const [agentModels, setAgentModels] = useState<Record<string, string>>({
    primary_agent: 'gpt-4o',
    pentester: 'claude-3.5-sonnet',
    coder: 'gpt-4o',
    installer: 'gpt-4o-mini',
    searcher: 'gpt-4o',
    adviser: 'claude-3.5-sonnet',
    memorist: 'gpt-4o-mini',
    generator: 'gpt-4o',
    refiner: 'claude-3.5-sonnet',
    enricher: 'gpt-4o',
    reporter: 'gpt-4o',
    reflector: 'claude-3.5-sonnet',
    tool_call_fixer: 'gpt-4o-mini',
    assistant: 'gpt-4o-mini',
  })
  const [providerKeys, setProviderKeys] = useState<Record<string, string>>({
    openai: 'sk-••••••••••••••••••••3f7a',
    anthropic: 'sk-ant-••••••••••••••8b2c',
    google: '',
    mistral: '',
    deepseek: '',
    ollama: 'http://localhost:11434',
    together: '',
    groq: '',
    azure: '',
    aws: '',
  })

  const [dockerSettings, setDockerSettings] = useState({
    image: 'pentagi/sandbox:latest',
    memoryLimit: '2g',
    cpuLimit: '1.0',
    networkMode: 'bridge',
    timeout: '300',
    autoRemove: true,
    privileged: false,
  })

  const [searchEngineConfig, setSearchEngineConfig] = useState<Record<string, { enabled: boolean; apiKey: string; cx?: string }>>({
    google: { enabled: true, apiKey: 'AIza••••••••••x9k', cx: 'a1b2c3d4e5' },
    bing: { enabled: true, apiKey: '••••••••••••7h3m', cx: '' },
    duckduckgo: { enabled: true, apiKey: '' },
    shodan: { enabled: true, apiKey: '••••••••••q4wp' },
    censys: { enabled: false, apiKey: '' },
    virustotal: { enabled: true, apiKey: '••••••••••m8nr' },
    nvd: { enabled: true, apiKey: '' },
  })

  const [embeddingConfig, setEmbeddingConfig] = useState({
    provider: 'openai',
    model: 'text-embedding-3-small',
    dimensions: '1536',
    batchSize: '100',
    chunkSize: '512',
    chunkOverlap: '64',
  })

  const sections = [
    { id: 'llm' as const, label: 'LLM Providers', icon: Cpu },
    { id: 'docker' as const, label: 'Docker', icon: Container },
    { id: 'search' as const, label: 'Search Engines', icon: Search },
    { id: 'oauth' as const, label: 'OAuth', icon: Key },
    { id: 'embedding' as const, label: 'Embedding', icon: Layers },
  ]

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      {/* Section Navigation */}
      <div className="flex gap-1 bg-black/40 rounded-lg border border-white/5 p-1 w-fit">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono transition-all ${
              activeSection === s.id
                ? 'text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            style={activeSection === s.id ? { backgroundColor: `${PINK}20`, color: PINK } : {}}
          >
            <s.icon className="size-3" />
            {s.label}
          </button>
        ))}
      </div>

      {/* LLM Provider Config */}
      {activeSection === 'llm' && (
        <div className="space-y-4">
          {/* Provider API Keys */}
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                <Cpu className="size-4" style={{ color: PINK }} />
                LLM Provider Configuration
              </CardTitle>
              <CardDescription className="text-zinc-500 text-xs">Configure API keys for {LLM_PROVIDERS.length} providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {LLM_PROVIDERS.map(provider => {
                  const hasKey = providerKeys[provider.id] && providerKeys[provider.id].length > 0
                  return (
                    <div key={provider.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                      <div className={`size-2 rounded-full shrink-0 ${hasKey ? 'bg-green-500' : 'bg-zinc-700'}`} />
                      <div className="w-28 shrink-0">
                        <span className="text-xs text-zinc-200 font-medium">{provider.name}</span>
                      </div>
                      <div className="flex-1">
                        <Input
                          value={providerKeys[provider.id] || ''}
                          onChange={e => setProviderKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                          placeholder="API Key..."
                          type="password"
                          className="bg-black/30 border-white/10 text-zinc-200 placeholder:text-zinc-600 text-xs h-7 font-mono"
                        />
                      </div>
                      <Badge variant="outline" className="text-[8px] font-mono shrink-0" style={{
                        borderColor: hasKey ? '#22c55e30' : '#ef444430',
                        color: hasKey ? '#22c55e' : '#ef4444',
                      }}>
                        {hasKey ? 'configured' : 'missing'}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Per-Agent Model Selection */}
          <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                <Bot className="size-4" style={{ color: PINK }} />
                Per-Agent Model Selection
              </CardTitle>
              <CardDescription className="text-zinc-500 text-xs">Override the default model for individual agents</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[360px]">
                <div className="space-y-2">
                  {AGENTS.map(agent => {
                    const currentModel = agentModels[agent.id] || 'gpt-4o'
                    const provider = currentModel.includes('claude') ? 'anthropic' : currentModel.includes('gemini') ? 'google' : currentModel.includes('mistral') ? 'mistral' : currentModel.includes('deepseek') ? 'deepseek' : currentModel.includes('llama') || currentModel.includes('qwen') || currentModel.includes('mixtral') ? 'ollama' : 'openai'
                    const providerModels = LLM_PROVIDERS.find(p => p.id === provider)?.models || LLM_PROVIDERS[0].models
                    return (
                      <div key={agent.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-white/5 bg-white/[0.01]">
                        <agent.icon className="size-4 shrink-0" style={{ color: PINK }} />
                        <div className="w-32 shrink-0">
                          <span className="text-xs text-zinc-300 font-medium">{agent.name}</span>
                          <p className="text-[9px] text-zinc-600 font-mono">{agent.role}</p>
                        </div>
                        <div className="flex-1">
                          <Select value={currentModel} onValueChange={v => setAgentModels(prev => ({ ...prev, [agent.id]: v }))}>
                            <SelectTrigger className="bg-black/30 border-white/10 text-zinc-200 text-xs h-7 font-mono">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LLM_PROVIDERS.flatMap(p => p.models).map(m => (
                                <SelectItem key={m} value={m} className="text-xs font-mono">{m}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Docker Settings */}
      {activeSection === 'docker' && (
        <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
              <Container className="size-4" style={{ color: PINK }} />
              Docker Configuration
            </CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Configure Docker sandbox for command execution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Sandbox Image</Label>
                <Input value={dockerSettings.image} onChange={e => setDockerSettings(prev => ({ ...prev, image: e.target.value }))} className="bg-black/30 border-white/10 text-zinc-200 text-xs h-8 font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Network Mode</Label>
                <Select value={dockerSettings.networkMode} onValueChange={v => setDockerSettings(prev => ({ ...prev, networkMode: v }))}>
                  <SelectTrigger className="bg-black/30 border-white/10 text-zinc-200 text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bridge">bridge</SelectItem>
                    <SelectItem value="host">host</SelectItem>
                    <SelectItem value="none">none</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Memory Limit</Label>
                <Select value={dockerSettings.memoryLimit} onValueChange={v => setDockerSettings(prev => ({ ...prev, memoryLimit: v }))}>
                  <SelectTrigger className="bg-black/30 border-white/10 text-zinc-200 text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1g">1 GB</SelectItem>
                    <SelectItem value="2g">2 GB</SelectItem>
                    <SelectItem value="4g">4 GB</SelectItem>
                    <SelectItem value="8g">8 GB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">CPU Limit</Label>
                <Select value={dockerSettings.cpuLimit} onValueChange={v => setDockerSettings(prev => ({ ...prev, cpuLimit: v }))}>
                  <SelectTrigger className="bg-black/30 border-white/10 text-zinc-200 text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5 cores</SelectItem>
                    <SelectItem value="1.0">1 core</SelectItem>
                    <SelectItem value="2.0">2 cores</SelectItem>
                    <SelectItem value="4.0">4 cores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Execution Timeout (seconds)</Label>
                <Input value={dockerSettings.timeout} onChange={e => setDockerSettings(prev => ({ ...prev, timeout: e.target.value }))} className="bg-black/30 border-white/10 text-zinc-200 text-xs h-8 font-mono" />
              </div>
            </div>
            <Separator className="bg-white/5" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-zinc-400 text-xs">Auto-Remove Container</Label>
                  <p className="text-[10px] text-zinc-600">Remove container after execution completes</p>
                </div>
                <Switch checked={dockerSettings.autoRemove} onCheckedChange={v => setDockerSettings(prev => ({ ...prev, autoRemove: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-zinc-400 text-xs">Privileged Mode</Label>
                  <p className="text-[10px] text-zinc-600">Grant extended privileges (dangerous)</p>
                </div>
                <Switch checked={dockerSettings.privileged} onCheckedChange={v => setDockerSettings(prev => ({ ...prev, privileged: v }))} />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="size-3.5 text-red-400" />
                <span className="text-xs text-red-400 font-medium">Security Notice</span>
              </div>
              <p className="text-[10px] text-zinc-400">Enabling privileged mode or host networking can compromise sandbox isolation. Only use in trusted environments.</p>
            </div>
            <Button size="sm" style={{ backgroundColor: PINK }} className="text-white hover:opacity-90 text-xs">
              <Save className="size-3 mr-1.5" /> Save Docker Settings
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search Engine Config */}
      {activeSection === 'search' && (
        <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
              <Search className="size-4" style={{ color: PINK }} />
              Search Engine Configuration
            </CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Configure {SEARCH_ENGINES.length} search engines for OSINT operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {SEARCH_ENGINES.map(engine => {
              const config = searchEngineConfig[engine.id]
              return (
                <div key={engine.id} className="p-3 rounded-lg border border-white/5 bg-white/[0.01] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe2 className="size-4 text-zinc-400" />
                      <span className="text-xs text-zinc-200 font-medium">{engine.name}</span>
                      {engine.apiRequired && (
                        <Badge variant="outline" className="text-[8px] border-yellow-500/20 text-yellow-400/60 bg-yellow-500/5 font-mono">
                          API Required
                        </Badge>
                      )}
                    </div>
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={v => setSearchEngineConfig(prev => ({ ...prev, [engine.id]: { ...prev[engine.id], enabled: v } }))}
                    />
                  </div>
                  {config.enabled && engine.apiRequired && (
                    <div className="grid grid-cols-2 gap-3 pl-6">
                      <div className="space-y-1">
                        <Label className="text-zinc-500 text-[10px]">API Key</Label>
                        <Input
                          value={config.apiKey}
                          onChange={e => setSearchEngineConfig(prev => ({ ...prev, [engine.id]: { ...prev[engine.id], apiKey: e.target.value } }))}
                          placeholder="Enter API key..."
                          type="password"
                          className="bg-black/30 border-white/10 text-zinc-200 placeholder:text-zinc-600 text-xs h-7 font-mono"
                        />
                      </div>
                      {engine.id === 'google' && (
                        <div className="space-y-1">
                          <Label className="text-zinc-500 text-[10px]">Custom Search CX</Label>
                          <Input
                            value={config.cx || ''}
                            onChange={e => setSearchEngineConfig(prev => ({ ...prev, [engine.id]: { ...prev[engine.id], cx: e.target.value } }))}
                            placeholder="CX ID..."
                            className="bg-black/30 border-white/10 text-zinc-200 placeholder:text-zinc-600 text-xs h-7 font-mono"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            <Button size="sm" style={{ backgroundColor: PINK }} className="text-white hover:opacity-90 text-xs">
              <Save className="size-3 mr-1.5" /> Save Search Configuration
            </Button>
          </CardContent>
        </Card>
      )}

      {/* OAuth Settings */}
      {activeSection === 'oauth' && (
        <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
              <Key className="size-4" style={{ color: PINK }} />
              OAuth Configuration
            </CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Configure OAuth providers for authenticated testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {['Google OAuth2', 'GitHub OAuth', 'Microsoft Azure AD'].map(provider => (
              <div key={provider} className="p-3 rounded-lg border border-white/5 bg-white/[0.01] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-200 font-medium">{provider}</span>
                  <Switch defaultChecked={provider === 'Google OAuth2'} />
                </div>
                <div className="grid grid-cols-2 gap-3 pl-6">
                  <div className="space-y-1">
                    <Label className="text-zinc-500 text-[10px]">Client ID</Label>
                    <Input placeholder="Enter client ID..." className="bg-black/30 border-white/10 text-zinc-200 placeholder:text-zinc-600 text-xs h-7 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-zinc-500 text-[10px]">Client Secret</Label>
                    <Input placeholder="Enter secret..." type="password" className="bg-black/30 border-white/10 text-zinc-200 placeholder:text-zinc-600 text-xs h-7 font-mono" />
                  </div>
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs">Default Redirect URI</Label>
              <Input defaultValue="https://pentagi.local/oauth/callback" className="bg-black/30 border-white/10 text-zinc-200 text-xs h-8 font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs">Token Storage</Label>
              <Select defaultValue="encrypted">
                <SelectTrigger className="bg-black/30 border-white/10 text-zinc-200 text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="encrypted">Encrypted (AES-256)</SelectItem>
                  <SelectItem value="session">Session Only</SelectItem>
                  <SelectItem value="database">Database (PostgreSQL)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" style={{ backgroundColor: PINK }} className="text-white hover:opacity-90 text-xs">
              <Save className="size-3 mr-1.5" /> Save OAuth Settings
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Embedding Config */}
      {activeSection === 'embedding' && (
        <Card className="bg-black/40 border-white/5 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
              <Layers className="size-4" style={{ color: PINK }} />
              Embedding Configuration
            </CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Configure embedding model and chunking parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Embedding Provider</Label>
                <Select value={embeddingConfig.provider} onValueChange={v => setEmbeddingConfig(prev => ({ ...prev, provider: v }))}>
                  <SelectTrigger className="bg-black/30 border-white/10 text-zinc-200 text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="local">Local (sentence-transformers)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Embedding Model</Label>
                <Select value={embeddingConfig.model} onValueChange={v => setEmbeddingConfig(prev => ({ ...prev, model: v }))}>
                  <SelectTrigger className="bg-black/30 border-white/10 text-zinc-200 text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-embedding-3-small">text-embedding-3-small (1536d)</SelectItem>
                    <SelectItem value="text-embedding-3-large">text-embedding-3-large (3072d)</SelectItem>
                    <SelectItem value="embedding-001">embedding-001 (768d)</SelectItem>
                    <SelectItem value="all-MiniLM-L6-v2">all-MiniLM-L6-v2 (384d)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Dimensions</Label>
                <Input value={embeddingConfig.dimensions} onChange={e => setEmbeddingConfig(prev => ({ ...prev, dimensions: e.target.value }))} className="bg-black/30 border-white/10 text-zinc-200 text-xs h-8 font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Batch Size</Label>
                <Input value={embeddingConfig.batchSize} onChange={e => setEmbeddingConfig(prev => ({ ...prev, batchSize: e.target.value }))} className="bg-black/30 border-white/10 text-zinc-200 text-xs h-8 font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Chunk Size (tokens)</Label>
                <Input value={embeddingConfig.chunkSize} onChange={e => setEmbeddingConfig(prev => ({ ...prev, chunkSize: e.target.value }))} className="bg-black/30 border-white/10 text-zinc-200 text-xs h-8 font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Chunk Overlap (tokens)</Label>
                <Input value={embeddingConfig.chunkOverlap} onChange={e => setEmbeddingConfig(prev => ({ ...prev, chunkOverlap: e.target.value }))} className="bg-black/30 border-white/10 text-zinc-200 text-xs h-8 font-mono" />
              </div>
            </div>
            <Separator className="bg-white/5" />
            <div className="p-3 rounded-lg bg-pink-500/5 border border-pink-500/10">
              <div className="flex items-center gap-2 mb-1">
                <Info className="size-3.5 text-pink-400" />
                <span className="text-xs text-pink-300 font-medium">Vector Database</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Backend</span>
                  <span className="text-zinc-300 font-mono">PostgreSQL + pgvector</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Index Type</span>
                  <span className="text-zinc-300 font-mono">IVFFlat</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Distance</span>
                  <span className="text-zinc-300 font-mono">cosine</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Probes</span>
                  <span className="text-zinc-300 font-mono">10</span>
                </div>
              </div>
            </div>
            <Button size="sm" style={{ backgroundColor: PINK }} className="text-white hover:opacity-90 text-xs">
              <Save className="size-3 mr-1.5" /> Save Embedding Settings
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// =================== MAIN COMPONENT ===================

export default function PentAgiTool({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>('flows')

  const tabs: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
    { id: 'flows', label: 'Flows', icon: Layers },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'knowledge', label: 'Knowledge', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#09090B]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-black/60 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${PINK}15`, border: `1px solid ${PINK}30` }}>
            <Shield className="size-4" style={{ color: PINK }} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              PentAGI
              <Badge variant="outline" className="text-[9px] font-mono" style={{ borderColor: `${PINK}30`, color: PINK, backgroundColor: `${PINK}08` }}>
                v2.4.0
              </Badge>
              <Badge variant="outline" className="text-[9px] border-green-500/20 text-green-400/80 bg-green-500/5 font-mono">
                MIT
              </Badge>
            </h1>
            <p className="text-[11px] text-zinc-500">Autonomous AI-Powered Penetration Testing Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] border-green-500/20 text-green-400/80 bg-green-500/5 font-mono">
            <div className="size-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
            System Online
          </Badge>
          <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-zinc-400">
            <Container className="size-3 mr-1" /> Docker: Running
          </Badge>
          <Badge variant="outline" className="text-[10px] font-mono" style={{ borderColor: `${PINK}30`, color: PINK }}>
            14 Agents
          </Badge>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-500 hover:text-zinc-200 hover:bg-white/5 text-xs h-7">
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as TabId)} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-2 border-b border-white/5 shrink-0">
          <TabsList className="bg-transparent border-none h-9 p-0 gap-1">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:text-pink-300 text-zinc-500 text-xs h-8 px-3 rounded-md border border-transparent data-[state=active]:border-pink-500/20 data-[state=active]:bg-pink-500/10 transition-all"
              >
                <tab.icon className="size-3.5 mr-1.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="flows" className="h-full m-0 overflow-y-auto">
            <FlowsTab />
          </TabsContent>
          <TabsContent value="terminal" className="h-full m-0 overflow-y-auto">
            <TerminalTab />
          </TabsContent>
          <TabsContent value="agents" className="h-full m-0 overflow-y-auto">
            <AgentsTab />
          </TabsContent>
          <TabsContent value="tools" className="h-full m-0 overflow-y-auto">
            <ToolsTab />
          </TabsContent>
          <TabsContent value="knowledge" className="h-full m-0 overflow-y-auto">
            <KnowledgeTab />
          </TabsContent>
          <TabsContent value="settings" className="h-full m-0 overflow-y-auto">
            <SettingsTab />
          </TabsContent>
        </div>
      </Tabs>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-white/5 bg-black/60 text-[9px] text-zinc-600 font-mono shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className="size-1.5 rounded-full bg-green-500" /> PostgreSQL+pgvector
          </span>
          <span>REST + GraphQL</span>
          <span>WebSocket: Connected</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{TOOLS.length} tools loaded</span>
          <span>{AGENTS.length} agents registered</span>
          <span>PentAGI v2.4.0 · MIT License</span>
        </div>
      </div>
    </motion.div>
  )
}
