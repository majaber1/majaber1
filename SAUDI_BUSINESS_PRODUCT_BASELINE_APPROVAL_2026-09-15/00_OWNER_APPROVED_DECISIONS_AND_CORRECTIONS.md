# 00 — Owner-Approved Decisions and Corrections

**Date**: 2026-09-15
**Status**: APPROVED — This document takes precedence over any conflicting content in deliverables 01-20.

---

## Owner Decisions (D1-D10)

### D1: MVP Scope
**Approved**: Option A — 18 MVP screens (feasibility workspace end-to-end + Command Center + Decision Inbox). No change to proposed scope.

### D2: Domain Generalization Priority
**Approved**: Option A — Before Phase 9. Clean architecture first; Coffee-specific code audit and refactoring completed before Phase 9 implementation begins.

### D3: Arabic/English Priority
**Approved**: Option A — MVP must be bilingual from day one. RTL-first architecture. No English-only interim.

### D4: Report Generation in MVP
**Approved**: Option A — Basic PDF feasibility report export included in MVP.

### D5: Decision Inbox Complexity
**Approved**: Option B — Simple notification list. "You have N pending decisions" linking to workspace Decision tabs. Full inbox deferred to post-MVP.

### D6: Onboarding Flow
**Approved**: Option A — Guided wizard (Profile → Goals → First Study).

### D7: Study Progress Representation
**Approved**: Option A — Phase indicators only. "Research → Evidence → Financial Model → Decision" with current phase highlighted. No percentage.

### D8: Prototype Visual Direction
**Approved**: Option A — Proceed with green Saudi theme, enterprise density, sidebar navigation. Approved visual direction.

### D9: Module Phasing Order (Post-MVP)
**Modified**: Phase 9A = Decision Simulator, Phase 9B = Funding Readiness, Phase 9C = Opportunity Radar, Phase 10 = Monitoring. Reporting is a basic export in Phase 9 (MVP), not a standalone phase.

### D10: Cursor Integration Strategy
**Approved**: Option A — Cursor continues Coffee validation independently. Phase 9 implementation starts after this review approval.

---

## Owner Corrections (C1-C10)

### C1: Reclassify G1 and G9
G1 (frontend-backend 503) and G9 (seed data UniqueViolation) are moved to UNVERIFIED_OPERATIONAL_CHECKS. These are operational issues that may or may not still exist. They are not architecture gaps and do not gate Phase 9.

### C2: Redefine Pre-Phase-9 Gate
The pre-Phase-9 gate is limited to:
1. Owner approval of this product review
2. Coffee validation closure decision (continue, archive, or merge)
3. Domain generalization audit (information needs, research prompts, financial formulas, UI labels)
4. Business-vs-Study object model confirmation (first-class Business Workspace)
5. API baseline confirmation (backend can serve workspace data)
6. Clean starting point (branch, dependencies, environment documented)

Items previously listed as "gaps" (G3-G8, G10) are Phase 9 implementation work, not prerequisites.

### C3: First-Class Business Workspace Model
The data model is: User/Org → Business Workspace → Studies, Evidence, Financial Models, Decisions, Reports, Monitoring. A "Business" is the first-class entity, not a "Study." Studies are evaluations within a Business Workspace. Routes, navigation, and API contracts reflect this hierarchy.

### C4: Agents Are Logical Responsibilities
The 7 specialist agents and 1 orchestrator represent logical responsibilities, not mandatory separate LLM processes. Preferred execution mode:
- Financial Modeling = DETERMINISTIC engine (no LLM required)
- Simulation = DETERMINISTIC engine
- Evidence Validation = rules-first, LLM-assisted where rules are insufficient
- Research = LLM-directed, tool-augmented
- Business Understanding = LLM-directed
- Decision Advisor = structured decision rationale (not "step-by-step reasoning chain")
- Monitoring = rules + threshold engine, LLM for recommendations only

Token/cost guardrails: each agent invocation should have cost bounds; prefer deterministic computation where possible.

### C5: Evidence Override Governance
User evidence overrides must be:
- Explicitly versioned (old value, new value, timestamp, reason)
- Auditable (override history preserved)
- No silent reclassification: USER_ASSUMPTION → SYSTEM_ESTIMATE is prohibited; SYSTEM_ESTIMATE → VERIFIED_FACT requires new source evidence; any class transition must be logged with justification
- Overrides flow forward to financial model and decision with the override's evidence class, not the original class

### C6: Scoring Weights Are Draft
All composite scoring weights in Funding Readiness and Opportunity Radar are:
- **DRAFT** — not empirically validated
- **CONFIGURABLE** — weights are system parameters, not hardcoded
- **REQUIRES CALIBRATION** — must be tuned against real usage data before being treated as reliable

### C7: Owner Decisions Applied
All 10 owner decisions (D1-D10) are reflected throughout the deliverables. See the D1-D10 section above.

### C8: Navigation Refinement
Approved sidebar navigation order:
1. Home (Command Center)
2. My Businesses
3. New Evaluation (+)
4. Opportunity Radar
5. Simulator
6. Funding
7. Reports
8. Action Center (replaces "Decision Inbox")
9. Settings

### C9: Domain Pack Wording
Domain packs define: information needs, research priorities, financial model dependencies. They do NOT include benchmark databases (yet). Remove any claim of "benchmark databases" from domain pack descriptions.

### C10: Final Status Update
After all corrections are applied consistently, final status changes to READY_FOR_OWNER_APPROVAL.

---

## Precedence Rule

If any content in deliverables 01-20 conflicts with this document, this document governs.
