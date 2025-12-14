'use client';

import { useEffect, useState } from 'react';
import { GroupPhoto, Person } from '@/types';
import MobilePhotoCarousel from '@/components/MobilePhotoCarousel';
import PhotoCarousel from '@/components/PhotoCarousel';

interface SingleColumnViewProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
}

export default function SingleColumnView({ groupPhotos, people }: SingleColumnViewProps) {
  const [useTouchLayout, setUseTouchLayout] = useState(false);

  useEffect(() => {
    const detect = () => {
      const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
      const touchCapable = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      const portraitTablet = typeof window !== 'undefined' && window.innerWidth < 1200; // catch iPad portrait
      setUseTouchLayout(coarse || (touchCapable && portraitTablet));
    };

    detect();
    window.addEventListener('resize', detect);
    return () => window.removeEventListener('resize', detect);
  }, []);

  const handlePersonClick = (person: Person) => {
    // Scroll to the person's card
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
      cardElement.classList.add('ring-2', 'ring-white/80', 'shadow-[0_0_30px_rgba(255,255,255,0.3)]', 'scale-[1.02]', 'transition-all', 'duration-500');
      setTimeout(() => {
        cardElement.classList.remove('ring-2', 'ring-white/80', 'shadow-[0_0_30px_rgba(255,255,255,0.3)]', 'scale-[1.02]', 'transition-all', 'duration-500');
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
    </>
  );
}
