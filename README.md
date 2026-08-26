# Jaber Dashboard V2 — Product Control Tower

Jaber Dashboard is the operating control tower for the application portfolio: product prioritization, technical readiness, repository/runtime truth, market/commercial planning, and daily execution.

## Architecture

- **Framework**: Next.js 16 + TypeScript + Tailwind CSS v4
- **Commercial/product planning data**: `src/data/projects.ts`
- **Canonical repository registry**: `portfolio.registry.json`
- **Operational generator**: `scripts/sync-portfolio.mjs`
- **Generated operational snapshot**: `src/data/portfolio.generated.json`
- **Operational UI adapter**: `src/data/operational.ts`
- **Automated refresh**: `.github/workflows/portfolio-sync.yml`
- **Deployment**: Vercel (primary), GitHub `main` as source control

## Source-of-truth policy

Operational readiness is **not** taken from manually maintained dashboard prose or commercial scores.

For every canonical repository, the sync process checks:

1. GitHub default branch and current HEAD SHA.
2. `.jaber-dashboard.json` manifest.
3. Manifest-declared README and architecture document presence/freshness.
4. Latest GitHub Actions state when available.
5. Manifest-declared public health endpoint(s), or a CI/build-only contract for products such as mobile MVPs.
6. Safe dependency signals such as database, storage and AI readiness without storing secrets.

Runtime states are intentionally distinct:

- `HEALTHY` — declared health is reachable with no critical dependency failure.
- `PARTIAL` — core runtime responds but required/important capabilities remain unconfigured, demo-only, stateless or unintegrated.
- `DEGRADED` — declared health reports a critical dependency problem or a health endpoint is failing.
- `UNHEALTHY` — declared health cannot be reached or CI/build fails.
- `STATIC` — static site health is valid and no backend is claimed.
- `MVP / CI` — build/CI is the appropriate signal; production backend readiness is not claimed.
- `UNVERIFIED` — the source contract or evidence is missing.
- `ARCHIVED` — historical repository excluded from active product KPIs.

Market sizing, pricing, GTM, revenue potential and commercial priority remain separate because they require customer validation and/or sourced market research.

## Automatic refresh

The portfolio source-of-truth workflow runs:

- every **6 hours**,
- manually with `workflow_dispatch`,
- when the registry, generator or workflow definition changes on `main`.

It writes only the safe generated snapshot back to the dashboard repository. No application credentials are copied into Jaber Dashboard.

Manual local refresh:

```bash
npm run sync:portfolio
```

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Validation:

```bash
npm run typecheck
npm run lint
npm run build
```

## Project structure

```text
portfolio.registry.json              Canonical repo/product registry
scripts/sync-portfolio.mjs           GitHub/docs/CI/health snapshot generator
.github/workflows/portfolio-sync.yml Six-hour refresh workflow
src/
├── app/
│   ├── page.tsx                     Portfolio home
│   ├── audit/page.tsx               Generated operational audit
│   ├── focus/page.tsx               Daily focus
│   └── projects/[slug]/             Product command pages
├── components/
│   └── ProjectCard.tsx              Commercial + generated operational state
├── data/
│   ├── projects.ts                  Product/commercial planning data
│   ├── portfolio.generated.json     Machine-generated operational truth
│   ├── operational.ts               Typed operational helpers
│   └── repository-audit.ts          Registry + generated snapshot renderer
└── types/
    └── project.ts
```

## Features

- Portfolio overview, filters and sorting
- Priority engine and daily focus
- Product lifecycle, tasks, blockers and artifacts
- Generated GitHub / README / Architecture / CI / health audit
- Live application and GitHub links per canonical product
- Runtime/storage badges that do not depend on commercial scores
- Market and competitor planning with provenance labels
- Financial and GTM planning
- AR/EN with RTL support
- Archived/placeholder repository de-duplication

## Deployment

The production dashboard is deployed on Vercel. Pushes to `main` trigger the normal production deployment. The six-hour operational snapshot commits also trigger a new Vercel deployment when the generated state changes, keeping the displayed dashboard synchronized with the latest published snapshot.

## Safety rules

- Never place secrets, tokens, connection strings or private credentials in manifests or health responses.
- Health endpoints expose configuration/readiness state only.
- A successful HTTP response is not automatically classified as production-ready.
- Missing evidence is displayed as `UNVERIFIED`; it is never inferred as healthy.
- Archived and placeholder repos do not count as separate portfolio applications.
