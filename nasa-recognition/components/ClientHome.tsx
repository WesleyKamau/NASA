'use client';

import { useEffect, useState, useRef } from 'react';
import { GroupPhoto, Person } from '@/types';
import { preloadAll } from '@/lib/preload';
import DesktopSplitView from '@/components/DesktopSplitView';
import CompactSplitView from '@/components/CompactSplitView';
import SingleColumnView from '@/components/SingleColumnView';
import OrganizedPersonGrid from '@/components/OrganizedPersonGrid';

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-8 sm:mb-12">
      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
        {title}
      </h2>
      <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full" />
      {subtitle && (
        <p className="text-slate-400 mt-4 text-sm sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface ClientHomeProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
}

export default function ClientHome({ groupPhotos, people }: ClientHomeProps) {
  const [useSplitView, setUseSplitView] = useState(false);
  const [useCompactSplit, setUseCompactSplit] = useState(false);
  const hasPreloaded = useRef(false);

  // Preload all images and highlights on component mount
  useEffect(() => {
    if (!hasPreloaded.current) {
      hasPreloaded.current = true;
      preloadAll(groupPhotos, people).catch(error => {
        console.error('Failed to preload assets:', error);
      });
    }
  }, [groupPhotos, people]);

  useEffect(() => {
    const checkLayout = () => {
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isXL = window.innerWidth >= 1280;
      
      // Use split view on:
      // 1. XL screens (desktop) - use full DesktopSplitView
      // 2. Touch devices in landscape orientation - use CompactSplitView
      const shouldUseSplitView = isXL || (isTouchDevice && isLandscape);
      setUseSplitView(shouldUseSplitView);
      
      // Determine if we should use compact version
      setUseCompactSplit(window.innerWidth < 1280 && shouldUseSplitView);
    };

    checkLayout();
    window.addEventListener('resize', checkLayout);
    window.addEventListener('orientationchange', checkLayout);
    
    return () => {
      window.removeEventListener('resize', checkLayout);
      window.removeEventListener('orientationchange', checkLayout);
    };
  }, []);

  if (useSplitView) {
    if (useCompactSplit) {
      return (
        <CompactSplitView
          groupPhotos={groupPhotos}
          people={people}
        />
      );
    }
    return (
      <DesktopSplitView
        groupPhotos={groupPhotos}
        people={people}
      />
    );
  }

  return (
    <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Photo Carousel Section */}
      <section className="mb-12">
        <SingleColumnView
          groupPhotos={groupPhotos}
          people={people}
        />
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm font-light tracking-wider">
            Hover or tap faces to interact
          </p>
        </div>
      </section>

      <div className="text-center mb-16">
        <p className="text-lg sm:text-xl font-light leading-relaxed text-slate-200 max-w-3xl mx-auto px-4">
          One of the most impactful parts of my NASA internship was all of the people I got to meet. This lets you learn more about the people who made it special! :)
        </p>
      </div>

      {/* Decorative divider */}
      <div className="flex items-center gap-6 my-16 sm:my-20 opacity-50">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="text-white/40 text-xl sm:text-2xl animate-spin-slow">✦</div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* People Section */}
      <section className="mb-16 sm:mb-24">
        <SectionHeader 
          title="The People"
          subtitle="Click on anyone to learn more about them"
        />
        
        <OrganizedPersonGrid
          people={people}
          groupPhotos={groupPhotos}
          idPrefix="mobile-"
        />
      </section>

      {/* Footer */}
      <footer className="text-center py-8 sm:py-12 border-t border-white/5 mt-8">
        <p className="text-slate-500 text-sm font-light">
          Made by <a className="text-slate-400 hover:text-white transition-colors duration-300" href="https://wesleykamau.com" target="_blank" rel="noreferrer">Wesley Kamau</a>
        </p>
      </footer>
    </main>
  );
}
