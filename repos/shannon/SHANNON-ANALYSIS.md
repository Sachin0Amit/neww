# Shannon — Comprehensive Backend Analysis

## 1. PRODUCT OVERVIEW

Shannon is an **autonomous, white-box AI pentester** for web applications and APIs. It analyzes source code, identifies attack paths, and executes real exploits to prove vulnerabilities before they reach production.

- **Publisher**: Keygraph (keygraph.io)
- **License**: AGPL-3.0 (Shannon Lite)
- **Edition**: This repo is Shannon Lite (the open-source CLI). Shannon Pro is commercial.
- **Monorepo**: pnpm workspaces + Turborepo + TypeScript
- **Current Version Tag**: v1.5.0

---

## 2. REPOSITORY STRUCTURE

```
shannon/
├── apps/
│   ├── cli/          — @keygraph/shannon (published to npm)
│   │   ├── src/
│   │   │   ├── commands/    — CLI command handlers (start, stop, setup, logs, workspaces, status, build, uninstall)
│   │   │   ├── config/      — TOML config resolver + writer (npx mode)
│   │   │   ├── docker.ts    — Docker orchestration (compose, worker spawn, image management)
│   │   │   ├── env.ts       — Environment/credential loading
│   │   │   ├── home.ts      — State directory management (~/.shannon/ or ./workspaces/)
│   │   │   ├── index.ts     — CLI dispatcher (main entry)
│   │   │   ├── mode.ts      — Local vs npx mode detection
│   │   │   ├── paths.ts     — Repo/config path resolution
│   │   │   └── splash.ts    — ASCII art splash screen
│   │   ├── infra/compose.yml  — Bundled Temporal compose for npx mode
│   │   └── package.json
│   │
│   └── worker/       — @shannon/worker (private, Temporal worker + pipeline logic)
│       ├── configs/
│       │   ├── config-schema.json    — JSON Schema for YAML config validation
│       │   └── example-config.yaml   — Example configuration file
│       ├── prompts/                  — Per-phase prompt templates
│       │   ├── pipeline-testing/     — Minimal prompts for fast testing
│       │   ├── shared/               — Shared partials (rules, target, login, etc.)
│       │   ├── pre-recon-code.txt
│       │   ├── recon.txt
│       │   ├── vuln-{injection,xss,auth,authz,ssrf}.txt
│       │   ├── exploit-{injection,xss,auth,authz,ssrf}.txt
│       │   ├── validate-authentication.txt
│       │   └── report-executive.txt
│       ├── src/
│       │   ├── ai/                   — Claude SDK integration
│       │   │   ├── audit-logger.ts         — Null Object audit logger
│       │   │   ├── claude-executor.ts       — Core SDK execution with retry
│       │   │   ├── message-handlers.ts      — SDK message stream dispatch
│       │   │   ├── models.ts               — Model tier resolution (small/medium/large)
│       │   │   ├── output-formatters.ts     — Terminal output formatting
│       │   │   ├── playwright-config-writer.ts — Stealth browser config
│       │   │   ├── progress-manager.ts      — Progress indicator management
│       │   │   ├── queue-schemas.ts         — Zod schemas for structured vuln output
│       │   │   ├── settings-writer.ts       — Claude SDK settings (deny rules)
│       │   │   └── types.ts                 — SDK message type definitions
│       │   ├── audit/                — Crash-safe audit logging
│       │   │   ├── audit-session.ts
│       │   │   ├── index.ts
│       │   │   ├── log-stream.ts
│       │   │   ├── logger.ts
│       │   │   ├── metrics-tracker.ts
│       │   │   ├── utils.ts
│       │   │   └── workflow-logger.ts
│       │   ├── config-parser.ts      — YAML config parsing + JSON Schema validation
│       │   ├── interfaces/           — Pluggable provider interfaces
│       │   │   ├── checkpoint-provider.ts
│       │   │   ├── findings-provider.ts
│       │   │   ├── index.ts
│       │   │   └── report-output-provider.ts
│       │   ├── mcp-server/           — MCP tool collectors (structured data from agents)
│       │   │   ├── exploit-collector.ts
│       │   │   ├── pre-recon-collector.ts
│       │   │   ├── recon-collector.ts
│       │   │   └── vuln-collector.ts
│       │   ├── paths.ts              — Centralized path constants
│       │   ├── progress-indicator.ts
│       │   ├── scripts/              — CLI helper scripts
│       │   │   ├── generate-totp.ts
│       │   │   └── save-deliverable.ts
│       │   ├── services/             — Business logic (Temporal-agnostic)
│       │   │   ├── agent-execution.ts      — Full agent lifecycle management
│       │   │   ├── config-loader.ts        — Config loading (file/YAML/data)
│       │   │   ├── container.ts            — DI container (per-workflow)
│       │   │   ├── error-handling.ts       — PentestError classification
│       │   │   ├── exploit-renderer.ts     — Exploit evidence → Markdown
│       │   │   ├── exploitation-checker.ts — Queue validation (shouldExploit?)
│       │   │   ├── findings-renderer.ts    — Queue → findings.md (no-LLM path)
│       │   │   ├── git-manager.ts          — Git checkpoint/rollback/commit
│       │   │   ├── index.ts
│       │   │   ├── pre-recon-renderer.ts   — Pre-recon data → Markdown
│       │   │   ├── preflight.ts            — Preflight validation service
│       │   │   ├── prompt-manager.ts       — Prompt template loading + variable substitution
│       │   │   ├── queue-validation.ts     — Exploitation queue validation
│       │   │   ├── recon-renderer.ts       — Recon data → Markdown
│       │   │   ├── reporting.ts            — Report assembly + model injection
│       │   │   ├── validate-authentication.ts — Auth validation service
│       │   │   └── vuln-renderer.ts        — Vuln analysis → Markdown
│       │   ├── session-manager.ts    — Agent definitions registry (AGENTS record)
│       │   ├── temporal/             — Temporal orchestration
│       │   │   ├── activities.ts     — Thin activity wrappers (heartbeat + error classification)
│       │   │   ├── activity-logger.ts
│       │   │   ├── pipeline.ts       — Re-exports
│       │   │   ├── shared.ts         — Types, query definitions
│       │   │   ├── summary-mapper.ts
│       │   │   ├── worker.ts         — Combined worker + client entry point
│       │   │   ├── workflow-errors.ts
│       │   │   ├── workflows.ts      — Main pentestPipelineWorkflow
│       │   │   └── workspaces.ts     — Workspace listing tool
│       │   ├── types/                — Type definitions
│       │   │   ├── activity-logger.ts
│       │   │   ├── agents.ts         — AgentName, ALL_AGENTS, VulnType
│       │   │   ├── audit.ts
│       │   │   ├── config.ts         — Config, DistributedConfig, ProviderConfig, etc.
│       │   │   ├── deliverables.ts   — DeliverableType enum
│       │   │   ├── errors.ts         — ErrorCode enum, PentestErrorType
│       │   │   ├── index.ts
│       │   │   ├── metrics.ts        — AgentMetrics
│       │   │   └── result.ts         — Result<T,E> discriminated union
│       │   └── utils/                — Shared utilities
│       │       ├── billing-detection.ts
│       │       ├── concurrency.ts
│       │       ├── file-io.ts
│       │       ├── formatting.ts
│       │       ├── functional.ts
│       │       ├── glob.ts
│       │       └── metrics.ts
│       └── package.json
│
├── docker-compose.yml    — Temporal server (shannon-temporal, ports 7233/8233)
├── Dockerfile            — 2-stage build (Chainguard Wolfi runtime)
├── entrypoint.sh
├── shannon               — Root entry point script (#!/usr/bin/env node)
├── sample-reports/       — Example pentest reports (Juice Shop, crAPI, capital-api)
├── workspaces/           — Workspace storage directory
├── repos/                — Target repository directory
└── docs/                 — Documentation
    ├── ai-providers.md
    ├── configuration.md
    ├── coverage-roadmap.md
    ├── development.md
    ├── platforms.md
    ├── safety.md
    ├── shannon-pro.md
    └── workspaces.md
```

---

## 3. CLI COMMANDS (Complete Reference)

### Dual-Mode Operation
Shannon auto-detects mode:
- **Local mode**: `SHANNON_LOCAL=1` set by `./shannon` entry point. Builds locally, mounts prompts, uses `./workspaces/`.
- **NPX mode**: Default when run via `npx @keygraph/shannon`. Pulls from Docker Hub, uses `~/.shannon/`.

### All Commands

| Command | NPX | Local | Description |
|---------|-----|-------|-------------|
| `setup` | ✅ | ❌ | Interactive TUI wizard for provider credential setup |
| `start` | ✅ | ✅ | Launch a pentest scan |
| `stop` | ✅ | ✅ | Stop all containers (`--clean` removes volumes) |
| `workspaces` | ✅ | ✅ | List all workspaces with status/cost |
| `logs <workspace>` | ✅ | ✅ | Tail workflow log (with chokidar file watching) |
| `status` | ✅ | ✅ | Show Temporal health + running workers |
| `build [--no-cache]` | ❌ | ✅ | Build worker Docker image locally |
| `uninstall` | ✅ | ❌ | Remove `~/.shannon/` and all data |
| `info` | ✅ | ✅ | Display splash screen |
| `help` | ✅ | ✅ | Show help |

### `start` Command Options

| Option | Short | Required | Description |
|--------|-------|----------|-------------|
| `--url` | `-u` | ✅ | Target URL |
| `--repo` | `-r` | ✅ | Repository path (or bare name in local mode) |
| `--config` | `-c` | ❌ | YAML configuration file path |
| `--output` | `-o` | ❌ | Copy deliverables to this directory after run |
| `--workspace` | `-w` | ❌ | Named workspace (auto-resumes if exists) |
| `--pipeline-testing` | — | ❌ | Minimal prompts for fast testing (10s retries) |
| `--debug` | — | ❌ | Preserve worker container after exit |

---

## 4. ARCHITECTURE — Five-Phase Pipeline

```
        ┌──────────────────────┐
        │   Pre-Reconnaissance │  (source code scan — large model)
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   Reconnaissance     │  (attack surface mapping)
        └──────────┬───────────┘
                   │
    ┌──────────────┼──────────────┬──────────────┬──────────────┐
    ▼              ▼              ▼              ▼              ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ Vuln    │  │ Vuln    │  │ Vuln    │  │ Vuln    │  │ Vuln    │
│Injection│  │  XSS    │  │  Auth   │  │  Authz  │  │  SSRF   │
└────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘
     │            │            │            │            │
     ▼            ▼            ▼            ▼            ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ Exploit │  │ Exploit │  │ Exploit │  │ Exploit │  │ Exploit │
│Injection│  │  XSS    │  │  Auth   │  │  Authz  │  │  SSRF   │
└────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘
     │            │            │            │            │
     └────────────┴──────┬─────┴────────────┴────────────┘
                         │
                         ▼
                ┌──────────────────────┐
                │      Reporting       │
                └──────────────────────┘
```

### Pre-Pipeline Phases
Before the five phases run, two critical pre-pipeline activities occur:

1. **Preflight Validation** — Cheap checks: repo exists + .git, config validates, credentials validate via SDK query, target URL reachable
2. **Authentication Validation** — If config has `authentication:`, performs real browser login, saves auth session to `auth-state.json`
3. **Playwright Stealth Config** — Writes anti-detection defaults for browser automation
4. **SDK Deny Rules Sync** — Writes `code_path` avoid rules to `~/.claude/settings.json`

### 13 Agents (in execution order)

| # | Agent Name | Phase | Model Tier | Prompt Template | Deliverable |
|---|-----------|-------|------------|-----------------|-------------|
| 1 | `pre-recon` | pre-recon | large | `pre-recon-code` | `pre_recon_deliverable.md` |
| 2 | `recon` | recon | medium | `recon` | `recon_deliverable.md` |
| 3 | `injection-vuln` | vulnerability-analysis | medium | `vuln-injection` | `injection_analysis_deliverable.md` |
| 4 | `xss-vuln` | vulnerability-analysis | medium | `vuln-xss` | `xss_analysis_deliverable.md` |
| 5 | `auth-vuln` | vulnerability-analysis | medium | `vuln-auth` | `auth_analysis_deliverable.md` |
| 6 | `ssrf-vuln` | vulnerability-analysis | medium | `vuln-ssrf` | `ssrf_analysis_deliverable.md` |
| 7 | `authz-vuln` | vulnerability-analysis | medium | `vuln-authz` | `authz_analysis_deliverable.md` |
| 8 | `injection-exploit` | exploitation | medium | `exploit-injection` | `injection_exploitation_evidence.md` |
| 9 | `xss-exploit` | exploitation | medium | `exploit-xss` | `xss_exploitation_evidence.md` |
| 10 | `auth-exploit` | exploitation | medium | `exploit-auth` | `auth_exploitation_evidence.md` |
| 11 | `ssrf-exploit` | exploitation | medium | `exploit-ssrf` | `ssrf_exploitation_evidence.md` |
| 12 | `authz-exploit` | exploitation | medium | `exploit-authz` | `authz_exploitation_evidence.md` |
| 13 | `report` | reporting | medium | `report-executive` | `comprehensive_security_assessment_report.md` |

### Pipeline Flow Details
- **Phases 1-2**: Sequential (pre-recon → recon)
- **Phases 3-4**: Pipelined parallel — 5 vuln→exploit pairs run concurrently (default: 5, configurable 1-5). Each pair: vuln agent runs → queue check → conditional exploit agent. Exploits start when their vuln finishes, NOT waiting for all vulns.
- **Phase 5**: Sequential (report)
- **Exploitation is conditional**: Only runs if `exploit=true` (default) AND the vuln queue has actionable findings

---

## 5. AI / MODEL CONFIGURATION

### Supported AI Providers

| Provider | Auth Method | Required Env Vars |
|----------|------------|-------------------|
| **Anthropic Direct** (recommended) | API Key | `ANTHROPIC_API_KEY` |
| **Anthropic OAuth** | OAuth Token | `CLAUDE_CODE_OAUTH_TOKEN` |
| **Custom Base URL** | Base URL + Auth Token | `ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN` |
| **AWS Bedrock** | Bearer Token | `CLAUDE_CODE_USE_BEDROCK=1`, `AWS_REGION`, `AWS_BEARER_TOKEN_BEDROCK`, model overrides |
| **Google Vertex AI** | Service Account Key | `CLAUDE_CODE_USE_VERTEX=1`, `CLOUD_ML_REGION`, `ANTHROPIC_VERTEX_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS`, model overrides |

### Model Tiers

| Tier | Default Model | Override Env Var | Use Case |
|------|--------------|------------------|----------|
| **small** | `claude-haiku-4-5-20251001` | `ANTHROPIC_SMALL_MODEL` | Summarization, structured extraction |
| **medium** | `claude-sonnet-4-6` | `ANTHROPIC_MEDIUM_MODEL` | Tool use, general analysis (default for most agents) |
| **large** | `claude-opus-4-7` | `ANTHROPIC_LARGE_MODEL` | Deep reasoning, complex analysis (pre-recon only) |

### SDK Configuration
- **SDK**: `@anthropic-ai/claude-agent-sdk` (v2.1.84 in Docker)
- **Max Turns**: 10,000 per agent
- **Permission Mode**: `bypassPermissions`
- **Adaptive Thinking**: Auto-enabled on Opus 4.6/4.7 (`CLAUDE_ADAPTIVE_THINKING=false` to disable)
- **Max Output Tokens**: 64,000 (configurable via `CLAUDE_CODE_MAX_OUTPUT_TOKENS`)
- **Structured Output**: Vuln agents return Zod-validated JSON via SDK's `outputFormat` (JSON Schema draft-07)

---

## 6. TEMPORAL WORKFLOW ORCHESTRATION

### Temporal Server
- Image: `temporalio/temporal:1.7.0`
- Container: `shannon-temporal`
- Ports: 7233 (gRPC), 8233 (Web UI)
- Network: `shannon-net`
- Volume: `temporal-data`

### Worker
- Ephemeral: `docker run --rm` — one container per scan
- Per-invocation task queue (unique per scan)
- Max concurrent activity executions: 25
- Heartbeat interval: 2 seconds

### Retry Configuration

| Preset | Initial Interval | Max Interval | Max Attempts | Use Case |
|--------|-----------------|--------------|--------------|----------|
| **Production** | 5 min | 30 min | 50 | Default |
| **Testing** | 10 sec | 30 sec | 5 | `--pipeline-testing` |
| **Subscription** | 5 min | 6 hours | 100 | `retry_preset: subscription` |
| **Preflight** | 10 sec | 1 min | 3 | Preflight validation |
| **Auth Validation** | 10 sec | 1 min | 3 | Auth credential check |

### Activity Timeouts
- Production: 2h start-to-close, 60min heartbeat
- Testing: 30min start-to-close, 30min heartbeat
- Subscription: 8h start-to-close, 2h heartbeat
- Auth validation: 10min start-to-close, 10min heartbeat

### Non-Retryable Error Types
- `AuthenticationError`, `PermissionError`, `InvalidRequestError`, `RequestTooLargeError`
- `ConfigurationError`, `InvalidTargetError`, `ExecutionLimitError`, `AuthLoginFailedError`

### Queryable Progress
- Query: `getProgress` returns `PipelineProgress` with current phase, agent, completed agents, elapsed time
- Temporal Web UI at `http://localhost:8233`

---

## 7. MCP SERVER TOOLS (Structured Data Collection)

Each agent has companion MCP servers that provide Zod-validated tools for structured data output:

### Pre-Recon Collector (`pre-recon-collector`)
Collects architectural baseline data from the pre-recon agent.

### Recon Collector (`recon-collector`)
Collects attack surface mapping data from the recon agent.

### Vuln Collector (`vuln-collector`) — 4 tools per class
| Tool | Description | Section |
|------|-------------|---------|
| `set_findings_summary` | Executive summary + dominant patterns | §1-2 |
| `set_strategic_intelligence` | Per-class strategic intelligence (varies by vuln class) | §3 |
| `set_safe_vectors` | Vectors confirmed to have robust defenses | §4 |
| `set_blind_spots` | Analysis gaps and coverage limitations (injection/xss/authz only) | §5 |

Per-class strategic intelligence schemas:
- **Injection**: `defensive_evasion_waf`, `error_based_potential`, `confirmed_database_technology`
- **XSS**: `csp_analysis`, `cookie_security`
- **Auth**: `authentication_method`, `session_token_details`, `password_policy`
- **SSRF**: `http_client_library`, `request_architecture`, `internal_services`
- **Authz**: `session_management_architecture`, `role_permission_model`, `resource_access_patterns`, `workflow_implementation`

### Exploit Collector (`exploit-collector`) — 1 tool
| Tool | Description |
|------|-------------|
| `add_exploit` | Record a single processed vulnerability (called once per vuln in queue) |

Discriminated by `status`:
- **exploited**: `severity`, `impact`, `exploitation_steps[]`, `proof_of_impact`
- **blocked**: `confidence`, `current_blocker`, `potential_impact`, `evidence_of_vulnerability`, `what_we_tried`, `how_this_would_be_exploited[]`, `expected_impact`

---

## 8. YAML CONFIGURATION (Complete Schema)

### Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `authentication` | object | conditional | Auth config for target app |
| `rules` | object | conditional | Avoid/focus rules |
| `pipeline` | object | no | Pipeline execution settings |
| `vuln_classes` | array | conditional | Which vuln classes to test (1-5 of: injection, xss, auth, authz, ssrf) |
| `exploit` | string enum | conditional | `"true"` or `"false"` — skip exploitation phase |
| `report` | object | no | Report filtering/guidance |
| `rules_of_engagement` | string | conditional | Free-text engagement rules |
| `description` | string | conditional | Target environment description |

At least ONE steering field is required: `authentication`, `rules`, `description`, `vuln_classes`, `exploit`, `report`, or `rules_of_engagement`.

### Authentication Schema

| Field | Type | Description |
|-------|------|-------------|
| `login_type` | enum | `form`, `sso`, `api`, `basic` |
| `login_url` | URI | Login page/endpoint URL |
| `credentials.username` | string | Username or email |
| `credentials.password` | string | Password |
| `credentials.totp_secret` | string | Base32 TOTP secret for 2FA |
| `credentials.email_login.address` | email | Email for magic-link/OTP flows |
| `credentials.email_login.password` | string | Email account password |
| `credentials.email_login.totp_secret` | string | Email account TOTP secret |
| `login_flow[]` | string[] | Step-by-step login instructions (1-20 steps, supports $username, $password, $totp, $email_address, $email_password, $email_totp placeholders) |
| `success_condition.type` | enum | `url_contains`, `element_present`, `url_equals_exactly`, `text_contains` |
| `success_condition.value` | string | Value to match |

### Rules Schema

Rule types: `url_path`, `subdomain`, `domain`, `method`, `header`, `parameter`, `code_path`

```yaml
rules:
  avoid:
    - description: "string"
      type: url_path|subdomain|domain|method|header|parameter|code_path
      value: "string"
  focus:
    - description: "string"
      type: url_path|subdomain|domain|method|header|parameter|code_path
      value: "string"
```

- `code_path` values are repo-relative file paths or globs — enforced at SDK tool layer via `~/.claude/settings.json` `permissions.deny`
- `url_path` values must start with `/`
- `domain` values must contain at least one dot
- `method` values must be one of: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- Duplicates within same list and conflicts between avoid/focus are rejected

### Report Schema

| Field | Type | Description |
|-------|------|-------------|
| `min_severity` | enum | `low`, `medium`, `high`, `critical` |
| `min_confidence` | enum | `low`, `medium`, `high` |
| `guidance` | string | Free-text guidance to the report agent (max 500 chars) |

### Pipeline Schema

| Field | Type | Description |
|-------|------|-------------|
| `retry_preset` | enum | `default` or `subscription` |
| `max_concurrent_pipelines` | string | "1"-"5" (default: 5) |

---

## 9. DATA FLOWS

### Scan Lifecycle

```
User runs: shannon start -u URL -r REPO [-c CONFIG] [-w WORKSPACE]
    │
    ▼
CLI (apps/cli)
    ├── Validates credentials
    ├── Resolves repo/config paths
    ├── Ensures Docker image (pull or build)
    ├── Starts Temporal infra (docker compose up)
    └── Spawns worker container (docker run -d)
         │
         ▼
Worker (apps/worker)
    ├── Connects to Temporal
    ├── Resolves workspace (new or resume)
    ├── Starts Temporal worker
    ├── Submits pentestPipelineWorkflow
    └── Polls for progress (30s intervals)
         │
         ▼
Temporal Workflow orchestrates:
    1. Preflight validation
    2. Playwright stealth config
    3. Auth validation (if configured)
    4. Init deliverables git
    5. Sync code_path deny rules
    6. Pre-recon agent
    7. Recon agent
    8. 5 parallel vuln→exploit pipelines
    9. Report assembly
   10. Report agent
   11. Model metadata injection
   12. Report output generation
    │
    ▼
Deliverables written to:
    <repo>/.shannon/deliverables/
    ├── pre_recon_deliverable.md
    ├── recon_deliverable.md
    ├── injection_analysis_deliverable.md
    ├── injection_exploitation_queue.json (structured output)
    ├── injection_exploitation_evidence.md
    ├── [same for xss, auth, ssrf, authz]
    └── comprehensive_security_assessment_report.md
```

### Session/Audit Data
- **Location**: `workspaces/<hostname>_<sessionId>/` or `~/.shannon/workspaces/<name>/`
- **session.json**: Session metadata, agent status, metrics, run scope, resume attempts
- **workflow.log**: Human-readable workflow progress log
- **Audit events**: LLM responses, tool starts/ends, errors

### Workspace Resume Flow
1. CLI passes `-w <workspace>` → worker detects existing `session.json`
2. Terminates any running workflows for that workspace
3. Loads resume state: completed agents, checkpoint hash
4. Restores deliverables git to last checkpoint
5. Cleans up partial/incomplete deliverables
6. Records resume attempt in session.json
7. Skips already-completed agents
8. Run scope (vuln_classes, exploit) locked from first run — mismatch fails fast

---

## 10. BROWSER AUTOMATION

### Playwright Integration
- **Tool**: `@playwright/cli` (v0.1.1) — MCP-based browser automation
- **Browser**: Chromium (headless, installed in Docker image)
- **Session Isolation**: 5 named sessions (`agent1` through `agent5`) — parallel agents use separate browser sessions
- **Stealth Config**: Auto-generated `cli.config.json` that:
  - Disables `Blink AutomationControlled` flag
  - Drops `--enable-automation` default
  - Overrides `HeadlessChrome` user agent
- **Auth Session**: `validate-authentication` activity performs real login, saves session to `auth-state.json`. Other agents restore this session (via `@include(shared/_shared-session.txt)`)
- **TOTP Generation**: `generate-totp` CLI tool for 2FA

### Playwright Session Mapping
| Agent | Session |
|-------|---------|
| validate-authentication | agent1 |
| pre-recon-code | agent1 |
| recon | agent2 |
| vuln-injection | agent1 |
| vuln-xss | agent2 |
| vuln-auth | agent3 |
| vuln-ssrf | agent4 |
| vuln-authz | agent5 |
| exploit-injection | agent1 |
| exploit-xss | agent2 |
| exploit-auth | agent3 |
| exploit-ssrf | agent4 |
| exploit-authz | agent5 |
| report-executive | agent3 |

---

## 11. ERROR HANDLING

### Error Codes

| Code | Category | Description |
|------|----------|-------------|
| `CONFIG_NOT_FOUND` | config | Config file missing |
| `CONFIG_VALIDATION_FAILED` | config | Schema validation failed |
| `CONFIG_PARSE_ERROR` | config | YAML parsing failed |
| `AGENT_EXECUTION_FAILED` | validation | Agent failed to execute |
| `OUTPUT_VALIDATION_FAILED` | validation | Agent didn't produce required deliverables |
| `API_RATE_LIMITED` | billing | API rate limit hit |
| `SPENDING_CAP_REACHED` | billing | Spending cap reached (retryable with long backoff) |
| `INSUFFICIENT_CREDITS` | billing | Insufficient credits |
| `GIT_CHECKPOINT_FAILED` | filesystem | Git checkpoint failed |
| `GIT_ROLLBACK_FAILED` | filesystem | Git rollback failed |
| `PROMPT_LOAD_FAILED` | prompt | Prompt template loading failed |
| `DELIVERABLE_NOT_FOUND` | validation | Required deliverable missing |
| `REPO_NOT_FOUND` | config | Repository path not found |
| `TARGET_UNREACHABLE` | network | Target URL unreachable |
| `AUTH_FAILED` | config | Credential validation failed |
| `AUTH_LOGIN_FAILED` | config | Login flow failed |
| `BILLING_ERROR` | billing | Generic billing error |

### Error Types for Retry Classification
- `PentestErrorType`: `'config' | 'network' | 'prompt' | 'filesystem' | 'validation' | 'billing' | 'unknown'`
- Billing errors are **retryable** with long backoff (5-30 min for production, up to 6 hours for subscription)
- Config errors are **non-retryable**

---

## 12. SECURITY FEATURES

### SSRF Protection
- Target URL DNS resolution is pinned (prevents DNS rebinding)
- Cloud metadata range `169.254.0.0/16` is blocked
- Loopback addresses trigger helpful error with `host.docker.internal` suggestion

### Config Security
- Dangerous patterns rejected: path traversal (`../`), HTML injection (`<>`), `javascript:`, `data:`, `file:` URLs
- Duplicate rules and conflicting avoid/focus rules rejected
- `/etc/hosts` forwarding skips loopback names, cloud metadata IPs, and Docker-internal names
- Auth state file (`auth-state.json`) deleted when workflow ends

### Docker Security
- Worker containers are ephemeral (`--rm`)
- Non-root user inside container (UID 1001)
- Target repo mounted read-only (`:ro`)
- Writable overlays only for `.shannon/deliverables`, `.shannon/scratchpad`, `.shannon/.playwright-cli`, `.playwright`
- `seccomp=unconfined` and `--shm-size 2gb` for browser automation
- UID remapping on Linux for bind mount permissions

---

## 13. WEB SERVER / API CAPABILITIES

### ❌ No Built-in Web API or HTTP Server
Shannon has **NO web server, REST API, or HTTP endpoint** for programmatic control. It is purely a **CLI tool** that:
1. Orchestrates Docker containers
2. Uses Temporal for workflow orchestration
3. Writes results to the filesystem

### Monitoring Endpoints (Read-Only)
- **Temporal Web UI**: `http://localhost:8233` — Shows workflow status, progress, history
- **Workflow Query**: `getProgress` Temporal query returns `PipelineProgress` (current phase, agent, completed agents, elapsed time)

### What a Frontend Would Need to Expose
To build a frontend, you would need to:
1. **Wrap the CLI** — Create a backend API server that executes Shannon CLI commands
2. **Parse filesystem outputs** — Read `session.json`, `workflow.log`, deliverables from workspace directories
3. **Query Temporal** — Use the Temporal client SDK to query workflow progress, list workflows, etc.
4. **Stream logs** — Tail `workflow.log` files or subscribe to Temporal workflow events

---

## 14. PLUGGABLE PROVIDER INTERFACES

Shannon uses a DI container pattern with three pluggable provider interfaces:

### `CheckpointProvider`
- **Default**: `NoOpCheckpointProvider` (always returns `{ skip: false }`)
- **Purpose**: Decide whether to skip an agent (for external checkpointing)
- **Method**: `shouldSkipAgent(agentName, repoPath, deliverablesSubdir)`

### `FindingsProvider`
- **Default**: `NoOpFindingsProvider`
- **Purpose**: Merge external findings into exploitation queues
- **Method**: `mergeFindings(vulnType, deliverablesPath, logger)`
- Used by `mergeFindingsIntoQueue` activity

### `ReportOutputProvider`
- **Default**: `NoOpReportOutputProvider`
- **Purpose**: Custom report output handling
- Used by `generateReportOutputActivity`

### Container Factory
- `setContainerFactory()` allows overriding container creation at worker startup
- This is the extension point for Shannon Pro to inject custom providers

---

## 15. DELIVERABLES & OUTPUT

### Per-Vuln-Class Output Files

| Vuln Class | Analysis | Exploitation Queue | Exploit Evidence | Findings (no-exploit mode) |
|-----------|----------|-------------------|------------------|---------------------------|
| injection | `injection_analysis_deliverable.md` | `injection_exploitation_queue.json` | `injection_exploitation_evidence.md` | `injection_findings.md` |
| xss | `xss_analysis_deliverable.md` | `xss_exploitation_queue.json` | `xss_exploitation_evidence.md` | `xss_findings.md` |
| auth | `auth_analysis_deliverable.md` | `auth_exploitation_queue.json` | `auth_exploitation_evidence.md` | `auth_findings.md` |
| ssrf | `ssrf_analysis_deliverable.md` | `ssrf_exploitation_queue.json` | `ssrf_exploitation_evidence.md` | `ssrf_findings.md` |
| authz | `authz_analysis_deliverable.md` | `authz_exploitation_queue.json` | `authz_exploitation_evidence.md` | `authz_findings.md` |

### Final Output
- `comprehensive_security_assessment_report.md` — Assembled from per-class deliverables + executive summary from report agent
- Model metadata injected into Executive Summary section

### Output Paths
- **Deliverables**: `<repo>/.shannon/deliverables/`
- **Workspace metadata**: `workspaces/<workspace-name>/session.json`, `workflow.log`
- **Custom output**: `-o <path>` copies deliverables after run

---

## 16. STRUCTURED OUTPUT (Vuln Queue JSON)

Vuln agents produce structured JSON via SDK's `outputFormat`. Schema varies per class:

### Common Base Fields
```json
{
  "ID": "string",
  "vulnerability_type": "string",
  "externally_exploitable": "boolean",
  "confidence": "string",
  "notes": "string (optional)"
}
```

### Per-Class Additional Fields

| Injection | XSS | Auth | SSRF | Authz |
|-----------|-----|------|------|-------|
| source | source | source_endpoint | source_endpoint | endpoint |
| combined_sources | source_detail | vulnerable_code_location | vulnerable_parameter | vulnerable_code_location |
| path | path | missing_defense | vulnerable_code_location | role_context |
| sink_call | sink_function | exploitation_hypothesis | missing_defense | guard_evidence |
| slot_type | render_context | suggested_exploit_technique | exploitation_hypothesis | side_effect |
| sanitization_observed | encoding_observed | | suggested_exploit_technique | reason |
| concat_occurrences | verdict | | | minimal_witness |
| verdict | mismatch_reason | | | |
| mismatch_reason | witness_payload | | | |
| witness_payload | | | | |

---

## 17. ENVIRONMENT VARIABLES (Complete)

### Credential Variables
| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Direct Anthropic API key |
| `CLAUDE_CODE_OAUTH_TOKEN` | Anthropic OAuth token |
| `ANTHROPIC_BASE_URL` | Custom Anthropic-compatible endpoint URL |
| `ANTHROPIC_AUTH_TOKEN` | Auth token for custom base URL |
| `CLAUDE_CODE_USE_BEDROCK` | Set to `1` for AWS Bedrock |
| `AWS_REGION` | AWS region for Bedrock |
| `AWS_BEARER_TOKEN_BEDROCK` | AWS bearer token for Bedrock |
| `CLAUDE_CODE_USE_VERTEX` | Set to `1` for Google Vertex AI |
| `CLOUD_ML_REGION` | GCP region for Vertex AI |
| `ANTHROPIC_VERTEX_PROJECT_ID` | GCP project ID |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to GCP service account key JSON |

### Model Override Variables
| Variable | Description |
|----------|-------------|
| `ANTHROPIC_SMALL_MODEL` | Override small tier model |
| `ANTHROPIC_MEDIUM_MODEL` | Override medium tier model |
| `ANTHROPIC_LARGE_MODEL` | Override large tier model |

### Shannon-Specific Variables
| Variable | Description |
|----------|-------------|
| `TEMPORAL_ADDRESS` | Temporal server address (default: `localhost:7233`) |
| `SHANNON_LOCAL` | Set to `1` for local mode |
| `SHANNON_FORWARD_HOSTS` | Set to `false` to disable /etc/hosts forwarding |
| `SHANNON_DOCKER` | Set to `true` inside Docker container |
| `SHANNON_HOST_UID` | Host UID for Linux bind mount permissions |
| `SHANNON_HOST_GID` | Host GID for Linux bind mount permissions |
| `SHANNON_DISABLE_LOADER` | Disable progress loader |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | Max output tokens for SDK (default: 64000) |
| `CLAUDE_ADAPTIVE_THINKING` | Set to `false` to disable adaptive thinking |
| `SHANNON_DELIVERABLES_SUBDIR` | Deliverables subdirectory override |
| `PLAYWRIGHT_MCP_EXECUTABLE_PATH` | Path to Chromium binary |
| `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` | Skip browser download (set to 1 in Docker) |

---

## 18. KEY DEPENDENCIES

### Runtime
- `@anthropic-ai/claude-agent-sdk` — Claude SDK for agent execution
- `@anthropic-ai/claude-code` — Claude Code CLI (v2.1.84, installed globally in Docker)
- `@playwright/cli` — Browser automation MCP server (v0.1.1)
- `@temporalio/worker`, `@temporalio/client`, `@temporalio/workflow`, `@temporalio/activity` — Temporal SDK
- `zod` — Schema validation
- `js-yaml` — YAML parsing
- `ajv` + `ajv-formats` — JSON Schema validation
- `zx` — Shell scripting utilities (fs, path, glob)
- `dotenv` — .env loading
- `chokidar` — File watching (for `logs` command)
- `@clack/prompts` — Interactive TUI (for `setup` command)
- `smol-toml` — TOML parsing (npx config)

### Dev
- `@biomejs/biome` — Linting + formatting
- `turbo` — Monorepo task orchestration
- `typescript` — Type checking
- `tsdown` — CLI bundler

---

## 19. SUMMARY — What Can Users DO?

| Capability | How |
|-----------|-----|
| **Start a pentest scan** | `shannon start -u URL -r REPO` |
| **Configure AI provider** | `shannon setup` (npx) or `.env` (local) |
| **Authenticated testing** | YAML config with `authentication` section (form/SSO/API/basic + TOTP + email login) |
| **Scope testing** | YAML config with `rules.avoid` / `rules.focus` (url_path, subdomain, domain, method, header, parameter, code_path) |
| **Select vuln classes** | YAML config `vuln_classes: [injection, xss, auth, authz, ssrf]` |
| **Analysis-only mode** | YAML config `exploit: "false"` — skips exploitation, renders findings from queue |
| **Resume interrupted scans** | `-w <workspace>` — auto-resumes from last checkpoint |
| **Monitor progress** | `shannon logs <workspace>`, `shannon status`, Temporal Web UI |
| **List workspaces** | `shannon workspaces` |
| **Custom output directory** | `-o <path>` |
| **Rate limit recovery** | YAML config `pipeline.retry_preset: subscription` |
| **Reduce concurrency** | YAML config `pipeline.max_concurrent_pipelines: 2` |
| **Report filtering** | YAML config `report.min_severity`, `report.min_confidence`, `report.guidance` |
| **Free-form engagement rules** | YAML config `rules_of_engagement` |
| **Pipeline testing mode** | `--pipeline-testing` flag |
| **Debug mode** | `--debug` flag (preserves container) |

---

## 20. FRONTEND INTEGRATION NOTES

To build a web frontend for Shannon, you need to create a **backend API server** that:

1. **Executes CLI commands** — Wraps `shannon start`, `shannon stop`, etc.
2. **Reads workspace data** — Parses `session.json`, `workflow.log`, deliverable files from filesystem
3. **Queries Temporal** — Uses `@temporalio/client` to query `getProgress`, list workflows, describe workflow status
4. **Streams logs** — Tails `workflow.log` or subscribes to Temporal workflow events via WebSocket
5. **Manages configurations** — Creates/edits YAML config files
6. **Manages credentials** — Handles API key setup (equivalent to `shannon setup`)

There is **no existing HTTP API** — everything is CLI + filesystem + Temporal gRPC. The frontend backend would need to bridge these three interfaces.
