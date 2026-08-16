'use client';

import { useState, useMemo } from 'react';
import { useLocale } from '@/lib/locale-context';
import { projects } from '@/data/projects';
import { getPriorityRecommendation, getPriorityReason, getTopActions } from '@/lib/priority';
import { countByStatus, getScoreColor, cn } from '@/lib/utils';
import KPICard from '@/components/KPICard';
import ProjectCard from '@/components/ProjectCard';
import OpportunityMatrix from '@/components/OpportunityMatrix';
import type { Project } from '@/types/project';

type FilterKey = 'all' | 'workNow' | 'blocked' | 'development' | 'qa' | 'production' | 'pilotReady' | 'salesReady' | 'revenue' | 'paused' | 'archived';
type SortKey = 'priority' | 'launch' | 'revenue' | 'market' | 'effort' | 'readiness' | 'blocked' | 'updated';

const FILTERS: { key: FilterKey; en: string; ar: string }[] = [
  { key: 'all', en: 'All', ar: 'الكل' },
  { key: 'workNow', en: 'Work Now', ar: 'اعمل الآن' },
  { key: 'blocked', en: 'Blocked', ar: 'محظور' },
  { key: 'development', en: 'Development', ar: 'تطوير' },
  { key: 'qa', en: 'QA', ar: 'اختبار' },
  { key: 'production', en: 'Production', ar: 'إنتاج' },
  { key: 'pilotReady', en: 'Pilot Ready', ar: 'جاهز للتجربة' },
  { key: 'salesReady', en: 'Sales Ready', ar: 'جاهز للبيع' },
  { key: 'revenue', en: 'Revenue', ar: 'إيرادات' },
  { key: 'paused', en: 'Paused', ar: 'متوقف' },
  { key: 'archived', en: 'Archived', ar: 'مؤرشف' },
];

const SORTS: { key: SortKey; en: string; ar: string }[] = [
  { key: 'priority', en: 'Priority', ar: 'الأولوية' },
  { key: 'launch', en: 'Closest to Launch', ar: 'الأقرب للإطلاق' },
  { key: 'revenue', en: 'Revenue Potential', ar: 'إمكانية الإيرادات' },
  { key: 'market', en: 'Market Opportunity', ar: 'فرصة السوق' },
  { key: 'effort', en: 'Lowest Effort', ar: 'أقل جهد' },
  { key: 'readiness', en: 'Readiness', ar: 'الجاهزية' },
  { key: 'blocked', en: 'Most Blocked', ar: 'الأكثر عوائق' },
  { key: 'updated', en: 'Recently Updated', ar: 'آخر تحديث' },
];

function filterProjects(ps: Project[], filter: FilterKey): Project[] {
  switch (filter) {
    case 'all': return ps;
    case 'workNow': return ps.filter(p => {
      const rec = getPriorityRecommendation(p);
      return rec === 'WORK NOW' || rec === 'FIX BLOCKER' || rec === 'FINISH THIS WEEK';
    });
    case 'blocked': return ps.filter(p => countByStatus(p.tasks, 'blocker') > 0);
    case 'development': return ps.filter(p => p.status === 'Development');
    case 'qa': return ps.filter(p => p.stage === 'QA' || p.lifecycle.QA === 'in_progress');
    case 'production': return ps.filter(p => p.status === 'Production' || p.stage === 'Production');
    case 'pilotReady': return ps.filter(p => getPriorityRecommendation(p) === 'READY FOR PILOT');
    case 'salesReady': return ps.filter(p => getPriorityRecommendation(p) === 'READY FOR SALES');
    case 'revenue': return ps.filter(p => p.stage === 'Revenue' || p.stage === 'Scale');
    case 'paused': return ps.filter(p => p.status === 'Paused');
    case 'archived': return ps.filter(p => p.status === 'Archived');
  }
}

function sortProjects(ps: Project[], sort: SortKey): Project[] {
  const sorted = [...ps];
  switch (sort) {
    case 'priority': return sorted.sort((a, b) => b.scores.priority - a.scores.priority);
    case 'launch': return sorted.sort((a, b) => b.scores.deployment - a.scores.deployment);
    case 'revenue': return sorted.sort((a, b) => b.scores.revenue - a.scores.revenue);
    case 'market': return sorted.sort((a, b) => b.scores.market - a.scores.market);
    case 'effort': return sorted.sort((a, b) => b.scores.overall - a.scores.overall);
    case 'readiness': return sorted.sort((a, b) => b.scores.overall - a.scores.overall);
    case 'blocked': return sorted.sort((a, b) => countByStatus(b.tasks, 'blocker') - countByStatus(a.tasks, 'blocker'));
    case 'updated': return sorted.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }
}

export default function PortfolioPage() {
  const { t, locale } = useLocale();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sort, setSort] = useState<SortKey>('priority');

  const topProject = useMemo(() =>
    [...projects].sort((a, b) => b.scores.priority - a.scores.priority)[0],
    []
  );

  const filtered = useMemo(() => sortProjects(filterProjects(projects, filter), sort), [filter, sort]);

  const totalBlockers = projects.reduce((sum, p) => sum + countByStatus(p.tasks, 'blocker'), 0);
  const totalPending = projects.reduce((sum, p) => sum + countByStatus(p.tasks, 'pending'), 0);
  const productionReady = projects.filter(p => p.stage === 'Production' || p.status === 'Production').length;
  const inDev = projects.filter(p => p.status === 'Development').length;
  const blocked = projects.filter(p => countByStatus(p.tasks, 'blocker') > 0).length;
  const qaRequired = projects.filter(p => p.lifecycle.QA === 'in_progress' || p.lifecycle.QA === 'not_started').length;
  const pilotReady = projects.filter(p => getPriorityRecommendation(p) === 'READY FOR PILOT').length;
  const salesReady = projects.filter(p => getPriorityRecommendation(p) === 'READY FOR SALES').length;
  const revenueGen = projects.filter(p => p.stage === 'Revenue' || p.stage === 'Scale').length;

  const topActions = getTopActions(topProject);
  const topRec = getPriorityRecommendation(topProject);
  const topReason = getPriorityReason(topProject);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      {/* Hero Focus */}
      <section className="rounded-xl border border-[var(--color-accent)]/30 bg-gradient-to-r from-[var(--color-accent)]/5 to-transparent p-5 animate-[fadeIn_0.3s_ease]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-accent-light)]">
            {locale === 'ar' ? 'التركيز الموصى به اليوم' : "TODAY'S RECOMMENDED FOCUS"}
          </span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-start gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{topProject.name}</h2>
              <span className={cn('text-sm font-bold tabular-nums', getScoreColor(topProject.scores.priority))}>
                {topProject.scores.priority}/100
              </span>
              <span className="inline-flex items-center rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">
                {topRec}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-3">{topReason}</p>
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">
                {locale === 'ar' ? 'اليوم' : 'TODAY'}:
              </span>
              {topActions.map((action, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-primary)]">
                  <span className="text-[var(--color-accent-light)] font-bold mt-0.5">{i + 1}.</span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-72 space-y-3 shrink-0">
            <div>
              <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold">
                {locale === 'ar' ? 'تعريف الانتهاء' : 'Definition of Done'}
              </span>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{topProject.definitionOfDone}</p>
            </div>
            <div>
              <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold">
                {locale === 'ar' ? 'بعد ذلك' : 'After This'}
              </span>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{topProject.afterCompletion}</p>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <KPICard label={t('kpi.totalApps')} value={projects.length} color="text-[var(--color-text-primary)]" />
        <KPICard label={t('kpi.productionReady')} value={productionReady} color="text-green-400" />
        <KPICard label={t('kpi.development')} value={inDev} color="text-blue-400" />
        <KPICard label={t('kpi.blocked')} value={blocked} color="text-red-400" />
        <KPICard label={t('kpi.qaRequired')} value={qaRequired} color="text-orange-400" />
        <KPICard label={t('kpi.pilotReady')} value={pilotReady} color="text-purple-400" />
        <KPICard label={t('kpi.readyToSell')} value={salesReady} color="text-emerald-400" />
        <KPICard label={t('kpi.revenueGenerating')} value={revenueGen} color="text-cyan-400" />
        <KPICard label={t('kpi.totalPending')} value={totalPending} color="text-yellow-400" />
        <KPICard label={t('kpi.totalBlockers')} value={totalBlockers} color="text-red-400" />
      </section>

      {/* Filters + Sort */}
      <section className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                filter === f.key
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
              )}
            >
              {locale === 'ar' ? f.ar : f.en}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortKey)}
          className="ml-auto rounded-md border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent)]"
        >
          {SORTS.map(s => (
            <option key={s.key} value={s.key}>
              {locale === 'ar' ? s.ar : s.en}
            </option>
          ))}
        </select>
      </section>

      {/* Project Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(p => (
          <ProjectCard key={p.id} project={p} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-[var(--color-text-tertiary)]">
            {locale === 'ar' ? 'لا توجد مشاريع تطابق هذا المرشح' : 'No projects match this filter'}
          </div>
        )}
      </section>

      {/* Opportunity Matrix */}
      <OpportunityMatrix projects={projects} />
    </div>
  );
}
