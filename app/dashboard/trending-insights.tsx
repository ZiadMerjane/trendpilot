'use client';

import { useEffect, useState } from 'react';

type SignalData = {
  term: string;
  google: number;
  reddit: number;
  hn: number;
  category: string;
  total: number;
};

type SortField = 'total' | 'google' | 'reddit' | 'hn';
type SortDirection = 'asc' | 'desc';

export default function TrendingInsights() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SignalData[]>([]);
  const [sortField, setSortField] = useState<SortField>('total');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const topics = [
    { term: 'AI startups', category: 'ai-tools' },
    { term: 'No-code tools', category: 'nocode' },
    { term: 'Remote jobs', category: 'worktech' },
    { term: 'Climate tech', category: 'climate' },
    { term: 'Fintech tools', category: 'fintech' },
    { term: 'Creator tools', category: 'martech' },
    { term: 'Health tracking', category: 'healthtech' },
  ];

  useEffect(() => {
    async function fetchSignals() {
      const results: SignalData[] = [];
      for (const topic of topics) {
        const res = await fetch(`/api/signals?q=${encodeURIComponent(topic.term)}`);
        const json = await res.json();
        const total = Math.round((json.google + json.reddit + json.hn) / 3);
        results.push({ term: topic.term, category: topic.category, total, ...json });
      }
      setData(results);
      setLoading(false);
    }
    fetchSignals();
  }, []);

  const categories = ['all', ...new Set(topics.map(t => t.category))];

  const sortedAndFiltered = [...data]
    .filter(d => filterCategory === 'all' || d.category === filterCategory)
    .sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1;
      return (a[sortField] - b[sortField]) * mult;
    });

  if (loading)
    return (
      <div className="p-4 text-sm opacity-70">
        Fetching live trend signals...
      </div>
    );

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">🌍 Trending Insights</h3>
        <div className="flex gap-2 text-sm">
          <select 
            className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <select 
            className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1"
            value={sortField}
            onChange={e => setSortField(e.target.value as SortField)}
          >
            <option value="total">Overall</option>
            <option value="google">Google</option>
            <option value="reddit">Reddit</option>
            <option value="hn">HN</option>
          </select>
          <button
            className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1"
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
          >
            {sortDir === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
      {sortedAndFiltered.map((s) => (
        <div
          key={s.term}
          className="border-b border-neutral-800/30 pb-2 mb-2 last:border-0 last:mb-0"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{s.term}</span>
            <span className="text-xs px-2 py-0.5 bg-neutral-800/30 rounded">
              {s.category}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span>Overall: {s.total}</span>
            <span>Google: {s.google}</span>
            <span>Reddit: {s.reddit}</span>
            <span>HN: {s.hn}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
