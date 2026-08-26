import snapshotJson from './portfolio.generated.json';

export type RuntimeState = 'healthy' | 'partial' | 'degraded' | 'unhealthy' | 'static' | 'mvp' | 'unverified' | 'archived';
export type StorageState = 'configured' | 'not_configured' | 'unverified';

export interface OperationalProject {
  repo: string;
  product: string;
  productSlug: string | null;
  classification: string;
  state: 'active' | 'archive' | 'support';
  action: string;
  productionUrl: string | null;
  github: {
    accessible: boolean;
    archived: boolean | null;
    visibility: string | null;
    defaultBranch: string | null;
    headSha: string | null;
    headMessage: string | null;
    headCommittedAt: string | null;
    repoUpdatedAt: string | null;
    repoPushedAt: string | null;
    htmlUrl: string;
    ci: { state: string; conclusion: string | null; workflow: string | null; updatedAt: string | null; url: string | null };
  };
  manifest: {
    state: string;
    schemaVersion: number | null;
    runtimePolicy: string | null;
    readinessHints: Record<string, unknown>;
  };
  docs: {
    readme: { state: string; path: string | null; lastCommitAt: string | null; stale: boolean | null };
    architecture: { state: string; path: string | null; lastCommitAt: string | null; stale: boolean | null };
  };
  health: Array<{ url: string; ok: boolean; httpStatus: number | null; latencyMs: number; body: unknown; error: string | null }>;
  storage: { state: StorageState; provider: string; evidence: string };
  runtime: { state: RuntimeState; summary: string };
  checkedAt: string;
}

export interface OperationalSnapshot {
  schemaVersion: number;
  generatedAt: string | null;
  generator: string;
  sourcePolicy: Record<string, string>;
  projects: OperationalProject[];
}

export const operationalSnapshot = snapshotJson as unknown as OperationalSnapshot;

const slugAliases: Record<string, string> = {
  multazim: 'multazim-ai',
  'kiswani-ai-studio': 'minibites-ai',
  playmotion: 'playmotion-events',
};

export function canonicalOperationalSlug(slug: string) {
  return slugAliases[slug] ?? slug;
}

export function findOperationalProject(snapshot: OperationalSnapshot, slug: string): OperationalProject | undefined {
  const canonical = canonicalOperationalSlug(slug);
  return snapshot.projects.find((p) => p.productSlug === canonical);
}

export function findOperationalByRepo(snapshot: OperationalSnapshot, repo: string): OperationalProject | undefined {
  return snapshot.projects.find((p) => p.repo === repo);
}

export function getOperationalProject(slug: string): OperationalProject | undefined {
  return findOperationalProject(operationalSnapshot, slug);
}

export function getOperationalByRepo(repo: string): OperationalProject | undefined {
  return findOperationalByRepo(operationalSnapshot, repo);
}

export function runtimeLabel(state: RuntimeState): string {
  return {
    healthy: 'HEALTHY',
    partial: 'PARTIAL',
    degraded: 'DEGRADED',
    unhealthy: 'UNHEALTHY',
    static: 'STATIC',
    mvp: 'MVP / CI',
    unverified: 'UNVERIFIED',
    archived: 'ARCHIVED',
  }[state];
}
