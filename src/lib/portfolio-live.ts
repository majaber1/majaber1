import 'server-only';

import registryJson from '../../portfolio.registry.json';
import type { OperationalProject, OperationalSnapshot, RuntimeState, StorageState } from '@/data/operational';

const SIX_HOURS_SECONDS = 6 * 60 * 60;

interface RegistryEntry {
  repo: string;
  product: string;
  productSlug?: string;
  classification: string;
  state: 'active' | 'archive' | 'support';
  fallbackProductionUrl?: string;
  action: string;
}

interface Manifest {
  schemaVersion?: number;
  slug?: string;
  product?: string;
  canonicalRepo?: string;
  branch?: string;
  productionUrl?: string | null;
  healthUrls?: string[];
  healthPaths?: string[];
  healthMode?: string;
  readmePath?: string;
  architecturePath?: string;
  sourcePolicy?: { runtime?: string };
  readinessHints?: Record<string, unknown>;
}

const registry = registryJson as unknown as { schemaVersion: number; owner: string; projects: RegistryEntry[] };

function githubHeaders() {
  const token = process.env.GITHUB_READ_TOKEN;
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'jaber-dashboard-live-sync',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 8000) {
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
    next: { revalidate: SIX_HOURS_SECONDS },
  });
}

async function fetchGithubJson(endpoint: string) {
  const response = await fetchWithTimeout(`https://api.github.com${endpoint}`, { headers: githubHeaders() });
  if (!response.ok) return null;
  return response.json();
}

async function fetchRawJson(repo: string, branch: string, filePath: string): Promise<{ state: string; data: Manifest | null }> {
  try {
    const response = await fetchWithTimeout(
      `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(branch)}/${filePath}`,
      { headers: { Accept: 'application/json', 'User-Agent': 'jaber-dashboard-live-sync' } },
    );
    if (!response.ok) return { state: response.status === 404 ? 'missing' : 'unavailable', data: null };
    const data = await response.json();
    return { state: 'present', data };
  } catch {
    return { state: 'unavailable', data: null };
  }
}

async function rawFileState(repo: string, branch: string, filePath: string | undefined) {
  if (!filePath) return { state: 'not_declared', path: null, lastCommitAt: null, stale: null };
  try {
    const response = await fetchWithTimeout(
      `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(branch)}/${filePath}`,
      { headers: { Range: 'bytes=0-0', 'User-Agent': 'jaber-dashboard-live-sync' } },
    );
    return {
      state: response.ok ? 'present' : response.status === 404 ? 'missing' : 'unavailable',
      path: filePath,
      lastCommitAt: null,
      stale: null,
    };
  } catch {
    return { state: 'unavailable', path: filePath, lastCommitAt: null, stale: null };
  }
}

async function latestCi(repo: string, branch: string) {
  const body = await fetchGithubJson(`/repos/${repo}/actions/runs?branch=${encodeURIComponent(branch)}&per_page=1`);
  const run = Array.isArray(body?.workflow_runs) ? body.workflow_runs[0] : null;
  if (!run) return { state: 'unknown', conclusion: null, workflow: null, updatedAt: null, url: null };
  const conclusion = run.conclusion || null;
  const state = conclusion === 'success'
    ? 'passing'
    : ['failure', 'timed_out', 'cancelled', 'action_required', 'startup_failure'].includes(conclusion)
      ? 'failing'
      : run.status === 'queued' || run.status === 'in_progress'
        ? 'running'
        : 'unknown';
  return {
    state,
    conclusion,
    workflow: run.name || null,
    updatedAt: run.updated_at || null,
    url: run.html_url || null,
  };
}

const SAFE_HEALTH_KEYS = new Set([
  'status', 'service', 'version', 'environment', 'frontend', 'backend',
  'database', 'databaseReachable', 'database_reachable', 'db_connected', 'db_enabled', 'db_backend', 'persistence',
  'object_storage', 'storage_provider', 'storage', 'durable', 'redis', 'blob', 'media_storage',
  'ai', 'ai_provider', 'openai', 'model', 'model_ready', 'provider', 'video_provider', 'providers',
  'auth', 'auth_mode', 'payments', 'e_sign', 'booking', 'whatsapp', 'real_whatsapp', 'mock_simulator',
  'checks', 'missing', 'components', 'dependencies', 'readiness', 'mode', 'sync', 'operationalSync',
]);

function safeHealthBody(value: unknown, depth = 0): unknown {
  if (depth > 4 || value == null) return value == null ? value : undefined;
  if (['string', 'number', 'boolean'].includes(typeof value)) return value;
  if (Array.isArray(value)) return value.slice(0, 30).map((v) => safeHealthBody(v, depth + 1)).filter((v) => v !== undefined);
  if (typeof value !== 'object') return undefined;
  const output: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (!SAFE_HEALTH_KEYS.has(key)) continue;
    const safe = safeHealthBody(child, depth + 1);
    if (safe !== undefined) output[key] = safe;
  }
  return output;
}

function walk(value: unknown, callback: (key: string, value: unknown) => void) {
  if (value == null) return;
  if (Array.isArray(value)) {
    value.forEach((child) => walk(child, callback));
    return;
  }
  if (typeof value === 'object') {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (child != null && typeof child === 'object') walk(child, callback);
      else callback(key, child);
    }
  }
}

function includesWord(value: unknown, words: string[]) {
  if (typeof value !== 'string') return false;
  const lower = value.toLowerCase();
  return words.some((word) => lower.includes(word));
}

async function checkHealth(url: string) {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json,text/plain;q=0.9,*/*;q=0.1', 'User-Agent': 'jaber-dashboard-health-check' },
      signal: AbortSignal.timeout(7000),
      redirect: 'follow',
      cache: 'no-store',
    });
    const text = await response.text();
    let body: unknown = null;
    if (text) {
      try { body = JSON.parse(text); } catch { body = text.slice(0, 500); }
    }
    return {
      url,
      ok: response.ok,
      httpStatus: response.status,
      latencyMs: Date.now() - started,
      body: safeHealthBody(body),
      error: null,
    };
  } catch (error) {
    return {
      url,
      ok: false,
      httpStatus: null,
      latencyMs: Date.now() - started,
      body: null,
      error: error instanceof Error ? error.message.slice(0, 250) : String(error).slice(0, 250),
    };
  }
}

function normalizedHealth(manifest: Manifest | null, entry: RegistryEntry) {
  const productionUrl = manifest?.productionUrl || entry.fallbackProductionUrl || null;
  if (Array.isArray(manifest?.healthUrls) && manifest.healthUrls.length > 0) return { productionUrl, urls: manifest.healthUrls };
  if (productionUrl && Array.isArray(manifest?.healthPaths) && manifest.healthPaths.length > 0) {
    return {
      productionUrl,
      urls: manifest.healthPaths.map((healthPath) => `${productionUrl.replace(/\/$/, '')}/${healthPath.replace(/^\//, '')}`),
    };
  }
  return { productionUrl, urls: [] as string[] };
}

function deriveStorage(health: OperationalProject['health']): OperationalProject['storage'] {
  let state: StorageState = 'unverified';
  let provider = 'unverified';
  let evidence = 'No safe storage signal returned by declared health.';

  for (const check of health) {
    walk(check.body, (key, value) => {
      if (key === 'storage_provider' && typeof value === 'string') provider = value;
      if (['object_storage', 'storage', 'media_storage', 'blob'].includes(key)) {
        if (value === true || includesWord(value, ['configured', 'ready', 'healthy', 'connected', 'durable'])) {
          state = 'configured';
          evidence = check.url;
        } else if (value === false || includesWord(value, ['not_configured', 'not configured', 'missing', 'disabled', 'none'])) {
          state = 'not_configured';
          evidence = check.url;
        }
      }
    });
  }

  return { state, provider, evidence };
}

function deriveRuntime(entry: RegistryEntry, manifest: Manifest | null, health: OperationalProject['health'], ci: OperationalProject['github']['ci']) {
  if (entry.state === 'archive') return { state: 'archived' as RuntimeState, summary: 'Archived / historical repository; excluded from active product KPIs.' };
  if (!manifest) return { state: 'unverified' as RuntimeState, summary: 'No valid .jaber-dashboard.json on the canonical branch; runtime is not inferred.' };

  const policy = manifest.sourcePolicy?.runtime || manifest.healthMode || '';
  const hints = manifest.readinessHints || {};
  const hintText = JSON.stringify(hints).toLowerCase();

  if (policy === 'ci-build' || manifest.healthMode === 'ci-build') {
    if (ci.state === 'passing') return { state: 'mvp' as RuntimeState, summary: 'CI/build is passing. This proves build health only; backend/AI production readiness is not claimed.' };
    if (ci.state === 'failing') return { state: 'unhealthy' as RuntimeState, summary: 'Latest CI/build is failing.' };
    return { state: 'unverified' as RuntimeState, summary: 'CI/build status is unavailable; runtime readiness is not proven.' };
  }

  if (health.length === 0) {
    if (hintText.includes('static')) return { state: 'static' as RuntimeState, summary: 'Static site by design, but no live health URL was resolvable in this check.' };
    return { state: 'unverified' as RuntimeState, summary: 'No declared/resolvable health URL; runtime readiness is unverified.' };
  }

  if (health.every((check) => check.httpStatus === null)) return { state: 'unhealthy' as RuntimeState, summary: 'All declared health endpoints are unreachable.' };
  if (health.some((check) => !check.ok)) return { state: 'degraded' as RuntimeState, summary: `At least one declared health endpoint is failing (${health.map((check) => check.httpStatus ?? 'ERR').join(', ')}).` };

  let explicitBad = false;
  let criticalBad = false;
  let optionalGap = false;
  for (const check of health) {
    walk(check.body, (key, value) => {
      if (key === 'status' && includesWord(value, ['degraded', 'unhealthy', 'not_ready', 'not ready', 'error', 'failed', 'blocked'])) explicitBad = true;
      if (['db_connected', 'databaseReachable', 'database_reachable'].includes(key) && value === false) criticalBad = true;
      if (['object_storage', 'storage', 'ai', 'openai', 'model_ready'].includes(key)) {
        if (value === false || includesWord(value, ['not_configured', 'not configured', 'missing', 'fallback', 'disabled', 'unavailable'])) optionalGap = true;
      }
    });
  }

  if (explicitBad || criticalBad) return { state: 'degraded' as RuntimeState, summary: 'Health responds but reports a critical not-ready/degraded dependency.' };
  if (optionalGap) return { state: 'partial' as RuntimeState, summary: 'Core runtime responds, but one or more AI/storage dependencies are not fully configured.' };
  if (hintText.includes('demo') || hintText.includes('stateless') || hintText.includes('not-integrated') || hintText.includes('not-implemented') || hintText.includes('not-proven') || hintText.includes('not-connected')) {
    if (hintText.includes('static')) return { state: 'static' as RuntimeState, summary: 'Static deployment health is good; manifest correctly marks capabilities that are not connected.' };
    return { state: 'partial' as RuntimeState, summary: 'Live health responds, while manifest readiness hints explicitly mark demo/stateless/unintegrated capabilities.' };
  }
  if (hintText.includes('static')) return { state: 'static' as RuntimeState, summary: 'Static deployment health is healthy and no backend is claimed.' };
  return { state: 'healthy' as RuntimeState, summary: 'Declared health endpoints are reachable and no critical dependency failure is reported.' };
}

function archivedRow(entry: RegistryEntry, checkedAt: string): OperationalProject {
  return {
    repo: entry.repo,
    product: entry.product,
    productSlug: entry.productSlug || null,
    classification: entry.classification,
    state: entry.state,
    action: entry.action,
    productionUrl: entry.fallbackProductionUrl || null,
    github: {
      accessible: true,
      archived: true,
      visibility: null,
      defaultBranch: null,
      headSha: null,
      headMessage: null,
      headCommittedAt: null,
      repoUpdatedAt: null,
      repoPushedAt: null,
      htmlUrl: `https://github.com/${entry.repo}`,
      ci: { state: 'unknown', conclusion: null, workflow: null, updatedAt: null, url: null },
    },
    manifest: { state: 'not_required', schemaVersion: null, runtimePolicy: null, readinessHints: {} },
    docs: {
      readme: { state: 'unverified', path: 'README.md', lastCommitAt: null, stale: null },
      architecture: { state: 'unverified', path: null, lastCommitAt: null, stale: null },
    },
    health: [],
    storage: { state: 'unverified', provider: 'unverified', evidence: 'archived repository' },
    runtime: { state: 'archived', summary: 'Archived / historical repository; excluded from active product KPIs.' },
    checkedAt,
  };
}

async function activeRow(entry: RegistryEntry, checkedAt: string): Promise<OperationalProject> {
  const repoMeta = await fetchGithubJson(`/repos/${entry.repo}`);
  if (!repoMeta) {
    return {
      ...archivedRow({ ...entry, state: 'active' }, checkedAt),
      state: 'active',
      github: {
        ...archivedRow({ ...entry, state: 'active' }, checkedAt).github,
        accessible: false,
        archived: null,
      },
      runtime: { state: 'unverified', summary: 'Canonical repository metadata is unavailable from the live sync.' },
    };
  }

  const branch = repoMeta.default_branch || 'main';
  const head = await fetchGithubJson(`/repos/${entry.repo}/commits/${encodeURIComponent(branch)}`);
  const manifestResult = await fetchRawJson(entry.repo, branch, '.jaber-dashboard.json');
  const manifest = manifestResult.data;
  const runtimePolicy = manifest?.sourcePolicy?.runtime || manifest?.healthMode || null;
  const ci = runtimePolicy === 'ci-build'
    ? await latestCi(entry.repo, branch)
    : { state: 'unknown', conclusion: null, workflow: null, updatedAt: null, url: null };
  const { productionUrl, urls } = normalizedHealth(manifest, entry);
  const [readme, architecture, health] = await Promise.all([
    rawFileState(entry.repo, branch, manifest?.readmePath || 'README.md'),
    rawFileState(entry.repo, branch, manifest?.architecturePath),
    Promise.all(urls.map((url) => checkHealth(url))),
  ]);
  const runtime = deriveRuntime(entry, manifest, health, ci);
  const storage = deriveStorage(health);

  return {
    repo: entry.repo,
    product: entry.product,
    productSlug: entry.productSlug || null,
    classification: entry.classification,
    state: entry.state,
    action: entry.action,
    productionUrl,
    github: {
      accessible: true,
      archived: Boolean(repoMeta.archived),
      visibility: repoMeta.visibility || null,
      defaultBranch: branch,
      headSha: head?.sha || null,
      headMessage: head?.commit?.message?.split('\n')[0] || null,
      headCommittedAt: head?.commit?.committer?.date || head?.commit?.author?.date || null,
      repoUpdatedAt: repoMeta.updated_at || null,
      repoPushedAt: repoMeta.pushed_at || null,
      htmlUrl: repoMeta.html_url || `https://github.com/${entry.repo}`,
      ci,
    },
    manifest: {
      state: manifestResult.state,
      schemaVersion: manifest?.schemaVersion || null,
      runtimePolicy,
      readinessHints: manifest?.readinessHints || {},
    },
    docs: { readme, architecture },
    health,
    storage,
    runtime,
    checkedAt,
  };
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

export async function generateLiveOperationalSnapshot(): Promise<OperationalSnapshot> {
  const checkedAt = new Date().toISOString();
  const projects = await mapLimit(registry.projects, 4, async (entry) => {
    try {
      return entry.state === 'archive' ? archivedRow(entry, checkedAt) : await activeRow(entry, checkedAt);
    } catch (error) {
      const fallback = archivedRow({ ...entry, state: 'active' }, checkedAt);
      return {
        ...fallback,
        state: entry.state,
        runtime: {
          state: entry.state === 'archive' ? 'archived' : 'unverified',
          summary: entry.state === 'archive'
            ? 'Archived / historical repository; excluded from active product KPIs.'
            : `Live sync failed safely: ${error instanceof Error ? error.message.slice(0, 180) : String(error).slice(0, 180)}`,
        },
      } as OperationalProject;
    }
  });

  return {
    schemaVersion: 1,
    generatedAt: checkedAt,
    generator: 'src/lib/portfolio-live.ts (6h server cache)',
    sourcePolicy: {
      code: 'GitHub canonical branch',
      runtime: 'manifest-declared live health or CI-only contract',
      docs: 'manifest-declared README/architecture presence',
      commercial: 'separate manual/researched data in projects.ts',
    },
    projects,
  };
}

export { SIX_HOURS_SECONDS };
