'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthButtons() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signInGithub() {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
  }
  async function signOut() { await supabase.auth.signOut(); }

  return email ? (
    <div className="flex items-center gap-3 text-sm">
      <span className="opacity-70">{email}</span>
      <button className="btn" onClick={signOut}>Sign out</button>
    </div>
  ) : (
    <button className="btn" onClick={signInGithub}>Sign in with GitHub</button>
  );
}