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
      if (typeof window === 'undefined') return;
      
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTabletLandscape(Boolean(isLandscape && isTouchDevice));
    };

    checkTabletLandscape();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkTabletLandscape);
      window.addEventListener('orientationchange', checkTabletLandscape);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkTabletLandscape);
        window.removeEventListener('orientationchange', checkTabletLandscape);
      }
    };
  }, []);

  return isTabletLandscape;
}
