import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const registry = JSON.parse(await fs.readFile(path.join(ROOT, 'portfolio.registry.json'), 'utf8'));
const token = process.env.GITHUB_TOKEN || '';
const now = new Date();

const ghHeaders = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'jaber-dashboard-source-of-truth-sync',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;
  if (text) {
    try { body = JSON.parse(text); } catch { body = text.slice(0, 1000); }
  }
  return { response, body };
}

async function gh(endpoint) {
  return requestJson(`https://api.github.com${endpoint}`, { headers: ghHeaders });
}

function decodeContent(body) {
  if (!body || typeof body !== 'object' || !body.content) return null;
  return Buffer.from(String(body.content).replace(/\n/g, ''), 'base64').toString('utf8');
}

async function getRepo(repo) {
  const { response, body } = await gh(`/repos/${repo}`);
  return response.ok ? body : null;
}

async function getHead(repo, branch) {
  const { response, body } = await gh(`/repos/${repo}/commits/${encodeURIComponent(branch)}`);
  if (!response.ok || !body?.sha) return null;
  return {
    sha: body.sha,
    message: body.commit?.message?.split('\n')[0] || '',
    committedAt: body.commit?.committer?.date || body.commit?.author?.date || null,
    htmlUrl: body.html_url || null,
  };
}

async function getManifest(repo, branch) {
  const { response, body } = await gh(`/repos/${repo}/contents/.jaber-dashboard.json?ref=${encodeURIComponent(branch)}`);
  if (!response.ok) return { state: response.status === 404 ? 'missing' : 'unavailable', data: null };
  const raw = decodeContent(body);
  if (!raw) return { state: 'invalid', data: null };
  try {
    const data = JSON.parse(raw);
    return { state: 'present', data };
  } catch {
    return { state: 'invalid', data: null };
  }
}

async function getDocumentEvidence(repo, branch, filePath, headCommittedAt) {
  if (!filePath) return { state: 'not_declared', path: null, lastCommitAt: null, stale: null };
  const { response } = await gh(`/repos/${repo}/contents/${filePath.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(branch)}`);
  if (!response.ok) return { state: response.status === 404 ? 'missing' : 'unavailable', path: filePath, lastCommitAt: null, stale: null };

  const commitResult = await gh(`/repos/${repo}/commits?sha=${encodeURIComponent(branch)}&path=${encodeURIComponent(filePath)}&per_page=1`);
  const commit = commitResult.response.ok && Array.isArray(commitResult.body) ? commitResult.body[0] : null;
  const lastCommitAt = commit?.commit?.committer?.date || commit?.commit?.author?.date || null;
  let stale = null;
  if (lastCommitAt && headCommittedAt) {
    stale = (new Date(headCommittedAt).getTime() - new Date(lastCommitAt).getTime()) > 45 * 24 * 60 * 60 * 1000;
  }
  return { state: 'present', path: filePath, lastCommitAt, stale };
}

async function getLatestCi(repo, branch) {
  const { response, body } = await gh(`/repos/${repo}/actions/runs?branch=${encodeURIComponent(branch)}&per_page=1`);
  if (!response.ok || !Array.isArray(body?.workflow_runs) || body.workflow_runs.length === 0) {
    return { state: 'unknown', conclusion: null, workflow: null, updatedAt: null, url: null };
  }
  const run = body.workflow_runs[0];
  const conclusion = run.conclusion || null;
  const state = conclusion === 'success'
    ? 'passing'
    : ['failure', 'timed_out', 'cancelled', 'action_required', 'startup_failure'].includes(conclusion)
      ? 'failing'
      : run.status === 'in_progress' || run.status === 'queued'
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

const SAFE_KEYS = new Set([
  'status', 'service', 'version', 'environment', 'frontend', 'backend', 'frontend_status', 'backend_status',
  'database', 'databaseReachable', 'database_reachable', 'db_connected', 'db_enabled', 'db_backend', 'persistence',
  'object_storage', 'storage_provider', 'storage', 'durable', 'redis', 'blob', 'media_storage',
  'ai', 'ai_provider', 'openai', 'model', 'model_ready', 'provider', 'video_provider', 'providers',
  'auth', 'auth_mode', 'payments', 'e_sign', 'booking', 'whatsapp', 'real_whatsapp', 'mock_simulator',
  'checks', 'missing', 'components', 'dependencies', 'readiness', 'mode'
]);

function safeHealthBody(value, depth = 0) {
  if (depth > 4 || value == null) return value == null ? value : undefined;
  if (['string', 'number', 'boolean'].includes(typeof value)) return value;
  if (Array.isArray(value)) return value.slice(0, 30).map((v) => safeHealthBody(v, depth + 1)).filter((v) => v !== undefined);
  if (typeof value !== 'object') return undefined;
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (!SAFE_KEYS.has(key)) continue;
    const safe = safeHealthBody(child, depth + 1);
    if (safe !== undefined) out[key] = safe;
  }
  return out;
}

function walkValues(value, callback, pathParts = []) {
  if (value == null) return;
  if (Array.isArray(value)) {
    value.forEach((v, i) => walkValues(v, callback, [...pathParts, String(i)]));
    return;
  }
  if (typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) walkValues(child, callback, [...pathParts, key]);
    return;
  }
  callback(pathParts, value);
}

function findSignal(body, names) {
  let found;
  walkValues(body, (parts, value) => {
    const key = parts.at(-1);
    if (found === undefined && names.includes(key)) found = value;
  });
  return found;
}

async function getHealth(url) {
  const started = Date.now();
  try {
    const { response, body } = await requestJson(url, {
      headers: { Accept: 'application/json,text/plain;q=0.9,*/*;q=0.1', 'User-Agent': 'jaber-dashboard-health-check' },
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
    });
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
      error: error instanceof Error ? error.message.slice(0, 300) : String(error).slice(0, 300),
    };
  }
}

function normalizedHealthUrls(manifest, entry) {
  const productionUrl = manifest?.productionUrl || entry.fallbackProductionUrl || null;
  if (Array.isArray(manifest?.healthUrls) && manifest.healthUrls.length) return { productionUrl, urls: manifest.healthUrls };
  if (productionUrl && Array.isArray(manifest?.healthPaths) && manifest.healthPaths.length) {
    return {
      productionUrl,
      urls: manifest.healthPaths.map((p) => `${productionUrl.replace(/\/$/, '')}/${String(p).replace(/^\//, '')}`),
    };
  }
  return { productionUrl, urls: [] };
}

function stringHas(value, words) {
  if (typeof value !== 'string') return false;
  const lower = value.toLowerCase();
  return words.some((w) => lower.includes(w));
}

function deriveStorage(healthChecks, hints = {}) {
  for (const check of healthChecks) {
    const body = check.body;
    const state = findSignal(body, ['object_storage', 'storage', 'media_storage', 'blob']);
    const provider = findSignal(body, ['storage_provider']);
    if (state === true || stringHas(state, ['configured', 'ready', 'healthy', 'connected', 'durable'])) {
      return { state: 'configured', provider: typeof provider === 'string' ? provider : 'reported by health', evidence: check.url };
    }
    if (state === false || stringHas(state, ['not_configured', 'not configured', 'missing', 'disabled', 'none'])) {
      return { state: 'not_configured', provider: typeof provider === 'string' ? provider : 'none', evidence: check.url };
    }
  }
  const hintText = JSON.stringify(hints).toLowerCase();
  if (hintText.includes('not-integrated') || hintText.includes('not-proven') || hintText.includes('not-configured')) {
    return { state: 'unverified', provider: 'unverified', evidence: 'manifest readiness hints' };
  }
  return { state: 'unverified', provider: 'unverified', evidence: 'no safe storage signal returned by health' };
}

function deriveRuntime({ entry, manifest, healthChecks, ci }) {
  if (entry.state === 'archive') return { state: 'archived', summary: 'Archived / historical repository; excluded from active product KPIs.' };
  if (!manifest) return { state: 'unverified', summary: 'No valid .jaber-dashboard.json on the canonical branch; runtime is not inferred.' };

  const runtimePolicy = manifest?.sourcePolicy?.runtime || manifest?.healthMode || '';
  const hints = manifest?.readinessHints || {};
  const hintText = JSON.stringify(hints).toLowerCase();

  if (runtimePolicy === 'ci-build' || manifest?.healthMode === 'ci-build') {
    if (ci.state === 'passing') return { state: 'mvp', summary: 'CI/build is passing. This is an MVP/build signal, not proof of a production backend or live AI integration.' };
    if (ci.state === 'failing') return { state: 'unhealthy', summary: 'Latest CI/build is failing; fix build before any readiness claim.' };
    return { state: 'unverified', summary: 'CI/build health is unavailable; runtime readiness is not proven.' };
  }

  if (healthChecks.length === 0) {
    if (hintText.includes('static')) return { state: 'static', summary: 'Static product/site by design; no backend health contract is required, but live deployment was not health-polled.' };
    return { state: 'unverified', summary: 'No health URL is declared/resolvable; runtime readiness is unverified.' };
  }

  const anyReachable = healthChecks.some((h) => h.httpStatus !== null);
  const allHttpOk = healthChecks.every((h) => h.ok);
  if (!anyReachable) return { state: 'unhealthy', summary: 'All declared health endpoints are unreachable.' };
  if (!allHttpOk) return { state: 'degraded', summary: `At least one declared health endpoint is failing (${healthChecks.map((h) => h.httpStatus ?? 'ERR').join(', ')}).` };

  let explicitBad = false;
  let criticalDependencyBad = false;
  let optionalDependencyGap = false;
  for (const check of healthChecks) {
    walkValues(check.body, (parts, value) => {
      const key = parts.at(-1) || '';
      if (key === 'status' && stringHas(value, ['degraded', 'unhealthy', 'not_ready', 'not ready', 'error', 'failed', 'blocked'])) explicitBad = true;
      if (['db_connected', 'databaseReachable', 'database_reachable'].includes(key) && value === false) criticalDependencyBad = true;
      if (['object_storage', 'storage', 'ai', 'openai', 'model_ready'].includes(key)) {
        if (value === false || stringHas(value, ['not_configured', 'not configured', 'missing', 'fallback', 'disabled', 'unavailable', 'false'])) optionalDependencyGap = true;
      }
    });
  }

  if (explicitBad || criticalDependencyBad) return { state: 'degraded', summary: 'Health endpoint is reachable but reports degraded/not-ready critical dependencies.' };
  if (optionalDependencyGap) return { state: 'partial', summary: 'Core health responds, but one or more AI/storage dependencies are not fully configured.' };
  if (hintText.includes('demo') || hintText.includes('stateless') || hintText.includes('not-integrated') || hintText.includes('not-implemented') || hintText.includes('not-proven') || hintText.includes('not-connected')) {
    if (hintText.includes('static')) return { state: 'static', summary: 'Static deployment health is good; manifest correctly marks backend/booking capabilities that are not connected.' };
    return { state: 'partial', summary: 'Health is reachable, but manifest readiness hints explicitly mark demo/stateless/unintegrated capabilities.' };
  }
  if (hintText.includes('static')) return { state: 'static', summary: 'Static deployment health is healthy; no backend is claimed.' };
  return { state: 'healthy', summary: 'Declared health endpoints are reachable and no critical dependency failure is reported.' };
}

async function syncEntry(entry) {
  const repoMeta = await getRepo(entry.repo);
  const branch = repoMeta?.default_branch || 'main';
  const head = repoMeta ? await getHead(entry.repo, branch) : null;
  const manifestResult = repoMeta ? await getManifest(entry.repo, branch) : { state: 'unavailable', data: null };
  const manifest = manifestResult.data;
  const docs = repoMeta && manifest
    ? await Promise.all([
        getDocumentEvidence(entry.repo, branch, manifest.readmePath || 'README.md', head?.committedAt),
        getDocumentEvidence(entry.repo, branch, manifest.architecturePath || 'docs/ARCHITECTURE.md', head?.committedAt),
      ])
    : [
        { state: 'unverified', path: manifest?.readmePath || 'README.md', lastCommitAt: null, stale: null },
        { state: 'unverified', path: manifest?.architecturePath || null, lastCommitAt: null, stale: null },
      ];
  const ci = repoMeta ? await getLatestCi(entry.repo, branch) : { state: 'unknown', conclusion: null, workflow: null, updatedAt: null, url: null };
  const { productionUrl, urls } = normalizedHealthUrls(manifest, entry);
  const healthChecks = await Promise.all(urls.map(getHealth));
  const runtime = deriveRuntime({ entry, manifest, healthChecks, ci });
  const storage = deriveStorage(healthChecks, manifest?.readinessHints || {});

  return {
    repo: entry.repo,
    product: entry.product,
    productSlug: entry.productSlug || null,
    classification: entry.classification,
    state: entry.state,
    action: entry.action,
    productionUrl,
    github: {
      accessible: Boolean(repoMeta),
      archived: repoMeta?.archived ?? null,
      visibility: repoMeta?.visibility || null,
      defaultBranch: branch,
      headSha: head?.sha || null,
      headMessage: head?.message || null,
      headCommittedAt: head?.committedAt || null,
      repoUpdatedAt: repoMeta?.updated_at || null,
      repoPushedAt: repoMeta?.pushed_at || null,
      htmlUrl: repoMeta?.html_url || `https://github.com/${entry.repo}`,
      ci,
    },
    manifest: {
      state: manifestResult.state,
      schemaVersion: manifest?.schemaVersion || null,
      runtimePolicy: manifest?.sourcePolicy?.runtime || manifest?.healthMode || null,
      readinessHints: manifest?.readinessHints || {},
    },
    docs: {
      readme: docs[0],
      architecture: docs[1],
    },
    health: healthChecks,
    storage,
    runtime,
    checkedAt: now.toISOString(),
  };
}

const projects = [];
for (const entry of registry.projects) {
  process.stdout.write(`sync ${entry.repo} ... `);
  try {
    const row = await syncEntry(entry);
    projects.push(row);
    console.log(row.runtime.state);
  } catch (error) {
    console.error('failed');
    projects.push({
      ...entry,
      productSlug: entry.productSlug || null,
      productionUrl: entry.fallbackProductionUrl || null,
      github: { accessible: false, archived: null, visibility: null, defaultBranch: null, headSha: null, headMessage: null, headCommittedAt: null, repoUpdatedAt: null, repoPushedAt: null, htmlUrl: `https://github.com/${entry.repo}`, ci: { state: 'unknown', conclusion: null, workflow: null, updatedAt: null, url: null } },
      manifest: { state: 'unavailable', schemaVersion: null, runtimePolicy: null, readinessHints: {} },
      docs: { readme: { state: 'unverified', path: 'README.md', lastCommitAt: null, stale: null }, architecture: { state: 'unverified', path: null, lastCommitAt: null, stale: null } },
      health: [],
      storage: { state: 'unverified', provider: 'unverified', evidence: 'sync error' },
      runtime: { state: 'unverified', summary: `Sync failed safely: ${error instanceof Error ? error.message.slice(0, 180) : String(error).slice(0, 180)}` },
      checkedAt: now.toISOString(),
    });
  }
}

const snapshot = {
  schemaVersion: 1,
  generatedAt: now.toISOString(),
  generator: 'scripts/sync-portfolio.mjs',
  sourcePolicy: {
    code: 'GitHub canonical branch',
    runtime: 'declared live health or CI-only contract',
    docs: 'manifest-declared README/architecture paths',
    commercial: 'not generated here; remains manual/researched in projects.ts',
  },
  projects,
};

const target = path.join(ROOT, 'src/data/portfolio.generated.json');
await fs.mkdir(path.dirname(target), { recursive: true });
await fs.writeFile(target, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
console.log(`wrote ${path.relative(ROOT, target)} with ${projects.length} repositories`);
