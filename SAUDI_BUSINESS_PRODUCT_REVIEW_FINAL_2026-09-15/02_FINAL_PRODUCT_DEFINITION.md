# 02 — Final Product Definition

## Product Identity

**Saudi Business** — AI Business Operating System

Tagline: "Ideas to Impact"

## What It Is

An AI-native platform that helps Saudi entrepreneurs, SMEs, investors, and advisors research, evaluate, decide, fund, launch, and monitor business opportunities — with every number grounded in evidence, every estimate traceable, and every decision auditable.

## What It Is Not

- Not a feasibility report generator
- Not a PDF export tool
- Not a generic dashboard
- Not a chatbot wrapper
- Not a Coffee-shop-specific product

## Core Operating Principle

**AI does the work. Humans make the decisions.**

AI researches, discovers, estimates, models, recommends, simulates, and monitors.
Humans approve, reject, edit, override, and decide.

## Product Modules

| # | Module | Purpose | Status |
|---|--------|---------|--------|
| 1 | **Business Command Center** | Portfolio-level executive view of all businesses, decisions, risks, opportunities, and alerts | New specification |
| 2 | **AI Feasibility Workspace** | End-to-end business evaluation from idea to GO/NO-GO decision | Core — most developed |
| 3 | **Evidence Intelligence Center** | Trust layer: browse, inspect, validate all evidence with provenance | Established in code |
| 4 | **Funding Readiness** | Post-decision funding preparation: score, gap, documents, programs, packages | Needs specification |
| 5 | **Opportunity Radar** | AI-powered opportunity discovery from market, sector, policy signals | Needs specification |
| 6 | **Business Decision Simulator** | What-if scenario engine on approved baselines | Needs specification |
| 7 | **Continuous Business Intelligence** | Post-launch monitoring: actual vs plan, alerts, staleness, competitor changes | Needs specification |
| 8 | **Reports & Knowledge Workspace** | Report generation, evidence register, decision history, knowledge base | Needs specification |
| 9 | **Decision Inbox** | Pending owner actions: approvals, reviews, overrides, gap resolutions | New specification |

## Domain Generalization

The platform serves any business domain through:
- **Core engines**: Research, Evidence, Financial, Decision — domain-agnostic
- **Domain packs**: Sector-specific information-needs templates, research priorities, financial model dependencies
- **Current validation domain**: Food & Beverage (Coffee)
- **Future domains**: Manufacturing, Recycling/Scrap, SaaS, Retail, Services, other Saudi sectors

## Evidence Classification (Non-Negotiable)

| Class | Definition | Trust Level |
|-------|-----------|-------------|
| VERIFIED_FACT | Confirmed by reputable source (government, official data, market reports) | Highest |
| SYSTEM_ESTIMATE | Derived by Saudi Business AI from data, models, benchmarks | High (with provenance) |
| USER_ASSUMPTION | Provided by the user based on their knowledge/expectations | Medium (explicit) |
| UNKNOWN | Evidence not available or cannot be reliably determined | Honest gap |

## Decision Outcomes

| Outcome | Meaning |
|---------|---------|
| GO | Proceed — evidence sufficient, financially viable, risks acceptable |
| GO_WITH_CONDITIONS | Proceed with specific conditions, mitigations, or further validation |
| DEFER | Insufficient evidence or timing — revisit later |
| NO_GO | Do not proceed — evidence shows unacceptable risk or unviability |

## Non-Negotiable Rules

1. No unsupported numbers — every figure has a source
2. SYSTEM_ESTIMATE retains upstream evidence chain
3. UNKNOWN is allowed when evidence genuinely fails — never fabricate
4. User input never disguised as SYSTEM_ESTIMATE
5. Low/Base/High ranges where uncertainty is material
6. Confidence and provenance visible at every decision point
7. Capacity must not be confused with demand
8. Owner budget must not backfill cost estimates
9. Product logic remains generic — no domain-specific hardcoding in core

## Target Users

| Persona | Role | Primary Modules |
|---------|------|----------------|
| **Entrepreneur / Founder** | Primary decision maker | All modules |
| **SME Owner** | Existing business operator evaluating expansion | Feasibility, Simulator, Monitoring |
| **Investor** | Evaluating opportunities for investment | Feasibility, Funding, Opportunity Radar |
| **Business Advisor / Consultant** | Supporting clients with analysis | All modules (multi-business) |
| **Organization / Accelerator** | Portfolio management | Command Center, Reports |

## First-Class Business Workspace Model

The core data model is:

```
User / Organization
  └── Business Workspace (first-class entity)
        ├── Studies (feasibility evaluations)
        ├── Evidence (shared across studies within a business)
        ├── Financial Models
        ├── Decisions
        ├── Reports
        └── Monitoring Data
```

A "Business" is the primary organizational unit, not a "Study." Studies are evaluations conducted within a Business Workspace. All modules (Simulator, Funding, Monitoring, Reports) attach to a Business Workspace, not to individual studies. Evidence may be shared across studies within the same Business.

## Market Context

- Saudi Vision 2030 driving entrepreneurship and diversification
- Growing SME ecosystem with government funding programs (Monsha'at, SDB, etc.)
- Bilingual market requiring Arabic/English support
- High trust requirements for financial decisions
