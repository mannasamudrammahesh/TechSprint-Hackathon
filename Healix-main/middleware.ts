import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/", 
    "/Home", 
    "/Contact", 
    "/Chat",
    "/voice-demo",
    "/voice-test",
    "/api/uploadthing", 
    "/api/send", 
    "/api/chat",
    "/api/stt",
    "/api/tts",
    "/api/translate",
    "/api/emotion-detect",
    "/insights", 
    "/skin-analysis"
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
 