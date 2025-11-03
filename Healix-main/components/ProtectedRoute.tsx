"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/utils/useIsMobile';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile(768); // Use 768px as mobile breakpoint

  useEffect(() => {
    // Define public routes based on mobile/desktop view
    let publicRoutes: string[];
    
    if (isMobile) {
      // In mobile view: only home and contact pages are public
      publicRoutes = ['/', '/Home', '/Contact', '/sign-in', '/sign-up'];
    } else {
      // In desktop view: keep original behavior
      publicRoutes = ['/', '/Contact', '/sign-in', '/sign-up'];
    }
    
    const isPublicRoute = publicRoutes.includes(pathname);

    // If not loading, not authenticated, and not on a public route, redirect to sign-in
    if (!loading && !user && !isPublicRoute) {
      const redirectUrl = `/sign-in?redirectTo=${encodeURIComponent(pathname)}`;
      router.push(redirectUrl);
    }
  }, [user, loading, pathname, router, isMobile]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Define public routes based on mobile/desktop view
  let publicRoutes: string[];
  
  if (isMobile) {
    // In mobile view: only home and contact pages are public
    publicRoutes = ['/', '/Home', '/Contact', '/sign-in', '/sign-up'];
  } else {
    // In desktop view: keep original behavior
    publicRoutes = ['/', '/Contact', '/sign-in', '/sign-up'];
  }
  
  const isPublicRoute = publicRoutes.includes(pathname);

  // If not authenticated and not on a public route, show nothing (will redirect)
  if (!user && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
