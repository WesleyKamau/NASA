'use client';

import { useEffect, useState } from 'react';
import { GroupPhoto, Person } from '@/types';
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
        <p className="text-center text-slate-500 text-sm mt-4">
          Hover or tap faces to interact
        </p>
      </section>

      <div className="text-center mb-12">
        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto px-4">
          One of the most impactful parts of my NASA internship was all of the people I got to meet. This lets you learn more about the people who made it special! :)
        </p>
      </div>

      {/* Decorative divider */}
      <div className="flex items-center gap-4 my-12 sm:my-16">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-slate-600" />
        <div className="text-slate-500 text-xl sm:text-2xl animate-spin-slow">✦</div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-600 to-slate-600" />
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
      <footer className="text-center py-6 sm:py-8 border-t border-slate-800/50 mt-4">
        <p className="text-slate-500 text-sm">
          Made by <a className="underline hover:text-slate-300 transition" href="https://wesleykamau.com" target="_blank" rel="noreferrer">Wesley Kamau</a>
        </p>
      </footer>
    </main>
  );
}
