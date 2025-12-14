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
