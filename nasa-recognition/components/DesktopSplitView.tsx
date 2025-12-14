'use client';

import { useState } from 'react';
import { GroupPhoto, Person } from '@/types';
import PhotoCarousel from '@/components/PhotoCarousel';
import MobilePhotoCarousel from '@/components/MobilePhotoCarousel';
import OrganizedPersonGrid from '@/components/OrganizedPersonGrid';
import PersonModal from '@/components/PersonModal';
import BackToTop from '@/components/BackToTop';
import { useTabletLandscape } from '@/hooks/useTabletLandscape';
import { BIDIRECTIONAL_HIGHLIGHT_CONFIG, GENERAL_COMPONENT_CONFIG } from '@/lib/configs/componentsConfig';

interface DesktopSplitViewProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
}

export default function DesktopSplitView({ groupPhotos, people }: DesktopSplitViewProps) {
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
        rightPanel.scrollTo({ top: cardTop - 100, behavior: 'smooth' });
      }
      
      // Highlight the card briefly (yellow for click, white for hover is from isHighlighted)
      cardElement.classList.add('ring-2', 'ring-white/80', 'shadow-[0_0_30px_rgba(255,255,255,0.3)]', 'scale-[1.02]', 'transition-all', 'duration-500');
      
      // Open modal after a short delay (only on desktop, not on touch devices like iPad)
      setTimeout(() => {
        if (!isTabletLandscape) {
          setSelectedPerson(person);
        }
        cardElement.classList.remove('ring-2', 'ring-white/80', 'shadow-[0_0_30px_rgba(255,255,255,0.3)]', 'scale-[1.02]', 'transition-all', 'duration-500');
      }, GENERAL_COMPONENT_CONFIG.MODAL_AUTO_OPEN_DELAY_MS);
    }
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Left side - Photo Carousel (fixed) */}
        <div className="flex-shrink-0 h-full flex flex-col justify-center items-center p-8">
          <div 
            className="flex flex-col"
            style={{ 
              width: 'min(calc(50vw - 4rem), calc((100vh - 12rem) * 0.75))' 
            }}
          >
            <div className="w-full aspect-[3/4] relative flex items-center justify-center">
              {isTabletLandscape ? (
                <MobilePhotoCarousel
                  groupPhotos={groupPhotos}
                  people={people}
                  onPersonClick={handlePersonClick}
                  highlightedPersonId={BIDIRECTIONAL_HIGHLIGHT_CONFIG.ENABLE_TILE_HOVER_HIGHLIGHT ? highlightedPersonId : undefined}
                  onHighlightedPersonChange={BIDIRECTIONAL_HIGHLIGHT_CONFIG.ENABLE_TILE_HOVER_HIGHLIGHT ? setHighlightedPersonId : undefined}
                />
              ) : (
                <PhotoCarousel
                  groupPhotos={groupPhotos}
                  people={people}
                  onPersonClick={handlePersonClick}
                  highlightedPersonId={BIDIRECTIONAL_HIGHLIGHT_CONFIG.ENABLE_TILE_HOVER_HIGHLIGHT ? highlightedPersonId : undefined}
                  onHighlightedPersonChange={BIDIRECTIONAL_HIGHLIGHT_CONFIG.ENABLE_TILE_HOVER_HIGHLIGHT ? setHighlightedPersonId : undefined}
                />
              )}
            </div>
            <div className="mt-8 text-center flex-shrink-0">
              <p className="text-slate-400 text-sm font-light tracking-wider">
                Hover over faces to pause
              </p>
              <p className="text-slate-500 text-xs mt-2 font-light">
                Click to view profiles
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Scrollable content */}
        <div 
          id="desktop-right-panel"
          className="flex-1 overflow-y-auto bg-black/40 backdrop-blur-md border-l border-white/10"
          style={{
            touchAction: 'pan-y',
            webkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          } as React.CSSProperties}
        >
          <div className="p-12">
            {/* Header removed per request */}
            <header className="text-center mb-16 pt-8">
              <p className="text-xl font-light leading-relaxed text-slate-200 max-w-2xl mx-auto">
                One of the most impactful parts of my NASA internship was all of the people I got to meet. This lets you learn more about the people who made it special! :)
              </p>
            </header>

            {/* Decorative divider */}
            <div className="flex items-center gap-6 my-16 opacity-50">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="text-white/40 text-xl animate-spin-slow">✦</div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            {/* People Section */}
            <section className="mb-20">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 tracking-tight">
                  The People
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full opacity-80" />
                <p className="text-slate-400 mt-6 font-light tracking-wide">
                  Click on anyone to learn more about them
                </p>
              </div>
              
              <OrganizedPersonGrid
                people={people}
                groupPhotos={groupPhotos}
                onPersonClick={setSelectedPerson}
                idPrefix="desktop-"
                highlightedPersonId={highlightedPersonId}
                onPersonHover={BIDIRECTIONAL_HIGHLIGHT_CONFIG.ENABLE_TILE_HOVER_HIGHLIGHT ? setHighlightedPersonId : undefined}
              />
            </section>

            {/* Footer */}
            <BackToTop containerId="desktop-right-panel" />
            <footer className="text-center py-12 border-t border-white/5 mt-8">
              <p className="text-slate-500 text-sm font-light">
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
