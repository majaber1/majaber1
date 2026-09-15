# 06 — AI Agent Model

## Design Principles

1. **Small governed set** — 7 specialist agents, 1 orchestrator
2. **Clear responsibility boundaries** — no overlap, no sprawl
3. **Evidence chain preservation** — every agent output is traceable
4. **Graceful failure** — agents fail to UNKNOWN, never fabricate
5. **Domain-agnostic core** — sector specifics come from configuration, not agent logic
6. **Human-in-the-loop** — agents recommend, humans decide

## Architecture

```
User Request
    ↓
┌─────────────────────────────┐
│    AI ORCHESTRATOR           │
│  (Coordination & Routing)    │
│                              │
│  Sub-roles:                  │
│  - Planner (task decomp)     │
│  - Research Coordinator      │
│  - Decision Coordinator      │
└──────────┬──────────────────┘
           │ delegates to
           ↓
┌──────────────────────────────────────────────────────┐
│              SPECIALIST AGENTS                        │
│                                                       │
│  1. Business Understanding    5. Decision Advisor     │
│  2. Research                  6. Simulation           │
│  3. Evidence Validation       7. Monitoring           │
│  4. Financial Modeling                                │
└──────────────────────────────────────────────────────┘
           │ uses
           ↓
┌──────────────────────────────────────────────────────┐
│              TOOLS & CONNECTORS                       │
│  Web Search, Maps/POI, Government APIs, File Parse,  │
│  Industry Databases, Financial Calculators, etc.      │
└──────────────────────────────────────────────────────┘
```

---

## Agent 0: AI Orchestrator

**Role**: Coordinate all agent interactions; decompose user requests into agent tasks; ensure correct sequencing; enforce guardrails; manage study lifecycle

**Inputs**: User requests, study state, module context

**Tools**: Agent registry, task queue, state manager

**Outputs**: Delegated tasks to specialist agents; aggregated results; study state transitions

**Persistence**: Study state machine, task execution log

**Guardrails**:
- Cannot skip research → evidence → financial → decision sequence
- Cannot produce a decision without sufficient evidence coverage
- Cannot override user decisions
- Must enforce domain pack configuration

**Handoff**: Delegates to specialist agents based on study phase and user request

**Failure behavior**: If an agent fails, orchestrator logs failure, marks affected outputs as degraded, notifies user. Never silently continues with missing data.

---

## Agent 1: Business Understanding / Planner

**Role**: Understand business intent, classify sector, identify geography, extract constraints, generate information needs plan

**Inputs**: User's business description (natural language or structured), sector, location, budget, goals, timeline

**Tools**: Sector classification model, domain pack loader, information needs template engine

**Outputs**:
- Structured business profile
- Sector classification with confidence
- Information needs list (categorized: market, competition, location, operations, financial, regulatory)
- Research plan with priorities
- Domain pack selection

**Persistence**: Business profile, information needs, research plan (all versioned)

**Guardrails**:
- Must ask clarifying questions if intent is ambiguous (not guess)
- Must load domain-appropriate information needs (not Coffee-specific defaults for non-F&B)
- Cannot assume budget = available funding

**Handoff**: Research plan → Research Agent

**Failure behavior**: Ambiguous input → return clarification request to user. Unknown sector → use generic template, flag for user review.

---

## Agent 2: Research

**Role**: Execute multi-source research to discover observations matching information needs

**Inputs**: Research plan from Planner, information needs list, geography, sector

**Tools**: Web search (DDG, SERP), Maps/POI (Google, OSM), government sources (data.gov.sa, Monsha'at), file/document parsing, industry databases, vendor APIs

**Outputs**:
- Raw observations with source metadata (URL, date, geography, extraction method)
- Source quality indicators
- Research coverage report (which needs were addressed)
- Unresolvable gaps

**Persistence**: All observations stored with full source metadata; research execution log

**Guardrails**:
- Must attempt multiple sources per information need
- Must preserve original source URL and retrieval date
- Must not fabricate observations
- Must respect rate limits and source availability
- Must use domain pack's source strategy (different sectors prioritize different sources)

**Handoff**: Raw observations → Evidence Validation Agent

**Failure behavior**: Source unavailable → retry with alternatives → mark as gap. Rate limited → backoff and retry. No results → report gap with attempted sources.

---

## Agent 3: Evidence Validation

**Role**: Classify, normalize, deduplicate, score, and trace provenance of all observations

**Inputs**: Raw observations from Research, user-provided inputs, existing evidence base

**Tools**: Classification model, normalization engine, deduplication engine, confidence scorer, provenance tracer

**Outputs**:
- Classified evidence items: VERIFIED_FACT / SYSTEM_ESTIMATE / USER_ASSUMPTION / UNKNOWN
- Confidence score per item (0-100)
- Normalized values (currency, units, timeframes)
- Deduplicated evidence set
- Provenance chain per item (source → observation → classification → normalization)
- Coverage analysis against information needs
- Conflict detection (contradictory evidence)

**Persistence**: Evidence register (append-only with versioning); provenance chains; classification audit log

**Guardrails**:
- USER_ASSUMPTION must never be relabeled as SYSTEM_ESTIMATE
- SYSTEM_ESTIMATE must retain derivation chain to upstream evidence
- Conflicting evidence must be flagged, not silently resolved
- UNKNOWN must be explicitly surfaced, not hidden
- Geographic and temporal relevance must be assessed

**Handoff**: Classified evidence → Financial Modeling Agent + Decision Advisor

**Failure behavior**: Unclassifiable observation → UNKNOWN with explanation. Conflicting sources → flag both with user arbitration request.

---

## Agent 4: Financial Modeling

**Role**: Convert evidence-backed assumptions into financial scenarios

**Inputs**: Classified evidence (with confidence), business profile (constraints, budget), domain pack parameters

**Tools**: Financial model engine (CAPEX, OPEX, revenue, cash flow, break-even, sensitivity calculators)

**Outputs**:
- Investment requirement: CAPEX + Working Capital (range)
- Revenue model: Low / Base / High scenarios
- OPEX breakdown (rent, labor, COGS, utilities, marketing, other)
- Cash flow projection (monthly/annual)
- Break-even point (months)
- Budget sufficiency assessment
- Sensitivity analysis (which inputs have highest impact)
- Each output linked to evidence source

**Persistence**: Financial model snapshots (versioned); parameter change log; evidence linkage

**Guardrails**:
- Every number must trace to evidence or be explicitly marked UNKNOWN
- Cannot use budget to backfill cost estimates
- Cannot confuse capacity with demand
- Must show ranges where uncertainty is material
- Must refuse to compute break-even when critical inputs are UNKNOWN
- Domain-specific formulas come from domain pack, not hardcoded

**Handoff**: Financial model → Decision Advisor; Scenario parameters → Simulation Agent

**Failure behavior**: Missing critical evidence → output with UNKNOWN fields and reduced confidence. Model error → report error, do not output partial financials without disclosure.

---

## Agent 5: Decision Advisor

**Role**: Synthesize evidence, financials, and risks into a decision recommendation

**Inputs**: Evidence register, financial model, risk register, business profile, domain pack decision criteria

**Tools**: Decision tree engine, risk aggregator, confidence synthesizer

**Outputs**:
- Decision recommendation: GO / GO_WITH_CONDITIONS / DEFER / NO_GO
- Decision reasoning chain (step-by-step)
- Conditions (for GO_WITH_CONDITIONS): specific actions required
- Evidence coverage summary at decision time
- Confidence level
- Key risks acknowledged
- Alternative actions

**Persistence**: Decision record with full input snapshot at time of decision; owner response; override history

**Guardrails**:
- Cannot recommend GO if evidence coverage is below threshold
- Cannot recommend GO if financials show unviability without explicit risk acknowledgment
- Must present all 4 outcomes as possible — never force a recommendation
- Decision must be reproducible from recorded inputs
- Owner override must be recorded with reason

**Handoff**: Decision → Owner Approval Gate → Next Actions (Funding / Simulation / Reports / Archive)

**Failure behavior**: Insufficient data for any recommendation → DEFER with explanation of what's missing. Conflicting signals → GO_WITH_CONDITIONS listing specific uncertainties.

---

## Agent 6: Simulation

**Role**: Run what-if scenarios on approved financial baselines

**Inputs**: Approved baseline (locked), scenario parameters (user-defined changes), evidence sensitivity data

**Tools**: Financial model engine (same as Agent 4), scenario comparison engine, sensitivity analyzer

**Outputs**:
- Scenario result: modified financials across Low/Base/High
- Delta comparison: current vs scenario
- Impact metrics: revenue, profit, cash, break-even, funding requirement
- Risk impact of changes
- Evidence sensitivity: which evidence assumptions are stressed beyond their confidence range
- Recommendation per scenario

**Persistence**: Named scenarios (versioned); comparison snapshots; applied scenarios log

**Guardrails**:
- Cannot modify approved baseline without owner approval
- Must show when a scenario pushes assumptions beyond evidence-supported ranges
- Must preserve traceability (which parameters changed, by how much)
- Cannot auto-apply scenarios

**Handoff**: Scenario results → Owner for approval to apply; if applied → updated baseline

**Failure behavior**: Parameter out of range → warn user, compute anyway with reduced confidence. Model instability → report divergence, suggest narrower scenario.

---

## Agent 7: Monitoring

**Role**: Track post-launch business performance and market changes

**Inputs**: Approved baseline, actual performance data (user-entered), market feeds, competitor signals, funding/regulatory updates

**Tools**: Variance calculator, trend analyzer, competitor monitor, assumption freshness checker, alert engine

**Outputs**:
- Actual vs plan variance
- Trend analysis
- Competitor activity alerts
- Assumption staleness alerts (evidence that is aging beyond its validity window)
- Risk escalation alerts
- AI-generated recommendations (actions, new simulations, updated decisions)
- Opportunity signals

**Persistence**: Performance time series; alert history; recommendation log; resolution tracking

**Guardrails**:
- Must not auto-adjust approved baseline based on actuals without owner approval
- Must distinguish between data entry gaps and actual performance gaps
- Alert thresholds must be configurable, not hardcoded
- Must not generate false urgency

**Handoff**: Alerts → Decision Inbox; Recommendations → Simulator or new Research cycle

**Failure behavior**: No data → prompt user for input; stale data → staleness warning. External source failure → degrade gracefully, note reduced monitoring coverage.

---

## Agent Interaction Rules

1. **Sequential dependency**: Business Understanding → Research → Evidence Validation → Financial Modeling → Decision Advisor
2. **Parallel allowed**: Research can run multiple source queries concurrently; Evidence Validation can process items concurrently
3. **Feedback loops**: Gap Recovery = Evidence Validation identifies gaps → Research runs targeted retrieval → Evidence Validation reclassifies
4. **Cross-module**: Simulation and Monitoring can trigger new Research cycles through the Orchestrator
5. **No direct agent-to-agent communication**: all coordination flows through the Orchestrator
6. **State visibility**: user can see which agent is active and what it's working on (study progress indicator)
