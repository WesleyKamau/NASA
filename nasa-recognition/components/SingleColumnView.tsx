'use client';

import { GroupPhoto, Person } from '@/types';
import MobilePhotoCarousel from './MobilePhotoCarousel';
import PhotoCarousel from './PhotoCarousel';

interface SingleColumnViewProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
}

export default function SingleColumnView({ groupPhotos, people }: SingleColumnViewProps) {
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
      cardElement.classList.add('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
      setTimeout(() => {
        cardElement.classList.remove('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
      }, 2000);
    }
  };

  return (
    <>
      {/* Mobile View (< 768px) */}
      <div className="md:hidden">
        <MobilePhotoCarousel 
          groupPhotos={groupPhotos} 
          people={people} 
        />
      </div>

      {/* Desktop/Tablet View (>= 768px) */}
      <div className="hidden md:block">
        <PhotoCarousel 
          groupPhotos={groupPhotos} 
          people={people} 
          onPersonClick={handlePersonClick}
        />
      </div>
    </>
  );
}
