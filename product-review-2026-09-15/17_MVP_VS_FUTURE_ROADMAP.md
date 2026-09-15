# 17 — MVP vs Future Roadmap

## Phasing Strategy

The product vision is an AI Business Operating System with 9 modules. Shipping everything at once would take too long and risk quality. The roadmap prioritizes by:

1. **Core value loop**: Can the user complete a meaningful action end-to-end?
2. **Revenue potential**: Which modules drive paid conversion?
3. **Technical dependency**: What must exist before other modules can work?
4. **Competitive differentiation**: What makes Saudi Business unique?

## MVP (Phase 9 — Current Target)

### Goal
A complete, professional feasibility workspace that demonstrates the AI Business OS value proposition through one end-to-end journey: Idea → Research → Evidence → Financial Model → Decision.

### MVP Screens (18 screens)

| Screen | Priority | Justification |
|--------|----------|---------------|
| Login / Register | P0 | Access control |
| Onboarding Wizard | P0 | First-use experience |
| Business Command Center (Home) | P0 | Portfolio entry point |
| Decision Inbox | P1 | Pending actions (can be simplified to notification list) |
| Study Creation Wizard | P0 | Study initiation |
| Workspace Overview | P0 | Executive summary |
| Workspace Market | P0 | Market analysis |
| Workspace Competitors | P0 | Competitive analysis |
| Workspace Location | P0 | Location intelligence |
| Workspace Operations | P0 | Operating model |
| Workspace Financials | P0 | Financial model |
| Workspace Evidence | P0 | Evidence register with provenance |
| Workspace Risks | P1 | Risk assessment |
| Workspace Decision | P0 | AI recommendation + owner approval |
| Evidence Detail Panel | P1 | Provenance drill-down |
| Profile Settings | P1 | User profile |
| Language Settings | P1 | AR/EN toggle |

### MVP Features

| Feature | Status | MVP Scope |
|---------|--------|-----------|
| Multi-sector support | Refine | Generic information needs + F&B domain pack |
| Evidence-first research | Keep | Full research → evidence → validation pipeline |
| Provenance & classification | Keep | VERIFIED_FACT / SYSTEM_ESTIMATE / USER_ASSUMPTION / UNKNOWN |
| Financial modeling | Keep | CAPEX, OPEX, Revenue (L/B/H), Break-even, Sufficiency |
| Decision engine | Keep | 4-outcome recommendation with reasoning |
| Gap recovery | Keep | Iterative research for UNKNOWN items |
| Owner approval gates | Keep | Decision approval with override tracking |
| Report generation | New | PDF feasibility report (basic) |
| Arabic/English UI | New | Full RTL support + language toggle |

### MVP NOT Included (Deferred)

| Feature | Reason for Deferral |
|---------|-------------------|
| Funding Readiness module | Requires mature study data; Phase 9+ |
| Opportunity Radar | Requires continuous signal collection infrastructure; Phase 9+ |
| Decision Simulator | Requires stable financial model API; Phase 9+ |
| Monitoring | Requires post-launch data; Future |
| Advanced reporting (10 types) | Basic PDF first; Phase 9+ |
| POS/accounting integrations | Future |
| Team/multi-user | Future |
| Mobile app | Future (responsive web for now) |

---

## Phase 9+ (Post-MVP)

### Phase 9A: Reporting & Knowledge (2-3 weeks)

| Deliverable | Description |
|-------------|-------------|
| Report Center | Generate and manage reports |
| Full Feasibility Report | Comprehensive PDF/web report |
| Executive Decision Memo | 1-page decision summary |
| Financial Model Export | Spreadsheet export |
| Evidence Register Export | Full evidence with provenance |
| Decision History | Audit trail of all decisions |

### Phase 9B: Funding Readiness (3-4 weeks)

| Deliverable | Description |
|-------------|-------------|
| Funding Dashboard | Readiness score + gap + requirements |
| Document Checklist | Required/missing documents |
| Program Matching | Government and bank program matching |
| Package Generation | Investor and bank packages |
| Missing-Info Workflow | Guided gap resolution |

### Phase 9C: Decision Simulator (2-3 weeks)

| Deliverable | Description |
|-------------|-------------|
| Scenario Builder | Parameter adjustment UI |
| Impact Comparison | Current vs scenario display |
| Evidence Sensitivity | Beyond-evidence warnings |
| Scenario Library | Save, compare, apply scenarios |
| Pre-built Templates | Common scenario templates |

### Phase 9D: Opportunity Radar (3-4 weeks)

| Deliverable | Description |
|-------------|-------------|
| Signal Collection | Background signal gathering |
| Opportunity Scoring | Composite scoring algorithm |
| Radar Feed | Opportunity cards with actions |
| Create Study from Opportunity | Pre-populated study creation |
| Saved Opportunities | Watchlist management |

---

## Future (Post Phase 9)

### Phase 10: Continuous Monitoring (4-6 weeks)

| Deliverable | Description |
|-------------|-------------|
| Monitoring Dashboard | Actual vs plan |
| Manual Data Entry | Monthly actuals |
| Alert System | Threshold-based alerts |
| Assumption Freshness | Evidence staleness tracking |
| AI Recommendations | Action suggestions |

### Phase 11: Enterprise Features (6-8 weeks)

| Deliverable | Description |
|-------------|-------------|
| Multi-user / Teams | Organization accounts, roles |
| Advanced Permissions | Read/write/approve per module |
| API Access | External integration API |
| POS Integration | Automated revenue tracking |
| Accounting Integration | Automated cost tracking |
| White-label | Enterprise/accelerator branding |

### Phase 12: Domain Expansion

| Deliverable | Description |
|-------------|-------------|
| Manufacturing Domain Pack | Sector-specific research + model |
| Retail Domain Pack | Sector-specific research + model |
| SaaS Domain Pack | Sector-specific research + model |
| Services Domain Pack | Sector-specific research + model |
| Domain Pack Framework | Standardized pack creation system |

---

## Technical Prerequisites by Phase

| Phase | Prerequisite |
|-------|-------------|
| MVP (Phase 9) | Frontend-backend connectivity, stable research pipeline, financial engine, auth system |
| 9A (Reports) | PDF generation library, report template engine |
| 9B (Funding) | Funding program database, document management |
| 9C (Simulator) | Financial model API (parameterized), scenario comparison engine |
| 9D (Radar) | Background signal collection, scoring algorithm |
| 10 (Monitoring) | Time-series data storage, alert engine |
| 11 (Enterprise) | Multi-tenancy, RBAC, API gateway |
| 12 (Domains) | Domain pack abstraction, template system |
