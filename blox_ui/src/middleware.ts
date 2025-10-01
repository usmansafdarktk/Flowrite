// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

// Define public paths accessible without login
const PUBLIC_PATHS = ['/', '/signin', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoggedIn = request.cookies.get('access_token')?.value;
  console.log('isLoggedIn', isLoggedIn);
  // Check if it's a public path
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  // Match /blog/new and /blog/:id
  const isBlogPath = pathname === '/blog/new' || /^\/blog\/[^/]+$/.test(pathname);

  if (!isLoggedIn) {
    if (!isPublicPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  } else {
    if (!isBlogPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/blog/new';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
