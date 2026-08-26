'use client';

import Link from 'next/link';
import type { Project } from '@/types/project';
import { getStatusColor, cn, countByStatus } from '@/lib/utils';
import { getPriorityRecommendation } from '@/lib/priority';
import { useLocale } from '@/lib/locale-context';
import { useOperationalProject } from '@/lib/operational-context';
import { runtimeLabel } from '@/data/operational';
import ScoreRing from './ScoreRing';
import LifecycleTracker from './LifecycleTracker';

const recColors: Record<string, string> = {
  'WORK NOW': 'bg-red-500/15 text-red-400 border-red-500/30',
  'FINISH THIS WEEK': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'FIX BLOCKER': 'bg-red-500/15 text-red-400 border-red-500/30',
  'READY FOR PILOT': 'bg-green-500/15 text-green-400 border-green-500/30',
  'READY FOR SALES': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'VALIDATE MARKET': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'MONITOR': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'PAUSE': 'bg-[var(--color-text-tertiary)]/15 text-[var(--color-text-tertiary)] border-[var(--color-text-tertiary)]/30',
};

const storageColors = {
  configured: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  not_configured: 'border-red-500/30 bg-red-500/10 text-red-400',
  unverified: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
};

const runtimeColors: Record<string, string> = {
  healthy: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  static: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  mvp: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  partial: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  degraded: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  unhealthy: 'border-red-500/30 bg-red-500/10 text-red-400',
  unverified: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  archived: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
};

export default function ProjectCard({ project }: { project: Project }) {
  const { locale } = useLocale();
  const ar = locale === 'ar';
  const rec = getPriorityRecommendation(project);
  const blockers = countByStatus(project.tasks, 'blocker');
  const pending = countByStatus(project.tasks, 'pending');
  const resolved = countByStatus(project.tasks, 'resolved');
  const operational = useOperationalProject(project.slug);
  const liveUrl = operational?.productionUrl || project.vercel?.productionUrl;
  const githubUrl = operational?.github.htmlUrl || (project.github?.repo ? `https://github.com/${project.github.repo}` : undefined);
  const storage = operational?.storage;

  return (
    <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-5 transition-all hover:border-[var(--color-border-accent)] hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Link href={`/projects/${project.slug}`} className="text-base font-semibold text-[var(--color-text-primary)] truncate hover:text-[var(--color-accent-light)]">
              {project.name}
            </Link>
            <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold', getStatusColor(project.status))}>
              {project.status}
            </span>
            {operational && (
              <span
                className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold', runtimeColors[operational.runtime.state] || runtimeColors.unverified)}
                title={operational.runtime.summary}
              >
                OPS {runtimeLabel(operational.runtime.state)}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)] line-clamp-1">{project.description}</p>
        </div>
        <ScoreRing score={project.scores.priority} size={52} />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide', recColors[rec] || recColors['MONITOR'])}>
          {rec}
        </span>
        {operational?.github.headSha && (
          <span className="inline-flex items-center rounded-md border border-[var(--color-border-primary)] px-2 py-0.5 font-mono text-[9px] text-[var(--color-text-tertiary)]">
            {operational.github.defaultBranch}@{operational.github.headSha.slice(0, 8)}
          </span>
        )}
      </div>

      <LifecycleTracker lifecycle={project.lifecycle} compact />

      <div className="mt-3 flex items-center gap-4 text-xs">
        <span className="text-green-400 tabular-nums">{resolved} resolved</span>
        <span className="text-yellow-400 tabular-nums">{pending} pending</span>
        {blockers > 0 && <span className="text-red-400 tabular-nums">{blockers} blockers</span>}
      </div>

      <div className="mt-2 text-xs text-[var(--color-text-tertiary)] min-h-10">
        <span className="text-[var(--color-text-secondary)]">{ar ? 'التالي:' : 'Next:'}</span> {project.nextAction}
      </div>

      {operational && (
        <div className="mt-3 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)]/40 p-2.5" title={operational.runtime.summary}>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">{ar ? 'المصدر التشغيلي' : 'Operational source'}</div>
          <div className="mt-1 text-[11px] leading-4 text-[var(--color-text-secondary)] line-clamp-2">{operational.runtime.summary}</div>
        </div>
      )}

      {storage && (
        <div className="mt-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)]/40 p-2.5" title={storage.evidence}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
              {ar ? 'التخزين' : 'Storage'}
            </span>
            <span className={cn('inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold', storageColors[storage.state])}>
              {storage.state === 'configured'
                ? (ar ? 'مفعّل' : 'CONFIGURED')
                : storage.state === 'not_configured'
                  ? (ar ? 'غير مربوط' : 'NOT CONFIGURED')
                  : (ar ? 'غير متحقق' : 'UNVERIFIED')}
            </span>
            <span className="text-[10px] text-[var(--color-text-tertiary)]">{storage.provider}</span>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--color-border-primary)] pt-3">
        <Link
          href={`/projects/${project.slug}`}
          className="inline-flex items-center rounded-md border border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          {ar ? 'التفاصيل' : 'Details'}
        </Link>

        {liveUrl ? (
          <a
            href={liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/15"
            title={liveUrl}
          >
            {ar ? 'فتح التطبيق ↗' : 'Live App ↗'}
          </a>
        ) : (
          <span className="inline-flex items-center rounded-md border border-[var(--color-border-primary)] px-2.5 py-1.5 text-xs text-[var(--color-text-tertiary)]">
            {ar ? 'لا يوجد رابط Live موثّق' : 'No verified live URL'}
          </span>
        )}

        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md border border-[var(--color-border-primary)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent-light)]"
          >
            GitHub ↗
          </a>
        )}
      </div>
    </div>
  );
}
