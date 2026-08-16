'use client';

import type { DataProvenance } from '@/types/project';
import { getProvenanceClass, cn } from '@/lib/utils';

export default function ProvenanceBadge({ provenance }: { provenance: DataProvenance }) {
  return (
    <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase', getProvenanceClass(provenance))}>
      {provenance}
    </span>
  );
}
