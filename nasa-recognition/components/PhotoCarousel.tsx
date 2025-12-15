'use client';

import { GroupPhoto, Person } from '@/types';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { GENERAL_COMPONENT_CONFIG } from '@/lib/configs/componentsConfig';
import CarouselNameTag from './CarouselNameTag';

interface PhotoCarouselProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
  onPersonClick?: (person: Person) => void;
  highlightedPersonId?: string | null;
  onHighlightedPersonChange?: (personId: string | null) => void;
}

export default function PhotoCarousel({ groupPhotos, people, onPersonClick, highlightedPersonId, onHighlightedPersonChange }: PhotoCarouselProps) {
  const FACE_HITBOX_PADDING = 10; // Percentage padding to expand face hitboxes
  const AUTO_RESUME_MS = GENERAL_COMPONENT_CONFIG.AUTO_RESUME_SECONDS * 1000;
  const [showDebugHitboxes, setShowDebugHitboxes] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 }); // percentage position
  const [touchPos, setTouchPos] = useState({ x: 50, y: 50 }); // percentage position for touch
  const [isTouching, setIsTouching] = useState(false);
  const [isMouseInside, setIsMouseInside] = useState(false);
  
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
  const lastHoveredPersonIdRef = useRef<string | null>(null);

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
    }, AUTO_RESUME_MS); // Resume after configured seconds of no interaction
  }, [AUTO_RESUME_MS]);

  const pauseAutoHighlight = useCallback(() => {
    setIsAutoHighlighting(false);

    if (highlightCooldownTimer.current) {
      clearTimeout(highlightCooldownTimer.current);
    }

    highlightCooldownTimer.current = setTimeout(() => {
      setIsAutoHighlighting(true);
    }, AUTO_RESUME_MS); // Resume after configured seconds of no interaction
  }, [AUTO_RESUME_MS]);

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

  // Handle external highlight change (Grid -> Carousel)
  useEffect(() => {
    // Default: stop auto-highlighting while external highlight is active
    if (highlightedPersonId === null) {
      // Clear any pending highlight cooldown timer to prevent unexpected state changes
      if (highlightCooldownTimer.current) {
        clearTimeout(highlightCooldownTimer.current);
        highlightCooldownTimer.current = undefined;
      }
      setIsAutoHighlighting(true);
      setHighlightedPersonIndex(0);
      return;
    }

    const index = shuffledPeople.findIndex(p => p.id === highlightedPersonId);

    if (index === -1) {
      // Tile person not in this photo: resume auto-highlight/auto-cycle
      setIsAutoHighlighting(true);
      setHighlightedPersonIndex(0);
      return;
    }

    // External highlight active and in-photo: clear timers and disable auto-highlighting immediately
    if (highlightTimer.current) {
      clearInterval(highlightTimer.current);
      highlightTimer.current = undefined;
    }
    if (highlightCooldownTimer.current) {
      clearTimeout(highlightCooldownTimer.current);
      highlightCooldownTimer.current = undefined;
    }

    setIsAutoHighlighting(false);
    setHighlightedPersonIndex(index);
    pauseAutoScroll();
  }, [highlightedPersonId, shuffledPeople, pauseAutoScroll]);

  // Find the closest hovered person (only one at a time)
  const getHoveredPerson = useCallback((): Person | null => {
    if (isAutoHighlighting || !isMouseInside) return null;
    
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
  }, [isAutoHighlighting, isMouseInside, isTouching, touchPos, mousePos, shuffledPeople, currentPhoto]);

  // Track hovered person and notify parent (Carousel -> Grid)
  useEffect(() => {
    // Only trigger if mouse is actually inside the carousel
    if (!isMouseInside) {
      if (lastHoveredPersonIdRef.current !== null) {
        lastHoveredPersonIdRef.current = null;
        onHighlightedPersonChange?.(null);
      }
      return;
    }

    // Don't trigger if auto-highlighting is active (unless we want auto-highlight to sync too)
    // But getHoveredPerson returns null if isAutoHighlighting is true anyway.
    const hoveredPerson = getHoveredPerson();
    
    // Only notify if changed
    if (hoveredPerson?.id !== lastHoveredPersonIdRef.current) {
      lastHoveredPersonIdRef.current = hoveredPerson?.id || null;
      onHighlightedPersonChange?.(hoveredPerson?.id || null);
    }
  }, [mousePos, isAutoHighlighting, currentPhoto, shuffledPeople, isMouseInside, getHoveredPerson, onHighlightedPersonChange]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isTouching) return; // Don't update mouse pos during touch
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
    setIsMouseInside(true);
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

  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* Photo viewer */}
      <div 
        className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/30 border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm"
        style={{
          aspectRatio: `${currentPhoto.width} / ${currentPhoto.height}`,
          maxHeight: '100%',
          maxWidth: '100%',
          width: 'auto',
          height: 'auto'
        }}
      >
        <div 
          ref={containerRef}
          className="relative w-full h-full bg-slate-800/50"
          onMouseEnter={() => setIsMouseInside(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { 
            setIsMouseInside(false);
            setIsTouching(false);
          }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={currentPhoto.imagePath}
            alt={currentPhoto.name}
            width={currentPhoto.width}
            height={currentPhoto.height}
            className="w-full h-full object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-height: 80vh) 100vh, 100vw"
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

                const isExternalHighlight = highlightedPersonId === person.id;
                const isHighlighted = (idx === highlightedPersonIndex && isAutoHighlighting);
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
                          ? 'ring-2 ring-white/80 shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105' 
                          : (isHovered || isExternalHighlight)
                            ? 'ring-2 ring-white/60 shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105'
                            : isMouseInside
                              ? 'ring-1 ring-white/20 bg-white/5'
                              : 'ring-2 ring-white/0'
                      }`}
                    />
                    
                    {/* Name tag - appears on highlight or hover */}
                    <CarouselNameTag
                      person={person}
                      isVisible={isHighlighted || isHovered || isExternalHighlight}
                      location={location}
                      onClick={(e) => handlePersonClick(person)}
                      variant="desktop"
                    />
                  </button>
                </div>
              );
            });
          })()}
          </div>
        </div>

        {/* Photo name overlay */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-black/50 backdrop-blur-xl px-4 py-2 rounded-lg border border-white/10">
            <h3 className="text-white font-semibold text-sm md:text-lg tracking-wide">{currentPhoto.name}</h3>
          </div>
        </div>

        {/* Navigation dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/40 backdrop-blur-lg px-4 py-2 rounded-full border border-white/10">
          {groupPhotos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => handlePhotoNavigation(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentPhotoIndex
                  ? 'bg-white/80 w-3 h-3'
                  : 'bg-white/30 hover:bg-white/60 w-2 h-2'
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
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-xl text-white p-2.5 rounded-full transition-all duration-200 hover:scale-110 border border-white/10"
              aria-label="Previous photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => handlePhotoNavigation((currentPhotoIndex + 1) % groupPhotos.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-xl text-white p-2.5 rounded-full transition-all duration-200 hover:scale-110 border border-white/10"
              aria-label="Next photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
