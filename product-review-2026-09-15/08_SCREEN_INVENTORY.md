# 08 — Screen Inventory

## Complete Screen List

| # | Screen | Route | Module | MVP | Priority |
|---|--------|-------|--------|-----|----------|
| **Auth & Onboarding** |
| S01 | Login | `/login` | Auth | Yes | P0 |
| S02 | Register | `/register` | Auth | Yes | P0 |
| S03 | Onboarding Wizard | `/onboard` | Auth | Yes | P0 |
| **Business Command Center** |
| S04 | Command Center (Home) | `/` | Command Center | Yes | P0 |
| S05 | Decision Inbox | `/inbox` | Command Center | Yes | P1 |
| **Feasibility Workspace** |
| S06 | Study Creation Wizard | `/studies/new` | Feasibility | Yes | P0 |
| S07 | Workspace — Overview | `/studies/:id` | Feasibility | Yes | P0 |
| S08 | Workspace — Market | `/studies/:id/market` | Feasibility | Yes | P0 |
| S09 | Workspace — Competitors | `/studies/:id/competitors` | Feasibility | Yes | P0 |
| S10 | Workspace — Location | `/studies/:id/location` | Feasibility | Yes | P0 |
| S11 | Workspace — Operations | `/studies/:id/operations` | Feasibility | Yes | P0 |
| S12 | Workspace — Financials | `/studies/:id/financials` | Feasibility | Yes | P0 |
| S13 | Workspace — Evidence | `/studies/:id/evidence` | Feasibility | Yes | P0 |
| S14 | Workspace — Risks | `/studies/:id/risks` | Feasibility | Yes | P1 |
| S15 | Workspace — Decision | `/studies/:id/decision` | Feasibility | Yes | P0 |
| S16 | Evidence Detail Panel | `/studies/:id/evidence/:eid` | Evidence Center | Yes | P1 |
| S17 | Competitor Detail | `/studies/:id/competitors/:cid` | Feasibility | Phase 9+ | P2 |
| **Evidence Intelligence** |
| S18 | Evidence Register (Global) | `/evidence` | Evidence Center | Phase 9+ | P2 |
| S19 | Evidence Comparison View | `/evidence/compare` | Evidence Center | Phase 9+ | P3 |
| **Funding Readiness** |
| S20 | Funding Dashboard | `/funding/:id` | Funding | Phase 9+ | P2 |
| S21 | Document Checklist | `/funding/:id/documents` | Funding | Phase 9+ | P2 |
| S22 | Program Matching | `/funding/:id/programs` | Funding | Phase 9+ | P2 |
| S23 | Investor Package Builder | `/funding/:id/investor` | Funding | Phase 9+ | P3 |
| S24 | Bank Package Builder | `/funding/:id/bank` | Funding | Phase 9+ | P3 |
| **Opportunity Radar** |
| S25 | Radar Feed | `/opportunities` | Opportunity Radar | Phase 9+ | P2 |
| S26 | Opportunity Detail | `/opportunities/:oid` | Opportunity Radar | Phase 9+ | P2 |
| S27 | Saved Opportunities | `/opportunities/saved` | Opportunity Radar | Phase 9+ | P3 |
| **Decision Simulator** |
| S28 | Simulator Home | `/simulator/:id` | Simulator | Phase 9+ | P2 |
| S29 | Scenario Builder | `/simulator/:id/new` | Simulator | Phase 9+ | P2 |
| S30 | Scenario Comparison | `/simulator/:id/compare` | Simulator | Phase 9+ | P3 |
| S31 | Scenario Library | `/simulator/:id/scenarios` | Simulator | Phase 9+ | P3 |
| **Monitoring** |
| S32 | Monitoring Dashboard | `/monitoring/:id` | Monitoring | Future | P3 |
| S33 | Performance Detail | `/monitoring/:id/performance` | Monitoring | Future | P3 |
| S34 | Market Watch | `/monitoring/:id/market` | Monitoring | Future | P3 |
| S35 | Alert History | `/monitoring/:id/alerts` | Monitoring | Future | P3 |
| **Reports & Knowledge** |
| S36 | Report Center | `/reports` | Reports | Phase 9+ | P2 |
| S37 | Report Viewer | `/reports/:rid` | Reports | Phase 9+ | P2 |
| S38 | Knowledge Hub | `/knowledge` | Knowledge | Future | P3 |
| S39 | Decision History | `/decisions` | Reports | Phase 9+ | P3 |
| **Settings** |
| S40 | Profile & Organization | `/settings/profile` | Settings | Yes | P1 |
| S41 | Notifications | `/settings/notifications` | Settings | Phase 9+ | P2 |
| S42 | Language & Regional | `/settings/language` | Settings | Yes | P1 |
| S43 | Team & Permissions | `/settings/team` | Settings | Future | P3 |

## Summary

| Category | Screen Count | MVP | Phase 9+ | Future |
|----------|-------------|-----|----------|--------|
| Auth & Onboarding | 3 | 3 | 0 | 0 |
| Command Center | 2 | 2 | 0 | 0 |
| Feasibility Workspace | 12 | 11 | 1 | 0 |
| Evidence Intelligence | 2 | 0 | 2 | 0 |
| Funding Readiness | 5 | 0 | 5 | 0 |
| Opportunity Radar | 3 | 0 | 3 | 0 |
| Decision Simulator | 4 | 0 | 4 | 0 |
| Monitoring | 4 | 0 | 0 | 4 |
| Reports & Knowledge | 4 | 0 | 3 | 1 |
| Settings | 4 | 2 | 1 | 1 |
| **Total** | **43** | **18** | **19** | **6** |
