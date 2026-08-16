import type { Project, DataProvenance, ArtifactStatus, TaskStatus } from '@/types/project';

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

export function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Active': case 'Production': return 'bg-green-500/15 text-green-400';
    case 'Development': return 'bg-blue-500/15 text-blue-400';
    case 'Pilot': return 'bg-purple-500/15 text-purple-400';
    case 'Blocked': return 'bg-red-500/15 text-red-400';
    case 'Paused': return 'bg-yellow-500/15 text-yellow-400';
    case 'Archived': return 'bg-[var(--color-text-tertiary)]/15 text-[var(--color-text-tertiary)]';
    default: return 'bg-[var(--color-text-tertiary)]/15 text-[var(--color-text-tertiary)]';
  }
}

export function getTaskStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'resolved': return 'bg-green-500/15 text-green-400';
    case 'pending': return 'bg-yellow-500/15 text-yellow-400';
    case 'blocker': return 'bg-red-500/15 text-red-400';
  }
}

export function getArtifactStatusColor(status: ArtifactStatus): string {
  switch (status) {
    case 'READY': return 'bg-green-500/15 text-green-400';
    case 'PARTIAL': return 'bg-yellow-500/15 text-yellow-400';
    case 'MISSING': return 'bg-red-500/15 text-red-400';
    case 'OUTDATED': return 'bg-orange-500/15 text-orange-400';
    case 'NOT_REQUIRED': return 'bg-[var(--color-text-tertiary)]/15 text-[var(--color-text-tertiary)]';
  }
}

export function getProvenanceClass(p: DataProvenance): string {
  switch (p) {
    case 'AUTO': return 'bg-green-500/20 text-green-400';
    case 'MANUAL': return 'bg-blue-500/20 text-blue-400';
    case 'ESTIMATED': return 'bg-yellow-500/20 text-yellow-400';
    case 'RESEARCHED': return 'bg-purple-500/20 text-purple-400';
    case 'UNVERIFIED': return 'bg-red-500/20 text-red-400';
  }
}

export function formatCurrency(amount: number, currency: string = 'SAR'): string {
  return `${currency} ${amount.toLocaleString()}`;
}

export function countByStatus(tasks: Project['tasks'], status: TaskStatus): number {
  return tasks.filter(t => t.status === status).length;
}

export function countArtifactsByStatus(artifacts: Project['artifacts'], status: ArtifactStatus): number {
  return artifacts.filter(a => a.status === status).length;
}
