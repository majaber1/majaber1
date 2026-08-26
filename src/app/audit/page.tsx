'use client';

import Link from 'next/link';
import { repositoryAudit, repositoryAuditSummary, type RepoPortfolioState } from '@/data/repository-audit';
import { useLocale } from '@/lib/locale-context';

const stateStyle: Record<RepoPortfolioState, string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  archive: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  support: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
};

const storageStyle = {
  configured: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  not_configured: 'border-red-500/30 bg-red-500/10 text-red-400',
  unverified: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
};

const runtimeStyle: Record<string, string> = {
  healthy: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  static: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  mvp: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  partial: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  degraded: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  unhealthy: 'border-red-500/30 bg-red-500/10 text-red-400',
  unverified: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  archived: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
};

const canonicalSlugOverrides: Record<string, string> = {
  'multazim-ai': 'multazim',
  'minibites-ai': 'kiswani-ai-studio',
  'playmotion-events': 'playmotion',
};

const resolveProjectSlug = (slug?: string) => slug ? (canonicalSlugOverrides[slug] ?? slug) : undefined;

function displayTimestamp(value: string | null) {
  if (!value) return 'Awaiting first sync';
  try { return new Date(value).toLocaleString(); } catch { return value; }
}

export default function AuditPage() {
  const { locale } = useLocale();
  const ar = locale === 'ar';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      <section className="rounded-xl border border-[var(--color-accent)]/30 bg-gradient-to-r from-[var(--color-accent)]/8 to-transparent p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[var(--color-accent-light)]">
              {ar ? 'تدقيق حي للمحفظة والمستودعات' : 'LIVE PORTFOLIO & REPOSITORY AUDIT'}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">
              {ar ? 'GitHub + README + Architecture + Health + CI' : 'GitHub + README + Architecture + Health + CI'}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-[var(--color-text-secondary)]">
              {ar
                ? 'الحالة التشغيلية هنا مولدة آليًا من المستودع الحقيقي وملف .jaber-dashboard.json ونقاط الـHealth المعلنة. لا يتم اعتبار التطبيق جاهزًا لمجرد أن الصفحة تفتح.'
                : 'Operational status is generated from the canonical repository, .jaber-dashboard.json, declared live health endpoints and CI. A page loading is never treated as proof that the product is ready.'}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] px-4 py-3 text-sm min-w-[230px]">
            <div className="text-[10px] uppercase tracking-wide text-[var(--color-text-tertiary)]">{ar ? 'آخر مزامنة تشغيلية' : 'Last operational sync'}</div>
            <div className="mt-1 font-semibold text-[var(--color-text-primary)]">{displayTimestamp(repositoryAuditSummary.generatedAt)}</div>
            <div className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">{ar ? 'دوريًا كل 6 ساعات + تشغيل يدوي' : 'Every 6 hours + manual run'}</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Metric label={ar ? 'كل المستودعات' : 'All repositories'} value={repositoryAuditSummary.totalRepos} />
        <Metric label={ar ? 'المحفظة النشطة' : 'Active portfolio'} value={repositoryAuditSummary.activePortfolio} />
        <Metric label={ar ? 'سليم / Static' : 'Healthy / Static'} value={repositoryAuditSummary.healthy} />
        <Metric label={ar ? 'تحتاج انتباه' : 'Needs attention'} value={repositoryAuditSummary.needsAttention} />
        <Metric label={ar ? 'مؤرشف / مدمج' : 'Archived / merged'} value={repositoryAuditSummary.archivedOrMerged} />
        <Metric label={ar ? 'مساند فقط' : 'Supporting only'} value={repositoryAuditSummary.supporting} />
      </section>

      <section className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] overflow-hidden">
        <div className="border-b border-[var(--color-border-primary)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {ar ? `سجل المستودعات — ${repositoryAuditSummary.totalRepos}` : `Repository registry — ${repositoryAuditSummary.totalRepos}`}
          </h2>
          <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
            {ar ? 'README وArchitecture وCI والـHealth كلها من المصدر المولد، وليست نصوصًا ثابتة.' : 'README, architecture, CI and runtime health are generated source-of-truth fields, not hardcoded audit text.'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1580px] w-full text-left rtl:text-right">
            <thead className="bg-[var(--color-bg-tertiary)] text-[10px] uppercase tracking-wide text-[var(--color-text-tertiary)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Repo</th>
                <th className="px-4 py-3 font-semibold">{ar ? 'المنتج الحقيقي' : 'Canonical product'}</th>
                <th className="px-4 py-3 font-semibold">{ar ? 'التصنيف' : 'Classification'}</th>
                <th className="px-4 py-3 font-semibold">GitHub / Docs / CI</th>
                <th className="px-4 py-3 font-semibold">{ar ? 'التخزين' : 'Storage'}</th>
                <th className="px-4 py-3 font-semibold">{ar ? 'الحالة الحية' : 'Runtime'}</th>
                <th className="px-4 py-3 font-semibold">{ar ? 'الإجراء التالي' : 'Next action'}</th>
                <th className="px-4 py-3 font-semibold">{ar ? 'روابط' : 'Links'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-primary)]/70">
              {repositoryAudit.map((row) => {
                const projectSlug = resolveProjectSlug(row.productSlug);
                return (
                  <tr key={row.repo} className="align-top hover:bg-[var(--color-bg-tertiary)]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-[var(--color-text-primary)]">{row.repo}</div>
                      {row.lastChecked && <div className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">checked {displayTimestamp(row.lastChecked)}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {projectSlug ? (
                        <Link href={`/projects/${projectSlug}`} className="text-sm font-semibold text-[var(--color-accent-light)] hover:underline">
                          {row.product}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-[var(--color-text-primary)]">{row.product}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold ${stateStyle[row.state]}`}>
                        {row.classification}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs leading-5 text-[var(--color-text-secondary)] max-w-[330px]">
                      <div>{row.githubStatus}</div>
                      <div className="mt-1 flex flex-wrap gap-1 text-[9px] uppercase tracking-wide text-[var(--color-text-tertiary)]">
                        <span>manifest {row.manifestState}</span><span>·</span><span>README {row.readmeState}</span><span>·</span><span>ARCH {row.architectureState}</span><span>·</span><span>CI {row.ciState}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs leading-5 max-w-[220px]">
                      <div title={row.storageEvidence}>
                        <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold ${storageStyle[row.storageState]}`}>
                          {row.storageState === 'configured'
                            ? (ar ? 'مفعّل' : 'CONFIGURED')
                            : row.storageState === 'not_configured'
                              ? (ar ? 'غير مربوط' : 'NOT CONFIGURED')
                              : (ar ? 'غير متحقق' : 'UNVERIFIED')}
                        </span>
                        <div className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">{row.storageProvider}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs leading-5 text-[var(--color-text-secondary)] max-w-[320px]">
                      <span className={`mb-2 inline-flex rounded-md border px-2 py-1 text-[10px] font-bold ${runtimeStyle[row.runtimeState] || runtimeStyle.unverified}`}>
                        {row.runtimeState.toUpperCase()}
                      </span>
                      <div>{row.runtimeStatus}</div>
                    </td>
                    <td className="px-4 py-3 text-xs leading-5 text-[var(--color-text-primary)] max-w-[300px]">{row.action}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1.5 text-xs">
                        <a href={`https://github.com/${row.repo}`} target="_blank" rel="noreferrer" className="text-[var(--color-accent-light)] hover:underline">GitHub ↗</a>
                        {row.vercelUrl && (
                          <a href={row.vercelUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">{ar ? 'فتح التطبيق ↗' : 'Live App ↗'}</a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-5">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{ar ? 'قاعدة المصدر الحقيقي' : 'Source-of-truth rule'}</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {ar
            ? 'حالة المنتج التقنية لا تؤخذ من scores التجارية أو من نص قديم داخل Dashboard. GitHub main والـmanifest والوثائق وCI والـHealth هي المصدر التشغيلي. معلومات السوق والتسعير تبقى منفصلة لأنها تحتاج بحثًا أو تحققًا تجاريًا.'
            : 'Technical readiness never comes from commercial scores or stale dashboard prose. GitHub main, the manifest, documentation, CI and live health are the operational source. Market and pricing information remain separate because they require research or customer validation.'}
        </p>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
      <div className="text-2xl font-bold tabular-nums text-[var(--color-text-primary)]">{value}</div>
      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{label}</div>
    </div>
  );
}
