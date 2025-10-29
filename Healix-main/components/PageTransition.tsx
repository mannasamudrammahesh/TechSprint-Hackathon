"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Prefetch links on hover for instant navigation
 */
export function usePrefetchLinks() {
  useEffect(() => {
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="/"]');
      
      if (link) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http')) {
          // Prefetch the page
          const router = useRouter();
          router.prefetch(href);
        }
      }
    };

    document.addEventListener('mouseenter', handleMouseEnter, true);
    return () => document.removeEventListener('mouseenter', handleMouseEnter, true);
  }, []);
}

/**
 * Show loading indicator during navigation
 */
export function NavigationProgress() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Page loaded, hide any loading indicators
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }, [pathname]);

  return null;
}
