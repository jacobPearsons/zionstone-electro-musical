'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollToTop() {
  const pathname = usePathname();
  const lastPathname = useRef(pathname);
  const isRestoredNavigation = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      isRestoredNavigation.current = true;
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;

    if (isRestoredNavigation.current) {
      isRestoredNavigation.current = false;
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion ? 'instant' : 'auto',
    });
  }, [pathname]);

  return null;
}
