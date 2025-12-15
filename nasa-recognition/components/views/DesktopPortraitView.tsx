'use client';

import { useState, useEffect, useRef } from 'react';
import { GroupPhoto, Person } from '@/types';
import PhotoCarousel from '@/components/PhotoCarousel';
import OrganizedPersonGrid from '@/components/OrganizedPersonGrid';
import PersonModal from '@/components/PersonModal';
import BackToTop from '@/components/BackToTop';
import StarfieldBackground from '@/components/StarfieldBackground';
import GalaxyBackground from '@/components/GalaxyBackground';
import TMinusCounter from '@/components/TMinusCounter';
import { GENERAL_COMPONENT_CONFIG } from '@/lib/configs/componentsConfig';

interface DesktopPortraitViewProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
}

export default function DesktopPortraitView({ groupPhotos, people }: DesktopPortraitViewProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const blurLayerRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount/reload
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle scroll effects (Blur fade and Scroll hint)
  useEffect(() => {
    let fadeTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Update blur opacity
      if (blurLayerRef.current) {
        const windowHeight = window.innerHeight;
        // Fade out over the first viewport height, but keep some blur
        const opacity = Math.max(
          GENERAL_COMPONENT_CONFIG.SCROLLED_BLUR_OPACITY,
          GENERAL_COMPONENT_CONFIG.INITIAL_BLUR_OPACITY - (scrollY / windowHeight)
        );
        blurLayerRef.current.style.opacity = opacity.toString();
      }

      // Handle scroll hint
      if (scrollY > 100 && showScrollHint) {
        fadeTimeout = setTimeout(() => {
          setShowScrollHint(false);
        }, 300);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (fadeTimeout) clearTimeout(fadeTimeout);
    };
  }, [showScrollHint]);

  const handlePersonClick = (person: Person) => {
    // Scroll to the person's card
    const personCardId = `person-card-desktop-portrait-${person.id}`;
    const cardElement = document.getElementById(personCardId);
    
    if (cardElement) {
      setTimeout(() => {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight effect
        cardElement.classList.add('ring-2', 'ring-white/80', 'shadow-[0_0_30px_rgba(255,255,255,0.3)]', 'scale-[1.02]', 'transition-all', 'duration-500');
        setTimeout(() => {
          cardElement.classList.remove('ring-2', 'ring-white/80', 'shadow-[0_0_30px_rgba(255,255,255,0.3)]', 'scale-[1.02]', 'transition-all', 'duration-500');
        }, 2000);
      }, GENERAL_COMPONENT_CONFIG.SCROLL_TO_CARD_DELAY_MS);
    }
  };

  return (
    <>
      {/* Dynamic Blur Layer - Fixed position, fades on scroll */}
      <div 
        ref={blurLayerRef}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm pointer-events-none z-20 transition-opacity duration-0"
        style={{ opacity: GENERAL_COMPONENT_CONFIG.INITIAL_BLUR_OPACITY }}
      />

      {/* Main Content - Continuous Scroll with dark blur aesthetic */}
      <main className="relative z-40 min-h-screen">
        {/* Photo Carousel Section - Constrained height */}
        <section className="relative h-screen flex flex-col items-center justify-center px-3 py-20">
          <div className="w-full max-w-[92vw] max-h-[75vh]">
            <div className="h-full flex items-center justify-center">
              <div className="w-full h-full max-h-full overflow-hidden flex items-center justify-center">
                <PhotoCarousel
                  groupPhotos={groupPhotos}
                  people={people}
                  onPersonClick={handlePersonClick}
                />
              </div>
            </div>
          </div>

          {/* Scroll Hint - Smooth fade animation */}
          <div 
            className={`absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-all duration-1000 ${
              showScrollHint ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-lg ring-1 ring-white/5">
                <p className="text-white/80 text-[10px] font-medium tracking-[0.2em] uppercase">
                  Scroll to Explore
                </p>
              </div>
              <div className="animate-bounce text-white/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto shadow-xl">
            <p className="text-lg font-light leading-relaxed text-slate-200 text-center">
              One of the most impactful parts of my NASA internship was all of the people I got to meet. 
              This lets you learn more about the people who made it special! :)
            </p>
          </div>
        </div>

        {/* People Section with modern styling */}
        <section className="relative z-10 px-4 pb-20">
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
            idPrefix="desktop-portrait-"
            uniformLayout={false}
          />
        </section>

        {/* Back to Top Button */}
        <BackToTop />

        {/* Footer with blur */}
        <footer className="relative z-10 bg-black/30 backdrop-blur-md border-t border-white/5">
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
