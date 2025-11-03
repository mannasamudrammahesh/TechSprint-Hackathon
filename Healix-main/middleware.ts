import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Function to detect mobile devices from User-Agent
function isMobileDevice(userAgent: string): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

// Routes that don't require authentication
function getPublicRoutes(isMobile: boolean): string[] {
  if (isMobile) {
    // In mobile view: only home and contact pages are public
    return [
      "/",
      "/Home",
      "/Contact",
      "/sign-in",
      "/sign-up",
      "/api/uploadthing",
    ];
  } else {
    // In desktop view: keep original behavior
    return [
      "/",
      "/Contact",
      "/sign-in",
      "/sign-up",
      "/api/uploadthing",
    ];
  }
}

// Routes to ignore completely
const ignoredRoutes = [
  "/api/health",
  "/_next",
  "/favicon.ico",
  "/logo.svg",
  "/public",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip ignored routes
  if (ignoredRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Detect if it's a mobile device
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = isMobileDevice(userAgent);
  
  // Get public routes based on device type
  const publicRoutes = getPublicRoutes(isMobile);
  
  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

  // Set cache headers for static files
  const response = NextResponse.next();
  if (pathname.startsWith('/_next/static')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // If it's a public route, allow access
  if (isPublicRoute) {
    return response;
  }

  // For protected routes, check authentication via cookies
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // If Supabase not configured, allow access (fallback to client-side protection)
      return response;
    }

    // Get the session token from cookies
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;

    // If no tokens found, redirect to sign-in
    if (!accessToken && !refreshToken) {
      const redirectUrl = new URL('/sign-in', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Create Supabase client for server-side
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    // Verify the session
    const { data: { user }, error } = await supabase.auth.getUser();

    // If no valid user, redirect to sign-in
    if (error || !user) {
      const redirectUrl = new URL('/sign-in', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch (error) {
    console.error('Middleware auth error:', error);
    // On error, allow access (fallback to client-side protection)
    return response;
  }
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
