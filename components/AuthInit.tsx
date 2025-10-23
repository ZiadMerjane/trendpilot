'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { repoSubscribeProjects } from '@/lib/repo';

export default function AuthInit() {
  const bootstrap = useStore(s => s.bootstrapFromCloud);

  useEffect(() => {
    let unsubscribeProjects: (() => void) | undefined;

    // Set initial state on first load
    supabase.auth.getSession().then(({ data }) => {
      const authed = !!data.session;
      useStore.setState({ signedIn: authed });
      if (authed) {
        bootstrap();
        // subscribe to projects realtime
        unsubscribeProjects = repoSubscribeProjects((list) => {
          useStore.setState((s) => ({ ...s, projects: list } as any));
        });
      }
    });

    // React to future sign-in / sign-out
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const authed = !!session;
      useStore.setState({ signedIn: authed });
      if (authed) {
        bootstrap();
        unsubscribeProjects = repoSubscribeProjects((list) => {
          useStore.setState((s) => ({ ...s, projects: list } as any));
        });
      } else {
        // cleanup
        if (unsubscribeProjects) unsubscribeProjects();
        unsubscribeProjects = undefined;
      }
    });

    return () => {
      try { sub.subscription.unsubscribe(); } catch {}
      if (unsubscribeProjects) unsubscribeProjects();
    };
  }, [bootstrap]);

  return null;
}