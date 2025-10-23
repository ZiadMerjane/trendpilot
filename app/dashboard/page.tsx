'use client';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import type { Idea } from '@/lib/types';
import Link from 'next/link';
import AuthButtons from '@/components/AuthButtons';

function ScoreBar({label,value}:{label:string;value:number}){
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-24 opacity-70">{label}</span>
      <div className="h-2 flex-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div className="h-full bg-neutral-900 dark:bg-white" style={{width:`${value}%`}} />
      </div>
      <span className="w-10 text-right">{value}%</span>
    </div>
  );
}

export default function Dashboard() {
  const ideas = useStore(s => s.ideas);
  const bootstrapFromCloud = useStore(s => s.bootstrapFromCloud);
  const signedIn = useStore(s => s.signedIn);

  useEffect(() => { bootstrapFromCloud(); }, [bootstrapFromCloud]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Trend Discovery Dashboard</h1>

      {!signedIn && (
        <div className="card p-4">
          <p className="mb-2">You're viewing demo data. Sign in to save ideas & projects to your account.</p>
          <AuthButtons />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ideas.map((idea: Idea)=>(
          <div key={idea.id} className="card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{idea.title}</div>
              <span className="badge border-neutral-300 dark:border-neutral-700">{idea.industry}</span>
            </div>
            <p className="text-sm opacity-80">{idea.summary}</p>
            <ScoreBar label="Success" value={idea.success_score} />
            <ScoreBar label="Confidence" value={Math.round(idea.confidence*100)} />
            <div className="flex gap-2 pt-2">
              <Link className="btn" href={`/ideas/${idea.id}`}>View Details</Link>
              <Link className="btn" href={`/projects/create?idea=${idea.id}`}>Accept</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
