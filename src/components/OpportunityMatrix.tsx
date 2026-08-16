'use client';

import type { Project } from '@/types/project';
import { useLocale } from '@/lib/locale-context';

interface Props {
  projects: Project[];
}

export default function OpportunityMatrix({ projects }: Props) {
  const { locale } = useLocale();

  const getQuadrant = (p: Project): { label: string; color: string } => {
    const effort = 100 - p.scores.overall;
    const revenue = p.scores.revenue;
    if (revenue >= 50 && effort < 50) return { label: locale === 'ar' ? 'مكسب سريع' : 'Quick Win', color: '#22c55e' };
    if (revenue >= 50 && effort >= 50) return { label: locale === 'ar' ? 'رهان استراتيجي' : 'Strategic Bet', color: '#6366f1' };
    if (revenue < 50 && effort < 50) return { label: locale === 'ar' ? 'تجربة' : 'Experiment', color: '#eab308' };
    return { label: locale === 'ar' ? 'أولوية منخفضة' : 'Deprioritize', color: '#6a6a80' };
  };

  return (
    <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
        {locale === 'ar' ? 'مصفوفة الفرص' : 'Opportunity Matrix'}
      </h3>
      <div className="relative h-64 border-l-2 border-b-2 border-[var(--color-border-primary)]">
        <span className="absolute -left-12 top-1/2 -rotate-90 text-[10px] text-[var(--color-text-tertiary)] whitespace-nowrap">
          {locale === 'ar' ? 'إمكانية الإيرادات' : 'Revenue Potential'} →
        </span>
        <span className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-[10px] text-[var(--color-text-tertiary)]">
          {locale === 'ar' ? 'الجهد المتبقي' : 'Remaining Effort'} →
        </span>

        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
          <div className="border-r border-b border-[var(--color-border-primary)]/30 flex items-center justify-center">
            <span className="text-[10px] text-green-500/30 font-medium">
              {locale === 'ar' ? 'جاهز للتجربة' : 'Ready for Pilot'}
            </span>
          </div>
          <div className="border-b border-[var(--color-border-primary)]/30 flex items-center justify-center">
            <span className="text-[10px] text-blue-500/30 font-medium">
              {locale === 'ar' ? 'رهان استراتيجي' : 'Strategic Bet'}
            </span>
          </div>
          <div className="border-r border-[var(--color-border-primary)]/30 flex items-center justify-center">
            <span className="text-[10px] text-yellow-500/30 font-medium">
              {locale === 'ar' ? 'تجربة' : 'Experiment'}
            </span>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-[10px] text-[var(--color-text-tertiary)]/30 font-medium">
              {locale === 'ar' ? 'أولوية منخفضة' : 'Deprioritize'}
            </span>
          </div>
        </div>

        {projects.map(p => {
          const effort = 100 - p.scores.overall;
          const revenue = p.scores.revenue;
          const market = p.scores.market;
          const quadrant = getQuadrant(p);
          const x = (effort / 100) * 100;
          const y = 100 - (revenue / 100) * 100;
          const bubbleSize = 12 + (market / 100) * 24;

          return (
            <div
              key={p.id}
              className="absolute flex flex-col items-center group cursor-pointer"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className="rounded-full opacity-80 transition-all group-hover:opacity-100 group-hover:scale-110"
                style={{
                  width: bubbleSize,
                  height: bubbleSize,
                  backgroundColor: quadrant.color,
                }}
              />
              <span className="text-[9px] text-[var(--color-text-secondary)] mt-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-bg-primary)]/90 px-1 rounded">
                {p.name}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        {projects.map(p => {
          const quadrant = getQuadrant(p);
          return (
            <div key={p.id} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: quadrant.color }} />
              <span className="text-[10px] text-[var(--color-text-secondary)]">{p.name}</span>
              <span className="text-[9px] text-[var(--color-text-tertiary)]">({quadrant.label})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
