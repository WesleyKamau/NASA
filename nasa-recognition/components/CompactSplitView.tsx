'use client';

import { useState, useEffect } from 'react';
import { GroupPhoto, Person } from '@/types';
import MobilePhotoCarousel from '@/components/MobilePhotoCarousel';
import OrganizedPersonGrid from '@/components/OrganizedPersonGrid';
import PersonModal from '@/components/PersonModal';
import { useTabletLandscape } from '@/hooks/useTabletLandscape';
import { BIDIRECTIONAL_HIGHLIGHT_CONFIG } from '@/lib/configs/componentsConfig';

interface CompactSplitViewProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
}

export default function CompactSplitView({ groupPhotos, people }: CompactSplitViewProps) {
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
      
      // Highlight the card briefly (yellow for click, white for hover is from isHighlighted)
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
            highlightedPersonId={BIDIRECTIONAL_HIGHLIGHT_CONFIG.ENABLE_TILE_HOVER_HIGHLIGHT ? highlightedPersonId : undefined}
            onHighlightedPersonChange={BIDIRECTIONAL_HIGHLIGHT_CONFIG.ENABLE_TILE_HOVER_HIGHLIGHT ? setHighlightedPersonId : undefined}
          />
        </div>

        {/* Right side - Scrollable content */}
        <div 
          id="desktop-right-panel"
          className="w-1/2 flex-shrink-0 overflow-y-auto bg-slate-900/30 border-l border-slate-700/50"
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
