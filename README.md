# Jaber Dashboard V2 — Product Control Tower

Portfolio dashboard, PMO, technical readiness monitor, GitHub/Vercel monitor, market intelligence dashboard, commercial strategy dashboard, and daily execution guide.

## Architecture

- **Framework**: Next.js 15 + TypeScript + Tailwind CSS v4
- **Data**: Typed project data in `src/data/projects.ts`
- **Deployment**: Vercel (primary), GitHub for source control
- **Persistence**: JSON data fallback (database abstraction ready)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Portfolio home
│   ├── focus/page.tsx     # Daily focus page
│   └── projects/[slug]/   # Project detail pages
├── components/            # Reusable UI components
├── data/
│   └── projects.ts        # Project data (7 projects)
├── lib/
│   ├── priority.ts        # Priority scoring engine
│   ├── i18n.ts           # AR/EN translations
│   ├── locale-context.tsx # Locale provider
│   └── utils.ts          # Utility functions
└── types/
    └── project.ts         # TypeScript data model
```

## Features

- **Portfolio Overview**: KPI cards, filters, sorting, project cards
- **Priority Engine**: Weighted scoring model (100 points) with transparent recommendations
- **Daily Focus**: Today's recommended project, top 3 actions, blockers, quick wins
- **Project Pages**: 9-tab command pages (Overview, Execution, Technical, Artifacts, Market, Commercial, Financial, Roadmap, Deployment)
- **Artifact Monitor**: Readiness tracking across Product, Technical, QA, Business, Commercial
- **Market Intelligence**: Competitor analysis, market opportunity, TAM/SAM/SOM
- **Financial Engine**: Revenue scenarios, milestones, break-even calculations
- **Opportunity Matrix**: Visual portfolio chart (effort vs revenue)
- **GitHub/Vercel Monitoring**: Repository and deployment status tracking
- **Data Provenance**: AUTO / MANUAL / ESTIMATED / RESEARCHED / UNVERIFIED badges
- **AR/EN**: Full bilingual support with RTL
- **Product Lifecycle**: 13-stage journey tracker per project

## Build

```bash
npm run build
```

## Deploy

Deployed to Vercel. Push to `main` triggers production deployment.

## Data Model

Projects are typed with comprehensive fields covering:
- Identity, stage, status
- Scores (product, technical, QA, deployment, commercial, artifacts, market, revenue, priority)
- GitHub and Vercel integration info
- 13-stage lifecycle tracker
- Tasks (resolved, pending, blockers)
- Artifacts with readiness status
- Competitors with detailed analysis
- Market opportunity with TAM/SAM/SOM
- Commercial strategy with fastest path to first customer
- Financial model with revenue milestones
- Roadmap (this week through 90 days)
- Data provenance for every important value

## Projects Tracked

1. Qarar AI
2. Multazim AI
3. Saudi Business
4. Private Coach
5. Mini Bites AI
6. LinkedIn AI Post
7. Jaber Dashboard (self-tracking)
