/**
 * Shannon - Findings Renderer
 * Converts collected data into structured findings
 */

import { type WorkspaceState, type Finding, type Severity, type Confidence, type VulnType } from './types';
import { listDeliverables, readDeliverable } from './workspace-manager';

/** Parse findings from workspace deliverables */
export async function parseFindings(workspaceName: string): Promise<Finding[]> {
  const files = await listDeliverables(workspaceName);
  const findings: Finding[] = [];

  for (const file of files) {
    if (!file.includes('analysis_deliverable') && !file.includes('exploitation_evidence')) continue;

    const content = await readDeliverable(workspaceName, file);
    if (!content) continue;

    const vulnType = extractVulnType(file) as VulnType;
    const isExploit = file.includes('exploitation_evidence');

    // Parse structured findings from the markdown content
    const findingBlocks = content.split(/^##+ /m).filter(block =>
      block.trim() && (
        block.match(/severity/i) ||
        block.match(/vuln/i) ||
        block.match(/finding/i) ||
        block.match(/CVE/i)
      )
    );

    for (const block of findingBlocks) {
      const severity = extractSeverity(block);
      const confidence = extractConfidence(block);
      const title = extractTitle(block);
      const endpoint = extractEndpoint(block);

      if (title) {
        findings.push({
          id: `${vulnType.toUpperCase()}-${findings.length + 1}`.padStart(8, '0').replace(/^/, 'VULN-'),
          vulnType,
          severity,
          title,
          description: block.slice(0, 500).trim(),
          endpoint,
          status: isExploit ?
            (block.toLowerCase().includes('blocked') ? 'blocked' : 'exploited') :
            'confirmed',
          confidence,
          evidence: block.slice(0, 1000),
        });
      }
    }
  }

  // If no structured findings found, create summary findings from content
  if (findings.length === 0) {
    for (const file of files) {
      if (!file.includes('analysis_deliverable') && !file.includes('exploitation_evidence')) continue;
      const content = await readDeliverable(workspaceName, file);
      if (!content) continue;

      const vulnType = extractVulnType(file) as VulnType;
      const isExploit = file.includes('exploitation_evidence');

      // Create a single finding from the entire deliverable
      findings.push({
        id: `VULN-${vulnType.toUpperCase()}-${findings.length + 1}`,
        vulnType,
        severity: extractSeverity(content),
        title: `${vulnType.charAt(0).toUpperCase() + vulnType.slice(1)} ${isExploit ? 'Exploitation' : 'Analysis'} Results`,
        description: content.slice(0, 500).trim(),
        endpoint: extractEndpoint(content),
        status: isExploit ? 'exploited' : 'confirmed',
        confidence: 'medium',
        evidence: content.slice(0, 1000),
      });
    }
  }

  return findings.sort((a, b) => {
    const severityOrder: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3);
  });
}

function extractVulnType(filename: string): string {
  if (filename.includes('injection')) return 'injection';
  if (filename.includes('xss')) return 'xss';
  if (filename.includes('authz')) return 'authz';
  if (filename.includes('auth')) return 'auth';
  if (filename.includes('ssrf')) return 'ssrf';
  return 'injection';
}

function extractSeverity(content: string): Severity {
  const lower = content.toLowerCase();
  const severityCounts = {
    critical: (lower.match(/\bcritical\b/g) || []).length,
    high: (lower.match(/\bhigh\b/g) || []).length,
    medium: (lower.match(/\bmedium\b/g) || []).length,
    low: (lower.match(/\blow\b/g) || []).length,
  };

  if (severityCounts.critical > 0) return 'critical';
  if (severityCounts.high > 0) return 'high';
  if (severityCounts.medium > 0) return 'medium';
  return 'low';
}

function extractConfidence(content: string): Confidence {
  const lower = content.toLowerCase();
  if (lower.includes('confirmed') || lower.includes('high confidence')) return 'high';
  if (lower.includes('likely') || lower.includes('medium confidence')) return 'medium';
  return 'low';
}

function extractTitle(content: string): string {
  // Try to find a heading
  const headingMatch = content.match(/^#+\s+(.+)/m);
  if (headingMatch) return headingMatch[1].trim().slice(0, 100);

  // Try first line
  const firstLine = content.split('\n').find(l => l.trim().length > 10);
  if (firstLine) return firstLine.trim().slice(0, 100);

  return '';
}

function extractEndpoint(content: string): string {
  // Try to find URLs or endpoints
  const urlMatch = content.match(/(?:https?:\/\/[^\s]+|\/api\/[^\s]+|\/[a-z]+\/[^\s]+)/);
  if (urlMatch) return urlMatch[0].replace(/[.)\]]+$/, '');
  return '/';
}
