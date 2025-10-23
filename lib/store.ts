'use client';
import { create } from 'zustand';
import type { Idea, Project } from '@/lib/types';
import seed from '@/lib/mock-ideas.json';
import { repoFetchIdeas, repoUpsertIdeas, repoFetchProjects, repoUpsertProject } from '@/lib/repo';

type State = {
  ideas: Idea[];
  projects: Project[];
  signedIn: boolean;
  addProject: (p: Project) => Promise<void>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  bootstrapFromCloud: () => Promise<void>;
};

const persistKey = 'trendpilot_state_v1';

function saveLocal(s: Pick<State, 'ideas'|'projects'>) {
  if (typeof window !== 'undefined') localStorage.setItem(persistKey, JSON.stringify(s));
}

// Initialize auth state
import { supabase } from '@/lib/supabase';

// Set up auth listener
if (typeof window !== 'undefined') {
  supabase.auth.getUser().then(({ data }) => {
    useStore.setState({ signedIn: !!data.user });
  });
  supabase.auth.onAuthStateChange((_, session) => {
    useStore.setState({ signedIn: !!session });
  });
}

export const useStore = create<State>((set, get) => ({
  ideas: [],
  projects: [],
  signedIn: false,
  addProject: async (p) => {
    // Cloud first
    await repoUpsertProject(p);
    // Local state
    const { ideas, projects } = get();
    const next = { ideas, projects: [...projects, p] };
    saveLocal(next); set(next);
  },
  updateProject: async (id, patch) => {
    const { ideas, projects } = get();
    const updated = projects.map(pr => pr.project_id === id ? { ...pr, ...patch } : pr);
    const target = updated.find(pr => pr.project_id === id)!;
    await repoUpsertProject(target);
    const next = { ideas, projects: updated };
    saveLocal(next); set(next);
  },
  bootstrapFromCloud: async () => {
    try {
      // download existing
      const [cloudIdeas, cloudProjects] = await Promise.all([repoFetchIdeas(), repoFetchProjects()]);
      // seed if empty
      const ideas = cloudIdeas.length ? cloudIdeas : (seed as Idea[]);
      if (!cloudIdeas.length) await repoUpsertIdeas(ideas);
      const projects = cloudProjects;
      saveLocal({ ideas, projects });
      set({ ideas, projects, addProject: get().addProject, updateProject: get().updateProject, bootstrapFromCloud: get().bootstrapFromCloud });
    } catch (e) {
      // Fallback to local mocks
      const ideas = (seed as Idea[]);
      const projects: Project[] = [];
      saveLocal({ ideas, projects });
      set({ ideas, projects, addProject: get().addProject, updateProject: get().updateProject, bootstrapFromCloud: get().bootstrapFromCloud });
      console.warn('Supabase unavailable, using local seed.', e);
    }
  }
}));
