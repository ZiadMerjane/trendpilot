'use client';
import { create } from 'zustand';
import type { Idea, Project } from '@/lib/types';
import seed from '@/lib/mock-ideas.json';
import { repoFetchIdeas, repoUpsertIdeas, repoFetchProjects, repoUpsertProject, repoSubscribeProjects } from '@/lib/repo';

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

import { supabase } from '@/lib/supabase';

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
    const { data } = await supabase.auth.getSession();
    const authed = !!data.session;
    set({ signedIn: authed });

    if (!authed) {
      // show demo data when logged out
      const ideas = seed as Idea[];
      const projects: Project[] = [];
      saveLocal({ ideas, projects });
      set({ ideas, projects });
      return;
    }

    try {
      const [cloudIdeas, cloudProjects] = await Promise.all([repoFetchIdeas(), repoFetchProjects()]);
      const ideas = cloudIdeas.length ? cloudIdeas : (seed as Idea[]);
      if (!cloudIdeas.length) await repoUpsertIdeas(ideas);
      const projects = cloudProjects;
      saveLocal({ ideas, projects });
      set({ ideas, projects });

      // subscribe to realtime project updates
      if (authed) {
        repoSubscribeProjects((list) => {
          const { ideas } = get();
          saveLocal({ ideas, projects: list });
          set({ projects: list });
        });
      }
    } catch (e) {
      const ideas = seed as Idea[];
      const projects: Project[] = [];
      saveLocal({ ideas, projects });
      set({ ideas, projects });
      console.warn('Supabase unavailable, using local seed.', e);
    }
  }
}));

// Auth sync is now handled by AuthInit component
