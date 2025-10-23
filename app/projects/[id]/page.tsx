'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import Link from 'next/link';

export default function ProjectWorkspace(){
  const { id } = useParams<{id:string}>();
  const { projects, ideas } = useStore();
  const p = projects.find(x=>x.project_id===id);
  if (!p) return <div>Project not found.</div>;
  const idea = ideas.find(i=>i.id===p.idea_id);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Project: {idea?.title ?? p.project_id}</h1>
        {idea?.category.match(/app|website/) && <Link className="btn" href={`/builder/${p.project_id}`}>Generate App</Link>}
      </div>
      <div className="card p-4">
        <h2 className="font-semibold mb-2">Roadmap</h2>
        <ul className="list-disc pl-6 text-sm">
          {p.roadmap[0]?.tasks.map(t=>(<li key={t.id}>{t.title} — {t.role} ({t.effort_days}d)</li>))}
        </ul>
      </div>
    </div>
  );
}
