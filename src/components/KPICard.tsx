'use client';

import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: number | string;
  color?: string;
  subtitle?: string;
}

export default function KPICard({ label, value, color, subtitle }: KPICardProps) {
  return (
    <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] px-4 py-3 transition-all hover:border-[var(--color-border-accent)] hover:-translate-y-0.5">
      <div className="text-xs text-[var(--color-text-tertiary)] mb-1">{label}</div>
      <div className={cn('text-2xl font-bold tabular-nums', color || 'text-[var(--color-text-primary)]')}>
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{subtitle}</div>
      )}
    </div>
  );
}
