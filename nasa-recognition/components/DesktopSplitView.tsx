'use client';

import { useState } from 'react';
import { GroupPhoto, Person } from '@/types';
import PhotoCarousel from '@/components/PhotoCarousel';
import OrganizedPersonGrid from '@/components/OrganizedPersonGrid';
import PersonModal from '@/components/PersonModal';
import BackToTop from '@/components/BackToTop';

interface DesktopSplitViewProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
}

export default function DesktopSplitView({ groupPhotos, people }: DesktopSplitViewProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const handlePersonClick = (person: Person) => {
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
      
      // Highlight the card briefly
      cardElement.classList.add('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
      
      // Open modal after a short delay
      setTimeout(() => {
        setSelectedPerson(person);
        cardElement.classList.remove('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
      }, 1200);
    }
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Left side - Photo Carousel (fixed) */}
        <div className="w-1/2 flex-shrink-0 p-8 flex flex-col">
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <PhotoCarousel
              groupPhotos={groupPhotos}
              people={people}
              onPersonClick={handlePersonClick}
            />
          </div>
          <p className="text-center text-slate-500 text-sm mt-4">
            Hover over faces to pause • Click to view profiles
          </p>
        </div>

        {/* Right side - Scrollable content */}
        <div 
          id="desktop-right-panel"
          className="w-1/2 flex-shrink-0 overflow-y-auto bg-slate-900/30 border-l border-slate-700/50"
        >
          <div className="p-8">
            {/* Header removed per request */}
            <header className="text-center mb-12 pt-8">
              <p className="text-lg text-slate-300 max-w-xl mx-auto">
                One of the most impactful parts of my NASA internship was all of the people I got to meet. This lets you learn more about the people who made it special! :)
              </p>
            </header>

            {/* Decorative divider */}
            <div className="flex items-center gap-4 my-12">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-slate-600" />
              <div className="text-slate-500 text-2xl animate-spin-slow">✦</div>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-600 to-slate-600" />
            </div>

            {/* People Section */}
            <section className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">
                  The People
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full" />
                <p className="text-slate-400 mt-4">
                  Click on anyone to learn more about them
                </p>
              </div>
              
              <OrganizedPersonGrid
                people={people}
                groupPhotos={groupPhotos}
                onPersonClick={setSelectedPerson}
                idPrefix="desktop-"
              />
            </section>

            {/* Footer */}
            <BackToTop containerId="desktop-right-panel" />
            <footer className="text-center py-8 border-t border-slate-800/50 mt-4">
              <p className="text-slate-500 text-sm">
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
