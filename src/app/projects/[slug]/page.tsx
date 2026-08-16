'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/locale-context';
import { projects } from '@/data/projects';
import { getPriorityRecommendation, getPriorityReason, getTopActions } from '@/lib/priority';
import { countByStatus, getScoreColor, getStatusColor, getTaskStatusColor, getArtifactStatusColor, getProvenanceClass, formatCurrency, cn } from '@/lib/utils';
import ScoreRing from '@/components/ScoreRing';
import LifecycleTracker from '@/components/LifecycleTracker';
import ProvenanceBadge from '@/components/ProvenanceBadge';
import type { Project, Artifact } from '@/types/project';

const TABS = ['overview', 'execution', 'technical', 'artifacts', 'market', 'commercial', 'financial', 'roadmap', 'deployment'] as const;
type Tab = typeof TABS[number];

const TAB_LABELS: Record<Tab, { en: string; ar: string }> = {
  overview: { en: 'Overview', ar: 'نظرة عامة' },
  execution: { en: 'Execution', ar: 'التنفيذ' },
  technical: { en: 'Technical', ar: 'التقنية' },
  artifacts: { en: 'Artifacts', ar: 'المخرجات' },
  market: { en: 'Market', ar: 'السوق' },
  commercial: { en: 'Commercial', ar: 'التجاري' },
  financial: { en: 'Financial', ar: 'المالي' },
  roadmap: { en: 'Roadmap', ar: 'خارطة الطريق' },
  deployment: { en: 'Deployment', ar: 'النشر' },
};

function InfoRow({ label, value, provenance }: { label: string; value: string; provenance?: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-[var(--color-border-primary)]/50 last:border-0">
      <span className="text-xs text-[var(--color-text-tertiary)] shrink-0">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--color-text-primary)] text-right">{value}</span>
        {provenance && <ProvenanceBadge provenance={provenance as any} />}
      </div>
    </div>
  );
}

function OverviewTab({ project: p }: { project: Project }) {
  const { locale } = useLocale();
  const rec = getPriorityRecommendation(p);
  const reason = getPriorityReason(p);
  const actions = getTopActions(p);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-5">
        <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
          <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
            {locale === 'ar' ? 'ملخص' : 'Summary'}
          </h4>
          <InfoRow label={locale === 'ar' ? 'الغرض' : 'Purpose'} value={p.purpose} />
          <InfoRow label={locale === 'ar' ? 'المشكلة' : 'Problem'} value={p.problem} />
          <InfoRow label={locale === 'ar' ? 'الحل' : 'Solution'} value={p.solution} />
          <InfoRow label={locale === 'ar' ? 'المستخدمون' : 'Target Users'} value={p.targetUsers} />
          <InfoRow label={locale === 'ar' ? 'المشتري' : 'Buyer'} value={p.buyer} />
          <InfoRow label={locale === 'ar' ? 'الجغرافيا' : 'Geography'} value={p.geography} />
        </div>

        <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
          <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
            {locale === 'ar' ? 'الحالة' : 'Status'}
          </h4>
          <InfoRow label={locale === 'ar' ? 'المرحلة' : 'Stage'} value={p.stage} />
          <InfoRow label={locale === 'ar' ? 'الحالة' : 'Status'} value={p.status} />
          <InfoRow label={locale === 'ar' ? 'الإجراء التالي' : 'Next Action'} value={p.nextAction} />
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-lg border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 p-4">
          <h4 className="text-xs font-semibold text-[var(--color-accent-light)] uppercase tracking-wide mb-3">
            {locale === 'ar' ? 'الأولوية والتوصية' : 'Priority & Recommendation'}
          </h4>
          <div className="flex items-center gap-3 mb-2">
            <ScoreRing score={p.scores.priority} size={56} />
            <div>
              <span className="inline-flex items-center rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">
                {rec}
              </span>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">{reason}</p>
            </div>
          </div>
          <div className="space-y-1.5 mt-3">
            {actions.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-[var(--color-accent-light)] font-bold">{i + 1}.</span>
                <span className="text-[var(--color-text-primary)]">{a}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
          <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
            {locale === 'ar' ? 'النتائج' : 'Scores'}
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(p.scores).map(([key, val]) => (
              <div key={key} className="text-center">
                <ScoreRing score={val} size={40} label={key} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
          <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
            {locale === 'ar' ? 'تعريف الانتهاء' : 'Definition of Done'}
          </h4>
          <p className="text-sm text-[var(--color-text-primary)]">{p.definitionOfDone}</p>
          <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mt-4 mb-2">
            {locale === 'ar' ? 'بعد الانتهاء' : 'After Completion'}
          </h4>
          <p className="text-sm text-[var(--color-text-primary)]">{p.afterCompletion}</p>
        </div>
      </div>

      <div className="lg:col-span-2">
        <LifecycleTracker lifecycle={p.lifecycle} />
      </div>
    </div>
  );
}

function ExecutionTab({ project: p }: { project: Project }) {
  const { locale } = useLocale();
  const resolved = p.tasks.filter(t => t.status === 'resolved');
  const pending = p.tasks.filter(t => t.status === 'pending');
  const blockers = p.tasks.filter(t => t.status === 'blocker');

  const renderTasks = (tasks: typeof p.tasks, title: string, color: string) => (
    <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-2 w-2 rounded-full ${color}`} />
        <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">
          {title} ({tasks.length})
        </h4>
      </div>
      {tasks.length === 0 ? (
        <p className="text-xs text-[var(--color-text-tertiary)]">{locale === 'ar' ? 'لا يوجد' : 'None'}</p>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <div key={task.id} className="rounded-md bg-[var(--color-bg-tertiary)] px-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm text-[var(--color-text-primary)]">{task.title}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-bold', getTaskStatusColor(task.status))}>
                    {task.status.toUpperCase()}
                  </span>
                  <span className="rounded bg-[var(--color-bg-card)] px-1.5 py-0.5 text-[9px] text-[var(--color-text-tertiary)]">
                    {task.category}
                  </span>
                </div>
              </div>
              {task.recommendedAction && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">→ {task.recommendedAction}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {renderTasks(blockers, locale === 'ar' ? 'عوائق' : 'Blockers', 'bg-red-500')}
      {renderTasks(pending, locale === 'ar' ? 'معلّق' : 'Pending', 'bg-yellow-500')}
      {renderTasks(resolved, locale === 'ar' ? 'تم الحل' : 'Resolved', 'bg-green-500')}
    </div>
  );
}

function ArtifactsTab({ project: p }: { project: Project }) {
  const { locale } = useLocale();
  const categories = ['Product', 'Technical', 'QA', 'Business', 'Commercial'] as const;

  const getReadiness = (cat: string) => {
    const items = p.artifacts.filter(a => a.category === cat && a.status !== 'NOT_REQUIRED');
    if (items.length === 0) return 0;
    return Math.round((items.filter(a => a.status === 'READY').length / items.length) * 100);
  };

  const totalReady = p.artifacts.filter(a => a.status === 'READY').length;
  const totalPartial = p.artifacts.filter(a => a.status === 'PARTIAL').length;
  const totalMissing = p.artifacts.filter(a => a.status === 'MISSING').length;
  const totalOutdated = p.artifacts.filter(a => a.status === 'OUTDATED').length;
  const totalTracked = p.artifacts.filter(a => a.status !== 'NOT_REQUIRED').length;
  const readinessPct = totalTracked > 0 ? Math.round((totalReady / totalTracked) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-3 text-center">
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">{readinessPct}%</div>
          <div className="text-[10px] text-[var(--color-text-tertiary)]">{locale === 'ar' ? 'الجاهزية' : 'Readiness'}</div>
        </div>
        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{totalReady}</div>
          <div className="text-[10px] text-green-400/70">READY</div>
        </div>
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{totalPartial}</div>
          <div className="text-[10px] text-yellow-400/70">PARTIAL</div>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{totalMissing}</div>
          <div className="text-[10px] text-red-400/70">MISSING</div>
        </div>
        <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">{totalOutdated}</div>
          <div className="text-[10px] text-orange-400/70">OUTDATED</div>
        </div>
      </div>

      {categories.map(cat => {
        const items = p.artifacts.filter(a => a.category === cat);
        const readiness = getReadiness(cat);
        return (
          <div key={cat} className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{cat}</h4>
              <span className={cn('text-xs font-bold tabular-nums', getScoreColor(readiness))}>{readiness}%</span>
            </div>
            <div className="space-y-1.5">
              {items.map((artifact, i) => (
                <div key={i} className="flex items-center justify-between rounded-md bg-[var(--color-bg-tertiary)] px-3 py-2">
                  <span className="text-sm text-[var(--color-text-primary)]">{artifact.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-bold', getArtifactStatusColor(artifact.status))}>
                      {artifact.status}
                    </span>
                    <ProvenanceBadge provenance={artifact.provenance} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MarketTab({ project: p }: { project: Project }) {
  const { locale } = useLocale();

  return (
    <div className="space-y-6">
      {/* Market Opportunity */}
      <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
        <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
          {locale === 'ar' ? 'فرصة السوق' : 'Market Opportunity'}
        </h4>
        <InfoRow label="Problem" value={p.market.problem} />
        <InfoRow label="Buyer" value={p.market.buyer} />
        <InfoRow label="User" value={p.market.user} />
        <InfoRow label="Who Pays" value={p.market.whoPays} />
        <InfoRow label="Pain Level" value={p.market.painLevel} />
        <InfoRow label="Saudi Opportunity" value={p.market.saudiOpportunity} />
        <InfoRow label="GCC Opportunity" value={p.market.gccOpportunity} />
        <InfoRow label="Global Opportunity" value={p.market.globalOpportunity} />
        {p.market.tam && <InfoRow label="TAM" value={p.market.tam} provenance={p.market.tamProvenance} />}
        {p.market.sam && <InfoRow label="SAM" value={p.market.sam} provenance={p.market.samProvenance} />}
        {p.market.som && <InfoRow label="SOM" value={p.market.som} provenance={p.market.somProvenance} />}
      </div>

      {/* Competitors */}
      <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
        <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
          {locale === 'ar' ? 'تحليل المنافسين' : 'Competitor Analysis'}
        </h4>

        {['Saudi', 'GCC', 'International'].map(market => {
          const comps = p.competitors.filter(c => c.market === market);
          if (comps.length === 0) return null;
          return (
            <div key={market} className="mb-4 last:mb-0">
              <h5 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">{market}</h5>
              <div className="overflow-scroll-x">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[var(--color-text-tertiary)]">
                      <th className="pb-2 pr-3 font-medium">Name</th>
                      <th className="pb-2 pr-3 font-medium">Positioning</th>
                      <th className="pb-2 pr-3 font-medium">Strengths</th>
                      <th className="pb-2 pr-3 font-medium">We Do Better</th>
                      <th className="pb-2 font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comps.map((c, i) => (
                      <tr key={i} className="border-t border-[var(--color-border-primary)]/30">
                        <td className="py-2 pr-3 text-[var(--color-text-primary)] font-medium">{c.name}</td>
                        <td className="py-2 pr-3 text-[var(--color-text-secondary)]">{c.positioning}</td>
                        <td className="py-2 pr-3 text-[var(--color-text-secondary)]">{c.strengths.join(', ')}</td>
                        <td className="py-2 pr-3 text-green-400">{c.weDoBetter.join(', ')}</td>
                        <td className="py-2">
                          <ProvenanceBadge provenance={c.provenance} />
                          {c.lastResearched && (
                            <span className="ml-1 text-[9px] text-[var(--color-text-tertiary)]">{c.lastResearched}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Competitor Matrix */}
      <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
        <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
          {locale === 'ar' ? 'مصفوفة المنافسين' : 'Competitor Matrix'}
        </h4>
        <div className="space-y-3">
          {p.competitors.map((c, i) => (
            <div key={i} className="rounded-md bg-[var(--color-bg-tertiary)] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">{c.name}</span>
                <span className="text-[10px] text-[var(--color-text-tertiary)]">{c.market}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[var(--color-text-tertiary)]">They do better: </span>
                  <span className="text-red-400">{c.theyDoBetter.join(', ')}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-tertiary)]">We do better: </span>
                  <span className="text-green-400">{c.weDoBetter.join(', ')}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[var(--color-text-tertiary)]">Gaps: </span>
                  <span className="text-yellow-400">{c.gapsToAddress.join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommercialTab({ project: p }: { project: Project }) {
  const { locale } = useLocale();
  const cs = p.commercial;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
        <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
          {locale === 'ar' ? 'الاستراتيجية التجارية' : 'Commercial Strategy'}
        </h4>
        <InfoRow label="First Customer" value={cs.firstCustomer} />
        <InfoRow label="Why They Pay" value={cs.whyTheyPay} />
        <InfoRow label="What We Sell First" value={cs.whatWeSellFirst} />
        <InfoRow label="Suggested Price" value={cs.suggestedPrice} provenance={cs.priceProvenance} />
        <InfoRow label="Fastest Sales Route" value={cs.fastestSalesRoute} />
        <InfoRow label="Proof Needed" value={cs.proofNeeded} />
        <InfoRow label="Primary Channel" value={cs.primaryChannel} />
      </div>

      <div className="rounded-lg border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 p-4">
        <h4 className="text-xs font-semibold text-[var(--color-accent-light)] uppercase tracking-wide mb-3">
          {locale === 'ar' ? 'أسرع طريق للعميل الأول' : 'Fastest Path to First Customer'}
        </h4>
        <div className="space-y-2">
          {cs.fastestPath.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-[var(--color-text-primary)]">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
        <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
          {locale === 'ar' ? 'القنوات' : 'Channels'}
        </h4>
        <div className="flex flex-wrap gap-2">
          {cs.channels.map((ch, i) => (
            <span key={i} className={cn(
              'rounded-md px-2.5 py-1 text-xs',
              ch === cs.primaryChannel
                ? 'bg-[var(--color-accent)] text-white font-semibold'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
            )}>
              {ch} {ch === cs.primaryChannel && '★'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinancialTab({ project: p }: { project: Project }) {
  const { locale } = useLocale();
  const f = p.financials;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {f.subscription && (
          <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-3 text-center">
            <div className="text-xl font-bold text-[var(--color-text-primary)]">{formatCurrency(f.subscription, f.currency)}</div>
            <div className="text-[10px] text-[var(--color-text-tertiary)]">/month</div>
          </div>
        )}
        {f.estimatedGrossMargin !== undefined && (
          <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-3 text-center">
            <div className="text-xl font-bold text-green-400">{f.estimatedGrossMargin}%</div>
            <div className="text-[10px] text-[var(--color-text-tertiary)]">Gross Margin</div>
          </div>
        )}
        {f.breakEvenCustomers && (
          <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-3 text-center">
            <div className="text-xl font-bold text-yellow-400">{f.breakEvenCustomers}</div>
            <div className="text-[10px] text-[var(--color-text-tertiary)]">Break-Even Customers</div>
          </div>
        )}
        <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-3 text-center">
          <ProvenanceBadge provenance={f.provenance} />
          <div className="text-[10px] text-[var(--color-text-tertiary)] mt-1">Data Source</div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
        <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
          {locale === 'ar' ? 'النموذج المالي' : 'Financial Model'}
        </h4>
        <InfoRow label="Pricing Model" value={f.pricingModel} />
        {f.setupFee && <InfoRow label="Setup Fee" value={formatCurrency(f.setupFee, f.currency)} />}
        {f.subscription && <InfoRow label="Subscription" value={formatCurrency(f.subscription, f.currency) + '/month'} />}
        {f.operatingCosts && <InfoRow label="Operating Costs" value={formatCurrency(f.operatingCosts, f.currency) + '/month'} />}
      </div>

      <div className="rounded-lg border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 p-4">
        <h4 className="text-xs font-semibold text-[var(--color-accent-light)] uppercase tracking-wide mb-3">
          {locale === 'ar' ? 'معالم الإيرادات' : 'Revenue Milestones'}
        </h4>
        <div className="space-y-3">
          {f.milestones.map((m, i) => (
            <div key={i} className="flex items-center justify-between rounded-md bg-[var(--color-bg-card)] px-4 py-3 border border-[var(--color-border-primary)]">
              <div>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">{m.label}</span>
                <span className="ml-2 text-xs text-[var(--color-text-tertiary)]">
                  {m.customersNeeded} {locale === 'ar' ? 'عميل' : 'customers'}
                </span>
              </div>
              <span className="text-sm font-bold text-green-400 tabular-nums">{formatCurrency(m.revenue, f.currency)}</span>
            </div>
          ))}
        </div>
      </div>

      {f.subscription && (
        <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
          <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
            {locale === 'ar' ? 'سيناريوهات الإيرادات' : 'Revenue Scenarios'}
          </h4>
          <div className="overflow-scroll-x">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[var(--color-text-tertiary)]">
                  <th className="pb-2 pr-4 font-medium">{locale === 'ar' ? 'العملاء' : 'Customers'}</th>
                  <th className="pb-2 pr-4 font-medium">MRR</th>
                  <th className="pb-2 font-medium">ARR</th>
                </tr>
              </thead>
              <tbody>
                {[5, 10, 25, 50, 100, 250].map(n => (
                  <tr key={n} className="border-t border-[var(--color-border-primary)]/30">
                    <td className="py-2 pr-4 text-[var(--color-text-primary)]">{n}</td>
                    <td className="py-2 pr-4 text-green-400 tabular-nums">{formatCurrency(n * f.subscription!, f.currency)}</td>
                    <td className="py-2 text-green-400 tabular-nums">{formatCurrency(n * f.subscription! * 12, f.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function RoadmapTab({ project: p }: { project: Project }) {
  const { locale } = useLocale();
  const periods = [
    { key: 'thisWeek' as const, en: 'This Week', ar: 'هذا الأسبوع', color: 'border-red-500/30' },
    { key: 'next30Days' as const, en: 'Next 30 Days', ar: 'الـ 30 يوم القادمة', color: 'border-yellow-500/30' },
    { key: 'next60Days' as const, en: 'Next 60 Days', ar: 'الـ 60 يوم القادمة', color: 'border-blue-500/30' },
    { key: 'next90Days' as const, en: 'Next 90 Days', ar: 'الـ 90 يوم القادمة', color: 'border-purple-500/30' },
  ];

  return (
    <div className="space-y-4">
      {periods.map(period => (
        <div key={period.key} className={cn('rounded-lg border bg-[var(--color-bg-card)] p-4', period.color)}>
          <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
            {locale === 'ar' ? period.ar : period.en}
          </h4>
          <div className="space-y-1.5">
            {p.roadmap[period.key].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-[var(--color-text-tertiary)]">•</span>
                <span className="text-[var(--color-text-primary)]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DeploymentTab({ project: p }: { project: Project }) {
  const { locale } = useLocale();

  return (
    <div className="space-y-6">
      {p.github && (
        <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
          <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
            {locale === 'ar' ? 'حالة GitHub' : 'GitHub Status'}
          </h4>
          <InfoRow label="Repository" value={p.github.repo} />
          <InfoRow label="Visibility" value={p.github.visibility} />
          <InfoRow label="Default Branch" value={p.github.defaultBranch} />
          {p.github.latestCommitSha && <InfoRow label="Latest SHA" value={p.github.latestCommitSha.slice(0, 8)} provenance={p.github.provenance} />}
          {p.github.latestCommitMessage && <InfoRow label="Latest Commit" value={p.github.latestCommitMessage} />}
          {p.github.openPRs !== undefined && <InfoRow label="Open PRs" value={String(p.github.openPRs)} />}
          {p.github.openIssues !== undefined && <InfoRow label="Open Issues" value={String(p.github.openIssues)} />}
          {p.github.ciStatus && (
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-[var(--color-text-tertiary)]">CI Status</span>
              <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold',
                p.github.ciStatus === 'passing' ? 'bg-green-500/15 text-green-400' :
                p.github.ciStatus === 'failing' ? 'bg-red-500/15 text-red-400' :
                'bg-yellow-500/15 text-yellow-400'
              )}>
                {p.github.ciStatus.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}

      {p.vercel && (
        <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
          <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
            {locale === 'ar' ? 'حالة Vercel' : 'Vercel Status'}
          </h4>
          {p.vercel.project && <InfoRow label="Project" value={p.vercel.project} />}
          {p.vercel.productionUrl && <InfoRow label="Production URL" value={p.vercel.productionUrl} />}
          {p.vercel.deploymentStatus && (
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-[var(--color-text-tertiary)]">Deployment</span>
              <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold',
                p.vercel.deploymentStatus === 'ready' ? 'bg-green-500/15 text-green-400' :
                p.vercel.deploymentStatus === 'error' ? 'bg-red-500/15 text-red-400' :
                'bg-yellow-500/15 text-yellow-400'
              )}>
                {p.vercel.deploymentStatus.toUpperCase()}
              </span>
            </div>
          )}
          {p.vercel.deployedSha && <InfoRow label="Deployed SHA" value={p.vercel.deployedSha.slice(0, 8)} provenance={p.vercel.provenance} />}
          {p.vercel.productionBranch && <InfoRow label="Branch" value={p.vercel.productionBranch} />}
          {p.vercel.lastDeployTime && <InfoRow label="Last Deploy" value={p.vercel.lastDeployTime} />}
        </div>
      )}

      {/* Source Sync */}
      <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
        <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
          {locale === 'ar' ? 'مزامنة المصدر' : 'Source Sync'}
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-tertiary)]">Local HEAD</span>
            <span className="text-xs text-yellow-400">Unavailable from hosted runtime</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-tertiary)]">GitHub HEAD</span>
            <span className="text-xs text-[var(--color-text-primary)] font-mono">
              {p.github?.latestCommitSha ? p.github.latestCommitSha.slice(0, 8) : 'Unknown'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-tertiary)]">Vercel SHA</span>
            <span className="text-xs text-[var(--color-text-primary)] font-mono">
              {p.vercel?.deployedSha ? p.vercel.deployedSha.slice(0, 8) : 'Unknown'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-primary)]/50">
            <span className="text-xs text-[var(--color-text-tertiary)]">Sync Status</span>
            <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-yellow-500/15 text-yellow-400">
              INCOMPLETE VERIFICATION
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TechnicalTab({ project: p }: { project: Project }) {
  const { locale } = useLocale();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(['product', 'technical', 'qa', 'deployment', 'commercial'] as const).map(key => (
          <div key={key} className="flex flex-col items-center">
            <ScoreRing score={p.scores[key]} size={56} label={key} />
          </div>
        ))}
      </div>
      <LifecycleTracker lifecycle={p.lifecycle} />
      {p.github && (
        <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
          <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
            Repository
          </h4>
          <InfoRow label="Repo" value={p.github.repo} />
          <InfoRow label="Branch" value={p.github.defaultBranch} />
          <InfoRow label="Visibility" value={p.github.visibility} />
          {p.github.latestCommitMessage && <InfoRow label="Latest" value={p.github.latestCommitMessage} />}
        </div>
      )}
    </div>
  );
}

export default function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { locale } = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const project = projects.find(p => p.slug === slug);

  if (!project) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          {locale === 'ar' ? 'المشروع غير موجود' : 'Project not found'}
        </h1>
        <Link href="/" className="text-sm text-[var(--color-accent-light)] mt-2 inline-block">
          ← {locale === 'ar' ? 'العودة' : 'Back to portfolio'}
        </Link>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab project={project} />;
      case 'execution': return <ExecutionTab project={project} />;
      case 'technical': return <TechnicalTab project={project} />;
      case 'artifacts': return <ArtifactsTab project={project} />;
      case 'market': return <MarketTab project={project} />;
      case 'commercial': return <CommercialTab project={project} />;
      case 'financial': return <FinancialTab project={project} />;
      case 'roadmap': return <RoadmapTab project={project} />;
      case 'deployment': return <DeploymentTab project={project} />;
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/" className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-light)] transition-colors">
            ← {locale === 'ar' ? 'المحفظة' : 'Portfolio'}
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {locale === 'ar' ? project.nameAr : project.name}
            </h1>
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', getStatusColor(project.status))}>
              {project.status}
            </span>
            <span className="text-xs text-[var(--color-text-tertiary)]">{project.category}</span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {locale === 'ar' ? project.descriptionAr : project.description}
          </p>
        </div>
        <ScoreRing score={project.scores.priority} size={64} label="Priority" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-[var(--color-border-primary)] pb-px">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors border-b-2',
              activeTab === tab
                ? 'border-[var(--color-accent)] text-[var(--color-text-primary)]'
                : 'border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
            )}
          >
            {locale === 'ar' ? TAB_LABELS[tab].ar : TAB_LABELS[tab].en}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-[fadeIn_0.2s_ease]" key={activeTab}>
        {renderTab()}
      </div>
    </div>
  );
}
