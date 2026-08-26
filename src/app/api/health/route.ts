import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      service: 'Jaber Dashboard',
      version: '2.2.0',
      mode: 'venture-control-tower',
      operationalSync: 'server-cache-6h+github-action-secondary',
      storage: 'not_required',
    },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300' } },
  );
}
