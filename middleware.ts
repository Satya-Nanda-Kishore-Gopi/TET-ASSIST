import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/tests', '/tet-test', '/study', '/study-plan', '/chat', '/ask-ai'];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Convenience redirect for /ask-ai to /chat
  if (pathname === '/ask-ai' || pathname.startsWith('/ask-ai/')) {
    const url = req.nextUrl.clone();
    url.pathname = '/chat';
    return NextResponse.redirect(url);
  }

  // All routes are open for anonymous access - no authentication redirects
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
