'use client';

import Link from 'next/link';
import { AUDIT_DATE } from '@/data/projects';
import { repositoryAudit, repositoryAuditSummary, type RepoPortfolioState } from '@/data/repository-audit';
import { useLocale } from '@/lib/locale-context';

const stateStyle: Record<RepoPortfolioState, string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  archive: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  support: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
};

export default function AuditPage() {
  const { locale } = useLocale();
  const ar = locale === 'ar';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      <section className="rounded-xl border border-[var(--color-accent)]/30 bg-gradient-to-r from-[var(--color-accent)]/8 to-transparent p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[var(--color-accent-light)]">
              {ar ? 'تدقيق المحفظة والمستودعات' : 'PORTFOLIO & REPOSITORY AUDIT'}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">
              {ar ? 'خريطة المنتجات الحقيقية وتنظيف النسخ القديمة' : 'Canonical products, live deployments and repo cleanup'}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-[var(--color-text-secondary)]">
              {ar
                ? 'هذه الشاشة لا تعتبر كل مستودع منتجًا مستقلًا. تربط النسخ القديمة والمكونات بالمنتج الحقيقي، وتفصل بين حالة الكود وحالة Vercel والحالة التشغيلية الفعلية.'
                : 'This view does not treat every repository as a separate product. It maps legacy copies and components to the canonical product and separates code status, Vercel status and actual runtime readiness.'}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] px-4 py-3 text-sm">
            <div className="text-[10px] uppercase tracking-wide text-[var(--color-text-tertiary)]">{ar ? 'تاريخ التدقيق' : 'Audit date'}</div>
            <div className="mt-1 font-semibold text-[var(--color-text-primary)]">{AUDIT_DATE}</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label={ar ? 'كل المستودعات' : 'All repositories'} value={repositoryAuditSummary.totalRepos} />
        <Metric label={ar ? 'المحفظة النشطة' : 'Active portfolio'} value={repositoryAuditSummary.activePortfolio} />
        <Metric label={ar ? 'مؤرشف / مدمج' : 'Archived / merged'} value={repositoryAuditSummary.archivedOrMerged} />
        <Metric label={ar ? 'مساند فقط' : 'Supporting only'} value={repositoryAuditSummary.supporting} />
      </section>

      <section className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] overflow-hidden">
        <div className="border-b border-[var(--color-border-primary)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {ar ? 'سجل المستودعات — 23 مستودعًا' : 'Repository registry — 23 repositories'}
          </h2>
          <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
            {ar ? 'اضغط اسم المنتج لفتح تفاصيله داخل Jaber Dashboard، أو افتح GitHub / Vercel مباشرة.' : 'Open the product inside Jaber Dashboard, or jump directly to GitHub / Vercel.'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full text-left rtl:text-right">
            <thead className="bg-[var(--color-bg-tertiary)] text-[10px] uppercase tracking-wide text-[var(--color-text-tertiary)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Repo</th>
                <th className="px-4 py-3 font-semibold">{ar ? 'المنتج الحقيقي' : 'Canonical product'}</th>
                <th className="px-4 py-3 font-semibold">{ar ? 'التصنيف' : 'Classification'}</th>
                <th className="px-4 py-3 font-semibold">GitHub</th>
                <th className="px-4 py-3 font-semibold">{ar ? 'الحالة الحية' : 'Runtime status'}</th>
                <th className="px-4 py-3 font-semibold">{ar ? 'الإجراء التالي' : 'Next action'}</th>
                <th className="px-4 py-3 font-semibold">{ar ? 'روابط' : 'Links'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-primary)]/70">
              {repositoryAudit.map((row) => (
                <tr key={row.repo} className="align-top hover:bg-[var(--color-bg-tertiary)]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-[var(--color-text-primary)]">{row.repo}</div>
                  </td>
                  <td className="px-4 py-3">
                    {row.productSlug ? (
                      <Link href={`/projects/${row.productSlug}`} className="text-sm font-semibold text-[var(--color-accent-light)] hover:underline">
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
                  <td className="px-4 py-3 text-xs leading-5 text-[var(--color-text-secondary)] max-w-[240px]">{row.githubStatus}</td>
                  <td className="px-4 py-3 text-xs leading-5 text-[var(--color-text-secondary)] max-w-[290px]">{row.runtimeStatus}</td>
                  <td className="px-4 py-3 text-xs leading-5 text-[var(--color-text-primary)] max-w-[300px]">{row.action}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5 text-xs">
                      <a href={`https://github.com/${row.repo}`} target="_blank" rel="noreferrer" className="text-[var(--color-accent-light)] hover:underline">GitHub ↗</a>
                      {row.vercelUrl && (
                        <a href={row.vercelUrl} target="_blank" rel="noreferrer" className="text-[var(--color-accent-light)] hover:underline">Vercel ↗</a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-5">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{ar ? 'قاعدة العرض الجديدة' : 'New portfolio rule'}</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {ar
            ? 'الـ KPI الرئيسي للمحفظة يعتمد المنتجات الحقيقية فقط. المستودعات المؤرشفة، الـ placeholders، والمكونات المدمجة تبقى ظاهرة هنا للتاريخ والتتبع لكنها لا تُحسب كتطبيقات مستقلة.'
            : 'Portfolio KPIs count canonical products only. Archived repos, placeholders and merged components remain visible here for history and traceability, but they are not counted as independent applications.'}
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
