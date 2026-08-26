import registryJson from '../../portfolio.registry.json';
import { findOperationalByRepo, operationalSnapshot, runtimeLabel, type OperationalSnapshot, type StorageState } from './operational';

export type RepoPortfolioState = 'active' | 'archive' | 'support';

interface RegistryEntry {
  repo: string;
  product: string;
  productSlug?: string;
  classification: string;
  state: RepoPortfolioState;
  fallbackProductionUrl?: string;
  action: string;
}

export interface RepositoryAuditRow {
  repo: string;
  product: string;
  productSlug?: string;
  classification: string;
  state: RepoPortfolioState;
  githubStatus: string;
  vercelUrl?: string;
  runtimeState: string;
  runtimeStatus: string;
  action: string;
  storageState: StorageState;
  storageProvider: string;
  storageEvidence: string;
  manifestState: string;
  readmeState: string;
  architectureState: string;
  ciState: string;
  lastChecked?: string;
}

const registry = registryJson as unknown as { schemaVersion: number; owner: string; projects: RegistryEntry[] };

function docLabel(state: string, stale: boolean | null | undefined) {
  if (state !== 'present') return state.toUpperCase();
  if (stale === true) return 'STALE';
  if (stale === false) return 'CURRENT';
  return 'PRESENT';
}

export function buildRepositoryAudit(snapshot: OperationalSnapshot): RepositoryAuditRow[] {
  return registry.projects.map((entry) => {
    const operational = findOperationalByRepo(snapshot, entry.repo);
    if (!operational) {
      return {
        repo: entry.repo,
        product: entry.product,
        productSlug: entry.productSlug,
        classification: entry.classification,
        state: entry.state,
        githubStatus: 'Awaiting operational sync — no runtime claim is inferred.',
        vercelUrl: entry.fallbackProductionUrl,
        runtimeState: entry.state === 'archive' ? 'archived' : 'unverified',
        runtimeStatus: entry.state === 'archive'
          ? 'ARCHIVED — excluded from active product KPIs.'
          : 'UNVERIFIED — awaiting GitHub/manifest/health evidence.',
        action: entry.action,
        storageState: 'unverified',
        storageProvider: 'unverified',
        storageEvidence: 'awaiting operational sync',
        manifestState: 'unverified',
        readmeState: 'unverified',
        architectureState: 'unverified',
        ciState: 'unknown',
      };
    }

    const sha = operational.github.headSha?.slice(0, 8) || 'unknown';
    const readme = docLabel(operational.docs.readme.state, operational.docs.readme.stale);
    const architecture = docLabel(operational.docs.architecture.state, operational.docs.architecture.stale);
    const ci = operational.github.ci.state.toUpperCase();
    const manifest = operational.manifest.state.toUpperCase();

    return {
      repo: entry.repo,
      product: entry.product,
      productSlug: entry.productSlug,
      classification: entry.classification,
      state: entry.state,
      githubStatus: `${operational.github.defaultBranch || 'branch?'} HEAD ${sha} · manifest ${manifest} · README ${readme} · architecture ${architecture} · CI ${ci}`,
      vercelUrl: operational.productionUrl || entry.fallbackProductionUrl,
      runtimeState: operational.runtime.state,
      runtimeStatus: `${runtimeLabel(operational.runtime.state)} — ${operational.runtime.summary}`,
      action: entry.action,
      storageState: operational.storage.state,
      storageProvider: operational.storage.provider,
      storageEvidence: operational.storage.evidence,
      manifestState: operational.manifest.state,
      readmeState: readme,
      architectureState: architecture,
      ciState: operational.github.ci.state,
      lastChecked: operational.checkedAt,
    };
  });
}

export function buildRepositoryAuditSummary(rows: RepositoryAuditRow[], generatedAt: string | null) {
  return {
    totalRepos: rows.length,
    activePortfolio: rows.filter((r) => r.state === 'active').length,
    archivedOrMerged: rows.filter((r) => r.state === 'archive').length,
    supporting: rows.filter((r) => r.state === 'support').length,
    generatedAt,
    healthy: rows.filter((r) => r.runtimeState === 'healthy' || r.runtimeState === 'static').length,
    needsAttention: rows.filter((r) => ['partial', 'degraded', 'unhealthy', 'unverified'].includes(r.runtimeState) && r.state === 'active').length,
  };
}

export const repositoryAudit = buildRepositoryAudit(operationalSnapshot);
export const repositoryAuditSummary = buildRepositoryAuditSummary(repositoryAudit, operationalSnapshot.generatedAt);
