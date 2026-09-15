# 19 — Owner Decisions Required

The following decisions cannot be made by AI or implementation teams. They require the product owner's explicit approval.

---

## Decision 1: MVP Scope Confirmation

**Question**: Is the proposed MVP scope (18 screens, feasibility workspace end-to-end + Command Center + Decision Inbox) the right scope for Phase 9?

**Options**:
- A) Approve as proposed (recommended)
- B) Reduce scope (specify what to cut)
- C) Expand scope (specify what to add)

**Impact**: Determines Phase 9 timeline (estimated 4-6 weeks for proposed scope)

---

## Decision 2: Domain Generalization Priority

**Question**: Should Coffee-specific code audit and refactoring happen BEFORE Phase 9 implementation, or can it be done during Phase 9?

**Options**:
- A) Before Phase 9 — ensure clean architecture first (recommended, adds 1-2 weeks but prevents rework)
- B) During Phase 9 — audit and refactor as modules are built (saves calendar time, risks discovering deep issues mid-sprint)
- C) After Phase 9 — ship F&B-specific MVP, generalize later (fastest to market, but locks in domain coupling)

**Impact**: Determines whether the architecture is clean for future domain expansion

---

## Decision 3: Arabic/English Priority

**Question**: Must Arabic RTL support be in MVP, or can it follow shortly after?

**Options**:
- A) MVP must be bilingual from day one (recommended — retrofitting RTL is expensive and the Saudi market expects Arabic)
- B) English-first MVP, Arabic in Phase 9A (faster MVP launch, but limits market fit)

**Impact**: Adds ~1 week to MVP if done upfront; 2-3 weeks if retrofitted

---

## Decision 4: Report Generation in MVP

**Question**: Should basic PDF report generation be part of MVP?

**Options**:
- A) Yes — include basic Feasibility Report PDF export (recommended — users expect a downloadable output)
- B) No — web-only workspace, PDF in Phase 9A

**Impact**: ~1 week additional MVP effort

---

## Decision 5: Decision Inbox Complexity

**Question**: How complex should the Decision Inbox be in MVP?

**Options**:
- A) Full inbox: aggregated pending actions with priorities and context (recommended)
- B) Simple notification list: "You have N pending decisions" linking to workspace Decision tabs
- C) No separate inbox: pending decisions shown as badges on Command Center study cards

**Impact**: Option A: ~3 days. Option B: ~1 day. Option C: 0 additional days.

---

## Decision 6: Onboarding Flow

**Question**: What should the first-use onboarding experience be?

**Options**:
- A) Guided wizard: Profile → Goals → First Study (recommended)
- B) Direct to study creation: "New Study" CTA with inline guidance
- C) Dashboard with prompt: "Welcome, start your first study" card

**Impact**: Option A provides the best first impression but adds ~3 days to MVP

---

## Decision 7: Study Progress Representation

**Question**: How should study progress be shown to users?

**Options**:
- A) Phase indicators: "Research → Evidence → Financial Model → Decision" with current phase highlighted (recommended — honest about process)
- B) Percentage: "65% complete" (simpler but potentially misleading)
- C) Both: Phase indicator primary, percentage secondary

**Impact**: UI design choice, minimal effort difference

---

## Decision 8: Prototype Visual Direction

**Question**: Are the prototype references (green Saudi theme, enterprise density, sidebar navigation) the approved visual direction?

**Options**:
- A) Yes — proceed with this direction (recommended — strong, professional, culturally appropriate)
- B) No — want a different direction (specify)
- C) Mostly yes — but with specific changes (specify)

**Impact**: Determines design system implementation

---

## Decision 9: Module Phasing Order (Post-MVP)

**Question**: Which module should come first after MVP?

**Options**:
- A) Reporting (9A) → Funding (9B) → Simulator (9C) → Radar (9D) (recommended — matches user journey)
- B) Simulator (9C) first — users want to test scenarios immediately after decisions
- C) Funding (9B) first — most commercially valuable for Saudi entrepreneurs
- D) Different order (specify)

**Impact**: Determines post-MVP development priorities

---

## Decision 10: Cursor Integration Strategy

**Question**: Should Cursor continue independently on Coffee validation while this product review is applied, or should all work pause until this review is approved?

**Options**:
- A) Cursor continues Coffee validation; Phase 9 implementation starts after this review approval (recommended — no wasted work, Cursor proves the engine while product is designed)
- B) All work pauses until product review approval
- C) Cursor pivots to Phase 9 implementation immediately after this review

**Impact**: Development team coordination and timeline

---

## Summary

| # | Decision | Recommended | Owner Approval Needed By |
|---|----------|-------------|-------------------------|
| 1 | MVP Scope | Approve as proposed | Before Phase 9 starts |
| 2 | Domain audit timing | Before Phase 9 | Before Phase 9 starts |
| 3 | Arabic/English | MVP bilingual | Before Phase 9 starts |
| 4 | PDF reports in MVP | Yes | Before Phase 9 starts |
| 5 | Decision Inbox | Full inbox | Before Phase 9 starts |
| 6 | Onboarding | Guided wizard | Before Phase 9 starts |
| 7 | Progress display | Phase indicators | Before UI implementation |
| 8 | Visual direction | Approve prototypes | Before UI implementation |
| 9 | Post-MVP phasing | Reports → Funding → Simulator → Radar | Before Phase 9 completes |
| 10 | Cursor strategy | Continue Coffee independently | Immediately |
