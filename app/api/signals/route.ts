import { NextRequest, NextResponse } from 'next/server';
import { getSignals } from '@/lib/signals';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const term = req.nextUrl.searchParams.get('q') ?? '';
  if (!term) return NextResponse.json({ error: 'Missing q' }, { status: 400 });
  const sig = await getSignals(term);
  return NextResponse.json(sig);
}
