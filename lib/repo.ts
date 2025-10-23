'use client';
import { supabase } from '@/lib/supabase';
import type { Idea, Project } from '@/lib/types';

/** ---------- IDEAS ---------- */
export async function repoFetchIdeas(): Promise<Idea[]> {
  const { data, error } = await supabase.from('ideas').select('data').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: any) => r.data as Idea);
}

export async function repoUpsertIdeas(list: Idea[]) {
  const rows = list.map(i => ({ id: i.id, data: i }));
  const { error } = await supabase.from('ideas').upsert(rows, { onConflict: 'id' });
  if (error) throw error;
}

/** ---------- PROJECTS ---------- */
export async function repoFetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('data').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: any) => r.data as Project);
}

export async function repoUpsertProject(p: Project) {
  const row = { id: p.project_id, idea_id: p.idea_id, data: p };
  const { error } = await supabase.from('projects').upsert([row], { onConflict: 'id' });
  if (error) throw error;
}

// Real-time subscription helper for projects
let _projectsSub: any = null;
export function repoSubscribeProjects(cb: (p: Project[]) => void) {
  // cleanup existing
  try { _projectsSub?.unsubscribe(); } catch {}
  _projectsSub = supabase.channel('projects_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, async (payload: any) => {
      try {
        const list = await repoFetchProjects();
        cb(list);
      } catch (e) {
        console.warn('Realtime projects fetch failed', e);
      }
    })
    .subscribe();
  return () => { try { _projectsSub.unsubscribe(); } catch {} };
}