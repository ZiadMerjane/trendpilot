export type ScoreInput = {
  category: string;
  countries: string[];
  time_horizon_months: number;  // how long trend likely lasts
  signals: { google?: number; news?: number; reddit?: number }; // 0..100
};

export function heuristicScore(i: ScoreInput) {
  const weights = { google: 0.45, news: 0.35, reddit: 0.20 };
  const signal =
    (i.signals.google ?? 0) * weights.google +
    (i.signals.news ?? 0) * weights.news +
    (i.signals.reddit ?? 0) * weights.reddit;

  const horizonBoost = Math.min(1, i.time_horizon_months / 12); // max boost at 12m+
  const categoryBoost =
    ['fintech','creator','smb','ai-tools','devtools'].includes(i.category.toLowerCase()) ? 1.08 : 1.0;

  const geoBonus = i.countries.length >= 5 ? 1.05 : 1.0;

  const success = Math.round(Math.min(100, signal * categoryBoost * geoBonus));
  const confidence = Math.round(Math.min(100, success * (0.6 + 0.4 * horizonBoost)));

  return { success, confidence };
}

export async function aiScore(fallback: ReturnType<typeof heuristicScore>, ideaText: string) {
  if (!process.env.NEXT_PUBLIC_OPENAI_KEY) return fallback;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role:'system', content:'Return JSON with {success, confidence} 0..100.' },
          { role:'user', content:`Idea: ${ideaText}\nBase: ${JSON.stringify(fallback)}` }
        ],
        temperature: 0.2,
      })
    });
    const json = await res.json();
    const text = json.choices?.[0]?.message?.content ?? '';
    const parsed = JSON.parse(text);
    return { success: parsed.success, confidence: parsed.confidence };
  } catch { return fallback; }
}