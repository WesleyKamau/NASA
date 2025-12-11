'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect tablet landscape mode
 * Detects any touch device in landscape orientation (iPhone, iPad, etc.)
 */
export function useTabletLandscape() {
  const [isTabletLandscape, setIsTabletLandscape] = useState(false);

  useEffect(() => {
    const checkTabletLandscape = () => {
      const isLandscape = typeof window !== 'undefined' && window.matchMedia('(orientation: landscape)').matches;
      const isTouchDevice = typeof navigator !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      setIsTabletLandscape(Boolean(isLandscape && isTouchDevice));
    };

    checkTabletLandscape();
    window.addEventListener('resize', checkTabletLandscape);
    window.addEventListener('orientationchange', checkTabletLandscape);
    
    return () => {
      window.removeEventListener('resize', checkTabletLandscape);
      window.removeEventListener('orientationchange', checkTabletLandscape);
    };
  }, []);

  return isTabletLandscape;
}
