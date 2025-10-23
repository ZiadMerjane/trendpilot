'use client';
import Link from 'next/link';
import { useStore } from '@/lib/store';

export default function ProjectsList(){
  const projects = useStore(s=>s.projects);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Projects</h1>
      <div className="grid gap-3">
        {projects.map(p=>(
          <div className="card p-4 flex items-center justify-between" key={p.project_id}>
            <div>
              <div className="font-semibold">{p.project_id}</div>
              <div className="opacity-70 text-sm">Status: {p.status}</div>
            </div>
            <Link className="btn" href={`/projects/${p.project_id}`}>Open</Link>
          </div>
        ))}
        {projects.length===0 && <div className="opacity-70">No projects yet. Accept an idea from the dashboard.</div>}
      </div>
    </div>
  );
}
