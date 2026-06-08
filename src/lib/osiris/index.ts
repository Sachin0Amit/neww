/**
 * OSIRIS - Barrel Export
 *
 * Central export point for all OSIRIS modules.
 */

// =================== Types ===================
export type {
  IntelDomain,
  IntelEntityType,
  ThreatLevel,
  Severity,
  IntelEntity,
  ReconResult,
  DNSResult,
  WHOISResult,
  IPResult,
  CertResult,
  BGPResult,
  CVEResult,
  ThreatIntel,
  AIAnalysis,
  ThreatScoreComponent,
  CompositeThreatScore,
  OsirisWorkspaceState,
  ReconRequest,
  AnalyzeRequest,
  OsirisSearchRequest,
  ThreatLandscapeRequest,
} from './types';

// =================== Recon Tools ===================
export {
  dnsLookup,
  whoisLookup,
  ipIntelligence,
  certLookup,
  bgpLookup,
  cveLookup,
  shodanLookup,
  networkSweep,
  sanctionsSearch,
  threatIntelligence,
  phoneLookup,
  macLookup,
  githubIntel,
  leakDetection,
  RECON_TOOLS,
  getReconTool,
  runReconTools,
} from './recon-tools';

export type { ReconToolDef } from './recon-tools';

// =================== Analysis Engine ===================
export {
  surfaceAnalysis,
  moderateAnalysis,
  deepAnalysis,
  calculateCompositeThreatScore,
  extractEntities,
  extractThreatIntel,
  runAnalysisPipeline,
} from './analysis-engine';

// =================== Workspace Manager ===================
export {
  createWorkspace,
  getWorkspace,
  getWorkspaceById,
  listWorkspaces,
  updateReconResults,
  updateThreatScore,
  updateAIAnalysis,
  updateEntities,
  updateThreatIntel,
  markRunning,
  markCompleted,
  markFailed,
  deleteWorkspace,
  appendLog,
  getStatus,
  findWorkspaceDirById,
  fullWorkspaceUpdate,
  addTokenUsage,
} from './workspace-manager';

export type { CreatedWorkspace } from './workspace-manager';
