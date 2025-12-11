'use client';

import { useEffect, useState } from 'react';
import { GroupPhoto, Person } from '@/types';
import MobilePhotoCarousel from './MobilePhotoCarousel';
import PhotoCarousel from './PhotoCarousel';
import PersonModal from './PersonModal';

interface SingleColumnViewProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
}

export default function SingleColumnView({ groupPhotos, people }: SingleColumnViewProps) {
  const [useTouchLayout, setUseTouchLayout] = useState(false);
  const [isLandscapeTablet, setIsLandscapeTablet] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  useEffect(() => {
    const detect = () => {
      if (typeof window === 'undefined') {
        // Set default values for SSR
        setUseTouchLayout(false);
        setIsLandscapeTablet(false);
        return;
      }
      
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const portraitTablet = window.innerWidth < 1200; // catch iPad portrait
      
      // Detect landscape tablet (iPad landscape: 1024px-1279px, landscape orientation)
      const landscapeTablet = touchCapable && window.innerWidth >= 1024 && 
                              window.innerWidth < 1280 && 
                              window.matchMedia('(orientation: landscape)').matches;
      
      setUseTouchLayout(coarse || (touchCapable && portraitTablet));
      setIsLandscapeTablet(landscapeTablet);
    };

    detect();
    window.addEventListener('resize', detect);
    return () => window.removeEventListener('resize', detect);
  }, []);

  const handlePersonClick = (person: Person) => {
    // iPad landscape uses desktop behavior (modal)
    if (isLandscapeTablet) {
      setSelectedPerson(person);
      return;
    }
    
    // Mobile/portrait tablet behavior: scroll to the person's card
    const personCardId = `person-card-mobile-${person.id}`;
    const cardElement = document.getElementById(personCardId);
    
    if (cardElement) {
      // Use a timeout to ensure the scroll happens after any layout updates
      setTimeout(() => {
        // Try multiple scrolling methods for better compatibility
        try {
          // Method 1: scrollIntoView
          cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (e) {
          // Fallback
        }
        
        // Method 2: window.scrollTo with calculation (as backup/reinforcement)
        const rect = cardElement.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const targetY = scrollTop + rect.top - (window.innerHeight / 2) + (rect.height / 2);
        
        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });
      }, 50);

      // Add a temporary highlight effect
      cardElement.classList.add('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
      setTimeout(() => {
        cardElement.classList.remove('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
      }, 2000);
    }
  };

  return (
    <>
      {/* Touch-first layout (phones, tablets, coarse/pen pointers) */}
      {useTouchLayout ? (
        <MobilePhotoCarousel 
          groupPhotos={groupPhotos} 
          people={people} 
          onPersonClick={handlePersonClick}
        />
      ) : (
        <PhotoCarousel 
          groupPhotos={groupPhotos} 
          people={people} 
          onPersonClick={handlePersonClick}
        />
      )}
      
      {/* Person Modal for landscape tablet */}
      {isLandscapeTablet && selectedPerson && (
        <PersonModal
          person={selectedPerson}
          groupPhotos={groupPhotos}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </>
  );
}
