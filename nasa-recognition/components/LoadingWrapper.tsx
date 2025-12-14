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
  const [showContent, setShowContent] = useState(false);
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
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  };

  return (
    <LoadingContext.Provider value={{ setAssetsLoaded }}>
      {isLoading && (
        <LoadingScreen 
          onLoadingComplete={handleLoadingComplete}
          assetsLoaded={assetsLoaded}
          fontsLoaded={fontsLoaded}
        />
      )}
      <div
        className={`transition-opacity duration-500 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {children}
      </div>
    </LoadingContext.Provider>
  );
}
