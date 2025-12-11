'use client';

import { GroupPhoto, Person } from '@/types';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, TouchEvent } from 'react';

interface MobilePhotoCarouselProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
  onPersonClick?: (person: Person) => void;
}

interface PhotoLocation {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Container aspect ratio (width / height) - used for letterboxing calculations
const CONTAINER_ASPECT_RATIO = 3 / 4;

export default function MobilePhotoCarousel({ groupPhotos, people, onPersonClick }: MobilePhotoCarouselProps) {
  const MAX_VISIBLE_LABELS = 1;
  const FACE_HITBOX_PADDING = 10; // Percentage padding to expand face hitboxes
  const getBorderWidth = (scale: number) => Math.max(1, 4 / scale); // Gets smaller when zoomed in
  const [showDebugHitboxes, setShowDebugHitboxes] = useState(false); // Can be toggled off later
  
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [highlightedPersonIndex, setHighlightedPersonIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isAutoHighlighting, setIsAutoHighlighting] = useState(true);
  const [shuffledPeople, setShuffledPeople] = useState<Person[]>([]);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [hoveredPersonId, setHoveredPersonId] = useState<string | null>(null);
  const [photoDimensions, setPhotoDimensions] = useState<Record<string, { width: number; height: number }>>({});
  
  // Touch/pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTap, setLastTap] = useState(0);
  const [isTouchMode, setIsTouchMode] = useState(false);
  const [autoZoomedOnPan, setAutoZoomedOnPan] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [interactionLocked, setInteractionLocked] = useState(false);
  const pinchStartDistance = useRef(0);
  const pinchStartScale = useRef(1);
  const pinchStartCenter = useRef({ x: 0, y: 0 });
  const interactionLockTimer = useRef<NodeJS.Timeout | null>(null);
  
  const photoScrollTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const highlightTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const cooldownTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const highlightCooldownTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);

  const currentPhoto = groupPhotos[currentPhotoIndex];

  // Helper function to convert photo coordinates to container coordinates
  // Account for letterboxing when photo aspect ratio differs from container (3:4)
  const convertPhotoToContainerCoords = (location: PhotoLocation): PhotoLocation => {
    if (!currentPhoto) return location;
    
    // Get photo dimensions (either from loaded state or from data)
    const photoDims = photoDimensions[currentPhoto.id];
    const photoWidth = photoDims?.width || currentPhoto.width || 1600;
    const photoHeight = photoDims?.height || currentPhoto.height || 1000;
    const PHOTO_ASPECT = photoWidth / photoHeight;
    
    // Determine how the image fits in the container
    if (PHOTO_ASPECT > CONTAINER_ASPECT_RATIO) {
      // Photo is wider than container - image fills width, letterboxed top/bottom
      const imageHeightInContainer = CONTAINER_ASPECT_RATIO / PHOTO_ASPECT; // as fraction of container
      const verticalOffsetPct = (1 - imageHeightInContainer) / 2 * 100; // top padding as %
      
      return {
        ...location,
        y: location.y * imageHeightInContainer + verticalOffsetPct,
        height: location.height * imageHeightInContainer,
      };
    } else {
      // Photo is taller than container - image fills height, letterboxed left/right
      const imageWidthInContainer = PHOTO_ASPECT / CONTAINER_ASPECT_RATIO; // as fraction of container
      const horizontalOffsetPct = (1 - imageWidthInContainer) / 2 * 100; // left padding as %
      
      return {
        ...location,
        x: location.x * imageWidthInContainer + horizontalOffsetPct,
        width: location.width * imageWidthInContainer,
      };
    }
  };

  useEffect(() => {
    const detectTouchMode = () => {
      const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
      const touchCapable = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      const portraitTablet = typeof window !== 'undefined' && window.innerWidth < 1200;
      setIsTouchMode(coarse || (touchCapable && portraitTablet));
    };

    detectTouchMode();
    window.addEventListener('resize', detectTouchMode);
    return () => window.removeEventListener('resize', detectTouchMode);
  }, []);

  useEffect(() => {
    return () => {
      if (interactionLockTimer.current) {
        clearTimeout(interactionLockTimer.current);
      }
    };
  }, []);

  // Update container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Also update after a short delay to ensure layout is settled
    const timer = setTimeout(updateDimensions, 100);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
    };
  }, [currentPhotoIndex]); // Update when photo changes too as layout might shift

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

  // Reset zoom when photo changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentPhotoIndex]);

  // Auto-scroll photos
  useEffect(() => {
    if (!isAutoScrolling || groupPhotos.length <= 1) return;

    photoScrollTimer.current = setInterval(() => {
      setCurrentPhotoIndex(prev => (prev + 1) % groupPhotos.length);
    }, 15000);

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
    }, 2500);

    return () => {
      if (highlightTimer.current) {
        clearInterval(highlightTimer.current);
      }
    };
  }, [isAutoHighlighting, shuffledPeople.length]);

  // Reset zoom/pan when auto-highlighting resumes
  useEffect(() => {
    if (isAutoHighlighting) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setAutoZoomedOnPan(false);
      setIsZooming(false);
    }
  }, [isAutoHighlighting]);

  const pauseAutoScroll = useCallback(() => {
    setIsAutoScrolling(false);
    
    if (cooldownTimer.current) {
      clearTimeout(cooldownTimer.current);
    }
    
    // Do not resume auto-scroll automatically
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

  const lockInteraction = useCallback((duration = 280) => {
    if (interactionLockTimer.current) {
      clearTimeout(interactionLockTimer.current);
    }
    setInteractionLocked(true);
    interactionLockTimer.current = setTimeout(() => {
      setInteractionLocked(false);
    }, duration);
  }, []);

  const handlePhotoNavigation = (index: number) => {
    setCurrentPhotoIndex(index);
    pauseAllAuto();
  };

  // Mobile touch handlers
  const handleTouchStart = (e: TouchEvent) => {
    if (interactionLocked) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
      if (scale === 1) {
        setAutoZoomedOnPan(false);
      }
      // Clear any hovered state when starting to pan
      setHoveredPersonId(null);
      pauseAllAuto();
    } else if (e.touches.length === 2) {
      // Pinch zoom preparation
      setIsDragging(false);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDistance.current = Math.hypot(dx, dy);
      pinchStartScale.current = scale;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - (rect.left + rect.width / 2);
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - (rect.top + rect.height / 2);
        pinchStartCenter.current = { x: cx, y: cy };
      }
      pauseAllAuto();
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    // Always prevent default and propagation to stop scrolling
    e.preventDefault();
    e.stopPropagation();

    if (interactionLocked) return;

    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (pinchStartDistance.current > 0) {
        const scaleFactor = dist / pinchStartDistance.current;
        const targetScale = Math.min(4, Math.max(1, pinchStartScale.current * scaleFactor));
        const { x: cx, y: cy } = pinchStartCenter.current;
        setIsZooming(true);
        setScale(prevScale => {
          const newScale = targetScale;
          const factor = newScale / prevScale;
          setPosition(prev => ({
            x: prev.x + cx * (factor - 1),
            y: prev.y + cy * (factor - 1),
          }));
          return newScale;
        });
        setTimeout(() => setIsZooming(false), 120);
      }
    } else if (isDragging && e.touches.length === 1) {
      // If starting a pan at zero zoom, auto-jump to default zoom once
      if (scale === 1 && !autoZoomedOnPan) {
        const defaultZoom = currentPhoto.defaultZoom || 2;
        lockInteraction(320);
        setIsZooming(true);
        setScale(defaultZoom);
        setAutoZoomedOnPan(true);
        if (currentPhoto.zoomTranslation) {
          setPosition({
            x: currentPhoto.zoomTranslation.x,
            y: currentPhoto.zoomTranslation.y,
          });
        } else {
          setPosition({ x: 0, y: 0 });
        }
        // Reset drag origin to avoid jump after zoom change
        setDragStart({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y
        });
        setTimeout(() => setIsZooming(false), 250);
      }

      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    // Re-enable body scroll
    document.body.style.overflow = '';
    setIsDragging(false);
    pinchStartDistance.current = 0;
  };

  const handleDoubleTap = (e: TouchEvent | React.MouseEvent) => {
    if (interactionLocked) return;
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected - toggle zoom
      if (scale === 1) {
        lockInteraction(300);
        setIsZooming(true);
        setScale(2);
        setAutoZoomedOnPan(true);
        setTimeout(() => setIsZooming(false), 250);
      } else {
        lockInteraction(300);
        setIsZooming(true);
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setAutoZoomedOnPan(false);
        setTimeout(() => setIsZooming(false), 250);
      }
      pauseAllAuto();
    }
    setLastTap(now);
  };

  const currentHighlightedPerson = shuffledPeople[highlightedPersonIndex];

  return (
    <div className="w-full">
      {/* Fallback for aspect-ratio using padding-bottom technique */}
      <style>
        {`
          @supports not (aspect-ratio: 1) {
            .aspect-3-4-fallback {
              height: 0 !important;
              padding-bottom: 75% !important;
              position: relative !important;
            }
          }
        `}
      </style>
      {/* Photo viewer - fixed vertical rectangle container */}
      <div className="relative mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/30 border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm aspect-3-4-fallback" style={{ width: '100%', maxWidth: '500px', aspectRatio: CONTAINER_ASPECT_RATIO }}>
        <div
          ref={containerRef}
          className="relative w-full h-full bg-slate-800/50 overflow-hidden touch-none flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onClick={(e) => {
            if (isTouchMode) {
              handleDoubleTap(e as any);
            }
          }}
        >
          <div
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging && !isZooming ? 'none' : 'transform 0.25s ease-out',
              transformOrigin: 'center center',
            }}
            className="relative w-full h-full"
          >
            <Image
              src={currentPhoto.imagePath}
              alt={currentPhoto.name}
              width={1600}
              height={1000}
              className="w-full h-full object-contain pointer-events-none"
              priority
              sizes="100vw"
              draggable={false}
              onLoadingComplete={(img) => {
                setPhotoDimensions((prev) => {
                  if (prev[currentPhoto.id]) {
                    return prev;
                  }
                  return { ...prev, [currentPhoto.id]: { width: img.naturalWidth, height: img.naturalHeight } };
                });
              }}
            />

            {/* Interactive regions overlay */}
            <div className="absolute inset-0 z-10 w-full h-full">
              {/* Debug: True center point dot */}
              {showDebugHitboxes && (() => {
                if (!containerRef.current) return null;
                
                const rect = containerRef.current.getBoundingClientRect();
                const imageCenterOffsetX = -position.x / (rect.width * scale) * 100;
                const imageCenterOffsetY = -position.y / (rect.height * scale) * 100;
                
                const visibleCenterX = 50 + imageCenterOffsetX;
                const visibleCenterY = 50 + imageCenterOffsetY;
                
                return (
                  <div 
                    className="absolute z-[60]"
                    style={{
                      left: `${visibleCenterX}%`,
                      top: `${visibleCenterY}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full shadow-lg ring-1 ring-white" />
                  </div>
                );
              })()}
              
              {/* Morphing indicator - circle that morphs into selected rectangle */}
              {!isAutoHighlighting && (() => {
                if (!containerRef.current) return null;
                
                const rect = containerRef.current.getBoundingClientRect();
                const imageCenterOffsetX = -position.x / (rect.width * scale) * 100;
                const imageCenterOffsetY = -position.y / (rect.height * scale) * 100;
                
                const visibleCenterX = 50 + imageCenterOffsetX;
                const visibleCenterY = 50 + imageCenterOffsetY;
                
                // Find the closest person whose expanded hitbox contains the center point
                let closestPerson: Person | null = null;
                let closestLocation = null;
                
                if (!isAutoHighlighting) {
                  const peopleInsideHitbox = shuffledPeople
                    .map(p => {
                      const loc = p.photoLocations.find(l => l.photoId === currentPhoto.id);
                      if (!loc) return null;
                      
                      // Calculate expanded hitbox
                      const expandedX = loc.x - FACE_HITBOX_PADDING / 2;
                      const expandedY = loc.y - FACE_HITBOX_PADDING / 2;
                      const expandedWidth = loc.width + FACE_HITBOX_PADDING;
                      const expandedHeight = loc.height + FACE_HITBOX_PADDING;
                      
                      // Check if center point is inside the expanded hitbox
                      const isInside = visibleCenterX >= expandedX && 
                                      visibleCenterX <= expandedX + expandedWidth &&
                                      visibleCenterY >= expandedY && 
                                      visibleCenterY <= expandedY + expandedHeight;
                      
                      if (!isInside) return null;
                      
                      // Calculate distance to face center for sorting
                      const pCenterX = loc.x + loc.width / 2;
                      const pCenterY = loc.y + loc.height / 2;
                      const dx = pCenterX - visibleCenterX;
                      const dy = pCenterY - visibleCenterY;
                      const distance = Math.sqrt(dx * dx + dy * dy);
                      
                      return { person: p, location: loc, expandedLocation: { x: expandedX, y: expandedY, width: expandedWidth, height: expandedHeight }, distance };
                    })
                    .filter((item): item is { person: Person; location: any; expandedLocation: any; distance: number } => 
                      item !== null
                    )
                    .sort((a, b) => a.distance - b.distance);
                  
                  if (peopleInsideHitbox.length > 0) {
                    closestPerson = peopleInsideHitbox[0].person;
                    // Use the actual face location, not the expanded hitbox
                    closestLocation = peopleInsideHitbox[0].location;
                  }
                }
                
                // Calculate average face rectangle size for the circle
                const avgFaceSize = shuffledPeople.reduce((sum, p) => {
                  const loc = p.photoLocations.find(l => l.photoId === currentPhoto.id);
                  if (!loc) return sum;
                  return sum + Math.max(loc.width, loc.height);
                }, 0) / Math.max(shuffledPeople.length, 1);
                
                // If a person is selected, morph to their rectangle
                if (closestLocation) {
                  const adjustedLocation = convertPhotoToContainerCoords(closestLocation);
                  return (
                    <div 
                      className="absolute z-50 transition-all duration-300 ease-out pointer-events-none"
                      style={{
                        left: `${adjustedLocation.x}%`,
                        top: `${adjustedLocation.y}%`,
                        width: `${adjustedLocation.width}%`,
                        height: `${adjustedLocation.height}%`,
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 border-2 border-white/60 rounded-lg shadow-lg" />
                    </div>
                  );
                }
                
                // Otherwise, show as a circle at the center
                // Use a fixed pixel size to ensure it's actually circular
                const circleSize = avgFaceSize; // This is in percentage
                
                return (
                  <div 
                    className="absolute z-50 transition-all duration-300 ease-out pointer-events-none"
                    style={{
                      left: `${visibleCenterX}%`,
                      top: `${visibleCenterY}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div 
                      className="bg-white/20 border-2 border-white/60 rounded-full shadow-lg"
                      style={{
                        width: `${circleSize}vw`,
                        height: `${circleSize}vw`,
                        aspectRatio: '1 / 1',
                      }}
                    />
                  </div>
                );
              })()}
              {shuffledPeople.map((person, idx) => {
                const location = person.photoLocations.find(
                  loc => loc.photoId === currentPhoto.id
                );
                
                if (!location) return null;

                const isHighlighted = isAutoHighlighting && idx === highlightedPersonIndex;

                // Calculate responsive text size based on zoom (inverse scaling with more reduction)
                const fontSize = Math.max(7, Math.min(14, 14 / (scale * 0.8)));
                const showWhenZoomed = (() => {
                  if (person.id === hoveredPersonId) return true;
                  if (isAutoHighlighting) return false;
                  
                  // Check if viewport center is inside this person's expanded hitbox
                  if (!containerRef.current) return false;
                  
                  const rect = containerRef.current.getBoundingClientRect();
                  const imageCenterOffsetX = -position.x / (rect.width * scale) * 100;
                  const imageCenterOffsetY = -position.y / (rect.height * scale) * 100;
                  
                  const visibleCenterX = 50 + imageCenterOffsetX;
                  const visibleCenterY = 50 + imageCenterOffsetY;
                  
                  // Calculate expanded hitbox
                  const expandedX = location.x - FACE_HITBOX_PADDING / 2;
                  const expandedY = location.y - FACE_HITBOX_PADDING / 2;
                  const expandedWidth = location.width + FACE_HITBOX_PADDING;
                  const expandedHeight = location.height + FACE_HITBOX_PADDING;
                  
                  // Check if center point is inside the expanded box
                  const isInside = visibleCenterX >= expandedX && 
                                  visibleCenterX <= expandedX + expandedWidth &&
                                  visibleCenterY >= expandedY && 
                                  visibleCenterY <= expandedY + expandedHeight;
                  
                  if (!isInside) return false;
                  
                  // If multiple faces overlap, only show the closest one
                  const personCenterX = location.x + location.width / 2;
                  const personCenterY = location.y + location.height / 2;
                  const myDist = Math.sqrt(
                    Math.pow(personCenterX - visibleCenterX, 2) + 
                    Math.pow(personCenterY - visibleCenterY, 2)
                  );
                  
                  const peopleInsideHitbox = shuffledPeople.filter(p => {
                    const pLoc = p.photoLocations.find(l => l.photoId === currentPhoto.id);
                    if (!pLoc) return false;
                    
                    const pExpandedX = pLoc.x - FACE_HITBOX_PADDING / 2;
                    const pExpandedY = pLoc.y - FACE_HITBOX_PADDING / 2;
                    const pExpandedWidth = pLoc.width + FACE_HITBOX_PADDING;
                    const pExpandedHeight = pLoc.height + FACE_HITBOX_PADDING;
                    
                    return visibleCenterX >= pExpandedX && 
                           visibleCenterX <= pExpandedX + pExpandedWidth &&
                           visibleCenterY >= pExpandedY && 
                           visibleCenterY <= pExpandedY + pExpandedHeight;
                  });
                  
                  // Only show if this is the closest person whose hitbox contains the center
                  const sortedByDistance = peopleInsideHitbox
                    .map(p => {
                      const pLoc = p.photoLocations.find(l => l.photoId === currentPhoto.id)!;
                      const pCenterX = pLoc.x + pLoc.width / 2;
                      const pCenterY = pLoc.y + pLoc.height / 2;
                      const dist = Math.sqrt(
                        Math.pow(pCenterX - visibleCenterX, 2) + 
                        Math.pow(pCenterY - visibleCenterY, 2)
                      );
                      return { id: p.id, dist };
                    })
                    .sort((a, b) => a.dist - b.dist);
                  
                  // Only show the single closest person
                  return sortedByDistance.length > 0 && sortedByDistance[0].id === person.id;
                })();

                // Calculate expanded hitbox for debugging
                const adjustedLocation = convertPhotoToContainerCoords(location);
                const expandedLocation = {
                  x: location.x - FACE_HITBOX_PADDING / 2,
                  y: location.y - FACE_HITBOX_PADDING / 2,
                  width: location.width + FACE_HITBOX_PADDING,
                  height: location.height + FACE_HITBOX_PADDING,
                };

                return (
                  <div
                    key={person.id}
                    className="absolute transition-all duration-300 cursor-pointer pointer-events-auto touch-none select-none"
                    style={{
                      left: `${adjustedLocation.x}%`,
                      top: `${adjustedLocation.y}%`,
                      width: `${adjustedLocation.width}%`,
                      height: `${adjustedLocation.height}%`,
                    }}
                    onMouseEnter={() => {
                      setHoveredPersonId(person.id);
                      pauseAllAuto();
                    }}
                    onMouseLeave={() => setHoveredPersonId(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Face clicked:', person.name, person.id);
                      
                      // Scroll to the person's card
                      const personCardId = `person-card-mobile-${person.id}`;
                      console.log('Looking for card:', personCardId);
                      const cardElement = document.getElementById(personCardId);
                      console.log('Card element found:', cardElement);
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
                          
                          // Only use this if scrollIntoView didn't work well or as a second pass
                          // But since we want smooth scrolling, we should be careful not to conflict
                          // Let's just ensure we are scrolling the window
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
                      } else {
                        console.error('Card element not found for:', personCardId);
                      }
                    }}
                  >
                    {/* Debug: Show expanded hitbox */}
                    {showDebugHitboxes && !isAutoHighlighting && (
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
                    
                    {/* Highlight border */}
                    <div 
                      className={`absolute inset-0 rounded-lg transition-all duration-500 z-10`}
                      style={{
                        boxShadow: isHighlighted 
                          ? `0 0 0 ${getBorderWidth(scale)}px rgb(250 204 21), 0 10px 15px -3px rgb(250 204 21 / 0.5)` 
                          : showWhenZoomed
                            ? `0 0 0 ${getBorderWidth(scale)}px rgb(255 255 255), 0 20px 25px -5px rgb(255 255 255 / 0.5)`
                            : isAutoHighlighting
                              ? 'none'
                              : `0 0 0 ${getBorderWidth(scale)}px rgb(255 255 255 / 0.2)`
                      }}
                    />
                    
                    {/* Name tag: fluid placement that follows the face, clamped within photo bounds */}
                    {(() => {
                      const shouldRenderLabel = isHighlighted || showWhenZoomed;
                      if (!shouldRenderLabel) return null;
                      
                      // Convert location to container coordinates to account for letterboxing
                      const containerLocation = convertPhotoToContainerCoords(location);
                      
                      // Calculate face center in container coordinates
                      const faceCenterX = containerLocation.x + containerLocation.width / 2;
                      
                      // Get viewport width to adjust estimation for different screen sizes
                      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 400;
                      
                      // Scale estimation based on viewport width
                      // On small phones (< 400px), use higher estimation
                      // On tablets/larger (> 768px), use lower estimation
                      const scaleFactor = viewportWidth < 400 ? 1.3 : 
                                         viewportWidth < 768 ? 1.1 : 
                                         0.7;
                      const basePadding = viewportWidth < 400 ? 9 : 
                                         viewportWidth < 768 ? 7 : 
                                         5;
                      
                      // Estimate label width as percentage of container width
                      const estimatedLabelWidthPct = person.name.length * scaleFactor + basePadding;
                      const halfLabelWidth = estimatedLabelWidthPct / 2;
                      
                      // Add buffer zone from edges
                      const edgeBuffer = viewportWidth < 768 ? 4 : 2;
                      
                      // Calculate how much the label would overflow on each side (including buffer)
                      const leftOverflow = Math.max(0, (halfLabelWidth + edgeBuffer) - faceCenterX);
                      const rightOverflow = Math.max(0, (faceCenterX + halfLabelWidth + edgeBuffer) - 100);
                      
                      console.log(`${person.name}:`, {
                        faceCenterX: faceCenterX.toFixed(2),
                        labelWidth: estimatedLabelWidthPct.toFixed(2),
                        leftOverflow: leftOverflow.toFixed(2),
                        rightOverflow: rightOverflow.toFixed(2),
                        viewportWidth,
                        scaleFactor,
                      });
                      
                      // Calculate shift: if near left edge, shift right; if near right edge, shift left
                      let horizontalShift = 0;
                      if (leftOverflow > 0) {
                        // Shift right to prevent left cutoff
                        horizontalShift = leftOverflow;
                        console.log(`  → Shifting RIGHT by ${horizontalShift.toFixed(2)}%`);
                      } else if (rightOverflow > 0) {
                        // Shift left to prevent right cutoff
                        horizontalShift = -rightOverflow;
                        console.log(`  → Shifting LEFT by ${Math.abs(horizontalShift).toFixed(2)}%`);
                      }
                      
                      // Convert shift from container percentage to face rectangle percentage
                      // horizontalShift is in container %, we need it relative to face width
                      const shiftInFacePercent = (horizontalShift / containerLocation.width) * 100;
                      
                      console.log(`  → Face width: ${containerLocation.width.toFixed(2)}%, shift in face coords: ${shiftInFacePercent.toFixed(2)}%`);
                      
                      return (
                        <div
                          className="absolute pointer-events-auto z-20 transition-all duration-300 ease-out cursor-pointer active:scale-95 touch-none select-none"
                          style={{ 
                            top: '100%',
                            left: `${50 + shiftInFacePercent}%`,
                            marginTop: '8px',
                            transform: 'translateX(-50%)',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Scroll to the person's card
                            const personCardId = `person-card-mobile-${person.id}`;
                            const cardElement = document.getElementById(personCardId);
                            if (cardElement) {
                              setTimeout(() => {
                                cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }, 50);
                              // Add highlight effect
                              cardElement.classList.add('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
                              setTimeout(() => {
                                cardElement.classList.remove('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
                              }, 2000);
                            }
                          }}
                        >
                          <div className="bg-slate-900/95 backdrop-blur-sm border border-blue-500/50 rounded-lg px-3 py-1.5 shadow-xl shadow-blue-500/30 whitespace-nowrap transition-all duration-150 active:bg-slate-700/95 active:border-blue-400 animate-in fade-in slide-in-from-bottom-2 zoom-in-95">
                            <p className="text-white font-semibold text-xs sm:text-sm md:text-lg">
                              {person.name}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Photo name overlay */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20">
          <div className="bg-black/60 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-lg">
            <h3
              className="text-white font-semibold text-sm sm:text-lg leading-snug"
              style={{
                maxWidth: '35vw',
                wordBreak: 'break-word',
                whiteSpace: 'normal',
              }}
            >
              {currentPhoto.name}
            </h3>
          </div>
        </div>

        {/* Zoom controls - compact in top right */}
        {isTouchMode && (
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg p-1">
            {scale > 1 && (
              <>
                <button
                  onClick={() => {
                    setScale(1);
                    setPosition({ x: 0, y: 0 });
                    pauseAllAuto();
                  }}
                  className="p-2 text-white transition-all touch-manipulation"
                  aria-label="Reset zoom"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <div className="h-6 w-px bg-white/20" />
              </>
            )}

            <button
              onClick={() => {
                const newScale = Math.max(1, scale - 0.5);
                setScale(newScale);
                if (newScale === 1) {
                  setPosition({ x: 0, y: 0 });
                }
                pauseAllAuto();
              }}
              disabled={scale <= 1}
              className="p-2 text-white disabled:text-slate-500 disabled:opacity-50 transition-all touch-manipulation"
              aria-label="Zoom out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
              </svg>
            </button>

            <div className="h-6 w-px bg-white/20" />

            <div className="px-2 text-white text-xs font-medium min-w-[2.5rem] text-center">
              {scale === 1 ? '1×' : `${scale.toFixed(1)}×`}
            </div>

            <div className="h-6 w-px bg-white/20" />

            <button
              onClick={() => {
                const defaultZoom = currentPhoto.defaultZoom || 2.0;
                const newScale = Math.min(4, scale + 0.5);
                
                // If zooming from 1x and photo has custom zoom config
                if (scale === 1 && currentPhoto.defaultZoom) {
                  setScale(defaultZoom);
                  
                  // Apply translation if specified
                  if (currentPhoto.zoomTranslation) {
                    setPosition({
                      x: currentPhoto.zoomTranslation.x,
                      y: currentPhoto.zoomTranslation.y
                    });
                  }
                } else {
                  setScale(newScale);
                }
                
                pauseAllAuto();
              }}
              disabled={scale >= 4}
              className="p-2 text-white disabled:text-slate-500 disabled:opacity-50 transition-all touch-manipulation"
              aria-label="Zoom in"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}  

        {/* Navigation dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {groupPhotos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => handlePhotoNavigation(index)}
              className={`h-2.5 rounded-full transition-all duration-300 touch-manipulation ${
                index === currentPhotoIndex
                  ? 'bg-white w-8'
                  : 'bg-white/40 w-2.5 active:bg-white/70'
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
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 backdrop-blur-sm text-white p-2.5 rounded-lg transition-all duration-200 active:scale-95 touch-manipulation shadow-lg md:left-4 md:p-3"
              aria-label="Previous photo"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => handlePhotoNavigation((currentPhotoIndex + 1) % groupPhotos.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 backdrop-blur-sm text-white p-2.5 rounded-lg transition-all duration-200 active:scale-95 touch-manipulation shadow-lg md:right-4 md:p-3"
              aria-label="Next photo"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Mobile instructions */}
      {isTouchMode && (
        <div className="mt-3 text-center">
          <p className="text-slate-400 text-sm">
            Pinch or use +/− to zoom • Drag to pan
          </p>
        </div>
      )}
    </div>
  );
}
