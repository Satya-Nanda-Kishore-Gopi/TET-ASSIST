import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/tests', '/tet-test', '/study', '/study-plan', '/chat', '/ask-ai'];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Check if current route is protected
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    // Check for active TET session cookie or Supabase auth token cookie
    const tetSession = req.cookies.get('tet_session')?.value;
    const hasSupabaseToken = req.cookies
      .getAll()
      .some((c: { name: string; value: string }) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token') && Boolean(c.value));

    const isAuthenticated = Boolean(tetSession || hasSupabaseToken);

    if (!isAuthenticated) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.search = `returnUrl=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(loginUrl);
    }
  }

  // Convenience redirect for /ask-ai to /chat for authenticated users
  if (pathname === '/ask-ai' || pathname.startsWith('/ask-ai/')) {
    const url = req.nextUrl.clone();
    url.pathname = '/chat';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/tests/:path*',
    '/tet-test/:path*',
    '/study/:path*',
    '/study-plan/:path*',
    '/chat/:path*',
    '/ask-ai/:path*',
  ],
};
