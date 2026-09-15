# 03 — Product Sitemap

## Global Navigation (Persistent Sidebar)

```
Saudi Business
├── Home (Business Command Center)
├── New Study (+)
├── My Businesses
│   ├── [Business 1] — Workspace
│   ├── [Business 2] — Workspace
│   └── ...
├── Opportunity Radar
├── Business Simulator
├── Funding Readiness
├── Market Intelligence
├── Knowledge Hub
├── Decision Inbox
└── Settings
    ├── Profile & Organization
    ├── Notifications
    ├── Language (AR/EN)
    ├── Integrations
    └── Team & Permissions
```

## Screen Hierarchy

### 1. Business Command Center (`/`)
- Portfolio overview
- Active studies summary cards
- Decision inbox (pending actions count)
- Risk alerts
- Opportunity highlights
- Funding readiness summary
- Recent simulations
- AI insights feed

### 2. AI Feasibility Workspace (`/studies/:id`)
```
Study Workspace
├── Overview (executive summary)
├── Market
│   ├── Market size & demand
│   ├── Target segments
│   └── Trends & growth
├── Competitors
│   ├── Competitor map
│   ├── Individual competitor profiles
│   └── Competitive positioning
├── Location
│   ├── Location analysis
│   ├── Map view
│   ├── Rent/cost comparison
│   └── Demographics & traffic
├── Operations
│   ├── Operating model
│   ├── Staffing
│   ├── Hours & capacity
│   └── Supply chain / COGS
├── Financials
│   ├── Investment requirement (CAPEX + Working Capital)
│   ├── Revenue scenarios (Low/Base/High)
│   ├── Operating costs (OPEX)
│   ├── Break-even / payback
│   ├── Cash flow projection
│   └── Budget sufficiency
├── Evidence
│   ├── Evidence register (all items)
│   ├── By classification
│   ├── Coverage heatmap
│   ├── Gaps & unknowns
│   └── Source quality
├── Risks
│   ├── Risk register
│   ├── Sensitivity analysis
│   └── Mitigation recommendations
└── Decision
    ├── AI recommendation
    ├── Conditions (if GO_WITH_CONDITIONS)
    ├── Evidence coverage summary
    ├── Owner action: Approve / Override / Request more research
    └── Next steps
```

### 3. Evidence Intelligence Center (`/studies/:id/evidence` + `/evidence`)
```
Evidence Center
├── Study-scoped evidence register
├── Global evidence library
├── Evidence detail view
│   ├── Value/range
│   ├── Classification badge
│   ├── Source(s) with links
│   ├── Observation count
│   ├── Date/recency
│   ├── Geography
│   ├── Derivation chain
│   ├── Confidence score
│   └── Decision impact
├── Filters: by class, source, date, confidence, domain
└── Evidence comparison view
```

### 4. Funding Readiness (`/funding/:id`)
```
Funding Readiness
├── Readiness Dashboard
│   ├── Readiness score (composite)
│   ├── Funding requirement
│   ├── Funding gap
│   └── Timeline
├── Document Checklist
│   ├── Required documents
│   ├── Status: ready / missing / draft
│   └── Upload / generate actions
├── Funding Programs
│   ├── Matched programs (government, bank, investor)
│   ├── Eligibility assessment
│   └── Application guidance
├── Investor Package
│   ├── Investment memo
│   ├── Financial model export
│   ├── Pitch deck data
│   └── Generate package action
└── Bank Package
    ├── Bank-ready financials
    ├── Collateral assessment
    └── Generate package action
```

### 5. Opportunity Radar (`/opportunities`)
```
Opportunity Radar
├── Signal Feed
│   ├── Market signals
│   ├── Policy / regulatory signals
│   ├── Competitor signals
│   ├── Demand signals
│   └── Sector signals
├── Opportunity Cards
│   ├── What changed / why now
│   ├── Evidence
│   ├── Potential (scored)
│   ├── Risk
│   ├── Relevance to user
│   └── Actions: Create Study / Simulate / Save / Dismiss
├── Saved Opportunities
└── Opportunity Detail View
```

### 6. Business Decision Simulator (`/simulator/:id`)
```
Decision Simulator
├── Baseline (locked from approved study)
├── Scenario Builder
│   ├── Parameter adjustment (price, rent, staff, capacity, etc.)
│   ├── Multi-variable scenarios
│   └── Named scenario save
├── Impact View
│   ├── Current vs Scenario comparison
│   ├── Revenue / Profit / Cash impact
│   ├── Break-even impact
│   ├── Risk impact
│   ├── Confidence change
│   └── Low/Base/High ranges
├── Scenario Library
│   ├── Saved scenarios
│   ├── Compare up to 3
│   └── Recommendation per scenario
└── Apply Scenario (owner approval required)
```

### 7. Continuous Business Intelligence (`/monitoring/:id`)
```
Monitoring Dashboard
├── Performance Overview
│   ├── Actual vs Plan (revenue, costs, KPIs)
│   ├── Trend lines
│   └── Variance alerts
├── Market Watch
│   ├── Competitor changes
│   ├── Market shifts
│   └── New entrants
├── Risk Monitor
│   ├── Assumption staleness tracker
│   ├── Evidence freshness
│   └── Active risk alerts
├── AI Recommendations
│   ├── Suggested actions
│   ├── New simulations recommended
│   └── Updated decisions
└── Alert History
```

### 8. Reports & Knowledge (`/reports`)
```
Reports & Knowledge
├── Report Center
│   ├── Generate report (by type)
│   ├── Report history
│   └── Scheduled reports
├── Report Types
│   ├── Full Feasibility Study
│   ├── Executive Decision Memo
│   ├── Financial Model Export
│   ├── Market Intelligence Report
│   ├── Competitor Analysis
│   ├── Location Analysis
│   ├── Risk Report
│   ├── Evidence Register
│   ├── Funding Package
│   └── Investor Package
├── Knowledge Hub
│   ├── Domain knowledge base
│   ├── Industry benchmarks
│   ├── Saudi market data
│   └── Regulatory reference
└── Decision History
    ├── All decisions with timestamps
    ├── Evidence at time of decision
    └── Outcome tracking
```

### 9. Decision Inbox (`/inbox`)
```
Decision Inbox
├── Pending Approvals
│   ├── Study decisions awaiting review
│   ├── Evidence requiring user input
│   ├── Gap resolution requests
│   └── Simulation results to approve
├── Notifications
│   ├── AI alerts
│   ├── Risk warnings
│   ├── Opportunity matches
│   └── Monitoring triggers
└── Action History
```

### 10. Authentication & Onboarding
```
Auth
├── Login / Register
├── Onboarding
│   ├── Business profile setup
│   ├── Goals & constraints
│   └── First study creation wizard
└── Organization setup (multi-user)
```
