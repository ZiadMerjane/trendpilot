import googleTrends from 'google-trends-api';

export type Signals = { google: number; reddit: number; hn: number };

function normalize(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export async function googleSignal(term: string): Promise<number> {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    const res = await googleTrends.interestOverTime({
      keyword: term,
      startTime: sixMonthsAgo,
      endTime: now,
      geo: '' // global
    });
    const payload = JSON.parse(res as unknown as string);
    const points: number[] = payload?.default?.timelineData?.map((p: any) => Number(p.value?.[0] ?? 0)) ?? [];
    if (!points.length) return 0;
    // weight recent weeks higher
    const w = points.map((v, i) => v * (0.6 + 0.4 * i / (points.length - 1)));
    const score = w.reduce((a, b) => a + b, 0) / w.length;
    return normalize(score);
  } catch {
    return 0;
  }
}

export async function redditSignal(term: string): Promise<number> {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(term)}&sort=new&limit=50&t=month`;
    const res = await fetch(url, { headers: { 'User-Agent': 'trendpilot/1.0' } });
    if (!res.ok) return 0;
    const json: any = await res.json();
    const posts = (json?.data?.children ?? []).map((c: any) => c.data);
    if (!posts.length) return 0;
    const karma = posts.reduce((sum: number, p: any) => sum + (p.ups ?? 0) + (p.num_comments ?? 0), 0);
    // scale by volume too
    const score = karma / posts.length;
    return normalize(Math.log10(1 + score) * 40 + Math.min(60, posts.length));
  } catch {
    return 0;
  }
}

export async function hnSignal(term: string): Promise<number> {
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(term)}&tags=story&numericFilters=points>5`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return 0;
    const json: any = await res.json();
    const hits = json?.hits ?? [];
    if (!hits.length) return 0;
    const pts = hits.reduce((s: number, h: any) => s + (h.points ?? 0), 0) / hits.length;
    return normalize(Math.log10(1 + pts) * 50 + Math.min(50, hits.length));
  } catch {
    return 0;
  }
}

export async function getSignals(term: string): Promise<Signals> {
  const [g, r, h] = await Promise.all([googleSignal(term), redditSignal(term), hnSignal(term)]);
  return { google: g, reddit: r, hn: h };
}
