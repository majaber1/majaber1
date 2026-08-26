# Jaber Dashboard — Canonical Architecture

_Last updated: 2026-08-26_

## Purpose

Jaber Dashboard is a venture/product control tower. It combines commercial planning with a separate operational source of truth for the canonical application portfolio.

## Runtime architecture

```text
Canonical product repositories
  ├─ main/default branch
  ├─ .jaber-dashboard.json
  ├─ README.md
  ├─ architecture document
  ├─ CI/build evidence where applicable
  └─ public safe health endpoint(s)
            │
            ├───────────────┐
            │               │
            ▼               ▼
GitHub Action snapshot   Jaber Dashboard live-sync API
(secondary persistence)  /api/portfolio-operational
            │               │
            ▼               │
src/data/portfolio.generated.json
            │               │
            └───────┬───────┘
                    ▼
          OperationalProvider
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
      Project cards       /audit page
```

## Primary operational source

`/api/portfolio-operational` runs server-side and caches a generated snapshot for six hours. It reads the canonical registry, checks public GitHub repository metadata, reads each repository manifest/document paths, and calls only the health URLs explicitly declared by that product.

The live generator is intentionally conservative:

- no manifest → `UNVERIFIED`
- health unreachable → `UNHEALTHY`
- health reports critical dependency failure → `DEGRADED`
- health responds but optional/important AI or storage capability is missing → `PARTIAL`
- static site with an honest static-health contract → `STATIC`
- mobile/CI-only MVP → `MVP / CI` when CI proves build health
- archived repos → `ARCHIVED`

## Secondary operational source

`.github/workflows/portfolio-sync.yml` is scheduled every six hours and can persist a richer snapshot to `src/data/portfolio.generated.json` when GitHub Actions is available. The application does not depend on this workflow to serve live operational state; the server-side cached API is the runtime fallback/primary path.

## Product registry

`portfolio.registry.json` is the only list of canonical portfolio repositories. It prevents placeholders, historical components and duplicate repositories from being counted as independent products.

## Product manifest contract

Each canonical repository should expose `.jaber-dashboard.json` with:

- canonical slug/repository/branch
- production URL
- declared safe health URL(s) or health paths
- README path
- architecture path
- source policy / runtime mode
- optional readiness hints for static/demo/stateless/CI-only boundaries

The manifest contains no secrets.

## Data separation

Operational truth and commercial planning are deliberately separated.

### Operational / generated

- GitHub branch and HEAD
- manifest presence
- README/architecture presence/freshness when evidence exists
- CI/build state where applicable
- health reachability and safe dependency readiness
- live application URL
- storage readiness signal

### Manual / researched / estimated

- product priority
- market attractiveness
- revenue potential
- pricing
- competitors
- GTM strategy
- commercial roadmap

A commercial score cannot override a failed health check.

## Security

- No project credentials are copied to Jaber Dashboard.
- `GITHUB_READ_TOKEN` is optional and may be configured only as a read token if higher GitHub API limits/private-repo visibility are required.
- Health bodies are whitelisted before being returned to the browser.
- Connection strings, tokens, hosts with credentials and arbitrary health payload keys are not exposed.
- Missing evidence is never converted to a healthy state.

## Deployment

- Source: `majaber1/majaber1` `main`
- Hosting: Vercel project `jaber-dashboard-v2`
- Public application: `https://jaber-dashboard-v2.vercel.app`
- Dashboard health: `/api/health`
- Operational sync: `/api/portfolio-operational`

## Current known limitation

GitHub Actions workflow runs were not observable during the 2026-08-26 rollout. For that reason, the live server-side six-hour cache is not merely a UI convenience; it is the runtime path that keeps the dashboard useful even when scheduled GitHub snapshot persistence is unavailable.
