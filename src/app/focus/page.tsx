'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/locale-context';
import { projects } from '@/data/projects';
import { getPriorityRecommendation, getPriorityReason, getTopActions } from '@/lib/priority';
import { countByStatus, getScoreColor, cn } from '@/lib/utils';
import ScoreRing from '@/components/ScoreRing';

export default function FocusPage() {
  const { locale } = useLocale();

  const sorted = useMemo(() =>
    [...projects].sort((a, b) => b.scores.priority - a.scores.priority),
    []
  );

  const top = sorted[0];
  const next = sorted[1];
  const topActions = getTopActions(top);
  const topRec = getPriorityRecommendation(top);
  const topReason = getPriorityReason(top);

  const allBlockers = projects.flatMap(p =>
    p.tasks.filter(t => t.status === 'blocker').map(t => ({ ...t, projectName: p.name, projectSlug: p.slug }))
  );

  const overdueItems = projects.flatMap(p =>
    p.tasks
      .filter(t => t.status === 'pending' && t.priority === 'critical')
      .map(t => ({ ...t, projectName: p.name, projectSlug: p.slug }))
  );

  const quickWins = projects.flatMap(p =>
    p.tasks
      .filter(t => t.status === 'pending' && t.priority === 'low')
      .map(t => ({ ...t, projectName: p.name, projectSlug: p.slug }))
  ).slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
      {/* Main Focus */}
      <section className="rounded-xl border border-[var(--color-accent)]/30 bg-gradient-to-br from-[var(--color-accent)]/8 via-transparent to-transparent p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-accent-light)]">
            {locale === 'ar' ? 'اليوم' : 'TODAY'}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <Link href={`/projects/${top.slug}`} className="text-2xl font-bold text-[var(--color-text-primary)] hover:text-[var(--color-accent-light)] transition-colors">
                {top.name}
              </Link>
              <ScoreRing score={top.scores.priority} size={48} />
            </div>

            <div className="inline-flex items-center rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400 mb-3">
              {topRec}
            </div>

            <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">{topReason}</p>

            <div className="space-y-2">
              {topActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-[var(--color-bg-tertiary)] px-4 py-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[var(--color-text-primary)]">{action}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-80 space-y-4 shrink-0">
            <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
              <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold">
                {locale === 'ar' ? 'تعريف الانتهاء' : 'Definition of Done'}
              </span>
              <p className="text-sm text-[var(--color-text-primary)] mt-1.5 leading-relaxed">{top.definitionOfDone}</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
              <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold">
                {locale === 'ar' ? 'النتيجة المتوقعة' : 'Expected Outcome'}
              </span>
              <p className="text-sm text-[var(--color-text-primary)] mt-1.5 leading-relaxed">{top.afterCompletion}</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
              <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold">
                {locale === 'ar' ? 'العائق الحالي' : 'Current Blocker'}
              </span>
              {countByStatus(top.tasks, 'blocker') > 0 ? (
                <div className="mt-1.5 space-y-1">
                  {top.tasks.filter(t => t.status === 'blocker').map(t => (
                    <p key={t.id} className="text-sm text-red-400">{t.title}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-green-400 mt-1.5">{locale === 'ar' ? 'لا عوائق' : 'No blockers'}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* NEXT */}
      {next && (
        <section className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-5">
          <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-text-tertiary)] mb-3 block">
            {locale === 'ar' ? 'التالي' : 'NEXT'}
          </span>
          <div className="flex items-center gap-4">
            <Link href={`/projects/${next.slug}`} className="text-lg font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent-light)] transition-colors">
              {next.name}
            </Link>
            <span className={cn('text-sm font-bold tabular-nums', getScoreColor(next.scores.priority))}>
              {next.scores.priority}/100
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{getPriorityReason(next)}</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
            <span className="text-[var(--color-text-secondary)]">{locale === 'ar' ? 'الإجراء التالي:' : 'Next action:'}</span>{' '}
            {next.nextAction}
          </p>
        </section>
      )}

      {/* Blockers */}
      {allBlockers.length > 0 && (
        <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <span className="text-xs font-bold tracking-widest uppercase text-red-400 mb-3 block">
            {locale === 'ar' ? 'عناصر محظورة' : 'BLOCKED ITEMS'} ({allBlockers.length})
          </span>
          <div className="space-y-2">
            {allBlockers.map(b => (
              <div key={b.id} className="flex items-center justify-between rounded-lg bg-[var(--color-bg-card)] px-4 py-2.5 border border-red-500/10">
                <div>
                  <span className="text-sm text-[var(--color-text-primary)]">{b.title}</span>
                  <Link href={`/projects/${b.projectSlug}`} className="ml-2 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-light)]">
                    {b.projectName}
                  </Link>
                </div>
                <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 rounded px-1.5 py-0.5">{b.category}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Overdue */}
      {overdueItems.length > 0 && (
        <section className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
          <span className="text-xs font-bold tracking-widest uppercase text-orange-400 mb-3 block">
            {locale === 'ar' ? 'مهام عاجلة' : 'CRITICAL PENDING'} ({overdueItems.length})
          </span>
          <div className="space-y-2">
            {overdueItems.map(item => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-[var(--color-bg-card)] px-4 py-2.5 border border-orange-500/10">
                <div>
                  <span className="text-sm text-[var(--color-text-primary)]">{item.title}</span>
                  <Link href={`/projects/${item.projectSlug}`} className="ml-2 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-light)]">
                    {item.projectName}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Wins */}
      {quickWins.length > 0 && (
        <section className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
          <span className="text-xs font-bold tracking-widest uppercase text-green-400 mb-3 block">
            {locale === 'ar' ? 'مكاسب سريعة' : 'QUICK WINS'} ({quickWins.length})
          </span>
          <div className="space-y-2">
            {quickWins.map(item => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-[var(--color-bg-card)] px-4 py-2.5 border border-green-500/10">
                <div>
                  <span className="text-sm text-[var(--color-text-primary)]">{item.title}</span>
                  <Link href={`/projects/${item.projectSlug}`} className="ml-2 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-light)]">
                    {item.projectName}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
