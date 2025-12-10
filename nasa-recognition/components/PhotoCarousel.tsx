'use client';

import { GroupPhoto, Person } from '@/types';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';

interface PhotoCarouselProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
  onPersonClick?: (person: Person) => void;
}

export default function PhotoCarousel({ groupPhotos, people, onPersonClick }: PhotoCarouselProps) {
  const FACE_HITBOX_PADDING = 10; // Percentage padding to expand face hitboxes
  const [showDebugHitboxes, setShowDebugHitboxes] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 }); // percentage position
  const [touchPos, setTouchPos] = useState({ x: 50, y: 50 }); // percentage position for touch
  const [isTouching, setIsTouching] = useState(false);
  
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [highlightedPersonIndex, setHighlightedPersonIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isAutoHighlighting, setIsAutoHighlighting] = useState(true);
  const [shuffledPeople, setShuffledPeople] = useState<Person[]>([]);
  
  const photoScrollTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const highlightTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const cooldownTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const highlightCooldownTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPhoto = groupPhotos[currentPhotoIndex];

  // Get people in current photo and shuffle them
  useEffect(() => {
    if (currentPhoto) {
      const peopleInPhoto = people.filter(person =>
        person.photoLocations.some(loc => loc.photoId === currentPhoto.id)
      );
      
      // Fisher-Yates shuffle
      const shuffled = [...peopleInPhoto];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      setShuffledPeople(shuffled);
      setHighlightedPersonIndex(0);
    }
  }, [currentPhoto, people]);

  // Auto-scroll photos
  useEffect(() => {
    if (!isAutoScrolling || groupPhotos.length <= 1) return;

    photoScrollTimer.current = setInterval(() => {
      setCurrentPhotoIndex(prev => (prev + 1) % groupPhotos.length);
    }, 15000); // Change photo every 15 seconds

    return () => {
      if (photoScrollTimer.current) {
        clearInterval(photoScrollTimer.current);
      }
    };
  }, [isAutoScrolling, groupPhotos.length]);

  // Auto-highlight people
  useEffect(() => {
    if (!isAutoHighlighting || shuffledPeople.length === 0) return;

    highlightTimer.current = setInterval(() => {
      setHighlightedPersonIndex(prev => (prev + 1) % shuffledPeople.length);
    }, 2500); // Highlight each person for 2.5 seconds

    return () => {
      if (highlightTimer.current) {
        clearInterval(highlightTimer.current);
      }
    };
  }, [isAutoHighlighting, shuffledPeople.length]);

  const pauseAutoScroll = useCallback(() => {
    setIsAutoScrolling(false);
    
    if (cooldownTimer.current) {
      clearTimeout(cooldownTimer.current);
    }
    
    cooldownTimer.current = setTimeout(() => {
      setIsAutoScrolling(true);
    }, 45000); // Resume after 45 seconds of no interaction
  }, []);

  const pauseAutoHighlight = useCallback(() => {
    setIsAutoHighlighting(false);
    
    if (highlightCooldownTimer.current) {
      clearTimeout(highlightCooldownTimer.current);
    }
    
    highlightCooldownTimer.current = setTimeout(() => {
      setIsAutoHighlighting(true);
    }, 45000); // Resume after 45 seconds of no interaction
  }, []);

  const pauseAllAuto = useCallback(() => {
    pauseAutoScroll();
    pauseAutoHighlight();
  }, [pauseAutoScroll, pauseAutoHighlight]);

  const handlePhotoNavigation = (index: number) => {
    setCurrentPhotoIndex(index);
    pauseAllAuto();
  };

  const handlePersonClick = (person: Person) => {
    pauseAllAuto();
    onPersonClick?.(person);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isTouching) return; // Don't update mouse pos during touch
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setTouchPos({ x, y });
    setIsTouching(true);
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
  };

  const isInsideExpandedHitbox = (person: Person) => {
    const location = person.photoLocations.find(loc => loc.photoId === currentPhoto.id);
    if (!location) return false;

    const expandedX = location.x - FACE_HITBOX_PADDING / 2;
    const expandedY = location.y - FACE_HITBOX_PADDING / 2;
    const expandedWidth = location.width + FACE_HITBOX_PADDING;
    const expandedHeight = location.height + FACE_HITBOX_PADDING;

    // Use touch position if touching, otherwise mouse position
    const pos = isTouching ? touchPos : mousePos;

    return pos.x >= expandedX && 
           pos.x <= expandedX + expandedWidth &&
           pos.y >= expandedY && 
           pos.y <= expandedY + expandedHeight;
  };

  // Find the closest hovered person (only one at a time)
  const getHoveredPerson = (): Person | null => {
    if (isAutoHighlighting) return null;
    
    const pos = isTouching ? touchPos : mousePos;
    let closestPerson: Person | null = null;
    let minDistance = Infinity;

    shuffledPeople.forEach(person => {
      const location = person.photoLocations.find(loc => loc.photoId === currentPhoto.id);
      if (!location) return;

      const expandedX = location.x - FACE_HITBOX_PADDING / 2;
      const expandedY = location.y - FACE_HITBOX_PADDING / 2;
      const expandedWidth = location.width + FACE_HITBOX_PADDING;
      const expandedHeight = location.height + FACE_HITBOX_PADDING;

      // Check if inside hitbox
      const isInside = pos.x >= expandedX && 
                      pos.x <= expandedX + expandedWidth &&
                      pos.y >= expandedY && 
                      pos.y <= expandedY + expandedHeight;

      if (isInside) {
        // Calculate distance from center of hitbox
        const centerX = location.x + location.width / 2;
        const centerY = location.y + location.height / 2;
        const distance = Math.sqrt(Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2));

        if (distance < minDistance) {
          minDistance = distance;
          closestPerson = person;
        }
      }
    });

    return closestPerson;
  };

  const currentHighlightedPerson = shuffledPeople[highlightedPersonIndex];

  return (
    <div className="w-full">
      {/* Photo viewer */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/30 border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div 
          ref={containerRef}
          className="relative w-full bg-slate-800/50"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setMousePos({ x: 50, y: 50 }); setIsTouching(false); }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={currentPhoto.imagePath}
            alt={currentPhoto.name}
            width={1600}
            height={1000}
            className="w-full h-auto object-contain"
            priority
            sizes="100vw"
          />

          {/* Interactive regions overlay */}
          <div className="absolute inset-0 z-10">
            {(() => {
              const hoveredPerson = getHoveredPerson();
              
              return shuffledPeople.map((person, idx) => {
                const location = person.photoLocations.find(
                  loc => loc.photoId === currentPhoto.id
                );
                
                if (!location) return null;

                const isHighlighted = idx === highlightedPersonIndex && isAutoHighlighting;
                const isHovered = !isAutoHighlighting && hoveredPerson?.id === person.id;
              
              // Calculate expanded hitbox for debugging
              const expandedLocation = {
                x: location.x - FACE_HITBOX_PADDING / 2,
                y: location.y - FACE_HITBOX_PADDING / 2,
                width: location.width + FACE_HITBOX_PADDING,
                height: location.height + FACE_HITBOX_PADDING,
              };

              return (
                <div
                  key={person.id}
                  className="absolute transition-all duration-300"
                  style={{
                    left: `${location.x}%`,
                    top: `${location.y}%`,
                    width: `${location.width}%`,
                    height: `${location.height}%`,
                  }}
                >
                  {/* Debug: Show expanded hitbox */}
                  {showDebugHitboxes && (
                    <div 
                      className="absolute transition-all duration-300"
                      style={{
                        left: `${((expandedLocation.x - location.x) / location.width) * 100}%`,
                        top: `${((expandedLocation.y - location.y) / location.height) * 100}%`,
                        width: `${(expandedLocation.width / location.width) * 100}%`,
                        height: `${(expandedLocation.height / location.height) * 100}%`,
                      }}
                    >
                      <div className="absolute inset-0 border border-dashed border-green-400/50 rounded-lg" />
                    </div>
                  )}

                  <button
                    className="absolute inset-0 group"
                    onClick={() => handlePersonClick(person)}
                    onMouseEnter={pauseAllAuto}
                    aria-label={`View ${person.name}`}
                  >
                    {/* Hover/highlight border */}
                    <div 
                      className={`absolute inset-0 rounded-lg transition-all duration-500 ${
                        isHighlighted 
                          ? 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50 scale-105' 
                          : isHovered
                            ? 'ring-4 ring-white shadow-lg shadow-white/30 scale-105'
                            : 'ring-2 ring-white/0'
                      }`}
                    />
                    
                    {/* Name tag - appears on highlight or hover */}
                    <div 
                      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full whitespace-nowrap transition-all duration-300 ${
                        (isHighlighted || isHovered) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-xl">
                        {person.name}
                      </div>
                    </div>
                  </button>
                </div>
              );
            });
          })()}
          </div>
        </div>

        {/* Photo name overlay */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
            <h3 className="text-white font-semibold text-lg">{currentPhoto.name}</h3>
          </div>
        </div>

        {/* Navigation dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {groupPhotos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => handlePhotoNavigation(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentPhotoIndex
                  ? 'bg-white w-8'
                  : 'bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`View ${photo.name}`}
            />
          ))}
        </div>

        {/* Navigation arrows */}
        {groupPhotos.length > 1 && (
          <>
            <button
              onClick={() => handlePhotoNavigation((currentPhotoIndex - 1 + groupPhotos.length) % groupPhotos.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
              aria-label="Previous photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => handlePhotoNavigation((currentPhotoIndex + 1) % groupPhotos.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
              aria-label="Next photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
