import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/Contact",
  "/sign-in",
  "/sign-up",
  "/api/uploadthing",
];

// Routes that should always be accessible
const ignoredRoutes = [
  "/api/health",
  "/_next",
  "/favicon.ico",
  "/logo.svg",
  "/public",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route should be ignored
  if (ignoredRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

  // Add performance headers
  const response = NextResponse.next();

  // Enable browser caching for static assets
  if (pathname.startsWith('/_next/static')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // For now, allow all routes (authentication will be handled client-side)
  // You can add server-side auth checks here if needed
  return response;
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
