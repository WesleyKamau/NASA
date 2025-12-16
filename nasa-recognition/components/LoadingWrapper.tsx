'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import LoadingScreen from './LoadingScreen';

interface LoadingWrapperProps {
  children: React.ReactNode;
}

interface LoadingContextType {
  setAssetsLoaded: (loaded: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export function useLoadingContext() {
  return useContext(LoadingContext);
}

export default function LoadingWrapper({ children }: LoadingWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Disable scrolling while loading
  useEffect(() => {
    // Store original values to restore them later (important for HMR)
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyHeight = document.body.style.height;
    const originalDocOverflow = document.documentElement.style.overflow;

    if (showOverlay) {
      // Prevent scrolling on body
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling by restoring originals
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.height = originalBodyHeight;
      document.documentElement.style.overflow = originalDocOverflow;
    }

    return () => {
      // Cleanup on unmount - restore original values
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.height = originalBodyHeight;
      document.documentElement.style.overflow = originalDocOverflow;
    };
  }, [showOverlay]);

  useEffect(() => {
    // Wait for fonts to load
    const loadFonts = async () => {
      if (document.fonts) {
        await document.fonts.ready;
      }
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Fade-out overlay; keep children always rendered so backdrop blur is unaffected
    setTimeout(() => {
      setShowOverlay(false);
    }, 500);
  };

  return (
    <LoadingContext.Provider value={{ setAssetsLoaded }}>
      {showOverlay && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-500 ${
            isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <LoadingScreen 
            onLoadingComplete={handleLoadingComplete}
            assetsLoaded={assetsLoaded}
            fontsLoaded={fontsLoaded}
          />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
}
