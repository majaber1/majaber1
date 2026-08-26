# Jaber Dashboard V2 — Product Control Tower

Jaber Dashboard is the operating control tower for the application portfolio: product prioritization, technical readiness, repository/runtime truth, market/commercial planning, and daily execution.

## Architecture

- **Framework**: Next.js 16 + TypeScript + Tailwind CSS v4
- **Commercial/product planning data**: `src/data/projects.ts`
- **Canonical repository registry**: `portfolio.registry.json`
- **Primary operational refresh**: `/api/portfolio-operational` with a six-hour server cache
- **Secondary snapshot generator**: `scripts/sync-portfolio.mjs`
- **Generated fallback snapshot**: `src/data/portfolio.generated.json`
- **Operational UI provider**: `src/lib/operational-context.tsx`
- **Secondary scheduled persistence**: `.github/workflows/portfolio-sync.yml`
- **Deployment**: Vercel project `jaber-dashboard-v2`, GitHub `main` as source control

## Source-of-truth policy

Operational readiness is **not** taken from manually maintained dashboard prose or commercial scores.

For every canonical repository, the operational layer checks:

1. GitHub canonical/default branch and current HEAD SHA.
2. `.jaber-dashboard.json` manifest.
3. Manifest-declared README and architecture document presence.
4. CI/build state when the product explicitly uses a CI-only health contract.
5. Manifest-declared public health endpoint(s).
6. Safe dependency signals such as database, storage and AI readiness without storing secrets.

Runtime states are intentionally distinct:

- `HEALTHY` — declared health is reachable with no critical dependency failure.
- `PARTIAL` — core runtime responds but important capabilities remain unconfigured, demo-only, stateless or unintegrated.
- `DEGRADED` — declared health reports a critical dependency problem or a health endpoint is failing.
- `UNHEALTHY` — declared health cannot be reached or required CI/build fails.
- `STATIC` — static site health is valid and no backend is claimed.
- `MVP / CI` — build/CI is the appropriate signal; production backend readiness is not claimed.
- `UNVERIFIED` — the source contract or evidence is missing.
- `ARCHIVED` — historical repository excluded from active product KPIs.

Market sizing, pricing, GTM, revenue potential and commercial priority remain separate because they require customer validation and/or sourced market research.

## Automatic refresh

### Primary: live server cache

The browser loads `/api/portfolio-operational`. The server computes a safe operational snapshot and caches it for **6 hours**. This path does not depend on GitHub Actions, so the dashboard remains current even when workflow runs are unavailable.

The live generator stays within public GitHub rate limits by using a lightweight contract: repository metadata + HEAD for active products, raw manifest/docs checks, CI only when explicitly required, and declared product health URLs.

An optional `GITHUB_READ_TOKEN` can be configured as a read-only server environment variable if higher GitHub API limits or private-repository visibility are needed.

### Secondary: GitHub Action snapshot

`.github/workflows/portfolio-sync.yml` is also scheduled every six hours and can write a richer snapshot to `src/data/portfolio.generated.json` when GitHub Actions is available. During the 2026-08-26 rollout no Actions runs were observable, which is why this workflow is intentionally secondary rather than a single point of failure.

Manual local snapshot generation:

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
scripts/sync-portfolio.mjs           Rich persisted snapshot generator
.github/workflows/portfolio-sync.yml Secondary six-hour persistence workflow
docs/ARCHITECTURE.md                 Canonical dashboard architecture
src/
├── app/
│   ├── api/health/                  Dashboard health contract
│   ├── api/portfolio-operational/   Primary six-hour live sync API
│   ├── page.tsx                     Portfolio home
│   ├── audit/page.tsx               Live operational audit
│   ├── focus/page.tsx               Daily focus
│   └── projects/[slug]/             Product command pages
├── components/
│   └── ProjectCard.tsx              Commercial + live operational state
├── data/
│   ├── projects.ts                  Product/commercial planning data
│   ├── portfolio.generated.json     Persisted fallback operational snapshot
│   ├── operational.ts               Operational types/helpers
│   └── repository-audit.ts          Registry + snapshot renderer
└── lib/
    ├── operational-context.tsx      Client live-sync provider
    └── portfolio-live.ts            Server-side live generator
```

## Features

- Portfolio overview, filters and sorting
- Priority engine and daily focus
- Product lifecycle, tasks, blockers and artifacts
- Live GitHub / README / Architecture / CI / health audit
- Live application and GitHub links per canonical product
- Runtime/storage badges that do not depend on commercial scores
- Market and competitor planning with provenance labels
- Financial and GTM planning
- AR/EN with RTL support
- Archived/placeholder repository de-duplication
- Dashboard self-monitoring through its own manifest and `/api/health`

## Deployment

The production dashboard is deployed on Vercel. Pushes to `main` trigger the normal production deployment. Runtime operational data refreshes through the six-hour server cache without requiring a redeploy. When the secondary GitHub Action snapshot runs successfully, its committed snapshot can also trigger a deployment if the persisted state changed.

## Safety rules

- Never place secrets, tokens, connection strings or private credentials in manifests or health responses.
- Health endpoints expose configuration/readiness state only.
- Health bodies are whitelisted before they are returned to the browser.
- A successful HTTP response is not automatically classified as production-ready.
- Missing evidence is displayed as `UNVERIFIED`; it is never inferred as healthy.
- Archived and placeholder repos do not count as separate portfolio applications.
