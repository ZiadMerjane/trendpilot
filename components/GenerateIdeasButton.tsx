'use client';
import { useState } from 'react';
import { repoUpsertIdeas } from '@/lib/repo';
import { generateIdeasFromTopics } from '@/lib/idea-gen';
import { useStore } from '@/lib/store';

async function fetchSignals(term: string) {
  const r = await fetch(`/api/signals?q=${encodeURIComponent(term)}`);
  if (!r.ok) throw new Error('signals fetch failed');
  return await r.json(); // {google, reddit, hn}
}

export default function GenerateIdeasButton() {
  const [busy, setBusy] = useState(false);
  const signedIn = useStore(s => s.signedIn);
  const refresh = useStore(s => s.bootstrapFromCloud);

  async function onGenerate() {
    if (!signedIn) { alert('Sign in first to save ideas to your account.'); return; }
    setBusy(true);
    try {
      const topics = ['AI startups', 'No-code tools', 'Remote jobs', 'Climate tech', 'Fintech'];
      const sigs = await Promise.all(topics.map(async term => ({ term, signals: await fetchSignals(term) })));
      const ideas = await generateIdeasFromTopics(sigs as any);
      await repoUpsertIdeas(ideas as any);
      await refresh();
      alert(`Generated ${ideas.length} ideas from live trends ✅`);
    } catch (e: any) {
      console.error(e);
      alert('Generation failed. Check console.');
    } finally { setBusy(false); }
  }

  return (
    <button className="btn" onClick={onGenerate} disabled={busy}>
      {busy ? 'Generating…' : 'Generate Ideas from Trends'}
    </button>
  );
}
