'use client';

import { useState, useEffect, useCallback } from 'react';

// Reference counter for multiple hook instances
let instanceCount = 0;

/**
 * Custom hook to handle viewport height correctly on mobile devices,
 * particularly iOS Safari where the address bar affects the visible area.
 * 
 * This hook sets CSS custom properties that can be used throughout the app:
 * - --vh: 1% of the actual visible viewport height
 * - --viewport-height: The full visible viewport height
 * 
 * It also returns the current viewport height for direct use in components.
 */
export function useViewportHeight() {
  const [viewportHeight, setViewportHeight] = useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 0
  );
  const [isReady, setIsReady] = useState(false);

  const updateViewportHeight = useCallback(() => {
    // Use visualViewport API if available (better for mobile browsers)
    const vh = window.visualViewport?.height ?? window.innerHeight;
    
    // Set CSS custom property for use in styles
    document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
    document.documentElement.style.setProperty('--viewport-height', `${vh}px`);
    
    setViewportHeight(vh);
  }, []);

  useEffect(() => {
    // Increment instance count
    instanceCount++;
    
    // Initial update
    updateViewportHeight();
    setIsReady(true);

    // Create a stable reference to the callback for event listeners
    // This prevents accumulation of stale closures across HMR/refreshes
    const handler = () => updateViewportHeight();

    // Listen to events that change viewport height (not scroll - avoid performance issues)
    window.addEventListener('resize', handler);
    window.addEventListener('orientationchange', handler);
    
    // visualViewport API provides more accurate updates on mobile
    // Only listen to resize, not scroll (scroll events can cause performance issues)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handler);
    }

    // Handle page show (for iOS Safari when returning to the page)
    window.addEventListener('pageshow', handler);

    return () => {
      // Decrement instance count
      instanceCount--;
      
      window.removeEventListener('resize', handler);
      window.removeEventListener('orientationchange', handler);
      window.removeEventListener('pageshow', handler);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handler);
      }
      
      // Only clean up CSS custom properties if this is the last instance
      if (instanceCount === 0) {
        document.documentElement.style.removeProperty('--vh');
        document.documentElement.style.removeProperty('--viewport-height');
      }
    };
  }, [updateViewportHeight]);

  return {
    viewportHeight,
    isReady,
    // Utility function to calculate height based on viewport
    calcHeight: (percentage: number) => viewportHeight * (percentage / 100),
  };
}

/**
 * Provider component that initializes viewport height tracking.
 * Should be placed high in the component tree.
 */
export function ViewportHeightProvider({ children }: { children: React.ReactNode }) {
  useViewportHeight();
  return <>{children}</>;
}
