import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is on a mobile device
 * Returns true for screens smaller than 768px (mobile/tablet)
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') return;

    // Initial check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook to detect if user prefers reduced motion
 * Useful for accessibility and performance
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Combined hook that returns true if animations should be disabled
 * Disables animations on mobile OR if user prefers reduced motion
 */
export function useShouldReduceMotion(): boolean {
  const isMobile = useIsMobile(640); // Mobile breakpoint at 640px
  const prefersReducedMotion = usePrefersReducedMotion();

  return isMobile || prefersReducedMotion;
}
