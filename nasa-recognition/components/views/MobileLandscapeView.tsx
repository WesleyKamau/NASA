'use client';

import { useState } from 'react';
import { GroupPhoto, Person } from '@/types';
import MobilePhotoCarousel from '@/components/MobilePhotoCarousel';
import OrganizedPersonGrid from '@/components/OrganizedPersonGrid';
import PersonModal from '@/components/PersonModal';
import TMinusCounter from '@/components/TMinusCounter';
import { useTabletLandscape } from '@/hooks/useTabletLandscape';
import { BIDIRECTIONAL_HIGHLIGHT_CONFIG, GENERAL_COMPONENT_CONFIG } from '@/lib/configs/componentsConfig';

interface MobileLandscapeViewProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
}

export default function MobileLandscapeView({ groupPhotos, people }: MobileLandscapeViewProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [highlightedPersonId, setHighlightedPersonId] = useState<string | null>(null);
  const isTabletLandscape = useTabletLandscape();

  const handlePersonClick = (person: Person) => {
    // Highlight the person's tile
    setHighlightedPersonId(person.id);

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
      
      // Highlight the card briefly (white glow for modern look)
      cardElement.classList.add('ring-2', 'ring-white/80', 'shadow-[0_0_30px_rgba(255,255,255,0.3)]', 'scale-[1.02]', 'transition-all', 'duration-500');
      
      // Open modal after a short delay (only on desktop, not on touch devices like iPad)
      setTimeout(() => {
        if (!isTabletLandscape) {
          setSelectedPerson(person);
        }
        cardElement.classList.remove('ring-2', 'ring-white/80', 'shadow-[0_0_30px_rgba(255,255,255,0.3)]', 'scale-[1.02]', 'transition-all', 'duration-500');
      }, 1200);
    }
  };

  return (
    <>
      {/* Blur overlay for background */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm pointer-events-none z-20"
        style={{ opacity: GENERAL_COMPONENT_CONFIG.SCROLLED_BLUR_OPACITY }}
      />
      
      <div className="flex h-screen overflow-hidden relative z-40">
        {/* Left side - Photo Carousel (fixed) - more compact */}
        <div className="w-1/2 flex-shrink-0 p-1 sm:p-2 flex flex-col items-center justify-center">
          <MobilePhotoCarousel
            groupPhotos={groupPhotos}
            people={people}
            onPersonClick={handlePersonClick}
            hideInstructions={true}
            highlightedPersonId={BIDIRECTIONAL_HIGHLIGHT_CONFIG.ENABLE_TILE_HOVER_HIGHLIGHT ? highlightedPersonId : undefined}
            onHighlightedPersonChange={BIDIRECTIONAL_HIGHLIGHT_CONFIG.ENABLE_TILE_HOVER_HIGHLIGHT ? setHighlightedPersonId : undefined}
          />
        </div>

        {/* Right side - Scrollable content */}
        <div 
          id="desktop-right-panel"
          className="w-1/2 flex-shrink-0 overflow-y-auto bg-black/30 backdrop-blur-md border-l border-white/10"
          style={{
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          } as React.CSSProperties}
        >
          <div className="p-2 sm:p-3">
            {/* People Section */}
            <section className="mb-4 sm:mb-6">
              <OrganizedPersonGrid
                people={people}
                groupPhotos={groupPhotos}
                onPersonClick={setSelectedPerson}
                idPrefix="desktop-"
                uniformLayout={true}
                highlightedPersonId={highlightedPersonId}
                onPersonHover={BIDIRECTIONAL_HIGHLIGHT_CONFIG.ENABLE_TILE_HOVER_HIGHLIGHT ? setHighlightedPersonId : undefined}
              />
            </section>

            {/* Footer */}
            <footer className="text-center py-3 sm:py-4 border-t border-white/5 mt-4 space-y-2">
              <div className="flex justify-center">
                <TMinusCounter />
              </div>
              <p className="text-slate-500 text-xs sm:text-sm font-light">
                Made by <a className="text-slate-400 hover:text-white transition-colors duration-300" href="https://wesleykamau.com" target="_blank" rel="noreferrer">Wesley Kamau</a>
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
