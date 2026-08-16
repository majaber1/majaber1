'use client';

import Link from 'next/link';
import type { Project } from '@/types/project';
import { getScoreColor, getStatusColor, cn, countByStatus } from '@/lib/utils';
import { getPriorityRecommendation } from '@/lib/priority';
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

export default function ProjectCard({ project }: { project: Project }) {
  const rec = getPriorityRecommendation(project);
  const blockers = countByStatus(project.tasks, 'blocker');
  const pending = countByStatus(project.tasks, 'pending');
  const resolved = countByStatus(project.tasks, 'resolved');

  return (
    <Link href={`/projects/${project.slug}`} className="block">
      <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-5 transition-all hover:border-[var(--color-border-accent)] hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)] truncate">{project.name}</h3>
              <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold', getStatusColor(project.status))}>
                {project.status}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] line-clamp-1">{project.description}</p>
          </div>
          <ScoreRing score={project.scores.priority} size={52} />
        </div>

        <div className="mb-3">
          <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide', recColors[rec] || recColors['MONITOR'])}>
            {rec}
          </span>
        </div>

        <LifecycleTracker lifecycle={project.lifecycle} compact />

        <div className="mt-3 flex items-center gap-4 text-xs">
          <span className="text-green-400 tabular-nums">{resolved} resolved</span>
          <span className="text-yellow-400 tabular-nums">{pending} pending</span>
          {blockers > 0 && <span className="text-red-400 tabular-nums">{blockers} blockers</span>}
        </div>

        <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">
          <span className="text-[var(--color-text-secondary)]">Next:</span> {project.nextAction}
        </div>
      </div>
    </Link>
  );
}
