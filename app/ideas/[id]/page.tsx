'use client';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Link from 'next/link';

export default function IdeaDetails(){
  const { id } = useParams<{id:string}>();
  const idea = useStore(s=>s.ideas.find(i=>i.id===id));
  const router = useRouter();
  if(!idea) return <div>Idea not found.</div>;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{idea.title}</h1>
        <Link className="btn" href={`/projects/create?idea=${idea.id}`}>Accept</Link>
      </div>
      <p className="opacity-80">{idea.summary}</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Competition</h2>
          <p className="text-sm opacity-80">{idea.competition.summary}</p>
          <ul className="list-disc pl-6 text-sm mt-2">{idea.competition.players.map(p=>(<li key={p.name}>{p.name}</li>))}</ul>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Best Markets</h2>
          <ul className="list-disc pl-6 text-sm">{idea.best_markets.map(m=>(<li key={m.country}>{m.country} — {m.reason}</li>))}</ul>
        </div>
      </div>
      <Link href="/dashboard" className="text-sm underline">← Back to Dashboard</Link>
    </div>
  );
}
