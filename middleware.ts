import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/projects',
  '/builder',
  '/visual-editor',
  '/ideas'
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return req.cookies.get(name)?.value },
        set(name, value, options) { res.cookies.set({ name, value, ...options }) },
        remove(name, options) { res.cookies.delete({ name, ...options }) }
      }
    }
  );

  // Check auth status
  const { data: { session } } = await supabase.auth.getSession();

  // Handle protected routes
  const path = req.nextUrl.pathname;
  const isProtected = PROTECTED_ROUTES.some(r => path.startsWith(r));
  const isAuthed = !!session;

  if (isProtected && !isAuthed) {
    const redirectUrl = new URL('/', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}