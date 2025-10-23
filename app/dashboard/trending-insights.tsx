'use client';

import { useEffect, useState } from 'react';

type SignalData = {
  term: string;
  google: number;
  reddit: number;
  hn: number;
};

export default function TrendingInsights() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SignalData[]>([]);

  const topics = [
    'AI startups',
    'No-code tools',
    'Remote jobs',
    'Climate tech',
    'Fintech',
  ];

  useEffect(() => {
    async function fetchSignals() {
      const results: SignalData[] = [];
      for (const t of topics) {
        const res = await fetch(`/api/signals?q=${encodeURIComponent(t)}`);
        const json = await res.json();
        results.push({ term: t, ...json });
      }
      setData(results);
      setLoading(false);
    }
    fetchSignals();
  }, []);

  if (loading)
    return (
      <div className="p-4 text-sm opacity-70">
        Fetching live trend signals...
      </div>
    );

  return (
    <div className="card p-4 space-y-3">
      <h3 className="font-semibold text-lg">🌍 Trending Insights</h3>
      {data.map((s) => (
        <div
          key={s.term}
          className="border-b border-neutral-800/30 pb-2 mb-2 last:border-0 last:mb-0"
        >
          <div className="font-medium">{s.term}</div>
          <div className="flex items-center gap-4 text-sm">
            <span>Google: {s.google}</span>
            <span>Reddit: {s.reddit}</span>
            <span>HN: {s.hn}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
