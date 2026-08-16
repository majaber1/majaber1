'use client';

import type { LifecycleStage, StageStatus } from '@/types/project';
import { useLocale } from '@/lib/locale-context';

const STAGES: LifecycleStage[] = [
  'Idea', 'Research', 'UX', 'MVP', 'Development', 'Integration', 'QA',
  'Production', 'Validation', 'Pilot', 'Sales', 'Revenue', 'Scale'
];

const stageColors: Record<StageStatus, string> = {
  complete: 'bg-green-500',
  in_progress: 'bg-yellow-500',
  blocked: 'bg-red-500',
  not_started: 'bg-[var(--color-bg-tertiary)]',
};

interface Props {
  lifecycle: Record<LifecycleStage, StageStatus>;
  compact?: boolean;
}

export default function LifecycleTracker({ lifecycle, compact }: Props) {
  const { t } = useLocale();
  const completed = STAGES.filter(s => lifecycle[s] === 'complete').length;
  const pct = Math.round((completed / STAGES.length) * 100);

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {STAGES.map(stage => (
          <div
            key={stage}
            className={`h-1.5 flex-1 rounded-full ${stageColors[lifecycle[stage]]}`}
            title={`${stage}: ${lifecycle[stage]}`}
          />
        ))}
        <span className="ml-2 text-xs text-[var(--color-text-tertiary)] tabular-nums">{pct}%</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">Product Journey</span>
        <span className="text-xs text-[var(--color-text-tertiary)]">{pct}% complete</span>
      </div>
      <div className="grid grid-cols-13 gap-1">
        {STAGES.map(stage => (
          <div key={stage} className="flex flex-col items-center gap-1">
            <div className={`h-2 w-full rounded-full ${stageColors[lifecycle[stage]]}`} />
            <span className="text-[8px] text-[var(--color-text-tertiary)] text-center leading-tight whitespace-nowrap overflow-hidden">
              {t(`lifecycle.${stage.toLowerCase()}`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
