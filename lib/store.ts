'use client';
import { create } from 'zustand';
import type { Idea, Project, Task, ComponentTree } from '@/lib/types';

type State = {
  ideas: Idea[];
  projects: Project[];
  addProject: (p: Project) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
};

const persistKey = 'trendpilot_state_v1';

function load(): Pick<State, 'ideas'|'projects'> {
  if (typeof window === 'undefined') return { ideas: [], projects: [] };
  try { const raw = window.localStorage.getItem(persistKey); if (raw) return JSON.parse(raw); } catch {}
  return { ideas: [], projects: [] };
}
function save(s: Pick<State, 'ideas'|'projects'>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(persistKey, JSON.stringify(s));
}

export const useStore = create<State>((set, get) => ({
  ideas: [],
  projects: [],
  addProject: (p) => { const { ideas, projects } = get(); const next = { ideas, projects: [...projects, p] }; save(next); set(next); },
  updateProject: (id, patch) => { const { ideas, projects } = get(); const nextProjects = projects.map(pr => pr.project_id===id? {...pr, ...patch }: pr); const next = { ideas, projects: nextProjects }; save(next); set(next); }
}));

// Seed ideas on first client load
export function seedIdeas(list: Idea[]) {
  const s = useStore.getState();
  if (!s.ideas || s.ideas.length === 0) {
    useStore.setState({ ...s, ideas: list });
    save({ ideas: list, projects: s.projects });
  }
}
