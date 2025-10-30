"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Public routes that don't require authentication
    const publicRoutes = ['/', '/Contact', '/sign-in', '/sign-up'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // If not loading, not authenticated, and not on a public route, redirect to sign-in
    if (!loading && !user && !isPublicRoute) {
      const redirectUrl = `/sign-in?redirectTo=${encodeURIComponent(pathname)}`;
      router.push(redirectUrl);
    }
  }, [user, loading, pathname, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/Contact', '/sign-in', '/sign-up'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If not authenticated and not on a public route, show nothing (will redirect)
  if (!user && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
