'use client';

import { useEffect, useState } from 'react';
import { LOADING_SCREEN_CONFIG } from '@/lib/configs/componentsConfig';
import { SITE_CONFIG } from '@/lib/configs/siteConfig';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  assetsLoaded: boolean;
  fontsLoaded: boolean;
}

export default function LoadingScreen({ onLoadingComplete, assetsLoaded, fontsLoaded }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Staggered entrance animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Ensure minimum display time for smooth UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, LOADING_SCREEN_CONFIG.MIN_LOADING_TIME_MS);

    return () => clearTimeout(timer);
  }, []);

  // Smooth progress animation that follows actual loading
  useEffect(() => {
    const targetProgress = fontsLoaded && assetsLoaded ? 100 :
                          fontsLoaded ? 60 :
                          assetsLoaded ? 70 : 30;

    const animateProgress = () => {
      setProgress(current => {
        const diff = targetProgress - current;
        if (Math.abs(diff) < 0.1) return targetProgress;
        return current + diff * 0.2;
      });
    };

    const interval = setInterval(animateProgress, 30);
    return () => clearInterval(interval);
  }, [fontsLoaded, assetsLoaded]);

  // Complete when min time elapsed, all assets loaded, AND progress bar reached 100%
  useEffect(() => {
    if (minTimeElapsed && assetsLoaded && fontsLoaded && progress >= 100) {
      setIsComplete(true);
      setTimeout(() => {
        setShouldHide(true);
        setTimeout(() => {
          onLoadingComplete?.();
        }, 300);
      }, 150);
    }
  }, [minTimeElapsed, assetsLoaded, fontsLoaded, progress, onLoadingComplete]);

  if (shouldHide) {
    return null;
  }

  const pct = Math.round(progress);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${
        isComplete ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#000' }}
    >
      {/* Deep space radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(15, 23, 42, 0.6) 0%, transparent 60%)',
        }}
      />

      {/* Content — no card, no border, just floating in space */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm mx-6">

        {/* Title — wide-tracked, staggered entrance */}
        <div
          className="text-center transition-all duration-700 ease-out"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          <h1
            className="text-white font-bold tracking-tight leading-none"
            style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)' }}
          >
            {SITE_CONFIG.title}
          </h1>
        </div>

        {/* Thin separator line */}
        <div
          className="w-12 h-px bg-white/20 my-6 transition-all duration-700 ease-out delay-100"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'scaleX(1)' : 'scaleX(0)',
          }}
        />

        {/* Progress section */}
        <div
          className="w-full transition-all duration-700 ease-out delay-200"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          {/* Progress line — thin and precise */}
          <div className="h-px w-full bg-white/10 relative overflow-hidden">
            <div
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-full bg-white/70 transition-transform duration-300 ease-out origin-left"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>

          {/* Status text — monospace, mission-control feel */}
          <p
            className="text-white/30 text-[11px] tracking-[0.25em] uppercase mt-3 text-center"
            style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
          >
            {pct < 100 ? `Initializing ${pct}%` : 'Ready'}
          </p>
        </div>
      </div>
    </div>
  );
}
