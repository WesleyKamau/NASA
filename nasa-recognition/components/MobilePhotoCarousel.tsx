'use client';

import { GroupPhoto, Person, PhotoLocation } from '@/types';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, TouchEvent, useLayoutEffect } from 'react';
import CenterIndicator from './CenterIndicator';
import PersonImage from './PersonImage';
import CarouselNameTag from './CarouselNameTag';
import PanGestureHint from './PanGestureHint';
import { MOBILE_PHOTO_CAROUSEL_CONFIG, GENERAL_COMPONENT_CONFIG, isDebugEnabled, DebugFeature } from '@/lib/configs/componentsConfig';
import { getPeopleInPhoto, shuffleArray, startAutoCycle } from '@/lib/carouselUtils';

interface MobilePhotoCarouselProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
  onPersonClick?: (person: Person) => void;
  hideInstructions?: boolean;
  highlightedPersonId?: string | null;
  onHighlightedPersonChange?: (personId: string | null) => void;
  isTablet?: boolean;
}

// Container aspect ratio (width / height) - used for letterboxing calculations
const CONTAINER_ASPECT_RATIO = MOBILE_PHOTO_CAROUSEL_CONFIG.CONTAINER_ASPECT_RATIO;
const ENABLE_FACE_TRANSITION = MOBILE_PHOTO_CAROUSEL_CONFIG.ENABLE_FACE_TRANSITION;
const FACE_FADE_DELAY_MS = MOBILE_PHOTO_CAROUSEL_CONFIG.FACE_FADE_DELAY_MS;
const FACE_FADE_DURATION_MS = MOBILE_PHOTO_CAROUSEL_CONFIG.FACE_FADE_DURATION_MS;
const FACE_TRANSITION_TOTAL_MS = MOBILE_PHOTO_CAROUSEL_CONFIG.FACE_TRANSITION_TOTAL_MS;
const PAN_GESTURE_FADE_OUT_MS = MOBILE_PHOTO_CAROUSEL_CONFIG.PAN_GESTURE_FADE_OUT_MS;
const PAN_GESTURE_FADE_BUFFER_MS = MOBILE_PHOTO_CAROUSEL_CONFIG.PAN_GESTURE_FADE_BUFFER_MS;

export default function MobilePhotoCarousel({ groupPhotos, people, onPersonClick, hideInstructions, highlightedPersonId, onHighlightedPersonChange, isTablet = false }: MobilePhotoCarouselProps) {
  const FACE_HITBOX_PADDING = MOBILE_PHOTO_CAROUSEL_CONFIG.FACE_HITBOX_PADDING;
  const SHOW_DEBUG_HITBOXES = isDebugEnabled(DebugFeature.SHOW_DEBUG_HITBOXES); // Respects master debug toggle
  const getBorderWidth = (scale: number) => Math.max(1, 4 / scale); // Gets smaller when zoomed in
  const AUTO_RESUME_MS = GENERAL_COMPONENT_CONFIG.AUTO_RESUME_SECONDS * 1000;
  
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [highlightedPersonIndex, setHighlightedPersonIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isAutoHighlighting, setIsAutoHighlighting] = useState(true);
  const [shuffledPeople, setShuffledPeople] = useState<Person[]>([]);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [hoveredPersonId, setHoveredPersonId] = useState<string | null>(null);
  const [photoDimensions, setPhotoDimensions] = useState<Record<string, { width: number; height: number }>>({});
  const [showCenterIndicator, setShowCenterIndicator] = useState(false);
  const [overlaysReadyForPhoto, setOverlaysReadyForPhoto] = useState<string | null>(null);
  const [isTabletLandscape, setIsTabletLandscape] = useState(false);
  const [isIPad, setIsIPad] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isTransitioningPhoto, setIsTransitioningPhoto] = useState(false);
  const [previousPhotoIndex, setPreviousPhotoIndex] = useState(0);
  const [showDestinationFace, setShowDestinationFace] = useState(false);
  const previousPhotoRef = useRef(0);
  const isAutoCycleRef = useRef(false); // Track if photo change is from auto-cycle (no face transition)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Touch/pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTap, setLastTap] = useState(0);
  const [isTouchMode, setIsTouchMode] = useState(false);
  const [autoZoomedOnPan, setAutoZoomedOnPan] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [interactionLocked, setInteractionLocked] = useState(false);
  const [hasPanned, setHasPanned] = useState(false); // Track if user has panned to hide gesture hint
  const panHintFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schedulePanHintDismiss = useCallback(() => {
    if (hasPanned) return;
    if (panHintFadeTimerRef.current) return;

    panHintFadeTimerRef.current = setTimeout(() => {
      setHasPanned(true);
      panHintFadeTimerRef.current = null;
    }, PAN_GESTURE_FADE_OUT_MS + PAN_GESTURE_FADE_BUFFER_MS);
  }, [hasPanned]);
  const pinchStartDistance = useRef(0);
  const pinchStartScale = useRef(1);
  const pinchStartCenter = useRef({ x: 0, y: 0 });
  const touchMoveHandlerRef = useRef<(event: TouchEvent) => void>(() => {});
  const interactionLockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const photoScrollTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const highlightTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const highlightCooldownTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const autoCycleResetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollToCardTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const transitionDelayTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const positionRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const [centerIndicatorForce, setCenterIndicatorForce] = useState(0); // Force re-render

  const currentPhoto = groupPhotos[currentPhotoIndex];
  const photoWidth = currentPhoto?.width || 2400;
  const photoHeight = currentPhoto?.height || 1600;

  // Helper function to convert photo coordinates to container coordinates
  // Account for letterboxing when photo aspect ratio differs from container (3:4)
  const convertPhotoToContainerCoords = (location: PhotoLocation): PhotoLocation => {
    if (!currentPhoto) return location;
    
    // Get photo dimensions (either from loaded state or from data)
    const photoDims = photoDimensions[currentPhoto.id];
    const photoWidth = photoDims?.width || currentPhoto.width || 1600;
    const photoHeight = photoDims?.height || currentPhoto.height || 1000;
    const PHOTO_ASPECT = photoWidth / photoHeight;
    
    // Calculate actual container aspect ratio from rendered dimensions
    let actualContainerAspect = CONTAINER_ASPECT_RATIO;
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      if (width > 0 && height > 0) {
        actualContainerAspect = width / height;
      }
    }
    
    // Determine how the image fits in the container
    if (PHOTO_ASPECT > actualContainerAspect) {
      // Photo is wider than container - image fills width, letterboxed top/bottom
      const imageHeightInContainer = actualContainerAspect / PHOTO_ASPECT; // as fraction of container
      const verticalOffsetPct = (1 - imageHeightInContainer) / 2 * 100; // top padding as %
      
      return {
        ...location,
        y: location.y * imageHeightInContainer + verticalOffsetPct,
        height: location.height * imageHeightInContainer,
      };
    } else {
      // Photo is taller than container - image fills height, letterboxed left/right
      const imageWidthInContainer = PHOTO_ASPECT / actualContainerAspect; // as fraction of container
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
      // Force touch mode on iPad landscape to enable pan/zoom handlers
      setIsTouchMode(coarse || (touchCapable && portraitTablet) || isTabletLandscape);

      // Touch device landscape detection (iPhone, iPad, etc.)
      const isLandscapeOrientation = typeof window !== 'undefined' && window.matchMedia('(orientation: landscape)').matches;
      const isTouchDevice = typeof navigator !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      const isTabletWidth = typeof window !== 'undefined' && window.innerWidth >= 768;
      
      // Improved iPad detection: check for iPad user agent or Macintosh with touch support
      const isIPadDevice = typeof navigator !== 'undefined' &&
        (
          /iPad/.test(navigator.userAgent) ||
          (
            /Macintosh/.test(navigator.userAgent) &&
            navigator.maxTouchPoints && navigator.maxTouchPoints > 1
          )
        ) && isTabletWidth;
      
      setIsLandscape(Boolean(isLandscapeOrientation));
      setIsIPad(Boolean(isIPadDevice));
      setIsTabletLandscape(Boolean(isLandscapeOrientation && isTouchDevice));
    };

    detectTouchMode();
    window.addEventListener('resize', detectTouchMode);
    return () => window.removeEventListener('resize', detectTouchMode);
  }, []);

  // Comprehensive cleanup of ALL timers and animation frames on unmount
  // This prevents memory leaks and "repeated error" crashes on iOS
  useEffect(() => {
    return () => {
      // Clear all interval timers
      if (photoScrollTimer.current) {
        clearInterval(photoScrollTimer.current);
        photoScrollTimer.current = undefined;
      }
      if (highlightTimer.current) {
        clearInterval(highlightTimer.current);
        highlightTimer.current = undefined;
      }
      
      // Clear all timeout timers
      if (interactionLockTimer.current) {
        clearTimeout(interactionLockTimer.current);
        interactionLockTimer.current = null;
      }
      if (scrollToCardTimeoutRef.current) {
        clearTimeout(scrollToCardTimeoutRef.current);
        scrollToCardTimeoutRef.current = undefined;
      }
      if (cooldownTimer.current) {
        clearTimeout(cooldownTimer.current);
        cooldownTimer.current = undefined;
      }
      if (highlightCooldownTimer.current) {
        clearTimeout(highlightCooldownTimer.current);
        highlightCooldownTimer.current = undefined;
      }
      if (autoCycleResetTimer.current) {
        clearTimeout(autoCycleResetTimer.current);
        autoCycleResetTimer.current = undefined;
      }
      if (transitionDelayTimer.current) {
        clearTimeout(transitionDelayTimer.current);
        transitionDelayTimer.current = undefined;
      }
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
      if (panHintFadeTimerRef.current) {
        clearTimeout(panHintFadeTimerRef.current);
        panHintFadeTimerRef.current = null;
      }
      if (endTimerRef.current) {
        clearTimeout(endTimerRef.current);
        endTimerRef.current = null;
      }
      
      // Cancel animation frame
      if (animationFrameRef.current) {
        const frameId = animationFrameRef.current;
        animationFrameRef.current = 0;
        cancelAnimationFrame(frameId);
        cancelAnimationFrame(frameId);
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
    if (!currentPhoto) return;
    const peopleInPhoto = getPeopleInPhoto(people, currentPhoto.id);
    setShuffledPeople(shuffleArray(peopleInPhoto));
    setHighlightedPersonIndex(0);
  }, [currentPhoto, people]);

  // Reset zoom and overlay state when photo changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setShowCenterIndicator(false);
    // Clear overlay ready state for new photo - prevents rectangles from showing
    // until the image fully loads, avoiding flash during auto-cycle
    setOverlaysReadyForPhoto(null);
  }, [currentPhotoIndex]);

  // Ensure overlays become visible shortly after photo render (even before onLoad)
  // This helps iPad landscape where initial load may hide overlays until next flip
  useEffect(() => {
    if (!currentPhoto) return;
    const t = setTimeout(() => {
      setOverlaysReadyForPhoto(prev => prev ?? currentPhoto.id);
    }, 150);
    return () => clearTimeout(t);
  }, [currentPhoto]);

  // Handle photo transition state for face highlights
  // Only show face transitions when user manually changes photos, not during auto-cycle
  useEffect(() => {
    // Clear any existing timers to prevent race conditions
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (endTimerRef.current) {
      clearTimeout(endTimerRef.current);
      endTimerRef.current = null;
    }

    // Skip if feature disabled, initial mount, or auto-cycling
    if (!ENABLE_FACE_TRANSITION || previousPhotoRef.current === currentPhotoIndex || isAutoCycleRef.current) {
      setIsTransitioningPhoto(false);
      setShowDestinationFace(false);
      previousPhotoRef.current = currentPhotoIndex;
      isAutoCycleRef.current = false; // Reset flag after use
      return;
    }

    // Capture the actual previous index before updating for transition visuals
    setPreviousPhotoIndex(previousPhotoRef.current);
    previousPhotoRef.current = currentPhotoIndex;

    setIsTransitioningPhoto(true);
    setShowDestinationFace(false);

    fadeTimerRef.current = setTimeout(() => {
      setShowDestinationFace(true);
    }, FACE_FADE_DELAY_MS);
    
    endTimerRef.current = setTimeout(() => {
      setIsTransitioningPhoto(false);
      setShowDestinationFace(false);
    }, FACE_TRANSITION_TOTAL_MS);
    
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (endTimerRef.current) clearTimeout(endTimerRef.current);
    };
  }, [currentPhotoIndex]);

  // Unified auto-cycle: highlights people, then scrolls to next photo when cycle completes
  useEffect(() => {
    const current = groupPhotos[currentPhotoIndex];
    if (!current) return;

    const enabled = isAutoScrolling && isAutoHighlighting && shuffledPeople.length > 0;
    const peopleCount = shuffledPeople.length;

    const cleanup = startAutoCycle({
      enabled,
      peopleInPhotoCount: peopleCount,
      groupPhotosLength: groupPhotos.length,
      setHighlightedPersonIndex,
      setCurrentPhotoIndex: (updater) => {
        // Preserve component-specific side effects on photo change
        setShowCenterIndicator(false);
        isAutoCycleRef.current = true;
        setCurrentPhotoIndex(updater);
      },
      timers: {
        highlightTimer,
        autoCycleResetTimer,
        transitionDelayTimer,
      },
      currentHighlightIndex: highlightedPersonIndex,
    });

    return cleanup;
  }, [isAutoScrolling, isAutoHighlighting, shuffledPeople.length, groupPhotos.length, currentPhotoIndex]);

  // Reset zoom/pan when auto-highlighting resumes
  useEffect(() => {
    if (isAutoHighlighting) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setAutoZoomedOnPan(false);
      setIsZooming(false);
      setShowCenterIndicator(false); // Hide center indicator when auto-cycle resumes
    }
  }, [isAutoHighlighting]);

  const pauseAutoScroll = useCallback(() => {
    setIsAutoScrolling(false);
    
    if (cooldownTimer.current) {
      clearTimeout(cooldownTimer.current);
    }
    if (autoCycleResetTimer.current) {
      clearTimeout(autoCycleResetTimer.current);
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
    }, AUTO_RESUME_MS); // Resume after configured seconds of no interaction
  }, [AUTO_RESUME_MS]);

  // Handle external highlighting from grid hover (for bidirectional highlighting)
  useEffect(() => {
    // If we are in manual interaction mode (indicated by the center indicator being visible),
    // we should ignore external highlight changes to prevent auto-cycle from resuming prematurely
    // when panning to empty space (which sets highlightedPersonId to null).
    if (showCenterIndicator) return;

    if (!highlightedPersonId || shuffledPeople.length === 0) {
      // External highlight cleared: immediately reset highlight and resume auto-highlighting
      // Clear any pending highlight cooldown timer to prevent unexpected state changes
      if (highlightCooldownTimer.current) {
        clearTimeout(highlightCooldownTimer.current);
        highlightCooldownTimer.current = undefined;
      }
      setIsAutoHighlighting(true);
      setHighlightedPersonIndex(0);
      return;
    }

    // Find the index of the highlighted person in the shuffled array
    const personIndex = shuffledPeople.findIndex(p => p.id === highlightedPersonId);

    if (personIndex === -1) {
      // Tile person not in this photo: resume auto-highlight/auto-cycle
      // Clear any pending highlight cooldown timer to prevent unexpected state changes
      if (highlightCooldownTimer.current) {
        clearTimeout(highlightCooldownTimer.current);
        highlightCooldownTimer.current = undefined;
      }
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
    setHighlightedPersonIndex(personIndex);
    pauseAutoScroll();
  }, [highlightedPersonId, shuffledPeople, pauseAutoScroll]);

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
    isAutoCycleRef.current = false; // User-initiated change, enable face transitions
    // Briefly clear highlight before resuming
    setIsAutoHighlighting(false);
    setHighlightedPersonIndex(-1);
    setCurrentPhotoIndex(index);
    pauseAllAuto();

    if (highlightCooldownTimer.current) {
      clearTimeout(highlightCooldownTimer.current);
    }
    setIsAutoHighlighting(true);
    setHighlightedPersonIndex(0);

    // Resume auto photo cycling shortly after manual navigation
    if (cooldownTimer.current) {
      clearTimeout(cooldownTimer.current);
    }
    cooldownTimer.current = setTimeout(() => {
      if (groupPhotos.length > 1) {
        setIsAutoScrolling(true);
      }
    }, 500);
  };

  // Mobile touch handlers
  const handleTouchStart = (e: TouchEvent) => {
    if (interactionLocked) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Cancel any pending scroll-to-card animations when user resumes touch
    if (scrollToCardTimeoutRef.current) {
      clearTimeout(scrollToCardTimeoutRef.current);
      scrollToCardTimeoutRef.current = undefined;
    }
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    // Prevent ancestor containers from intercepting gestures (dual-column layout)
    const parentEl = containerRef.current?.parentElement;
    if (parentEl) {
      parentEl.style.touchAction = 'none';
      parentEl.style.overscrollBehavior = 'contain';
    }
    setShowCenterIndicator(true);

    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
      // Cancel any existing RAF loop before starting a new one
      if (animationFrameRef.current) {
        const frameId = animationFrameRef.current;
        animationFrameRef.current = 0;
        cancelAnimationFrame(frameId);
      }
      // Start RAF loop to continuously update center indicator during drag
      const updateCenterIndicator = () => {
        setCenterIndicatorForce(prev => prev + 1);
        animationFrameRef.current = requestAnimationFrame(updateCenterIndicator);
      };
      animationFrameRef.current = requestAnimationFrame(updateCenterIndicator);
      
      if (scale === 1) {
        setAutoZoomedOnPan(false);
      }
      // Clear any hovered state when starting to pan
      setHoveredPersonId(null);
      pauseAllAuto();
    } else if (e.touches.length === 2) {
      // Pinch zoom preparation
      setIsDragging(false);
      setIsPinching(true);
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
    if (interactionLocked && !isZooming) return;
    
    // Note: Pan hint dismissal is handled by PanGestureHint's own touch listeners,
    // not within this touch handler

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
          scaleRef.current = newScale;
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
      // If starting a pan at zero zoom and original position, auto-jump to default zoom once
      const isAtOrigin = scale === 1 && position.x === 0 && position.y === 0;
      if (isAtOrigin && !autoZoomedOnPan) {
        const defaultZoom = currentPhoto.defaultZoom || 2;
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
        // Reset drag origin to allow panning during zoom animation
        setDragStart({
          x: e.touches[0].clientX - (currentPhoto.zoomTranslation?.x ?? 0),
          y: e.touches[0].clientY - (currentPhoto.zoomTranslation?.y ?? 0)
        });
        setTimeout(() => setIsZooming(false), 300);
      }

      // Always apply drag, even during zoom animation for smooth concurrent interaction
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
      // Update refs for instant feedback
      positionRef.current = {
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      };
      // Update center indicator during drag
      setCenterIndicatorForce(prev => prev + 1);
    }
  };

  useEffect(() => {
    touchMoveHandlerRef.current = handleTouchMove;
  }, [handleTouchMove]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const listener: EventListener = (event) => {
      const touchEvent = event as unknown as TouchEvent;
      touchEvent.preventDefault();
      touchEvent.stopPropagation();
      touchMoveHandlerRef.current(touchEvent);
    };

    element.addEventListener('touchmove', listener, { passive: false });
    return () => {
      element.removeEventListener('touchmove', listener);
    };
  }, []);

  const handleTouchEnd = () => {
    // Re-enable body scroll
    document.body.style.overflow = '';
    // Restore ancestor styles
    const parentEl = containerRef.current?.parentElement;
    if (parentEl) {
      parentEl.style.touchAction = '';
      (parentEl.style as any).overscrollBehavior = '';
    }
    setIsDragging(false);
    setIsPinching(false);
    pinchStartDistance.current = 0;
    // Cancel RAF loop
    if (animationFrameRef.current) {
      const frameId = animationFrameRef.current;
      animationFrameRef.current = 0;
      cancelAnimationFrame(frameId);
    }
  };

  const handleDoubleTap = (e: TouchEvent | React.MouseEvent) => {
    if (interactionLocked) return;
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected - toggle zoom
      if (scale === 1) {
        lockInteraction(350);
        setIsZooming(true);
        setScale(2);
        setAutoZoomedOnPan(true);
        setTimeout(() => setIsZooming(false), 300);
      } else {
        lockInteraction(350);
        setIsZooming(true);
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setAutoZoomedOnPan(false);
        setTimeout(() => setIsZooming(false), 300);
      }
      pauseAllAuto();
    }
    setLastTap(now);
    setShowCenterIndicator(true);
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
              padding-bottom: ${100 / CONTAINER_ASPECT_RATIO}% !important;
              position: relative !important;
            }
          }
        `}
      </style>
      {/* Photo viewer - fixed vertical rectangle container */}
      <div 
        className="relative mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/30 border border-slate-700/50 bg-slate-900/70 aspect-3-4-fallback" 
        style={{ 
          width: '100%', 
          height: (isIPad || isTablet || (isLandscape && isTouchMode)) ? '75vh' : undefined,
          maxWidth: (isIPad || isTablet || (isLandscape && isTouchMode)) ? undefined : '500px', 
          maxHeight: (isIPad || isTablet || (isLandscape && isTouchMode)) ? undefined : '75vh',
          aspectRatio: CONTAINER_ASPECT_RATIO
        }}
      >
        <div
          ref={containerRef}
          className="relative w-full h-full bg-slate-800/50 overflow-hidden touch-none flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onClick={(e) => {
            if (isTouchMode) {
              handleDoubleTap(e as any);
            }
          }}
          style={{ touchAction: 'none' }}
        >
          <div
            style={{
              width: `${scale * 100.5}%`,
              height: `${scale * 100.5}%`,
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
              transition: isPinching 
                ? 'none' 
                : isDragging 
                  ? 'width 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
                  : 'width 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              willChange: 'width, height, transform',
              position: 'absolute',
              top: '50%',
              left: '50%',
            }}
            className="relative leading-none"
          >
            <Image
              src={currentPhoto.imagePath}
              alt={currentPhoto.name}
              width={photoWidth}
              height={photoHeight}
              unoptimized
              className="w-full h-full object-contain object-center block pointer-events-none"
              style={{ imageRendering: 'auto' }}
              priority
              draggable={false}
              onLoad={(e) => {
                const img = e.currentTarget;
                setPhotoDimensions((prev) => {
                  if (prev[currentPhoto.id]) {
                    return prev;
                  }
                  return { ...prev, [currentPhoto.id]: { width: img.naturalWidth, height: img.naturalHeight } };
                });
                // Mark overlays as ready for this specific photo after image loads
                setOverlaysReadyForPhoto(currentPhoto.id);
              }}
            />

                {/* Interactive regions overlay */}
                <div className={`absolute inset-0 z-10 w-full h-full ${isTabletLandscape ? 'pointer-events-none' : 'pointer-events-auto'}`}>
              {/* Debug: True center point dot */}
              {SHOW_DEBUG_HITBOXES && (() => {
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

              {/* Person image transition removed for this branch */}
              
              {/* Center indicator component */}
              {showCenterIndicator && (
                <CenterIndicator
                  show={showCenterIndicator}
                  position={position}
                  scale={scale}
                  currentPhoto={currentPhoto}
                  shuffledPeople={shuffledPeople}
                  isAutoHighlighting={isAutoHighlighting}
                  centerIndicatorForce={centerIndicatorForce}
                  convertPhotoToContainerCoords={convertPhotoToContainerCoords}
                  containerRef={containerRef}
                  FACE_HITBOX_PADDING={FACE_HITBOX_PADDING}
                  onHighlightedPersonChange={onHighlightedPersonChange}
                />
              )}

              {shuffledPeople.map((person, idx) => {
                // Two-stage guard: wait for initial render frame AND current photo to load
                // This prevents rectangles from flashing when auto-cycling to new photos
                if (overlaysReadyForPhoto !== currentPhoto.id) return null;
                
                const location = person.photoLocations.find(
                  loc => loc.photoId === currentPhoto.id
                );
                
                if (!location) return null;

                const isHighlighted = isAutoHighlighting && idx === highlightedPersonIndex;
                
                // During auto-cycle, only show the highlighted person's overlay
                if (isAutoHighlighting && !isHighlighted) return null;

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

                // Determine if face transition overlays should be rendered for this person
                // Only render during manual transitions (not auto-cycle) for highlighted or visible people
                const shouldRenderFaceTransition = ENABLE_FACE_TRANSITION && 
                  isTransitioningPhoto && 
                  !isAutoCycleRef.current && 
                  (isHighlighted || showWhenZoomed);

                return (
                  <div
                    key={person.id}
                    className={`absolute transition-all duration-300 touch-none select-none ${(isHighlighted || showWhenZoomed) ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}`}
                    style={{
                      left: `${adjustedLocation.x}%`,
                      top: `${adjustedLocation.y}%`,
                      width: `${adjustedLocation.width}%`,
                      height: `${adjustedLocation.height}%`,
                    }}
                    onMouseEnter={() => {
                      if (isHighlighted || showWhenZoomed) {
                        setHoveredPersonId(person.id);
                        pauseAllAuto();
                      }
                    }}
                    onMouseLeave={() => {
                      if (isHighlighted || showWhenZoomed) {
                        setHoveredPersonId(null);
                      }
                    }}
                    onClick={(e) => {
                      // Only allow clicks if this person is highlighted or shown when zoomed
                      if (!isHighlighted && !showWhenZoomed) {
                        return;
                      }
                      pauseAllAuto();
                      if (scrollToCardTimeoutRef.current) {
                        clearTimeout(scrollToCardTimeoutRef.current);
                        scrollToCardTimeoutRef.current = undefined;
                      }
                      
                      e.stopPropagation();
                      
                      if (isTabletLandscape) {
                        // On iPad landscape: scroll to card, but only open modal on mouse clicks (not touch)
                        const personCardId = `person-card-desktop-${person.id}`;
                        const cardElement = document.getElementById(personCardId);
                        if (cardElement) {
                          const rightPanel = document.getElementById('desktop-right-panel');
                          if (rightPanel) {
                            const cardTop = cardElement.offsetTop;
                            rightPanel.scrollTo({ top: cardTop - 100, behavior: 'smooth' });
                          }
                          cardElement.classList.add('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
                          setTimeout(() => {
                            cardElement.classList.remove('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
                          }, 2000);
                        }
                        
                        // Only open modal on mouse events, not touch
                        const isMouseEvent = e.nativeEvent instanceof PointerEvent && e.nativeEvent.pointerType === 'mouse';
                        if (onPersonClick && isMouseEvent) {
                          setTimeout(() => {
                            onPersonClick(person);
                          }, 1200);
                        }
                      } else {
                        // Scroll to the person's card (mobile behavior)
                        if (onPersonClick) {
                          onPersonClick(person);
                        } else {
                          const personCardId = `person-card-mobile-${person.id}`;
                          const cardElement = document.getElementById(personCardId);
                          if (cardElement) {
                            scrollToCardTimeoutRef.current = setTimeout(() => {
                              cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              scrollToCardTimeoutRef.current = undefined;
                            }, 50);
                            cardElement.classList.add('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
                            setTimeout(() => {
                              cardElement.classList.remove('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
                            }, 2000);
                          }
                        }
                      }
                    }}
                  >
                    {/* Debug: Show expanded hitbox */}
                    {SHOW_DEBUG_HITBOXES && !isAutoHighlighting && (
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
                    
                    {/* Face Image during transition - Previous photo (fades out) */}
                    {shouldRenderFaceTransition && (() => {
                      const prevPhoto = groupPhotos[previousPhotoIndex];
                      if (!prevPhoto) return null;
                      
                      const prevLocation = person.photoLocations.find(
                        loc => loc.photoId === prevPhoto.id
                      );
                      
                      if (!prevLocation) return null;
                      
                      return (
                        <div 
                            className="absolute inset-0 overflow-hidden rounded-lg z-0 transition-opacity"
                            style={{ opacity: showDestinationFace ? 0 : 1, transitionDuration: `${FACE_FADE_DURATION_MS}ms` }}
                        >
                            <PersonImage person={person} groupPhotos={groupPhotos} className="object-cover" forcePhotoId={prevPhoto.id} priority />
                        </div>
                      );
                    })()}
                    
                    {/* Face Image during transition - Current photo (fades in) */}
                    {shouldRenderFaceTransition && (
                      <div 
                          className="absolute inset-0 overflow-hidden rounded-lg z-10 transition-opacity"
                          style={{ opacity: showDestinationFace ? 1 : 0, transitionDuration: `${FACE_FADE_DURATION_MS}ms` }}
                      >
                          <PersonImage person={person} groupPhotos={groupPhotos} className="object-cover" forcePhotoId={currentPhoto.id} priority />
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
                    
                    <CarouselNameTag
                      person={person}
                      isVisible={isHighlighted || showWhenZoomed}
                      location={location}
                      variant="mobile"
                      onClick={(e) => {
                        if (isTabletLandscape) {
                          // On iPad landscape: scroll to card, but only open modal on mouse clicks (not touch)
                          const personCardId = `person-card-desktop-${person.id}`;
                          const cardElement = document.getElementById(personCardId);
                          if (cardElement) {
                            const rightPanel = document.getElementById('desktop-right-panel');
                            if (rightPanel) {
                              const cardTop = cardElement.offsetTop;
                              rightPanel.scrollTo({ top: cardTop - 100, behavior: 'smooth' });
                            }
                            cardElement.classList.add('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
                            setTimeout(() => {
                              cardElement.classList.remove('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
                            }, 2000);
                          }
                          
                          // Only open modal on mouse events, not touch
                          const isMouseEvent = e.nativeEvent instanceof PointerEvent && e.nativeEvent.pointerType === 'mouse';
                          if (onPersonClick && isMouseEvent) {
                            setTimeout(() => {
                              onPersonClick(person);
                            }, 1200);
                          }
                        } else {
                          // Scroll to the person's card (mobile behavior)
                          const personCardId = `person-card-mobile-${person.id}`;
                          const cardElement = document.getElementById(personCardId);
                          if (cardElement) {
                            cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            cardElement.classList.add('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
                            setTimeout(() => {
                              cardElement.classList.remove('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50');
                            }, 2000);
                          }
                          
                          if (onPersonClick) {
                            setTimeout(() => {
                              onPersonClick(person);
                            }, 1200);
                          }
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Photo name overlay */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20">
          <div className="bg-black/70 px-2 py-1 sm:px-4 sm:py-2 rounded-lg">
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
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 bg-black/70 rounded-lg p-1">
            {(scale > 1 || position.x !== 0 || position.y !== 0) && (
              <>
                <button
                  onClick={() => {
                    setScale(1);
                    setPosition({ x: 0, y: 0 });
                    setAutoZoomedOnPan(false);
                    pauseAllAuto();
                  }}
                  className="p-2 text-white transition-all touch-manipulation"
                  aria-label="Reset zoom and position"
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
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/70 text-white p-2.5 rounded-lg transition-all duration-200 active:scale-95 touch-manipulation shadow-lg md:left-4 md:p-3"
              aria-label="Previous photo"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => handlePhotoNavigation((currentPhotoIndex + 1) % groupPhotos.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/70 text-white p-2.5 rounded-lg transition-all duration-200 active:scale-95 touch-manipulation shadow-lg md:right-4 md:p-3"
              aria-label="Next photo"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Pan gesture hint - shows if user hasn't panned within configured delay */}
        {isTouchMode && !hasPanned && (
          <PanGestureHint onInteraction={schedulePanHintDismiss} />
        )}
      </div>

      {/* Mobile instructions */}
      {isTouchMode && !hideInstructions && (
        <div className="mt-3 text-center">
          <p className="text-slate-400 text-sm">
            Pinch or use +/− to zoom • Drag to pan
          </p>
        </div>
      )}
    </div>
  );
}
