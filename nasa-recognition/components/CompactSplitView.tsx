'use client';

import { useState, useEffect } from 'react';
import { GroupPhoto, Person } from '@/types';
import MobilePhotoCarousel from '@/components/MobilePhotoCarousel';
import OrganizedPersonGrid from '@/components/OrganizedPersonGrid';
import PersonModal from '@/components/PersonModal';

interface CompactSplitViewProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
}

export default function CompactSplitView({ groupPhotos, people }: CompactSplitViewProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isTabletLandscape, setIsTabletLandscape] = useState(false);

  useEffect(() => {
    const checkTabletLandscape = () => {
      const isLandscape = typeof window !== 'undefined' && window.matchMedia('(orientation: landscape)').matches;
      const isTouchDevice = typeof navigator !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      // Detect any touch device in landscape (iPhone, iPad, etc.)
      setIsTabletLandscape(Boolean(isLandscape && isTouchDevice));
    };

    checkTabletLandscape();
    window.addEventListener('resize', checkTabletLandscape);
    window.addEventListener('orientationchange', checkTabletLandscape);
    return () => {
      window.removeEventListener('resize', checkTabletLandscape);
      window.removeEventListener('orientationchange', checkTabletLandscape);
    };
  }, []);

  const handlePersonClick = (person: Person) => {
    // Scroll to the person's card in the right panel
    const personCardId = `person-card-desktop-${person.id}`;
    const cardElement = document.getElementById(personCardId);
    
    if (cardElement) {
      // Scroll within the right panel
      const rightPanel = document.getElementById('desktop-right-panel');
      if (rightPanel) {
        const cardTop = cardElement.offsetTop;
        rightPanel.scrollTo({ top: cardTop - 50, behavior: 'smooth' });
      }
      
      // Highlight the card briefly
      cardElement.classList.add('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
      
      // Open modal after a short delay (only on desktop, not on touch devices like iPad)
      setTimeout(() => {
        if (!isTabletLandscape) {
          setSelectedPerson(person);
        }
        cardElement.classList.remove('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
      }, 1200);
    }
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden relative z-10">
        {/* Left side - Photo Carousel (fixed) - more compact */}
        <div className="w-1/2 flex-shrink-0 p-1 sm:p-2 flex flex-col items-center justify-center">
          <MobilePhotoCarousel
            groupPhotos={groupPhotos}
            people={people}
            onPersonClick={handlePersonClick}
            hideInstructions={true}
          />
        </div>

        {/* Right side - Scrollable content */}
        <div 
          id="desktop-right-panel"
          className="w-1/2 flex-shrink-0 overflow-y-auto bg-slate-900/30 border-l border-slate-700/50"
        >
          <div className="p-2 sm:p-3">
            {/* Header - more compact
            <header className="text-center mb-6 sm:mb-8 pt-4 sm:pt-6">
              <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-xl mx-auto px-2">
                One of the most impactful parts of my NASA internship was all of the people I got to meet. This lets you learn more about the people who made it special! :)
              </p>
            </header> */}

            {/* Decorative divider
            <div className="flex items-center gap-2 sm:gap-4 my-6 sm:my-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-slate-600" />
              <div className="text-slate-500 text-lg sm:text-xl animate-spin-slow">✦</div>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-600 to-slate-600" />
            </div> */}

            {/* People Section */}
            <section className="mb-4 sm:mb-6">
              {/* <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">
                  The People
                </h2>
                <div className="h-1 w-16 sm:w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full" />
                <p className="text-slate-400 mt-2 sm:mt-4 text-xs sm:text-sm">
                  Tap anyone to learn more
                </p>
              </div> */}
              
              <OrganizedPersonGrid
                people={people}
                groupPhotos={groupPhotos}
                onPersonClick={setSelectedPerson}
                idPrefix="desktop-"
                uniformLayout={true}
              />
            </section>

            {/* Footer */}
            <footer className="text-center py-4 sm:py-6 border-t border-slate-800/50 mt-4">
              <p className="text-slate-500 text-xs sm:text-sm">
                Made by <a className="underline hover:text-slate-300 transition" href="https://wesleykamau.com" target="_blank" rel="noreferrer">Wesley Kamau</a>
              </p>
            </footer>
          </div>
        </div>
      </div>

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
