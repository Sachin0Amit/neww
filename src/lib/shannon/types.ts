/**
 * Shannon - Autonomous White-Box AI Pentester
 * Type definitions adapted from the original Shannon codebase (AGPL-3.0)
 * Original: https://github.com/KeygraphHQ/shannon
 */

// =================== AGENTS ===================

export const ALL_AGENTS = [
  'pre-recon',
  'recon',
  'injection-vuln',
  'xss-vuln',
  'auth-vuln',
  'ssrf-vuln',
  'authz-vuln',
  'injection-exploit',
  'xss-exploit',
  'auth-exploit',
  'ssrf-exploit',
  'authz-exploit',
  'report',
] as const;

export type AgentName = (typeof ALL_AGENTS)[number];

export type AgentStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled-back';

export interface AgentDefinition {
  name: AgentName;
  displayName: string;
  prerequisites: AgentName[];
  phase: 'pre-recon' | 'recon' | 'vuln-analysis' | 'exploitation' | 'reporting';
  promptTemplate: string;
  deliverableFilename: string;
  modelTier: 'small' | 'medium' | 'large';
}

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  { name: 'pre-recon', displayName: 'Pre-Reconnaissance', prerequisites: [], phase: 'pre-recon', promptTemplate: 'pre-recon-code', deliverableFilename: 'pre_recon_deliverable.md', modelTier: 'large' },
  { name: 'recon', displayName: 'Reconnaissance', prerequisites: ['pre-recon'], phase: 'recon', promptTemplate: 'recon', deliverableFilename: 'recon_deliverable.md', modelTier: 'medium' },
  { name: 'injection-vuln', displayName: 'Injection Analysis', prerequisites: ['recon'], phase: 'vuln-analysis', promptTemplate: 'vuln-injection', deliverableFilename: 'injection_analysis_deliverable.md', modelTier: 'medium' },
  { name: 'xss-vuln', displayName: 'XSS Analysis', prerequisites: ['recon'], phase: 'vuln-analysis', promptTemplate: 'vuln-xss', deliverableFilename: 'xss_analysis_deliverable.md', modelTier: 'medium' },
  { name: 'auth-vuln', displayName: 'Auth Analysis', prerequisites: ['recon'], phase: 'vuln-analysis', promptTemplate: 'vuln-auth', deliverableFilename: 'auth_analysis_deliverable.md', modelTier: 'medium' },
  { name: 'ssrf-vuln', displayName: 'SSRF Analysis', prerequisites: ['recon'], phase: 'vuln-analysis', promptTemplate: 'vuln-ssrf', deliverableFilename: 'ssrf_analysis_deliverable.md', modelTier: 'medium' },
  { name: 'authz-vuln', displayName: 'AuthZ Analysis', prerequisites: ['recon'], phase: 'vuln-analysis', promptTemplate: 'vuln-authz', deliverableFilename: 'authz_analysis_deliverable.md', modelTier: 'medium' },
  { name: 'injection-exploit', displayName: 'Injection Exploitation', prerequisites: ['injection-vuln'], phase: 'exploitation', promptTemplate: 'exploit-injection', deliverableFilename: 'injection_exploitation_evidence.md', modelTier: 'medium' },
  { name: 'xss-exploit', displayName: 'XSS Exploitation', prerequisites: ['xss-vuln'], phase: 'exploitation', promptTemplate: 'exploit-xss', deliverableFilename: 'xss_exploitation_evidence.md', modelTier: 'medium' },
  { name: 'auth-exploit', displayName: 'Auth Exploitation', prerequisites: ['auth-vuln'], phase: 'exploitation', promptTemplate: 'exploit-auth', deliverableFilename: 'auth_exploitation_evidence.md', modelTier: 'medium' },
  { name: 'ssrf-exploit', displayName: 'SSRF Exploitation', prerequisites: ['ssrf-vuln'], phase: 'exploitation', promptTemplate: 'exploit-ssrf', deliverableFilename: 'ssrf_exploitation_evidence.md', modelTier: 'medium' },
  { name: 'authz-exploit', displayName: 'AuthZ Exploitation', prerequisites: ['authz-vuln'], phase: 'exploitation', promptTemplate: 'exploit-authz', deliverableFilename: 'authz_exploitation_evidence.md', modelTier: 'medium' },
  { name: 'report', displayName: 'Report Generation', prerequisites: ['injection-exploit', 'xss-exploit', 'auth-exploit', 'ssrf-exploit', 'authz-exploit'], phase: 'reporting', promptTemplate: 'report-executive', deliverableFilename: 'comprehensive_security_assessment_report.md', modelTier: 'medium' },
];

export type VulnType = 'injection' | 'xss' | 'auth' | 'ssrf' | 'authz';

// =================== CONFIG ===================

export type RuleType = 'url_path' | 'subdomain' | 'domain' | 'method' | 'header' | 'parameter' | 'code_path';

export interface Rule {
  description: string;
  type: RuleType;
  value: string;
}

export interface Rules {
  avoid?: Rule[];
  focus?: Rule[];
}

export type VulnClass = 'injection' | 'xss' | 'auth' | 'authz' | 'ssrf';

export const ALL_VULN_CLASSES: readonly VulnClass[] = ['injection', 'xss', 'auth', 'authz', 'ssrf'];

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Confidence = 'low' | 'medium' | 'high';

export interface ReportConfig {
  min_severity?: Severity;
  min_confidence?: Confidence;
  guidance?: string;
}

export type LoginType = 'form' | 'sso' | 'api' | 'basic';

export interface SuccessCondition {
  type: 'url_contains' | 'element_present' | 'url_equals_exactly' | 'text_contains';
  value: string;
}

export interface EmailLogin {
  address: string;
  password: string;
  totp_secret?: string;
}

export interface Credentials {
  username: string;
  password?: string;
  totp_secret?: string;
  email_login?: EmailLogin;
}

export interface Authentication {
  login_type: LoginType;
  login_url: string;
  credentials: Credentials;
  login_flow?: string[];
  success_condition: SuccessCondition;
}

export interface PipelineConfig {
  retry_preset?: 'default' | 'subscription';
  max_concurrent_pipelines?: number;
}

export interface Config {
  rules?: Rules;
  authentication?: Authentication;
  pipeline?: PipelineConfig;
  description?: string;
  vuln_classes?: VulnClass[];
  exploit?: 'true' | 'false';
  report?: ReportConfig;
  rules_of_engagement?: string;
}

export interface DistributedConfig {
  avoid: Rule[];
  focus: Rule[];
  authentication: Authentication | null;
  description: string;
  vuln_classes: VulnClass[];
  exploit: boolean;
  report: ReportConfig;
  rules_of_engagement: string;
}

// =================== ERRORS ===================

export enum ErrorCode {
  CONFIG_NOT_FOUND = 'CONFIG_NOT_FOUND',
  CONFIG_VALIDATION_FAILED = 'CONFIG_VALIDATION_FAILED',
  CONFIG_PARSE_ERROR = 'CONFIG_PARSE_ERROR',
  AGENT_EXECUTION_FAILED = 'AGENT_EXECUTION_FAILED',
  OUTPUT_VALIDATION_FAILED = 'OUTPUT_VALIDATION_FAILED',
  API_RATE_LIMITED = 'API_RATE_LIMITED',
  SPENDING_CAP_REACHED = 'SPENDING_CAP_REACHED',
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
  GIT_CHECKPOINT_FAILED = 'GIT_CHECKPOINT_FAILED',
  GIT_ROLLBACK_FAILED = 'GIT_ROLLBACK_FAILED',
  PROMPT_LOAD_FAILED = 'PROMPT_LOAD_FAILED',
  DELIVERABLE_NOT_FOUND = 'DELIVERABLE_NOT_FOUND',
  REPO_NOT_FOUND = 'REPO_NOT_FOUND',
  TARGET_UNREACHABLE = 'TARGET_UNREACHABLE',
  AUTH_FAILED = 'AUTH_FAILED',
  AUTH_LOGIN_FAILED = 'AUTH_LOGIN_FAILED',
  BILLING_ERROR = 'BILLING_ERROR',
}

export type PentestErrorType = 'config' | 'network' | 'prompt' | 'filesystem' | 'validation' | 'billing' | 'unknown';

export interface PentestErrorContext {
  [key: string]: unknown;
}

// =================== RESULT ===================

export interface Ok<T> { readonly ok: true; readonly value: T }
export interface Err<E> { readonly ok: false; readonly error: E }
export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> { return { ok: true, value }; }
export function err<E>(error: E): Err<E> { return { ok: false, error }; }
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> { return result.ok === true; }
export function isErr<T, E>(result: Result<T, E>): result is Err<E> { return result.ok === false; }

// =================== DELIVERABLES ===================

export enum DeliverableType {
  CODE_ANALYSIS = 'CODE_ANALYSIS',
  RECON = 'RECON',
  INJECTION_ANALYSIS = 'INJECTION_ANALYSIS',
  XSS_ANALYSIS = 'XSS_ANALYSIS',
  AUTH_ANALYSIS = 'AUTH_ANALYSIS',
  AUTHZ_ANALYSIS = 'AUTHZ_ANALYSIS',
  SSRF_ANALYSIS = 'SSRF_ANALYSIS',
  INJECTION_EXPLOIT = 'INJECTION_EXPLOIT',
  XSS_EXPLOIT = 'XSS_EXPLOIT',
  AUTH_EXPLOIT = 'AUTH_EXPLOIT',
  AUTHZ_EXPLOIT = 'AUTHZ_EXPLOIT',
  SSRF_EXPLOIT = 'SSRF_EXPLOIT',
  REPORT = 'REPORT',
}

export const DELIVERABLE_FILENAMES: Record<string, string> = {
  [DeliverableType.CODE_ANALYSIS]: 'pre_recon_deliverable.md',
  [DeliverableType.RECON]: 'recon_deliverable.md',
  [DeliverableType.INJECTION_ANALYSIS]: 'injection_analysis_deliverable.md',
  [DeliverableType.XSS_ANALYSIS]: 'xss_analysis_deliverable.md',
  [DeliverableType.AUTH_ANALYSIS]: 'auth_analysis_deliverable.md',
  [DeliverableType.AUTHZ_ANALYSIS]: 'authz_analysis_deliverable.md',
  [DeliverableType.SSRF_ANALYSIS]: 'ssrf_analysis_deliverable.md',
  [DeliverableType.INJECTION_EXPLOIT]: 'injection_exploitation_evidence.md',
  [DeliverableType.XSS_EXPLOIT]: 'xss_exploitation_evidence.md',
  [DeliverableType.AUTH_EXPLOIT]: 'auth_exploitation_evidence.md',
  [DeliverableType.AUTHZ_EXPLOIT]: 'authz_exploitation_evidence.md',
  [DeliverableType.SSRF_EXPLOIT]: 'ssrf_exploitation_evidence.md',
  [DeliverableType.REPORT]: 'comprehensive_security_assessment_report.md',
};

// =================== METRICS ===================

export interface AgentMetrics {
  durationMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  costUsd: number | null;
  numTurns: number | null;
  model?: string;
  skipped?: boolean;
}

// =================== WEB BACKEND TYPES ===================

export interface AgentProgress {
  name: AgentName;
  status: AgentStatus;
  progress: number;
  duration?: string;
  model?: string;
  startTime?: number;
  endTime?: number;
  error?: string;
}

export interface PipelinePhase {
  phase: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  agents: AgentProgress[];
}

export interface WorkspaceState {
  id: string;
  name: string;
  targetUrl: string;
  repoPath: string;
  config: Config;
  status: 'initializing' | 'running' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  currentPhase?: string;
  currentAgent?: string;
  error?: string;
  findings?: { critical: number; high: number; medium: number; low: number };
  cost?: number;
  agentMetrics: Record<string, AgentMetrics>;
  pipeline: PipelinePhase[];
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: string;
}

export interface ScanRequest {
  url: string;
  repo: string;
  workspace?: string;
  config?: string;
  pipelineTesting?: boolean;
  exploit?: boolean;
  vulnClasses?: VulnClass[];
  authentication?: Authentication;
  rules?: Rules;
  report?: ReportConfig;
  description?: string;
  rulesOfEngagement?: string;
  maxConcurrent?: number;
  retryPreset?: 'default' | 'subscription';
}

export interface ExploitationDecision {
  shouldExploit: boolean;
  shouldRetry: boolean;
  vulnerabilityCount: number;
  vulnType: VulnType;
}

export interface Finding {
  id: string;
  vulnType: VulnType;
  severity: Severity;
  title: string;
  description: string;
  endpoint: string;
  status: 'exploited' | 'blocked' | 'confirmed';
  confidence: Confidence;
  evidence?: string;
  steps?: string[];
}
