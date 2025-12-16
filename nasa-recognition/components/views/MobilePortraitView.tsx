'use client';

import { useState, useEffect } from 'react';
import { GroupPhoto, Person } from '@/types';
import MobilePhotoCarousel from '@/components/MobilePhotoCarousel';
import OrganizedPersonGrid from '@/components/OrganizedPersonGrid';
import PersonModal from '@/components/PersonModal';
import BackToTop from '@/components/BackToTop';
import TMinusCounter from '@/components/TMinusCounter';
import { useViewportHeight } from '@/hooks/useViewportHeight';

interface MobilePortraitViewProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
}

export default function MobilePortraitView({ groupPhotos, people }: MobilePortraitViewProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  
  // Use custom viewport height hook for proper iOS Safari handling
  useViewportHeight();

  // Scroll to top on mount/reload
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle scroll effects - Minimal processing for iOS stability
  useEffect(() => {
    // Only hide scroll hint, no other processing
    const handleScroll = () => {
      if (window.scrollY > 100 && showScrollHint) {
        setShowScrollHint(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showScrollHint]);

  const handlePersonClick = (person: Person) => {
    // Scroll to the person's card without heavy DOM manipulation
    const personCardId = `person-card-mobile-portrait-${person.id}`;
    const cardElement = document.getElementById(personCardId);
    
    if (cardElement) {
      // Use simpler scrollIntoView without additional effects
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <>
      {/* Static overlay - No dynamic updates for iOS stability */}
      <div className="fixed inset-0 bg-black/30 pointer-events-none z-20" />

      {/* Main Content - Continuous Scroll with dark blur aesthetic */}
      <main className="relative z-40 min-h-viewport touch-native">
        {/* Photo Carousel Section - Full viewport height with proper iOS Safari handling */}
        <section className="relative min-h-viewport flex flex-col items-center justify-center px-3 safe-area-inset-top safe-area-inset-bottom">
          <div className="w-full max-w-2xl">
            <MobilePhotoCarousel
              groupPhotos={groupPhotos}
              people={people}
              onPersonClick={handlePersonClick}
            />
          </div>

          {/* Scroll Hint - Now has dedicated space at bottom without competing */}
          <div 
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000 safe-area-inset-bottom ${
              showScrollHint ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
            }`}
          >
            <div className="flex flex-col items-center gap-1.5">
              <div className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-full shadow-lg ring-1 ring-white/5">
                <p className="text-white/80 text-[9px] font-medium tracking-[0.2em] uppercase">
                  Scroll to Explore
                </p>
              </div>
              <div className="animate-bounce text-white/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Decorative Transition with blur */}
        <div className="relative z-10 py-12">
          <div className="flex items-center gap-6 px-4 opacity-50">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="text-white/40 text-2xl animate-spin-slow">✦</div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>

        {/* Intro Text with dark blur card */}
        <div className="relative z-10 px-4 pb-16">
          <div className="bg-black/60 border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto shadow-xl">
            <p className="text-lg font-light leading-relaxed text-slate-200 text-center">
              One of the most impactful parts of my NASA internship was all of the people I got to meet. 
              This lets you learn more about the people who made it special! :)
            </p>
          </div>
        </div>

        {/* People Section with modern styling */}
        <section className="relative z-10 px-4 pb-2">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 tracking-tight">
              The People
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full opacity-80" />
            <p className="text-slate-400 mt-6 font-light tracking-wide">
              Tap a card for more
            </p>
          </div>

          <OrganizedPersonGrid
            people={people}
            groupPhotos={groupPhotos}
            onPersonClick={setSelectedPerson}
            idPrefix="mobile-portrait-"
            uniformLayout={true}
          />
        </section>

        {/* Back to Top Button */}
        <BackToTop />

        {/* Footer with blur */}
        <footer className="relative z-10 bg-black/70 border-t border-white/5">
          <div className="text-center py-6 px-4 space-y-2.5">
            <div className="flex items-center justify-center">
              <TMinusCounter />
            </div>
            <p className="text-slate-500 text-sm font-light">
              Made by <a className="text-slate-400 hover:text-white transition-colors duration-300" href="https://wesleykamau.com" target="_blank" rel="noreferrer">Wesley Kamau</a>
            </p>
          </div>
        </footer>
      </main>

      {/* Person Modal */}
      {selectedPerson && (
        <PersonModal
          person={selectedPerson}
          groupPhotos={groupPhotos}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </>
  );
}
