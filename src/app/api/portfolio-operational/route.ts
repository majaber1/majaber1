import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';
import staticSnapshot from '@/data/portfolio.generated.json';
import type { OperationalSnapshot } from '@/data/operational';
import { generateLiveOperationalSnapshot, SIX_HOURS_SECONDS } from '@/lib/portfolio-live';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getCachedSnapshot = unstable_cache(
  async () => generateLiveOperationalSnapshot(),
  ['jaber-dashboard-live-operational-snapshot-v1'],
  { revalidate: SIX_HOURS_SECONDS },
);

export async function GET() {
  try {
    const snapshot = await getCachedSnapshot();
    return NextResponse.json(snapshot, {
      headers: {
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=600',
        'X-Jaber-Sync-Mode': 'live-server-cache-6h',
      },
    });
  } catch (error) {
    console.error('[portfolio-operational] live sync failed', error instanceof Error ? error.message : String(error));
    return NextResponse.json(staticSnapshot as unknown as OperationalSnapshot, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'X-Jaber-Sync-Mode': 'static-fallback',
        'X-Jaber-Sync-Degraded': 'true',
      },
    });
  }
}
