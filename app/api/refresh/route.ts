import { NextResponse } from 'next/server';
import seed from '@/lib/mock-ideas.json';
import type { Idea } from '@/lib/types';
import { repoUpsertIdeas } from '@/lib/repo';
import { heuristicScore, aiScore } from '@/lib/scoring';
import { getSignals } from '@/lib/signals';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ideas = (seed as Idea[]);
    const updated: Idea[] = [];
    for (const idea of ideas) {
      const term = idea.title ?? 'startup';
      const sig = await getSignals(term); // { google, reddit, hn }
      const base = heuristicScore({
        category: idea.category ?? 'general',
        countries: idea.best_markets?.map(b => b.country) ?? [],
        time_horizon_months: 12,
        signals: { google: sig.google, news: sig.hn, reddit: sig.reddit }
      });
      const scores = await aiScore(base, `${idea.title}. ${idea.summary ?? ''}`);
      updated.push({ ...idea, success_score: scores.success, confidence: scores.confidence });
    }
    await repoUpsertIdeas(updated);
    return NextResponse.json({ ok: true, count: updated.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message ?? 'unknown' }, { status: 500 });
  }
}