'use client';

import { GroupPhoto, Person } from '@/types';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, TouchEvent } from 'react';

interface MobilePhotoCarouselProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
  onPersonClick?: (person: Person) => void;
}

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
  const [labelOffsets, setLabelOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [hoveredPersonId, setHoveredPersonId] = useState<string | null>(null);
  
  // Touch/pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTap, setLastTap] = useState(0);
  
  const photoScrollTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const highlightTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const cooldownTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const highlightCooldownTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);

  const currentPhoto = groupPhotos[currentPhotoIndex];
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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
    }
  }, [isAutoHighlighting]);

  // Dynamic label positioning with collision avoidance
  useEffect(() => {
    if (!containerRef.current || containerDimensions.width === 0) return;

    // Helper to check if viewport center is inside expanded face hitbox
    const isInsideExpandedHitbox = (person: Person) => {
      const location = person.photoLocations.find(loc => loc.photoId === currentPhoto.id);
      if (!location) return false;

      const rect = containerRef.current!.getBoundingClientRect();
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
      return visibleCenterX >= expandedX && 
             visibleCenterX <= expandedX + expandedWidth &&
             visibleCenterY >= expandedY && 
             visibleCenterY <= expandedY + expandedHeight;
    };
    
    // Helper to calculate distance from viewport center (for sorting when multiple overlap)
    const getDistanceFromCenter = (person: Person) => {
      const location = person.photoLocations.find(loc => loc.photoId === currentPhoto.id);
      if (!location) return Infinity;

      const personCenterX = location.x + location.width / 2;
      const personCenterY = location.y + location.height / 2;
      
      const rect = containerRef.current!.getBoundingClientRect();
      const imageCenterOffsetX = -position.x / (rect.width * scale) * 100;
      const imageCenterOffsetY = -position.y / (rect.height * scale) * 100;
      
      const visibleCenterX = 50 + imageCenterOffsetX;
      const visibleCenterY = 50 + imageCenterOffsetY;
      
      const dx = personCenterX - visibleCenterX;
      const dy = personCenterY - visibleCenterY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    let visiblePeople: Person[] = [];

    if (isAutoHighlighting) {
      // In auto mode, just show the highlighted person
      const current = shuffledPeople[highlightedPersonIndex];
      if (current) visiblePeople = [current];
    } else {
      // In manual/zoom mode, show people whose expanded hitbox contains the viewport center
      visiblePeople = shuffledPeople
        .filter(person => isInsideExpandedHitbox(person))
        .map(person => ({ person, distance: getDistanceFromCenter(person) }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, MAX_VISIBLE_LABELS)
        .map(item => item.person);
    }

    if (visiblePeople.length === 0) {
      setLabelOffsets({});
      return;
    }

    // Skip label calculation while dragging to improve performance and prevent update loops
    if (isDragging) return;

    // Calculate stable positions immediately without physics simulation
    setLabelOffsets(prev => {
      const newOffsets: Record<string, { x: number; y: number }> = {};
      
      visiblePeople.forEach(person => {
        const loc = person.photoLocations.find(l => l.photoId === currentPhoto.id);
        if (!loc) return;
        
        const imgW = containerDimensions.width;
        const imgH = containerDimensions.height;
        const faceX = (loc.x + loc.width / 2) / 100 * imgW;
        const faceY = (loc.y + loc.height / 2) / 100 * imgH;
        const faceW = loc.width / 100 * imgW;
        const faceH = loc.height / 100 * imgH;
        
        // Estimate label dimensions
        const estimatedFontSize = 14;
        const charWidth = estimatedFontSize * 0.75;
        const paddingX = estimatedFontSize * 0.9 * 2;
        const labelWidth = person.name.length * charWidth + paddingX;
        const labelHeight = estimatedFontSize + (estimatedFontSize * 0.4 * 2);
        const halfLabelW = labelWidth / 2;
        const halfLabelH = labelHeight / 2;
        
        // Check each direction for obstacles
        const checkDirection = (dx: number, dy: number, distance: number) => {
          const testX = faceX + dx * distance;
          const testY = faceY + dy * distance;
          
          // Check if position is in bounds
          const edgePadding = 15;
          if (testX - halfLabelW < edgePadding || testX + halfLabelW > imgW - edgePadding ||
              testY - halfLabelH < edgePadding || testY + halfLabelH > imgH - edgePadding) {
            return false;
          }
          
          // Check for face collisions
          for (const p of shuffledPeople) {
            const pLoc = p.photoLocations.find(l => l.photoId === currentPhoto.id);
            if (!pLoc) continue;
            
            const pX = pLoc.x / 100 * imgW;
            const pY = pLoc.y / 100 * imgH;
            const pW = pLoc.width / 100 * imgW;
            const pH = pLoc.height / 100 * imgH;
            
            // Box collision check with padding
            const padding = 15;
            const labelLeft = testX - halfLabelW;
            const labelRight = testX + halfLabelW;
            const labelTop = testY - halfLabelH;
            const labelBottom = testY + halfLabelH;
            
            if (labelRight + padding > pX && labelLeft - padding < pX + pW &&
                labelBottom + padding > pY && labelTop - padding < pY + pH) {
              return false;
            }
          }
          
          return true;
        };
        
        // Try different directions with preference order
        const directions = [
          { dx: 0, dy: 1, dist: faceH / 2 + 40 },   // Below
          { dx: 0, dy: -1, dist: faceH / 2 + 40 },  // Above
          { dx: 1, dy: 0, dist: faceW / 2 + 45 },   // Right
          { dx: -1, dy: 0, dist: faceW / 2 + 45 },  // Left
          { dx: 1, dy: 1, dist: 55 },               // Bottom-right
          { dx: -1, dy: 1, dist: 55 },              // Bottom-left
          { dx: 1, dy: -1, dist: 55 },              // Top-right
          { dx: -1, dy: -1, dist: 55 },             // Top-left
        ];
        
        let foundClear = false;
        for (const dir of directions) {
          if (checkDirection(dir.dx, dir.dy, dir.dist)) {
            newOffsets[person.id] = { 
              x: dir.dx * dir.dist, 
              y: dir.dy * dir.dist 
            };
            foundClear = true;
            break;
          }
        }
        
        if (!foundClear) {
          // Fallback: position below
          newOffsets[person.id] = { x: 0, y: 50 };
        }
      });
      
      return newOffsets;
    });

  }, [shuffledPeople, currentPhoto, highlightedPersonIndex, isAutoHighlighting, scale, position, containerDimensions]);

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

  const handlePhotoNavigation = (index: number) => {
    setCurrentPhotoIndex(index);
    pauseAllAuto();
  };

  // Mobile touch handlers
  const handleTouchStart = (e: TouchEvent) => {
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
      pauseAllAuto();
    } else if (e.touches.length === 2) {
      // Pinch zoom preparation
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    // Always prevent default and propagation to stop scrolling
    e.preventDefault();
    e.stopPropagation();

    if (isDragging && e.touches.length === 1) {
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
  };

  const handleDoubleTap = (e: TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected - toggle zoom
      if (scale === 1) {
        setScale(2);
      } else {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
      pauseAllAuto();
    }
    setLastTap(now);
  };

  const currentHighlightedPerson = shuffledPeople[highlightedPersonIndex];

  return (
    <div className="w-full">
      {/* Photo viewer */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/30 border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div 
          ref={containerRef}
          className="relative w-full bg-slate-800/50 overflow-hidden touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onClick={(e) => {
            if (isMobile) {
              handleDoubleTap(e as any);
            }
          }}
        >
          <div
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out',
              transformOrigin: 'center center',
            }}
            className="w-full h-full"
          >
            <Image
              src={currentPhoto.imagePath}
              alt={currentPhoto.name}
              width={1600}
              height={1000}
              className="w-full h-auto object-contain pointer-events-none"
              priority
              sizes="100vw"
              draggable={false}
            />

            {/* Interactive regions overlay */}
            <div className="absolute inset-0 z-10">
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
                  return (
                    <div 
                      className="absolute z-50 transition-all duration-300 ease-out pointer-events-none"
                      style={{
                        left: `${closestLocation.x}%`,
                        top: `${closestLocation.y}%`,
                        width: `${closestLocation.width}%`,
                        height: `${closestLocation.height}%`,
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
                const lineLength = Math.max(20, Math.min(40, 30 / scale));
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
                    .sort((a, b) => a.dist - b.dist)
                    .slice(0, MAX_VISIBLE_LABELS);
                  
                  return sortedByDistance.some(item => item.id === person.id);
                })();

                // Get dynamic label offset
                const offset = labelOffsets[person.id] || { x: 0, y: 0 };
                
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
                    className="absolute transition-all duration-300 cursor-pointer pointer-events-auto"
                    style={{
                      left: `${location.x}%`,
                      top: `${location.y}%`,
                      width: `${location.width}%`,
                      height: `${location.height}%`,
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
                    
                    {/* Name tag with connecting line */}
                    {(isHighlighted || showWhenZoomed) && (
                      <div className="z-20">
                        {/* Connecting line - from edge of rectangle to label */}
                        <svg
                          className="absolute pointer-events-none overflow-visible"
                          style={{
                            left: '50%',
                            top: '50%',
                            width: `${Math.abs(offset.x) + 100}px`,
                            height: `${Math.abs(offset.y) + 100}px`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          {/* Calculate where line should start from rectangle edge */}
                          {(() => {
                            const centerX = (Math.abs(offset.x) + 100) / 2;
                            const centerY = (Math.abs(offset.y) + 100) / 2;
                            
                            // Calculate rectangle dimensions in pixels
                            const imgW = containerDimensions.width;
                            const imgH = containerDimensions.height;
                            
                            // If dimensions aren't ready, fallback to percentage-ish logic or hide
                            if (imgW === 0 || imgH === 0) return null;
                            
                            const rectPixelW = location.width / 100 * imgW;
                            const rectPixelH = location.height / 100 * imgH;
                            
                            const rectHalfW = rectPixelW / 2;
                            const rectHalfH = rectPixelH / 2;
                            
                            // Find intersection point on rectangle edge
                            let startX = centerX;
                            let startY = centerY;
                            
                            // Check slope to determine which edge is intersected
                            // Slope of diagonal: rectHalfH / rectHalfW
                            // Slope of offset: Math.abs(offset.y) / Math.abs(offset.x)
                            
                            // Avoid division by zero
                            const offsetX = offset.x === 0 ? 0.001 : offset.x;
                            const offsetY = offset.y === 0 ? 0.001 : offset.y;
                            
                            if (Math.abs(offsetY / offsetX) < (rectHalfH / rectHalfW)) {
                              // Intersects left or right edge
                              // x = +/- rectHalfW
                              // y = x * (offsetY / offsetX)
                              const xSign = offsetX > 0 ? 1 : -1;
                              const dx = rectHalfW * xSign;
                              const dy = dx * (offsetY / offsetX);
                              
                              startX = centerX + dx;
                              startY = centerY + dy;
                            } else {
                              // Intersects top or bottom edge
                              // y = +/- rectHalfH
                              // x = y * (offsetX / offsetY)
                              const ySign = offsetY > 0 ? 1 : -1;
                              const dy = rectHalfH * ySign;
                              const dx = dy * (offsetX / offsetY);
                              
                              startX = centerX + dx;
                              startY = centerY + dy;
                            }
                            
                            const endX = centerX + offset.x;
                            const endY = centerY + offset.y;
                            
                            return (
                              <path
                                d={`M ${startX} ${startY} L ${endX} ${endY}`}
                                stroke={isHighlighted ? '#FBBF24' : '#FFFFFF'}
                                strokeWidth="2"
                                fill="none"
                                opacity="0.7"
                              />
                            );
                          })()}
                        </svg>
                        
                        {/* Name tag - positioned outside rectangle */}
                        <div 
                          className="absolute whitespace-nowrap"
                          style={{ 
                            top: '50%',
                            left: '50%',
                            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${1 / scale})`,
                            transformOrigin: 'center',
                            transition: 'transform 0.1s ease-out',
                          }}
                        >
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-xl"
                            style={{
                              fontSize: `${fontSize}px`,
                              padding: `${fontSize * 0.4}px ${fontSize * 0.9}px`,
                            }}
                          >
                            {person.name}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Photo name overlay */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20">
          <div className="bg-black/60 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-lg">
            <h3 className="text-white font-semibold text-sm sm:text-lg">{currentPhoto.name}</h3>
          </div>
        </div>

        {/* Zoom controls - compact in top right */}
        {isMobile && (
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
      {isMobile && (
        <div className="mt-3 text-center">
          <p className="text-slate-400 text-sm">
            Pinch or use +/− to zoom • Drag to pan
          </p>
        </div>
      )}
    </div>
  );
}
