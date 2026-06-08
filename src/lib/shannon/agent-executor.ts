/**
 * Shannon - Agent Executor
 * Executes individual agents using LLM calls
 */

import { type AgentName, type AgentMetrics, type DistributedConfig, AGENT_DEFINITIONS } from './types';
import { resolveModel, type ModelTier } from './models';
import { PentestError } from './error-handling';
import { addLog, updateAgentProgress, saveDeliverable, addAgentMetrics } from './workspace-manager';

/** Build a system prompt for a given agent */
function buildAgentPrompt(
  agentName: AgentName,
  targetUrl: string,
  repoPath: string,
  config: DistributedConfig,
): string {
  const def = AGENT_DEFINITIONS.find(d => d.name === agentName);
  if (!def) throw new PentestError(`Unknown agent: ${agentName}`, 'config', false);

  const vulnClass = agentName.includes('injection') ? 'injection' :
    agentName.includes('xss') ? 'xss' :
    agentName.includes('authz') ? 'authz' :
    agentName.includes('auth') ? 'auth' :
    agentName.includes('ssrf') ? 'ssrf' : 'general';

  const phase = def.phase;
  const baseContext = `You are an expert security analyst agent (${def.displayName}) in the Shannon autonomous pentesting pipeline.

TARGET APPLICATION:
- URL: ${targetUrl}
- Repository: ${repoPath}
- Description: ${config.description || 'No description provided'}

CONFIGURATION:
- Vulnerability Classes Being Tested: ${config.vuln_classes.join(', ')}
- Exploitation: ${config.exploit ? 'ENABLED' : 'DISABLED'}
- Authentication: ${config.authentication ? `Configured (${config.authentication.login_type})` : 'Not configured'}

${config.authentication ? `
AUTHENTICATION DETAILS:
- Login Type: ${config.authentication.login_type}
- Login URL: ${config.authentication.login_url}
- Username: ${config.authentication.credentials.username}
${config.authentication.login_flow ? `- Login Flow:\n${config.authentication.login_flow.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}` : ''}
` : ''}

${config.avoid.length > 0 ? `AVOID RULES:\n${config.avoid.map(r => `- [${r.type}] ${r.value}: ${r.description}`).join('\n')}` : ''}
${config.focus.length > 0 ? `FOCUS RULES:\n${config.focus.map(r => `- [${r.type}] ${r.value}: ${r.description}`).join('\n')}` : ''}
${config.rules_of_engagement ? `RULES OF ENGAGEMENT:\n${config.rules_of_engagement}` : ''}`;

  // Phase-specific instructions
  const phasePrompts: Record<string, string> = {
    'pre-recon': `${baseContext}

PHASE: PRE-RECONNAISSANCE (Source Code Analysis)
Your job is to analyze the application's source code to identify:
1. Executive Summary - High-level overview of the application's security posture
2. Application Intelligence - Architecture, data flows, attack surface assessment
3. Authentication Deep Dive - Session management, token handling, MFA implementation
4. Codebase Indexing - Entry points, middleware chain, route handlers
5. Critical File Paths - Files containing auth logic, input validation, database queries
6. XSS Sinks - All locations where user input is rendered without encoding
7. SSRF Sinks - All locations where user-controlled URLs are fetched server-side

Analyze the code thoroughly and provide structured findings with file paths and line references.
Format your output as Markdown with clear sections and code references.`,

    'recon': `${baseContext}

PHASE: RECONNAISSANCE (Live Application Analysis)
Based on the pre-reconnaissance findings, perform live reconnaissance:
1. Executive Summary - Key attack surface findings
2. Technology Stack - Framework, server, database, CDN identification
3. Authentication Mechanisms - Session handling, cookie security, token validation
4. API Endpoints - Discovered endpoints with methods and parameters
5. Input Vectors - All user-controllable input points
6. Network Map - Service architecture and data flows
7. Role Architecture - User roles and privilege levels
8. Authorization Candidates - Potential horizontal/vertical privilege escalation paths
9. Injection Sources - Input points vulnerable to injection attacks

Provide detailed findings with specific URLs, parameters, and evidence.`,

    'vuln-analysis': `${baseContext}

PHASE: VULNERABILITY ANALYSIS - ${vulnClass.toUpperCase()}
Analyze the application specifically for ${vulnClass.toUpperCase()} vulnerabilities:

1. Findings Summary - Key outcomes and patterns discovered
2. Strategic Intelligence - ${getVulnStrategicIntel(vulnClass)}
3. Safe Vectors - Confirmed attack vectors that can be safely tested
4. Blind Spots - Areas that couldn't be fully assessed

For each vulnerability found, provide:
- Severity: critical/high/medium/low
- Confidence: high/medium/low
- Endpoint and parameter affected
- Technical description
- Proof of concept (safe)
- Remediation advice

Format as structured Markdown.`,

    'exploitation': `${baseContext}

PHASE: EXPLOITATION - ${vulnClass.toUpperCase()}
Based on the vulnerability analysis, attempt to exploit confirmed ${vulnClass.toUpperCase()} vulnerabilities:

For each vulnerability:
1. Attempt exploitation following safe practices
2. Document the exploitation steps in detail
3. Capture evidence (responses, data accessed)
4. Assess real-world impact
5. If blocked by security controls, document what was attempted and what blocked it

For each finding, classify as:
- EXPLOITED: Successfully demonstrated the vulnerability
- BLOCKED: Security control prevented exploitation (still a valid finding)

Provide detailed exploitation evidence with step-by-step reproduction.`,

    'reporting': `${baseContext}

PHASE: REPORT GENERATION
Compile all findings from the previous phases into a comprehensive security assessment report:

1. Executive Summary
   - Overall risk rating
   - Key findings summary
   - Business impact assessment

2. Methodology
   - Testing approach and scope
   - Tools and techniques used
   - Limitations and constraints

3. Findings by Severity (Critical → Low)
   For each finding:
   - Title and ID
   - Severity and confidence
   - Affected endpoint/component
   - Description
   - Evidence (exploitation steps or blocked attempts)
   - Impact assessment
   - Remediation recommendations

4. Vulnerability Distribution
   - By class (injection, XSS, auth, authz, SSRF)
   - By severity

5. Recommendations
   - Immediate actions (critical findings)
   - Short-term improvements
   - Long-term security program recommendations

${config.report?.min_severity ? `MINIMUM SEVERITY FILTER: ${config.report.min_severity}` : ''}
${config.report?.min_confidence ? `MINIMUM CONFIDENCE FILTER: ${config.report.min_confidence}` : ''}
${config.report?.guidance ? `USER GUIDANCE: ${config.report.guidance}` : ''}

Format as a professional security assessment report in Markdown.`,
  };

  return phasePrompts[phase] || baseContext;
}

function getVulnStrategicIntel(vulnClass: string): string {
  const intel: Record<string, string> = {
    injection: 'WAF presence, database type, query construction patterns, parameterized vs dynamic SQL',
    xss: 'CSP headers, output encoding mechanisms, DOM manipulation patterns, template engine escaping',
    auth: 'Session management, token generation, password policies, MFA bypass potential',
    authz: 'Role hierarchy, permission checks, IDOR patterns, horizontal/vertical escalation paths',
    ssrf: 'Internal services, cloud metadata endpoints, URL validation mechanisms, outbound request filtering',
  };
  return intel[vulnClass] || 'General attack surface analysis';
}

/** Call the LLM directly using z-ai-web-dev-sdk */
async function callLLM(
  prompt: string,
  model: string,
  systemPrompt?: string,
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const messages = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      { role: 'user' as const, content: prompt },
    ];

    const response = await zai.chat.completions.create({
      messages,
      stream: false,
      thinking: { type: 'disabled' },
    });

    const text = response.choices?.[0]?.message?.content || '';
    const inputTokens = response.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
    const outputTokens = response.usage?.completion_tokens || Math.ceil(text.length / 4);

    return { text, inputTokens, outputTokens };
  } catch (error) {
    throw new PentestError(
      `LLM call failed: ${error instanceof Error ? error.message : String(error)}`,
      'network',
      true,
      { model, promptLength: prompt.length },
    );
  }
}

/** Execute a single agent and return its output */
export async function executeAgent(
  workspaceName: string,
  agentName: AgentName,
  targetUrl: string,
  repoPath: string,
  config: DistributedConfig,
  maxRetries = 2,
): Promise<{ success: boolean; metrics: AgentMetrics; output?: string }> {
  const def = AGENT_DEFINITIONS.find(d => d.name === agentName);
  if (!def) {
    return {
      success: false,
      metrics: { durationMs: 0, inputTokens: null, outputTokens: null, costUsd: null, numTurns: null },
    };
  }

  const model = resolveModel(def.modelTier);
  const startTime = Date.now();

  await updateAgentProgress(workspaceName, agentName, {
    status: 'in_progress',
    progress: 0,
    model,
    startTime,
  });
  await addLog(workspaceName, 'info', `Starting agent: ${def.displayName} (${model})`);

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      // Build the prompt for this agent
      const prompt = buildAgentPrompt(agentName, targetUrl, repoPath, config);

      // Read previous deliverables for context (for agents after pre-recon)
      let contextPrompt = '';
      if (def.phase === 'recon' || def.phase === 'vuln-analysis' || def.phase === 'exploitation' || def.phase === 'reporting') {
        const { readDeliverable } = await import('./workspace-manager');
        const preReconOutput = await readDeliverable(workspaceName, 'pre_recon_deliverable.md');
        if (preReconOutput) {
          contextPrompt += `\n\nPREVIOUS FINDINGS (Pre-Reconnaissance):\n${preReconOutput.slice(0, 8000)}`;
        }
      }
      if (def.phase === 'vuln-analysis' || def.phase === 'exploitation' || def.phase === 'reporting') {
        const { readDeliverable } = await import('./workspace-manager');
        const reconOutput = await readDeliverable(workspaceName, 'recon_deliverable.md');
        if (reconOutput) {
          contextPrompt += `\n\nPREVIOUS FINDINGS (Reconnaissance):\n${reconOutput.slice(0, 8000)}`;
        }
      }
      if (def.phase === 'exploitation' || def.phase === 'reporting') {
        const { readDeliverable } = await import('./workspace-manager');
        const vulnClass = agentName.split('-')[0];
        const vulnOutput = await readDeliverable(workspaceName, `${vulnClass}_analysis_deliverable.md`);
        if (vulnOutput) {
          contextPrompt += `\n\nVULNERABILITY ANALYSIS (${vulnClass.toUpperCase()}):\n${vulnOutput.slice(0, 8000)}`;
        }
      }

      await updateAgentProgress(workspaceName, agentName, { progress: 20 });

      // Call the LLM
      const result = await callLLM(
        prompt + contextPrompt,
        model,
        `You are ${def.displayName}, an expert security analyst in the Shannon autonomous pentesting pipeline. Provide thorough, technical analysis with specific evidence and recommendations.`,
      );

      await updateAgentProgress(workspaceName, agentName, { progress: 80 });

      const endTime = Date.now();
      const metrics: AgentMetrics = {
        durationMs: endTime - startTime,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        costUsd: estimateCost(model, result.inputTokens, result.outputTokens),
        numTurns: 1,
        model,
      };

      // Save the deliverable
      const deliverableContent = result.text || `# ${def.displayName}\n\nNo output generated.`;
      await saveDeliverable(workspaceName, def.deliverableFilename, deliverableContent);

      // Update workspace state
      await updateAgentProgress(workspaceName, agentName, {
        status: 'completed',
        progress: 100,
        endTime,
      });
      await addAgentMetrics(workspaceName, agentName, metrics);
      await addLog(workspaceName, 'info', `Agent completed: ${def.displayName} (${formatDuration(metrics.durationMs)})`);

      return { success: true, metrics, output: deliverableContent };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempt++;

      if (attempt <= maxRetries) {
        await addLog(workspaceName, 'warn', `Agent ${def.displayName} failed (attempt ${attempt}/${maxRetries + 1}): ${lastError.message}. Retrying...`);
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // All retries failed
  const endTime = Date.now();
  const metrics: AgentMetrics = {
    durationMs: endTime - startTime,
    inputTokens: null,
    outputTokens: null,
    costUsd: null,
    numTurns: null,
    model,
  };

  await updateAgentProgress(workspaceName, agentName, {
    status: 'failed',
    progress: 0,
    endTime,
    error: lastError?.message,
  });
  await addAgentMetrics(workspaceName, agentName, metrics);
  await addLog(workspaceName, 'error', `Agent failed: ${def.displayName} - ${lastError?.message}`);

  return { success: false, metrics };
}

/** Estimate cost based on model and token usage */
function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const costs: Record<string, { input: number; output: number }> = {
    'glm-4-flash': { input: 0.000001, output: 0.000002 },
    'glm-4-plus': { input: 0.000003, output: 0.000006 },
    'claude-opus-4-7': { input: 0.000015, output: 0.000075 },
    'claude-sonnet-4-6': { input: 0.000003, output: 0.000015 },
    'claude-haiku-4-5-20251001': { input: 0.0000008, output: 0.000004 },
  };

  const costPerToken = costs[model] || costs['glm-4-plus'];
  return (inputTokens * costPerToken.input) + (outputTokens * costPerToken.output);
}

/** Format duration in human-readable form */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}
