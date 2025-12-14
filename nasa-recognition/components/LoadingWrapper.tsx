'use client';

import { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';

interface LoadingWrapperProps {
  children: React.ReactNode;
}

export default function LoadingWrapper({ children }: LoadingWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Preload critical assets
    const preloadAssets = async () => {
      // Wait for fonts and initial render
      if (document.fonts) {
        await document.fonts.ready;
      }
      // Additional preload logic can go here
    };

    preloadAssets();
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Slight delay before showing content for smooth transition
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  };

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
      <div
        className={`transition-opacity duration-500 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {children}
      </div>
    </>
  );
}
