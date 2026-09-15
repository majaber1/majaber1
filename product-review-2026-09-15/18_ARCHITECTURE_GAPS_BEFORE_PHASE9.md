# 18 — Architecture Gaps Before Phase 9

## Phase 9 Gate Questions — Answered

### 1. Does the current architecture support the AI Business Operating System vision?

**YES, with modifications.**

The 6-layer architecture (User Channels → Orchestrator → Specialist Engines → Connectors → Data/Knowledge → Product Modules) is sound and extensible. The evidence system, provenance model, financial engine structure, and decision flow are well-designed foundations.

However, the current implementation is narrowly focused on the feasibility pipeline. The architecture supports the vision in design, but the implementation needs to grow to support:
- Multi-module navigation (currently only feasibility workspace)
- Command Center aggregation
- Cross-module data sharing (feasibility → funding → simulator)
- Background processing for Radar and Monitoring

### 2. What must be fixed BEFORE Phase 9?

| # | Gap | Severity | Description | Fix Effort |
|---|-----|----------|-------------|------------|
| G1 | **Frontend-Backend connectivity** | CRITICAL | Frontend cannot reach backend (503). This is a deployment/configuration issue, not an architecture issue, but nothing works without it. | Small (env var / proxy fix) |
| G2 | **Domain generalization audit** | HIGH | Verify no Coffee-specific hardcoding leaked into core architecture. Check: information needs templates, research queries, financial model formulas, evidence classification logic. | Medium (code audit + refactor if needed) |
| G3 | **Command Center home page** | HIGH | Current home page is a simple study list. MVP requires a portfolio-level command center with pending decisions, risks, insights. | Medium (new page build) |
| G4 | **Decision tab implementation** | HIGH | Decision tab must show AI recommendation with reasoning chain, conditions, and owner approval action — not just a placeholder. | Medium |
| G5 | **Evidence UI completeness** | MEDIUM | Evidence tab exists but needs: coverage heatmap, gap identification, user-assumption entry, evidence detail panel with full provenance. | Medium |
| G6 | **Workspace tab data binding** | MEDIUM | Each workspace tab (Market, Competitors, Location, Operations) must render real research data with evidence badges, not placeholder content. | Medium-Large |
| G7 | **Financial model display** | MEDIUM | Financials tab must display the actual financial model output with evidence traceability, not mock numbers. | Medium |
| G8 | **Arabic/English support** | MEDIUM | Full RTL layout support, language toggle, bilingual content handling. Must be architected before building more UI, not retrofitted. | Medium |
| G9 | **Seed data UniqueViolation** | LOW | `ensure_seed_programs` function fails on duplicate slugs. Needs upsert logic. | Small |
| G10 | **Study progress indicators** | LOW | Replace any "% complete" with phase-based progress (Research → Evidence → Financials → Decision). Percentage implies false precision. | Small |

### 3. What can safely wait until after Phase 9?

| Item | Reason It Can Wait |
|------|-------------------|
| Funding Readiness module | Requires mature study completion flow first |
| Opportunity Radar | Requires background signal infrastructure |
| Decision Simulator | Requires stable financial model API |
| Monitoring module | Post-launch feature |
| Advanced reporting (10 types) | Basic PDF report sufficient for MVP |
| Multi-user / Teams | Single-user MVP is valid |
| POS / accounting integrations | Manual data entry first |
| Mobile app | Responsive web sufficient |
| Domain packs beyond F&B | F&B validates the generic architecture; other packs add later |
| Dark mode | Nice-to-have |

### 4. Is any current Coffee implementation leaking into generic architecture?

**REQUIRES CODE AUDIT.**

Based on the product review documents, the architecture is designed to be generic. However, the Coffee validation scenario has been the only testing path, which creates risk of:

- Information needs templates hardcoded to F&B concepts (seating, menu, COGS % for food)
- Research queries that assume restaurant/cafe contexts
- Financial model formulas with F&B-specific structure (food cost ratio, covers × ticket)
- Evidence classification rules tuned to F&B sources
- UI labels that reference Coffee/F&B concepts in supposedly generic screens

**CODE_FACT_REQUIRED**: Audit these files for Coffee/F&B-specific logic in generic code:
- `ai_engine/config.py` — research prompts
- `ai_engine/models/` — information needs models
- `backend/app/api/v2/study_engine.py` — study creation and processing
- `financial-engine/` — financial model formulas
- `apps/web/` — UI labels and field names

**Recommendation**: Before Phase 9 implementation, run a focused audit (1-2 days) to flag and refactor any Coffee-specific logic into the domain pack pattern.

### 5. Are any screens/modules missing?

| Missing Item | Importance | MVP? |
|-------------|-----------|------|
| **Decision Inbox** | High — users need a single place for pending actions | Yes (simplified) |
| **Onboarding wizard** | High — first-use experience determines retention | Yes |
| **Study creation wizard** | High — currently may be too bare | Yes (refine) |
| **Evidence Detail Panel** | Medium — provenance drill-down is a differentiator | Yes |
| **Basic PDF Report** | Medium — users expect a downloadable output | Phase 9 |

### 6. Is the user journey coherent from Idea → Growth?

**YES, the journey is coherent.**

```
Idea → Research → Feasibility → Decision → Funding → Launch → Monitoring → Simulation → Growth
  ✓       ✓           ✓           ✓         (P9+)     (P9+)     (Future)     (P9+)      (Future)
```

The end-to-end flow is logically sound:
- Each stage has clear inputs and outputs
- Decision gates exist at the right points
- Evidence flows forward through the entire journey
- Workspace persistence ensures nothing is lost
- Post-decision modules (Funding, Simulator, Monitoring) extend rather than replace the core

**One refinement needed**: The journey must explicitly handle the "existing business" entry point (skip feasibility, go to Monitoring/Simulator). Currently the journey assumes a new study.

## Pre-Phase 9 Checklist

- [ ] G1: Fix frontend-backend connectivity
- [ ] G2: Coffee-specific code audit → refactor to domain pack
- [ ] G3: Build Command Center home page
- [ ] G4: Implement Decision tab with approval flow
- [ ] G5: Complete Evidence tab UI
- [ ] G6: Bind workspace tabs to real data
- [ ] G7: Display real financial model output
- [ ] G8: Implement Arabic/English / RTL support
- [ ] G9: Fix seed data upsert
- [ ] G10: Phase-based progress indicators

**Estimated effort for all gaps**: 4-6 weeks of focused implementation work.
