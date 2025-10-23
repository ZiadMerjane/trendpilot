'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import type { Project, Task } from '@/lib/types';
import Link from 'next/link';

function createTasks(prefix:string): Task[] {
  return [
    { id:`${prefix}-spec`, title:"Define MVP scope", role:"product", effort_days:2, dependencies:[] },
    { id:`${prefix}-ui`, title:"Design UI skeleton", role:"designer", effort_days:3, dependencies:[`${prefix}-spec`] },
    { id:`${prefix}-api`, title:"Create API routes", role:"backend", effort_days:3, dependencies:[`${prefix}-spec`] },
    { id:`${prefix}-front`, title:"Build pages", role:"frontend", effort_days:5, dependencies:[`${prefix}-ui`, `${prefix}-api`] }
  ]
}
export default function CreateProject(){
  const params = useSearchParams();
  const ideaId = params.get('idea') ?? 'custom';
  const store = useStore();
  const router = useRouter();
  const idea = store.ideas.find(i=>i.id===ideaId);
  if(!idea) return <div>Idea not found.</div>;
  const projectId = `${idea.id}-${Math.random().toString(36).slice(2,6)}`;
  const project: Project = {
    project_id: projectId,
    idea_id: idea.id,
    status: "active",
    kpis: [{name:"Waitlist signups", target:"100", period:"monthly"}],
    roadmap: [{ milestone:"MVP", eta:"2025-11-15", tasks: createTasks(projectId)}],
    monitors: [{type:"keyword", query:`${idea.title}`, frequency:"daily"}],
    app_repo_ref: null,
    ui_component_tree: undefined
  };
  store.addProject(project);
  if (typeof window !== 'undefined') router.replace(`/projects/${projectId}`);
  return <div className="space-y-2"><p>Creating project…</p><Link href="/projects">Go to projects</Link></div>;
}
