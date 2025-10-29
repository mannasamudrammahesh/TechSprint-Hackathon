import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/Contact",
    "/api/uploadthing"
  ],
  afterAuth(auth, req) {
    // Add performance headers
    const response = NextResponse.next();

    // Enable browser caching for static assets
    if (req.nextUrl.pathname.startsWith('/_next/static')) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    return response;
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
