import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/login', '/signup'];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isPublic = publicRoutes.some((route) => path === route);

  const accessToken = req.cookies.get('accessToken')?.value;

  if (!isPublic && !accessToken) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (isPublic && accessToken) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
  ]
};
