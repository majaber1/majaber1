'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { findOperationalProject, operationalSnapshot, type OperationalProject, type OperationalSnapshot } from '@/data/operational';

interface OperationalContextValue {
  snapshot: OperationalSnapshot;
  loading: boolean;
  error: string | null;
  source: 'live' | 'static';
}

const OperationalContext = createContext<OperationalContextValue>({
  snapshot: operationalSnapshot,
  loading: true,
  error: null,
  source: 'static',
});

export function OperationalProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<OperationalSnapshot>(operationalSnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'live' | 'static'>('static');

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const response = await fetch('/api/portfolio-operational', { cache: 'no-store' });
        if (!response.ok) throw new Error(`Operational API returned ${response.status}`);
        const next = await response.json() as OperationalSnapshot;
        if (!cancelled && Array.isArray(next.projects) && next.projects.length > 0) {
          setSnapshot(next);
          setSource('live');
          setError(null);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : String(cause));
          setSource('static');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    refresh();
    return () => { cancelled = true; };
  }, []);

  const value = useMemo(() => ({ snapshot, loading, error, source }), [snapshot, loading, error, source]);
  return <OperationalContext.Provider value={value}>{children}</OperationalContext.Provider>;
}

export function useOperationalSnapshot() {
  return useContext(OperationalContext);
}

export function useOperationalProject(slug: string): OperationalProject | undefined {
  const { snapshot } = useOperationalSnapshot();
  return findOperationalProject(snapshot, slug);
}
