/**
 * OSIRIS - OSINT Intelligence Types
 * Type definitions for the OSIRIS open-source intelligence dashboard.
 */

// =================== Domain Types ===================

/** Operational domain classification */
export type IntelDomain = 'AIR' | 'SEA' | 'LAND' | 'SPACE' | 'CYBER';

/** Entity type classification */
export type IntelEntityType = 'TRACK' | 'FACILITY' | 'EVENT';

/** Threat level classification */
export type ThreatLevel = 'NONE' | 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

/** Severity levels for threat intel */
export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';

// =================== Intel Entity ===================

/** An intelligence entity tracked by OSIRIS */
export interface IntelEntity {
  id: string;
  name: string;
  domain: IntelDomain;
  type: IntelEntityType;
  threat: ThreatLevel;
  location?: {
    lat: number;
    lon: number;
    label?: string;
  };
  metadata: Record<string, unknown>;
  lastSeen: string;
  sources: string[];
}

// =================== Recon Results ===================

/** Base result structure for all recon tools */
export interface ReconResult {
  tool: string;
  query: string;
  results: Record<string, unknown>;
  timestamp: string;
  error?: string;
}

/** DNS lookup result */
export interface DNSResult {
  domain: string;
  records: Array<{
    type: string;
    value: string;
    ttl?: number;
    priority?: number;
  }>;
  nameservers?: string[];
  mxRecords?: string[];
  spfRecord?: string;
  dkimRecord?: string;
  dmarcRecord?: string;
}

/** WHOIS lookup result */
export interface WHOISResult {
  domain: string;
  registrar?: string;
  creationDate?: string;
  expirationDate?: string;
  updatedDate?: string;
  nameServers?: string[];
  registrant?: string;
  registrantCountry?: string;
  status?: string;
  organization?: string;
  adminEmail?: string;
}

/** IP intelligence result */
export interface IPResult {
  ip: string;
  asn?: string;
  isp?: string;
  organization?: string;
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  hostname?: string;
  isProxy?: boolean;
  isTor?: boolean;
  isHosting?: boolean;
  reputation?: string;
  abuseScore?: number;
}

/** SSL certificate result */
export interface CertResult {
  domain: string;
  issuer?: string;
  subject?: string;
  validFrom?: string;
  validTo?: string;
  serialNumber?: string;
  fingerprint?: string;
  protocol?: string;
  keySize?: number;
  isExpired?: boolean;
  isSelfSigned?: boolean;
  sanNames?: string[];
  chainIssues?: string[];
}

/** BGP/ASN lookup result */
export interface BGPResult {
  asn?: string;
  asName?: string;
  asOrg?: string;
  prefix?: string;
  country?: string;
  peers?: string[];
  upstreams?: string[];
  downstreams?: string[];
  rpkiStatus?: string;
}

/** CVE lookup result */
export interface CVEResult {
  cveId: string;
  description?: string;
  severity?: Severity;
  cvssScore?: number;
  cvssVector?: string;
  publishedDate?: string;
  modifiedDate?: string;
  affectedProducts?: string[];
  references?: string[];
  cwe?: string;
  exploitAvailable?: boolean;
  patchAvailable?: boolean;
}

// =================== Threat Intelligence ===================

/** Threat intelligence indicator */
export interface ThreatIntel {
  id: string;
  type: string;
  severity: Severity;
  source: string;
  description: string;
  indicators: string[];
  domain: IntelDomain;
  timestamp: string;
  confidence: number; // 0-100
  tlp?: string; // Traffic Light Protocol
  tags?: string[];
}

// =================== AI Analysis ===================

/** AI-generated intelligence analysis */
export interface AIAnalysis {
  summary: string;
  bluf: string; // Bottom Line Up Front
  key_findings: string[];
  recommendations: string[];
  confidence: number; // 0-100
  threat_assessment: ThreatLevel;
  risk_matrix: {
    likelihood: number; // 0-100
    impact: number; // 0-100
    risk_score: number; // 0-100
  };
  related_entities?: string[];
  sources_evaluated: number;
  analysis_depth: 'surface' | 'moderate' | 'deep';
  generated_at: string;
}

// =================== Threat Scoring ===================

/** Weighted threat score component */
export interface ThreatScoreComponent {
  source: string;
  score: number; // 0-100
  weight: number; // 0-1
  weighted_score: number;
  reasoning?: string;
}

/** Composite threat assessment */
export interface CompositeThreatScore {
  overall_score: number; // 0-100
  threat_level: ThreatLevel;
  components: ThreatScoreComponent[];
  risk_matrix: {
    likelihood: number;
    impact: number;
    quadrant: 'low-low' | 'low-high' | 'high-low' | 'high-high';
  };
  confidence: number;
  timestamp: string;
}

// =================== Workspace State ===================

import type { BaseWorkspaceState, TokenUsage, Progress } from '@/lib/types';

/** OSIRIS workspace state */
export interface OsirisWorkspaceState extends BaseWorkspaceState {
  toolId: 'osiris';
  target?: string;
  domain?: IntelDomain;
  reconResults?: ReconResult[];
  threatScore?: CompositeThreatScore;
  aiAnalysis?: AIAnalysis;
  entities?: IntelEntity[];
  threatIntel?: ThreatIntel[];
}

// =================== API Request Types ===================

/** Recon tool execution request */
export interface ReconRequest {
  target: string;
  tools?: string[];
  domain?: IntelDomain;
}

/** AI analysis request */
export interface AnalyzeRequest {
  target: string;
  reconData?: ReconResult[];
  domain?: IntelDomain;
  depth?: 'surface' | 'moderate' | 'deep';
}

/** Multi-tool search request */
export interface OsirisSearchRequest {
  query: string;
  tools?: string[];
  domain?: IntelDomain;
}

/** Threat landscape request */
export interface ThreatLandscapeRequest {
  domain?: IntelDomain;
  region?: string;
  severity?: Severity;
  limit?: number;
}
