'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Play, Square, Folder, Settings, FileText, Activity, ChevronRight,
  AlertTriangle, Bug, Lock, Unlock, Globe, Code, Zap, Eye, Search,
  Server, Cpu, Clock, TrendingUp, AlertCircle, CheckCircle2, XCircle,
  Loader2, ExternalLink, Download, RefreshCw, Plus, Trash2, Save,
  ArrowRight, Terminal, BarChart3, ShieldAlert, ShieldCheck,
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// =================== TYPES ===================

interface PipelinePhase {
  phase: string
  status: 'completed' | 'in_progress' | 'pending' | 'failed'
  agents: { name: string; status: string; progress?: number; duration?: string }[]
}

interface Workspace {
  id: string
  name: string
  target: string
  repo: string
  status: string
  createdAt: string
  completedAt?: string
  duration?: string
  findings?: { critical: number; high: number; medium: number; low: number }
  cost?: string
  agents?: { completed: number; total: number }
  currentPhase?: string
  currentAgent?: string
  error?: string
}

interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
}

interface Finding {
  id: string
  vulnType: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  endpoint: string
  status: 'exploited' | 'blocked' | 'confirmed'
  confidence: string
}

// =================== CONSTANTS ===================

const VULN_CLASSES = ['injection', 'xss', 'auth', 'authz', 'ssrf'] as const
const LOGIN_TYPES = ['form', 'sso', 'api', 'basic'] as const
const RULE_TYPES = ['url_path', 'subdomain', 'domain', 'method', 'header', 'parameter', 'code_path'] as const
const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
}
const PHASE_LABELS: Record<string, string> = {
  preflight: 'Preflight',
  'pre-recon': 'Pre-Recon',
  recon: 'Recon',
  'vulnerability-analysis': 'Vuln Analysis',
  exploitation: 'Exploitation',
  reporting: 'Reporting',
}
const AGENT_MODELS: Record<string, string> = {
  'pre-recon': 'Claude Opus 4.7',
  recon: 'Claude Sonnet 4.6',
  'injection-vuln': 'Claude Sonnet 4.6',
  'xss-vuln': 'Claude Sonnet 4.6',
  'auth-vuln': 'Claude Sonnet 4.6',
  'authz-vuln': 'Claude Sonnet 4.6',
  'ssrf-vuln': 'Claude Sonnet 4.6',
  'injection-exploit': 'Claude Sonnet 4.6',
  'xss-exploit': 'Claude Sonnet 4.6',
  'auth-exploit': 'Claude Sonnet 4.6',
  'authz-exploit': 'Claude Sonnet 4.6',
  'ssrf-exploit': 'Claude Sonnet 4.6',
  report: 'Claude Sonnet 4.6',
}

// =================== SUB-COMPONENTS ===================

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: 'bg-green-500',
    running: 'bg-blue-500 animate-pulse',
    in_progress: 'bg-blue-500 animate-pulse',
    pending: 'bg-gray-600',
    failed: 'bg-red-500',
    stopped: 'bg-yellow-500',
  }
  return <div className={`size-2 rounded-full ${colors[status] || 'bg-gray-600'}`} />
}

function SeverityBadge({ severity }: { severity: string }) {
  const color = SEVERITY_COLORS[severity] || '#6b7280'
  return (
    <Badge
      variant="outline"
      className="text-[10px] font-mono uppercase"
      style={{ borderColor: `${color}40`, color, backgroundColor: `${color}10` }}
    >
      {severity}
    </Badge>
  )
}

function KPICard({ title, value, subtitle, icon: Icon, color, trend }: {
  title: string; value: string | number; subtitle?: string
  icon: LucideIcon; color: string; trend?: string
}) {
  return (
    <Card className="bg-black/40 border-purple-500/10 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] text-purple-400/50 uppercase tracking-wider font-mono">{title}</p>
            <p className="text-2xl font-bold text-purple-100 mt-1" style={{ color }}>{value}</p>
            {subtitle && <p className="text-xs text-purple-400/40 mt-0.5">{subtitle}</p>}
            {trend && <p className="text-[10px] text-green-400/60 mt-1 flex items-center gap-1"><TrendingUp className="size-3" />{trend}</p>}
          </div>
          <div className="size-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Icon className="size-4" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PipelineNode({ name, status, progress, model, isLast }: {
  name: string; status: string; progress?: number; model?: string; isLast?: boolean
}) {
  const statusColors: Record<string, string> = {
    completed: 'border-green-500/40 bg-green-500/10',
    running: 'border-blue-500/40 bg-blue-500/10',
    in_progress: 'border-blue-500/40 bg-blue-500/10',
    pending: 'border-purple-500/20 bg-purple-500/5',
    failed: 'border-red-500/40 bg-red-500/10',
  }
  const iconMap: Record<string, LucideIcon> = {
    completed: CheckCircle2,
    running: Loader2,
    in_progress: Loader2,
    pending: Clock,
    failed: XCircle,
  }
  const Icon = iconMap[status] || Clock
  const isSpinning = status === 'running' || status === 'in_progress'

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border ${statusColors[status] || ''} min-w-[220px]`}>
        <Icon className={`size-4 ${isSpinning ? 'animate-spin' : ''}`} style={{ color: status === 'completed' ? '#22c55e' : status === 'failed' ? '#ef4444' : '#3b82f6' }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-purple-100 truncate">{name}</span>
            <StatusDot status={status} />
          </div>
          {model && <span className="text-[10px] text-purple-400/40 font-mono">{model}</span>}
          {progress !== undefined && progress > 0 && (
            <div className="mt-1.5">
              <Progress value={progress} className="h-1 bg-purple-500/10" />
              <span className="text-[9px] text-purple-400/40 font-mono">{progress}%</span>
            </div>
          )}
        </div>
      </div>
      {!isLast && (
        <ChevronRight className="size-4 text-purple-500/30 shrink-0" />
      )}
    </div>
  )
}

// =================== MAIN COMPONENT ===================

interface ShannonToolProps {
  onClose: () => void
}

export default function ShannonTool({ onClose }: ShannonToolProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isStarting, setIsStarting] = useState(false)
  const [scanId, setScanId] = useState<string | null>(null)

  // Scan form state
  const [targetUrl, setTargetUrl] = useState('')
  const [repoPath, setRepoPath] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [selectedVulnClasses, setSelectedVulnClasses] = useState<string[]>([...VULN_CLASSES])
  const [exploitEnabled, setExploitEnabled] = useState(true)
  const [pipelineTesting, setPipelineTesting] = useState(false)
  const [maxConcurrent, setMaxConcurrent] = useState('5')
  const [retryPreset, setRetryPreset] = useState('default')

  // Auth config
  const [authEnabled, setAuthEnabled] = useState(false)
  const [authLoginType, setAuthLoginType] = useState<string>('form')
  const [authLoginUrl, setAuthLoginUrl] = useState('')
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authTotpSecret, setAuthTotpSecret] = useState('')
  const [authLoginFlow, setAuthLoginFlow] = useState('')
  const [authSuccessType, setAuthSuccessType] = useState<string>('url_contains')
  const [authSuccessValue, setAuthSuccessValue] = useState('')

  // Rules config
  const [avoidRules, setAvoidRules] = useState<Array<{ description: string; type: string; value: string }>>([])
  const [focusRules, setFocusRules] = useState<Array<{ description: string; type: string; value: string }>>([])

  // Report config
  const [reportMinSeverity, setReportMinSeverity] = useState<string>('low')
  const [reportMinConfidence, setReportMinConfidence] = useState<string>('low')
  const [reportGuidance, setReportGuidance] = useState('')
  const [description, setDescription] = useState('')
  const [rulesOfEngagement, setRulesOfEngagement] = useState('')

  // Data state
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [systemStatus, setSystemStatus] = useState<Record<string, unknown> | null>(null)
  const [pipelineProgress, setPipelineProgress] = useState<PipelinePhase[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [findings, setFindings] = useState<Finding[]>([])
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null)

  // Setup state
  const [setupProvider, setSetupProvider] = useState<string>('anthropic')
  const [setupApiKey, setSetupApiKey] = useState('')

  // Fetch data
  const fetchWorkspaces = useCallback(async () => {
    try {
      const res = await fetch('/api/shannon/workspaces')
      const data = await res.json()
      if (data.workspaces) setWorkspaces(data.workspaces)
    } catch { /* ignore */ }
  }, [])

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/shannon/status')
      const data = await res.json()
      setSystemStatus(data)
    } catch { /* ignore */ }
  }, [])

  const fetchProgress = useCallback(async () => {
    if (!scanId) return
    try {
      const res = await fetch(`/api/shannon/progress?scanId=${scanId}`)
      const data = await res.json()
      if (data.pipeline) setPipelineProgress(data.pipeline)
    } catch { /* ignore */ }
  }, [scanId])

  const fetchLogs = useCallback(async (ws: string) => {
    try {
      const res = await fetch(`/api/shannon/logs?workspace=${ws}`)
      const data = await res.json()
      if (data.logs) setLogs(data.logs)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchWorkspaces()
    fetchStatus()
  }, [fetchWorkspaces, fetchStatus])

  useEffect(() => {
    if (scanId && activeTab === 'monitor') {
      const interval = setInterval(fetchProgress, 3000)
      return () => clearInterval(interval)
    }
  }, [scanId, activeTab, fetchProgress])

  // Start scan
  const handleStartScan = async () => {
    if (!targetUrl || !repoPath) return
    setIsStarting(true)
    try {
      const res = await fetch('/api/shannon/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          repo: repoPath,
          workspace: workspaceName || undefined,
          pipelineTesting,
          exploit: exploitEnabled,
          vulnClasses: selectedVulnClasses,
          authentication: authEnabled ? {
            login_type: authLoginType,
            login_url: authLoginUrl,
            credentials: { username: authUsername, password: authPassword, totp_secret: authTotpSecret },
            login_flow: authLoginFlow ? authLoginFlow.split('\n').filter(Boolean) : undefined,
            success_condition: { type: authSuccessType, value: authSuccessValue },
          } : undefined,
          rules: (avoidRules.length > 0 || focusRules.length > 0) ? {
            avoid: avoidRules,
            focus: focusRules,
          } : undefined,
          report: {
            min_severity: reportMinSeverity,
            min_confidence: reportMinConfidence,
            guidance: reportGuidance || undefined,
          },
          description: description || undefined,
          rulesOfEngagement: rulesOfEngagement || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setScanId(data.scanId)
        if (data.pipeline) setPipelineProgress(data.pipeline)
        setActiveTab('monitor')
        fetchWorkspaces()
      }
    } catch { /* ignore */ }
    setIsStarting(false)
  }

  // Stop scan
  const handleStopScan = async () => {
    if (!scanId) return
    try {
      await fetch('/api/shannon/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId }),
      })
      setScanId(null)
      fetchWorkspaces()
    } catch { /* ignore */ }
  }

  // Setup credentials
  const handleSetup = async () => {
    try {
      await fetch('/api/shannon/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: setupProvider,
          apiKey: setupProvider === 'anthropic' ? setupApiKey : undefined,
        }),
      })
      setSetupApiKey('')
      fetchStatus()
    } catch { /* ignore */ }
  }

  // Toggle vuln class
  const toggleVulnClass = (cls: string) => {
    setSelectedVulnClasses(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    )
  }

  // Add rule
  const addAvoidRule = () => setAvoidRules(prev => [...prev, { description: '', type: 'url_path', value: '' }])
  const addFocusRule = () => setFocusRules(prev => [...prev, { description: '', type: 'url_path', value: '' }])
  const removeAvoidRule = (idx: number) => setAvoidRules(prev => prev.filter((_, i) => i !== idx))
  const removeFocusRule = (idx: number) => setFocusRules(prev => prev.filter((_, i) => i !== idx))
  const updateAvoidRule = (idx: number, field: string, value: string) => {
    setAvoidRules(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }
  const updateFocusRule = (idx: number, field: string, value: string) => {
    setFocusRules(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  // Sample findings
  const sampleFindings: Finding[] = [
    { id: 'INJ-VULN-01', vulnType: 'Injection', severity: 'critical', title: 'SQL Injection in Login Endpoint', description: 'User input directly interpolated into SQL query without parameterization', endpoint: '/api/auth/login', status: 'exploited', confidence: 'high' },
    { id: 'XSS-VULN-01', vulnType: 'XSS', severity: 'high', title: 'Reflected XSS in Search', description: 'Search query reflected without encoding in HTML response', endpoint: '/search?q=', status: 'exploited', confidence: 'high' },
    { id: 'AUTH-VULN-01', vulnType: 'Auth', severity: 'critical', title: 'Broken Authentication - Weak Password Policy', description: 'No password complexity requirements, allows 4-char passwords', endpoint: '/api/auth/register', status: 'exploited', confidence: 'high' },
    { id: 'AUTHZ-VULN-01', vulnType: 'AuthZ', severity: 'high', title: 'IDOR in User Profile', description: 'User can access other users profiles by changing ID parameter', endpoint: '/api/users/{id}', status: 'exploited', confidence: 'high' },
    { id: 'SSRF-VULN-01', vulnType: 'SSRF', severity: 'medium', title: 'SSRF via Webhook URL', description: 'Webhook URL validation allows internal network access', endpoint: '/api/webhooks', status: 'blocked', confidence: 'medium' },
    { id: 'INJ-VULN-02', vulnType: 'Injection', severity: 'high', title: 'Command Injection in File Upload', description: 'Filename parameter passed to shell command without sanitization', endpoint: '/api/upload', status: 'exploited', confidence: 'medium' },
    { id: 'XSS-VULN-02', vulnType: 'XSS', severity: 'medium', title: 'Stored XSS in Comments', description: 'User comments rendered without sanitization', endpoint: '/api/comments', status: 'blocked', confidence: 'medium' },
    { id: 'AUTH-VULN-02', vulnType: 'Auth', severity: 'medium', title: 'Session Fixation', description: 'Session ID not rotated after login', endpoint: '/api/auth/login', status: 'exploited', confidence: 'low' },
  ]

  // =================== RENDER TABS ===================

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#0A0A0D]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/10 bg-black/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Shield className="size-4 text-purple-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-purple-100 flex items-center gap-2">
              Shannon
              <Badge variant="outline" className="text-[9px] border-purple-500/20 text-purple-400/60 bg-purple-500/5 font-mono">v1.5.0</Badge>
              <Badge variant="outline" className="text-[9px] border-green-500/20 text-green-400/80 bg-green-500/5">AGPL-3.0</Badge>
            </h1>
            <p className="text-[11px] text-purple-400/50">Autonomous White-Box AI Pentester</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {systemStatus && (
            <Badge variant="outline" className="text-[10px] border-green-500/20 text-green-400/80 bg-green-500/5 font-mono">
              <div className="size-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
              Temporal: {(systemStatus as Record<string, Record<string, string>>).temporal?.status || 'unknown'}
            </Badge>
          )}
          {scanId && (
            <Badge variant="outline" className="text-[10px] border-blue-500/20 text-blue-400/80 bg-blue-500/5 font-mono">
              Scan: {scanId.slice(0, 16)}
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} className="text-purple-400/60 hover:text-purple-200 hover:bg-purple-500/10">
            Close
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-2 border-b border-purple-500/10">
          <TabsList className="bg-transparent border-none h-9 p-0 gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'new-scan', label: 'New Scan', icon: Play },
              { id: 'monitor', label: 'Pipeline', icon: Activity },
              { id: 'workspaces', label: 'Workspaces', icon: Folder },
              { id: 'findings', label: 'Findings', icon: Bug },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'logs', label: 'Logs', icon: Terminal },
              { id: 'setup', label: 'Setup', icon: Settings },
            ].map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-200 text-purple-400/50 text-xs h-8 px-3 rounded-md border border-transparent data-[state=active]:border-purple-500/20 transition-all"
              >
                <tab.icon className="size-3.5 mr-1.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {/* ====== DASHBOARD ====== */}
          <TabsContent value="dashboard" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-7xl mx-auto space-y-4">
              {/* KPI Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <KPICard title="Critical" value={3} icon={AlertCircle} color="#ef4444" />
                <KPICard title="High" value={7} icon={AlertTriangle} color="#f97316" />
                <KPICard title="Medium" value={12} icon={ShieldAlert} color="#eab308" />
                <KPICard title="Low" value={5} icon={ShieldCheck} color="#22c55e" />
                <KPICard title="Workspaces" value={workspaces.length} icon={Folder} color="#a855f7" />
                <KPICard title="MTTR" value="2.3d" icon={Clock} color="#06b6d4" trend="↓ 18%" />
              </div>

              {/* Two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent Scans */}
                <Card className="lg:col-span-2 bg-black/40 border-purple-500/10 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                      <Activity className="size-4 text-purple-400" />
                      Recent Scans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {workspaces.length === 0 ? (
                      <div className="text-center py-8 text-purple-400/40">
                        <Folder className="size-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No workspaces yet</p>
                        <p className="text-xs mt-1">Start a new scan to begin</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-purple-500/10 hover:bg-transparent">
                            <TableHead className="text-purple-400/40 text-[11px]">Workspace</TableHead>
                            <TableHead className="text-purple-400/40 text-[11px]">Target</TableHead>
                            <TableHead className="text-purple-400/40 text-[11px]">Status</TableHead>
                            <TableHead className="text-purple-400/40 text-[11px]">Findings</TableHead>
                            <TableHead className="text-purple-400/40 text-[11px]">Duration</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workspaces.map(ws => (
                            <TableRow
                              key={ws.id}
                              className="border-purple-500/5 hover:bg-purple-500/5 cursor-pointer"
                              onClick={() => { setSelectedWorkspace(ws.name); setActiveTab('monitor') }}
                            >
                              <TableCell className="text-purple-200 text-xs font-mono">{ws.name}</TableCell>
                              <TableCell className="text-purple-300/60 text-xs">{ws.target}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`text-[9px] ${
                                  ws.status === 'completed' ? 'border-green-500/30 text-green-400/80 bg-green-500/5' :
                                  ws.status === 'running' ? 'border-blue-500/30 text-blue-400/80 bg-blue-500/5' :
                                  ws.status === 'failed' ? 'border-red-500/30 text-red-400/80 bg-red-500/5' :
                                  'border-yellow-500/30 text-yellow-400/80 bg-yellow-500/5'
                                }`}>
                                  <StatusDot status={ws.status} />
                                  <span className="ml-1">{ws.status}</span>
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {ws.findings && (
                                  <div className="flex gap-1">
                                    {ws.findings.critical > 0 && <span className="text-[10px] text-red-400 font-mono">{ws.findings.critical}C</span>}
                                    {ws.findings.high > 0 && <span className="text-[10px] text-orange-400 font-mono">{ws.findings.high}H</span>}
                                    {ws.findings.medium > 0 && <span className="text-[10px] text-yellow-400 font-mono">{ws.findings.medium}M</span>}
                                    {ws.findings.low > 0 && <span className="text-[10px] text-green-400 font-mono">{ws.findings.low}L</span>}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-purple-300/40 text-xs font-mono">{ws.duration || '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card className="bg-black/40 border-purple-500/10 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                      <Server className="size-4 text-purple-400" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: 'Temporal Server', value: 'Healthy', status: 'completed' },
                      { label: 'Docker', value: 'Running', status: 'completed' },
                      { label: 'Workers', value: '1 Active', status: 'completed' },
                      { label: 'AI Provider', value: 'Anthropic', status: 'completed' },
                      { label: 'Model', value: 'Claude Sonnet 4.6', status: 'completed' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-xs text-purple-300/60">{item.label}</span>
                        <div className="flex items-center gap-1.5">
                          <StatusDot status={item.status} />
                          <span className="text-xs text-purple-200 font-mono">{item.value}</span>
                        </div>
                      </div>
                    ))}
                    <Separator className="bg-purple-500/10" />
                    <div className="text-[10px] text-purple-400/30 font-mono">
                      Temporal: localhost:7233
                      <br />Web UI: localhost:8233
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Vulnerability Distribution */}
              <Card className="bg-black/40 border-purple-500/10 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                    <ShieldAlert className="size-4 text-purple-400" />
                    Vulnerability Distribution by Class
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { type: 'Injection', count: 2, critical: 1, high: 1, icon: Code },
                      { type: 'XSS', count: 2, high: 1, medium: 1, icon: Eye },
                      { type: 'Auth', count: 2, critical: 1, medium: 1, icon: Lock },
                      { type: 'AuthZ', count: 1, high: 1, icon: Unlock },
                      { type: 'SSRF', count: 1, medium: 1, icon: Globe },
                    ].map(cls => (
                      <div key={cls.type} className="p-3 rounded-lg border border-purple-500/10 bg-purple-500/5">
                        <div className="flex items-center gap-2 mb-2">
                          <cls.icon className="size-3.5 text-purple-400" />
                          <span className="text-xs font-medium text-purple-200">{cls.type}</span>
                        </div>
                        <div className="text-xl font-bold text-purple-100">{cls.count}</div>
                        <div className="flex gap-1 mt-1">
                          {cls.critical && <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-mono">{cls.critical}C</span>}
                          {cls.high && <span className="text-[9px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded font-mono">{cls.high}H</span>}
                          {cls.medium && <span className="text-[9px] bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded font-mono">{cls.medium}M</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ====== NEW SCAN ====== */}
          <TabsContent value="new-scan" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-4xl mx-auto space-y-4">
              {/* Target Configuration */}
              <Card className="bg-black/40 border-purple-500/10 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                    <Globe className="size-4 text-purple-400" />
                    Target Configuration
                  </CardTitle>
                  <CardDescription className="text-purple-400/40 text-xs">Define the target application and repository</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-purple-300/60 text-xs">Target URL *</Label>
                      <Input
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        placeholder="https://your-app.example.com"
                        className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 focus-visible:border-purple-500/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-300/60 text-xs">Repository Path *</Label>
                      <Input
                        value={repoPath}
                        onChange={(e) => setRepoPath(e.target.value)}
                        placeholder="/path/to/repo or repo-name"
                        className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 focus-visible:border-purple-500/40"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-purple-300/60 text-xs">Workspace Name</Label>
                      <Input
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        placeholder="my-scan (auto-generated if empty)"
                        className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 focus-visible:border-purple-500/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-300/60 text-xs">Description</Label>
                      <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Target environment description"
                        className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 focus-visible:border-purple-500/40"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vulnerability Classes */}
              <Card className="bg-black/40 border-purple-500/10 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                    <Bug className="size-4 text-purple-400" />
                    Vulnerability Classes
                  </CardTitle>
                  <CardDescription className="text-purple-400/40 text-xs">Select which vulnerability classes to test</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {VULN_CLASSES.map(cls => (
                      <button
                        key={cls}
                        onClick={() => toggleVulnClass(cls)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                          selectedVulnClasses.includes(cls)
                            ? 'border-purple-500/40 bg-purple-500/15 text-purple-200'
                            : 'border-purple-500/10 bg-purple-500/5 text-purple-400/40 hover:border-purple-500/20'
                        }`}
                      >
                        {selectedVulnClasses.includes(cls) && '✓ '}
                        {cls}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pipeline Settings */}
              <Card className="bg-black/40 border-purple-500/10 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                    <Cpu className="size-4 text-purple-400" />
                    Pipeline Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-300/60 text-xs">Enable Exploitation</Label>
                      <p className="text-[10px] text-purple-400/30">Run exploit agents after vulnerability analysis</p>
                    </div>
                    <Switch checked={exploitEnabled} onCheckedChange={setExploitEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-300/60 text-xs">Pipeline Testing Mode</Label>
                      <p className="text-[10px] text-purple-400/30">Minimal prompts for fast testing (10s retries)</p>
                    </div>
                    <Switch checked={pipelineTesting} onCheckedChange={setPipelineTesting} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-purple-300/60 text-xs">Max Concurrent Pipelines</Label>
                      <Select value={maxConcurrent} onValueChange={setMaxConcurrent}>
                        <SelectTrigger className="bg-black/30 border-purple-500/20 text-purple-100 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['1', '2', '3', '4', '5'].map(n => (
                            <SelectItem key={n} value={n}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-300/60 text-xs">Retry Preset</Label>
                      <Select value={retryPreset} onValueChange={setRetryPreset}>
                        <SelectTrigger className="bg-black/30 border-purple-500/20 text-purple-100 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default (5min-30min, 50 attempts)</SelectItem>
                          <SelectItem value="subscription">Subscription (5min-6hr, 100 attempts)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Authentication */}
              <Card className="bg-black/40 border-purple-500/10 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                        <Lock className="size-4 text-purple-400" />
                        Authentication
                      </CardTitle>
                      <CardDescription className="text-purple-400/40 text-xs">Configure authenticated testing</CardDescription>
                    </div>
                    <Switch checked={authEnabled} onCheckedChange={setAuthEnabled} />
                  </div>
                </CardHeader>
                {authEnabled && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-purple-300/60 text-xs">Login Type</Label>
                        <Select value={authLoginType} onValueChange={setAuthLoginType}>
                          <SelectTrigger className="bg-black/30 border-purple-500/20 text-purple-100 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LOGIN_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-purple-300/60 text-xs">Login URL</Label>
                        <Input
                          value={authLoginUrl}
                          onChange={(e) => setAuthLoginUrl(e.target.value)}
                          placeholder="https://app.example.com/login"
                          className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-purple-300/60 text-xs">Username</Label>
                        <Input value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} placeholder="user@example.com" className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-purple-300/60 text-xs">Password</Label>
                        <Input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-purple-300/60 text-xs">TOTP Secret (Optional)</Label>
                        <Input value={authTotpSecret} onChange={(e) => setAuthTotpSecret(e.target.value)} placeholder="Base32 secret" className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 text-xs" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-300/60 text-xs">Login Flow (one step per line)</Label>
                      <Textarea
                        value={authLoginFlow}
                        onChange={(e) => setAuthLoginFlow(e.target.value)}
                        placeholder={'Navigate to $login_url\nEnter $username in #email field\nEnter $password in #password field\nClick #submit-btn'}
                        className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 text-xs min-h-[80px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-purple-300/60 text-xs">Success Condition Type</Label>
                        <Select value={authSuccessType} onValueChange={setAuthSuccessType}>
                          <SelectTrigger className="bg-black/30 border-purple-500/20 text-purple-100 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['url_contains', 'element_present', 'url_equals_exactly', 'text_contains'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-purple-300/60 text-xs">Success Condition Value</Label>
                        <Input value={authSuccessValue} onChange={(e) => setAuthSuccessValue(e.target.value)} placeholder="/dashboard" className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 text-xs" />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Rules of Engagement */}
              <Card className="bg-black/40 border-purple-500/10 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                    <Shield className="size-4 text-purple-400" />
                    Rules of Engagement
                  </CardTitle>
                  <CardDescription className="text-purple-400/40 text-xs">Define avoid/focus rules and engagement boundaries</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-purple-300/60 text-xs">Rules of Engagement (free text)</Label>
                    <Textarea
                      value={rulesOfEngagement}
                      onChange={(e) => setRulesOfEngagement(e.target.value)}
                      placeholder="Do not test the payment processing endpoints. Focus on user-facing APIs only..."
                      className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 text-xs min-h-[60px]"
                    />
                  </div>

                  {/* Avoid Rules */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-red-400/60 text-xs flex items-center gap-1"><XCircle className="size-3" /> Avoid Rules</Label>
                      <Button variant="ghost" size="sm" onClick={addAvoidRule} className="text-purple-400/60 hover:text-purple-200 h-6 text-[10px]">
                        <Plus className="size-3 mr-1" /> Add
                      </Button>
                    </div>
                    {avoidRules.map((rule, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <Input value={rule.description} onChange={(e) => updateAvoidRule(idx, 'description', e.target.value)} placeholder="Description" className="bg-black/30 border-red-500/10 text-purple-100 placeholder:text-purple-500/30 text-xs flex-1" />
                        <Select value={rule.type} onValueChange={(v) => updateAvoidRule(idx, 'type', v)}>
                          <SelectTrigger className="bg-black/30 border-red-500/10 text-purple-100 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {RULE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input value={rule.value} onChange={(e) => updateAvoidRule(idx, 'value', e.target.value)} placeholder="Value" className="bg-black/30 border-red-500/10 text-purple-100 placeholder:text-purple-500/30 text-xs w-[150px]" />
                        <Button variant="ghost" size="icon" onClick={() => removeAvoidRule(idx)} className="size-7 text-red-400/40 hover:text-red-400 shrink-0"><Trash2 className="size-3" /></Button>
                      </div>
                    ))}
                  </div>

                  {/* Focus Rules */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-green-400/60 text-xs flex items-center gap-1"><CheckCircle2 className="size-3" /> Focus Rules</Label>
                      <Button variant="ghost" size="sm" onClick={addFocusRule} className="text-purple-400/60 hover:text-purple-200 h-6 text-[10px]">
                        <Plus className="size-3 mr-1" /> Add
                      </Button>
                    </div>
                    {focusRules.map((rule, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <Input value={rule.description} onChange={(e) => updateFocusRule(idx, 'description', e.target.value)} placeholder="Description" className="bg-black/30 border-green-500/10 text-purple-100 placeholder:text-purple-500/30 text-xs flex-1" />
                        <Select value={rule.type} onValueChange={(v) => updateFocusRule(idx, 'type', v)}>
                          <SelectTrigger className="bg-black/30 border-green-500/10 text-purple-100 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {RULE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input value={rule.value} onChange={(e) => updateFocusRule(idx, 'value', e.target.value)} placeholder="Value" className="bg-black/30 border-green-500/10 text-purple-100 placeholder:text-purple-500/30 text-xs w-[150px]" />
                        <Button variant="ghost" size="icon" onClick={() => removeFocusRule(idx)} className="size-7 text-red-400/40 hover:text-red-400 shrink-0"><Trash2 className="size-3" /></Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Report Settings */}
              <Card className="bg-black/40 border-purple-500/10 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                    <FileText className="size-4 text-purple-400" />
                    Report Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-purple-300/60 text-xs">Min Severity</Label>
                      <Select value={reportMinSeverity} onValueChange={setReportMinSeverity}>
                        <SelectTrigger className="bg-black/30 border-purple-500/20 text-purple-100 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['low', 'medium', 'high', 'critical'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-300/60 text-xs">Min Confidence</Label>
                      <Select value={reportMinConfidence} onValueChange={setReportMinConfidence}>
                        <SelectTrigger className="bg-black/30 border-purple-500/20 text-purple-100 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['low', 'medium', 'high'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-300/60 text-xs">Guidance (max 500 chars)</Label>
                      <Input value={reportGuidance} onChange={(e) => setReportGuidance(e.target.value.slice(0, 500))} placeholder="Focus on..." className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 text-xs" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Start Button */}
              <div className="flex justify-end gap-3 pb-4">
                <Button variant="outline" onClick={onClose} className="border-purple-500/20 text-purple-300/60 hover:bg-purple-500/10 hover:text-purple-200">
                  Cancel
                </Button>
                <Button
                  onClick={handleStartScan}
                  disabled={!targetUrl || !repoPath || isStarting || selectedVulnClasses.length === 0}
                  className="bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 text-purple-200 disabled:opacity-30"
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="size-4 mr-2" />
                      Start Pentest
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ====== PIPELINE MONITOR ====== */}
          <TabsContent value="monitor" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-5xl mx-auto space-y-4">
              {pipelineProgress.length === 0 ? (
                <Card className="bg-black/40 border-purple-500/10 backdrop-blur-sm">
                  <CardContent className="py-12 text-center">
                    <Activity className="size-8 mx-auto mb-3 text-purple-400/30" />
                    <p className="text-purple-300/50 text-sm">No active pipeline</p>
                    <p className="text-purple-400/30 text-xs mt-1">Start a new scan to see pipeline progress</p>
                    <Button onClick={() => setActiveTab('new-scan')} variant="outline" size="sm" className="mt-4 border-purple-500/20 text-purple-300/60 hover:bg-purple-500/10">
                      <Plus className="size-3 mr-1" /> New Scan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Pipeline Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm font-medium text-purple-200">Pipeline Progress</h2>
                      <Badge variant="outline" className="text-[9px] border-blue-500/20 text-blue-400/80 bg-blue-500/5 font-mono">
                        <div className="size-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
                        Running
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={fetchProgress} className="text-purple-400/60 hover:text-purple-200 h-7 text-[10px]">
                        <RefreshCw className="size-3 mr-1" /> Refresh
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleStopScan} className="border-red-500/20 text-red-400/80 hover:bg-red-500/10 h-7 text-[10px]">
                        <Square className="size-3 mr-1" /> Stop
                      </Button>
                    </div>
                  </div>

                  {/* 5-Phase Pipeline Visualization */}
                  <div className="space-y-1">
                    {pipelineProgress.map((phase, phaseIdx) => (
                      <Card key={phase.phase} className={`bg-black/40 border backdrop-blur-sm ${
                        phase.status === 'in_progress' ? 'border-blue-500/30' :
                        phase.status === 'completed' ? 'border-green-500/20' :
                        phase.status === 'failed' ? 'border-red-500/30' :
                        'border-purple-500/10'
                      }`}>
                        <Accordion type="single" collapsible defaultValue={phase.status === 'in_progress' ? phase.phase : undefined}>
                          <AccordionItem value={phase.phase} className="border-none">
                            <AccordionTrigger className="py-3 px-4 hover:no-underline">
                              <div className="flex items-center gap-3 flex-1">
                                <StatusDot status={phase.status} />
                                <span className="text-xs font-medium text-purple-200">
                                  Phase {phaseIdx + 1}: {PHASE_LABELS[phase.phase] || phase.phase}
                                </span>
                                <Badge variant="outline" className={`text-[9px] ml-auto mr-4 ${
                                  phase.status === 'completed' ? 'border-green-500/20 text-green-400/80' :
                                  phase.status === 'in_progress' ? 'border-blue-500/20 text-blue-400/80' :
                                  phase.status === 'failed' ? 'border-red-500/20 text-red-400/80' :
                                  'border-purple-500/20 text-purple-400/40'
                                }`}>
                                  {phase.status}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-3">
                              <div className="space-y-1.5">
                                {phase.agents.map((agent) => (
                                  <div key={agent.name} className="flex items-center gap-3 pl-6">
                                    <PipelineNode
                                      name={agent.name}
                                      status={agent.status}
                                      progress={agent.progress}
                                      model={AGENT_MODELS[agent.name]}
                                      isLast={false}
                                    />
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </Card>
                    ))}
                  </div>

                  {/* Agent Summary */}
                  <Card className="bg-black/40 border-purple-500/10 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-purple-200">Agent Overview (13 Agents)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                        {Object.entries(AGENT_MODELS).map(([name, model]) => {
                          let agentStatus = 'pending'
                          for (const phase of pipelineProgress) {
                            const agent = phase.agents.find(a => a.name === name)
                            if (agent) { agentStatus = agent.status; break }
                          }
                          return (
                            <div key={name} className={`p-2 rounded-lg border text-center ${
                              agentStatus === 'completed' ? 'border-green-500/20 bg-green-500/5' :
                              agentStatus === 'running' || agentStatus === 'in_progress' ? 'border-blue-500/20 bg-blue-500/5' :
                              'border-purple-500/10 bg-purple-500/5'
                            }`}>
                              <StatusDot status={agentStatus} />
                              <p className="text-[10px] text-purple-200 mt-1 font-mono truncate">{name}</p>
                              <p className="text-[8px] text-purple-400/30 font-mono">{model}</p>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          {/* ====== WORKSPACES ====== */}
          <TabsContent value="workspaces" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-6xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-purple-200">Workspaces</h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={fetchWorkspaces} className="text-purple-400/60 hover:text-purple-200 h-7 text-[10px]">
                    <RefreshCw className="size-3 mr-1" /> Refresh
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('new-scan')} className="border-purple-500/20 text-purple-300/60 h-7 text-[10px]">
                    <Plus className="size-3 mr-1" /> New Scan
                  </Button>
                </div>
              </div>

              {workspaces.length === 0 ? (
                <Card className="bg-black/40 border-purple-500/10 backdrop-blur-sm">
                  <CardContent className="py-12 text-center">
                    <Folder className="size-8 mx-auto mb-3 text-purple-400/30" />
                    <p className="text-purple-300/50 text-sm">No workspaces found</p>
                    <p className="text-purple-400/30 text-xs mt-1">Start a new scan to create a workspace</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {workspaces.map(ws => (
                    <Card
                      key={ws.id}
                      className={`bg-black/40 border backdrop-blur-sm cursor-pointer hover:border-purple-500/30 transition-colors ${
                        ws.status === 'completed' ? 'border-green-500/10' :
                        ws.status === 'running' ? 'border-blue-500/10' :
                        ws.status === 'failed' ? 'border-red-500/10' :
                        'border-purple-500/10'
                      }`}
                      onClick={() => { setSelectedWorkspace(ws.name); setActiveTab('monitor') }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-sm font-medium text-purple-200 font-mono">{ws.name}</h3>
                            <p className="text-[10px] text-purple-400/40 mt-0.5">{ws.target}</p>
                          </div>
                          <Badge variant="outline" className={`text-[9px] ${
                            ws.status === 'completed' ? 'border-green-500/30 text-green-400/80 bg-green-500/5' :
                            ws.status === 'running' ? 'border-blue-500/30 text-blue-400/80 bg-blue-500/5' :
                            ws.status === 'failed' ? 'border-red-500/30 text-red-400/80 bg-red-500/5' :
                            'border-yellow-500/30 text-yellow-400/80 bg-yellow-500/5'
                          }`}>
                            {ws.status}
                          </Badge>
                        </div>
                        {ws.findings && (
                          <div className="flex gap-2 mb-3">
                            {ws.findings.critical > 0 && <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-mono">{ws.findings.critical} Critical</span>}
                            {ws.findings.high > 0 && <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded font-mono">{ws.findings.high} High</span>}
                            {ws.findings.medium > 0 && <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded font-mono">{ws.findings.medium} Medium</span>}
                            {ws.findings.low > 0 && <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-mono">{ws.findings.low} Low</span>}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[10px] text-purple-400/30">
                          <span>Created: {new Date(ws.createdAt).toLocaleDateString()}</span>
                          {ws.duration && <span className="font-mono">{ws.duration}</span>}
                          {ws.cost && <span className="font-mono">{ws.cost}</span>}
                        </div>
                        {ws.agents && (
                          <div className="mt-2">
                            <Progress value={(ws.agents.completed / ws.agents.total) * 100} className="h-1 bg-purple-500/10" />
                            <span className="text-[9px] text-purple-400/30 font-mono">{ws.agents.completed}/{ws.agents.total} agents</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ====== FINDINGS ====== */}
          <TabsContent value="findings" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-6xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-purple-200">Security Findings</h2>
                <div className="flex gap-2">
                  {['critical', 'high', 'medium', 'low'].map(sev => (
                    <Badge key={sev} variant="outline" className="text-[9px] font-mono cursor-pointer" style={{ borderColor: `${SEVERITY_COLORS[sev]}30`, color: SEVERITY_COLORS[sev], backgroundColor: `${SEVERITY_COLORS[sev]}10` }}>
                      {sev}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {sampleFindings.map(finding => (
                  <Card key={finding.id} className="bg-black/40 border-purple-500/10 backdrop-blur-sm hover:border-purple-500/20 transition-colors cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="size-8 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${SEVERITY_COLORS[finding.severity]}15` }}>
                          {finding.status === 'exploited' ? (
                            <Zap className="size-4" style={{ color: SEVERITY_COLORS[finding.severity] }} />
                          ) : (
                            <ShieldAlert className="size-4" style={{ color: SEVERITY_COLORS[finding.severity] }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono text-purple-400/50">{finding.id}</span>
                            <SeverityBadge severity={finding.severity} />
                            <Badge variant="outline" className="text-[9px] border-purple-500/20 text-purple-400/60 bg-purple-500/5">{finding.vulnType}</Badge>
                            <Badge variant="outline" className={`text-[9px] ${
                              finding.status === 'exploited' ? 'border-red-500/20 text-red-400/80 bg-red-500/5' :
                              finding.status === 'blocked' ? 'border-yellow-500/20 text-yellow-400/80 bg-yellow-500/5' :
                              'border-green-500/20 text-green-400/80 bg-green-500/5'
                            }`}>
                              {finding.status}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-medium text-purple-100">{finding.title}</h4>
                          <p className="text-xs text-purple-300/50 mt-0.5">{finding.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-purple-400/30 font-mono flex items-center gap-1">
                              <Globe className="size-3" /> {finding.endpoint}
                            </span>
                            <span className="text-[10px] text-purple-400/30 font-mono">
                              Confidence: {finding.confidence}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-purple-500/20 shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ====== REPORTS ====== */}
          <TabsContent value="reports" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-5xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-purple-200">Assessment Reports</h2>
                <Button variant="outline" size="sm" className="border-purple-500/20 text-purple-300/60 h-7 text-[10px]">
                  <Download className="size-3 mr-1" /> Export
                </Button>
              </div>

              {/* Report Preview */}
              <Card className="bg-black/40 border-purple-500/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="prose prose-invert max-w-none">
                    <div className="border-b border-purple-500/10 pb-4 mb-4">
                      <h2 className="text-lg font-semibold text-purple-100 flex items-center gap-2">
                        <Shield className="size-5 text-purple-400" />
                        Comprehensive Security Assessment Report
                      </h2>
                      <div className="flex gap-4 mt-2 text-[10px] text-purple-400/40 font-mono">
                        <span>Target: https://example.com</span>
                        <span>Date: 2025-01-16</span>
                        <span>Scope: Full Assessment</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-purple-200 mb-2">Executive Summary</h3>
                        <p className="text-xs text-purple-300/60 leading-relaxed">
                          The security assessment identified 8 exploitable vulnerabilities across 5 vulnerability classes.
                          Two critical-severity issues were found: SQL Injection in the authentication system and broken
                          authentication mechanisms that allow brute-force attacks. Immediate remediation is recommended
                          for all critical and high-severity findings.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-purple-200 mb-2">Findings Summary</h3>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-center">
                            <div className="text-xl font-bold text-red-400">2</div>
                            <div className="text-[10px] text-red-400/60">Critical</div>
                          </div>
                          <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/10 text-center">
                            <div className="text-xl font-bold text-orange-400">3</div>
                            <div className="text-[10px] text-orange-400/60">High</div>
                          </div>
                          <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 text-center">
                            <div className="text-xl font-bold text-yellow-400">2</div>
                            <div className="text-[10px] text-yellow-400/60">Medium</div>
                          </div>
                          <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10 text-center">
                            <div className="text-xl font-bold text-green-400">1</div>
                            <div className="text-[10px] text-green-400/60">Low</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-purple-200 mb-2">Detailed Findings</h3>
                        {sampleFindings.slice(0, 3).map(finding => (
                          <div key={finding.id} className="p-3 rounded-lg border border-purple-500/10 bg-purple-500/5 mb-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono text-purple-400/50">{finding.id}</span>
                              <SeverityBadge severity={finding.severity} />
                              <span className="text-xs font-medium text-purple-100">{finding.title}</span>
                            </div>
                            <p className="text-xs text-purple-300/50">{finding.description}</p>
                            <div className="mt-2 p-2 rounded bg-black/30 border border-purple-500/5">
                              <p className="text-[10px] text-purple-400/40 font-mono mb-1">Exploitation Steps:</p>
                              <ol className="text-[10px] text-purple-300/60 font-mono list-decimal list-inside space-y-0.5">
                                <li>Navigate to {finding.endpoint}</li>
                                <li>Inject payload: &lt;script&gt;alert(1)&lt;/script&gt;</li>
                                <li>Observe reflected payload in response</li>
                              </ol>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ====== LOGS ====== */}
          <TabsContent value="logs" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-5xl mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-purple-200">Workflow Logs</h2>
                <div className="flex gap-2">
                  <Select value={selectedWorkspace || ''} onValueChange={(v) => { setSelectedWorkspace(v); fetchLogs(v) }}>
                    <SelectTrigger className="bg-black/30 border-purple-500/20 text-purple-100 text-xs w-[200px] h-7">
                      <SelectValue placeholder="Select workspace" />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaces.map(ws => <SelectItem key={ws.id} value={ws.name}>{ws.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm" className="text-purple-400/60 hover:text-purple-200 h-7 text-[10px]">
                    <RefreshCw className="size-3" />
                  </Button>
                </div>
              </div>

              <Card className="bg-black/60 border-purple-500/10 backdrop-blur-sm font-mono">
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="p-3 space-y-0.5">
                      {(logs.length > 0 ? logs : [
                        { timestamp: '2025-01-16T08:00:01Z', level: 'info' as const, message: 'Shannon v1.5.0 — Autonomous White-Box AI Pentester' },
                        { timestamp: '2025-01-16T08:00:01Z', level: 'info' as const, message: 'Connecting to Temporal server at localhost:7233...' },
                        { timestamp: '2025-01-16T08:00:02Z', level: 'info' as const, message: 'Temporal connection established' },
                        { timestamp: '2025-01-16T08:00:03Z', level: 'info' as const, message: 'Waiting for workflow to start...' },
                        { timestamp: '2025-01-16T08:00:04Z', level: 'info' as const, message: 'Workflow pentestPipelineWorkflow started' },
                        { timestamp: '2025-01-16T08:00:05Z', level: 'info' as const, message: '[preflight] Validating target URL...' },
                        { timestamp: '2025-01-16T08:00:05Z', level: 'info' as const, message: '[preflight] Target URL reachable ✓' },
                        { timestamp: '2025-01-16T08:00:06Z', level: 'info' as const, message: '[preflight] Repository path validated ✓' },
                        { timestamp: '2025-01-16T08:00:07Z', level: 'info' as const, message: '[preflight] Credentials validated ✓' },
                        { timestamp: '2025-01-16T08:00:08Z', level: 'info' as const, message: '[pre-recon] Starting pre-reconnaissance agent (claude-opus-4-7)' },
                        { timestamp: '2025-01-16T08:02:30Z', level: 'info' as const, message: '[pre-recon] Agent completed — deliverable written to pre_recon_deliverable.md' },
                        { timestamp: '2025-01-16T08:02:31Z', level: 'info' as const, message: '[recon] Starting reconnaissance agent (claude-sonnet-4-6)' },
                        { timestamp: '2025-01-16T08:06:15Z', level: 'info' as const, message: '[recon] Agent completed — deliverable written to recon_deliverable.md' },
                        { timestamp: '2025-01-16T08:06:16Z', level: 'info' as const, message: '[vuln] Starting 5 parallel vulnerability analysis agents...' },
                        { timestamp: '2025-01-16T08:06:17Z', level: 'info' as const, message: '[vuln/injection] Agent started' },
                        { timestamp: '2025-01-16T08:06:17Z', level: 'info' as const, message: '[vuln/xss] Agent started' },
                        { timestamp: '2025-01-16T08:06:18Z', level: 'info' as const, message: '[vuln/auth] Agent started' },
                        { timestamp: '2025-01-16T08:06:18Z', level: 'info' as const, message: '[vuln/authz] Agent started' },
                        { timestamp: '2025-01-16T08:06:19Z', level: 'info' as const, message: '[vuln/ssrf] Agent started' },
                      ]).map((log, idx) => (
                        <div key={idx} className="flex gap-3 text-[11px] leading-relaxed">
                          <span className="text-purple-500/30 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          <span className={`shrink-0 w-10 ${
                            log.level === 'error' ? 'text-red-400' :
                            log.level === 'warn' ? 'text-yellow-400' :
                            'text-blue-400/60'
                          }`}>{log.level.toUpperCase()}</span>
                          <span className="text-purple-200/70">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ====== SETUP ====== */}
          <TabsContent value="setup" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-3xl mx-auto space-y-4">
              <h2 className="text-sm font-medium text-purple-200">Provider Configuration</h2>

              <Card className="bg-black/40 border-purple-500/10 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-purple-200">AI Provider</CardTitle>
                  <CardDescription className="text-purple-400/40 text-xs">Configure the AI provider for agent execution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-purple-300/60 text-xs">Provider</Label>
                    <Select value={setupProvider} onValueChange={setSetupProvider}>
                      <SelectTrigger className="bg-black/30 border-purple-500/20 text-purple-100 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anthropic">Anthropic Direct (Recommended)</SelectItem>
                        <SelectItem value="anthropic-oauth">Anthropic OAuth</SelectItem>
                        <SelectItem value="custom">Custom Base URL</SelectItem>
                        <SelectItem value="bedrock">AWS Bedrock</SelectItem>
                        <SelectItem value="vertex">Google Vertex AI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {setupProvider === 'anthropic' && (
                    <div className="space-y-2">
                      <Label className="text-purple-300/60 text-xs">Anthropic API Key</Label>
                      <Input
                        type="password"
                        value={setupApiKey}
                        onChange={(e) => setSetupApiKey(e.target.value)}
                        placeholder="sk-ant-..."
                        className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 text-xs"
                      />
                    </div>
                  )}

                  {setupProvider === 'anthropic-oauth' && (
                    <div className="space-y-2">
                      <Label className="text-purple-300/60 text-xs">Claude Code OAuth Token</Label>
                      <Input type="password" placeholder="OAuth token" className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 text-xs" />
                    </div>
                  )}

                  {setupProvider === 'custom' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-purple-300/60 text-xs">Custom Base URL</Label>
                        <Input placeholder="https://api.example.com/v1" className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-purple-300/60 text-xs">Auth Token</Label>
                        <Input type="password" placeholder="Bearer token" className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 text-xs" />
                      </div>
                    </div>
                  )}

                  {setupProvider === 'bedrock' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-purple-300/60 text-xs">AWS Region</Label>
                        <Input placeholder="us-east-1" className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-purple-300/60 text-xs">AWS Bearer Token (Bedrock)</Label>
                        <Input type="password" placeholder="Bearer token" className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 text-xs" />
                      </div>
                    </div>
                  )}

                  {setupProvider === 'vertex' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-purple-300/60 text-xs">GCP Region</Label>
                        <Input placeholder="us-central1" className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-purple-300/60 text-xs">Project ID</Label>
                        <Input placeholder="my-project-id" className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-purple-300/60 text-xs">Service Account Key (JSON path)</Label>
                        <Input placeholder="/path/to/key.json" className="bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 text-xs" />
                      </div>
                    </div>
                  )}

                  <Button onClick={handleSetup} className="bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 text-purple-200">
                    <Save className="size-4 mr-2" />
                    Save Configuration
                  </Button>
                </CardContent>
              </Card>

              {/* Model Tiers */}
              <Card className="bg-black/40 border-purple-500/10 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-purple-200">Model Tiers</CardTitle>
                  <CardDescription className="text-purple-400/40 text-xs">Default models per tier (override with environment variables)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-purple-500/10 hover:bg-transparent">
                        <TableHead className="text-purple-400/40 text-[11px]">Tier</TableHead>
                        <TableHead className="text-purple-400/40 text-[11px]">Default Model</TableHead>
                        <TableHead className="text-purple-400/40 text-[11px]">Override Env Var</TableHead>
                        <TableHead className="text-purple-400/40 text-[11px]">Use Case</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        ['Small', 'claude-haiku-4-5-20251001', 'ANTHROPIC_SMALL_MODEL', 'Summarization, extraction'],
                        ['Medium', 'claude-sonnet-4-6', 'ANTHROPIC_MEDIUM_MODEL', 'Tool use, general analysis'],
                        ['Large', 'claude-opus-4-7', 'ANTHROPIC_LARGE_MODEL', 'Deep reasoning (pre-recon only)'],
                      ].map(([tier, model, env, use]) => (
                        <TableRow key={tier} className="border-purple-500/5 hover:bg-purple-500/5">
                          <TableCell className="text-purple-200 text-xs font-mono">{tier}</TableCell>
                          <TableCell className="text-purple-300/60 text-xs font-mono">{model}</TableCell>
                          <TableCell className="text-purple-400/40 text-[10px] font-mono">{env}</TableCell>
                          <TableCell className="text-purple-300/40 text-xs">{use}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Error Codes Reference */}
              <Card className="bg-black/40 border-purple-500/10 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-purple-200">Error Codes Reference</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-1">
                      {[
                        ['CONFIG_NOT_FOUND', 'Config file missing', 'config', false],
                        ['CONFIG_VALIDATION_FAILED', 'Schema validation failed', 'config', false],
                        ['AGENT_EXECUTION_FAILED', 'Agent failed to execute', 'validation', true],
                        ['API_RATE_LIMITED', 'API rate limit hit', 'billing', true],
                        ['SPENDING_CAP_REACHED', 'Spending cap reached', 'billing', true],
                        ['INSUFFICIENT_CREDITS', 'Insufficient credits', 'billing', false],
                        ['GIT_CHECKPOINT_FAILED', 'Git checkpoint failed', 'filesystem', true],
                        ['TARGET_UNREACHABLE', 'Target URL unreachable', 'network', true],
                        ['AUTH_FAILED', 'Credential validation failed', 'config', false],
                        ['AUTH_LOGIN_FAILED', 'Login flow failed', 'config', false],
                      ].map(([code, desc, cat, retryable]) => (
                        <div key={code} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-purple-500/5">
                          <code className="text-[10px] font-mono text-red-400/80 min-w-[200px]">{code}</code>
                          <span className="text-[11px] text-purple-300/50 flex-1">{desc}</span>
                          <Badge variant="outline" className="text-[8px] border-purple-500/20 text-purple-400/40 bg-purple-500/5">{cat}</Badge>
                          <Badge variant="outline" className={`text-[8px] ${retryable ? 'border-green-500/20 text-green-400/60' : 'border-red-500/20 text-red-400/60'}`}>
                            {retryable ? 'retryable' : 'non-retryable'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  )
}
