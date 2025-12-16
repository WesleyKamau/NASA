'use client';

import { Person, GroupPhoto } from '@/types';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getPersonImage } from '@/lib/imageUtils';
import { imageLoadQueue } from '@/lib/imageLoadQueue';
import { scrollManager } from '@/lib/scrollManager';
import { crashLogger } from '@/lib/crashLogger';

interface PersonImageProps {
  person: Person;
  groupPhotos: GroupPhoto[];
  className?: string;
  priority?: boolean;
  forcePhotoId?: string; // Force using a specific photo instead of preferred
  show?: boolean; // Only render when true (default: true)
}

export default function PersonImage({ person, groupPhotos, className = '', priority = false, forcePhotoId, show = true }: PersonImageProps) {
  const [imageError, setImageError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority); // Only load immediately if priority
  const [isLoaded, setIsLoaded] = useState(false); // Track when image finishes loading for animation
  const containerRef = useRef<HTMLDivElement>(null);
  const [isQueued, setIsQueued] = useState(false);
  const onLoadDoneRef = useRef<(() => void) | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInViewportRef = useRef(false); // Track if currently in viewport
  const scrollUnsubRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);
  
  // Generate stable ID for this image for queue deduplication
  const imageId = `${person.id}-${forcePhotoId || 'default'}`;
  
  // Cleanup on unmount to prevent queue stalling
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (onLoadDoneRef.current) {
        onLoadDoneRef.current();
        onLoadDoneRef.current = null;
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (scrollUnsubRef.current) {
        scrollUnsubRef.current();
        scrollUnsubRef.current = null;
      }
    };
  }, []);

  // Try to queue image - called when in viewport and scroll stops
  const tryQueue = useCallback(() => {
    if (isQueued || shouldLoad || priority) return;
    if (!isInViewportRef.current) return;
    
    const success = imageLoadQueue.enqueue(imageId, (done) => {
      onLoadDoneRef.current = done;
      setShouldLoad(true);
    });
    
    if (success) {
      setIsQueued(true);
      // Successfully queued - disconnect observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      // Unsubscribe from scroll events
      if (scrollUnsubRef.current) {
        scrollUnsubRef.current();
        scrollUnsubRef.current = null;
      }
    }
    // If not successful (scroll blocking or queue full), keep observer active for retry
  }, [imageId, isQueued, shouldLoad, priority]);

  // Subscribe to scroll stop events for retry
  useEffect(() => {
    if (priority || shouldLoad || isQueued) return;
    
    // Subscribe to scroll state changes to retry when scrolling stops
    scrollUnsubRef.current = scrollManager.subscribe(() => {
      // Scroll just stopped - try to queue if we're in viewport
      if (isInViewportRef.current) {
        tryQueue();
      }
    });
    
    return () => {
      if (scrollUnsubRef.current) {
        scrollUnsubRef.current();
        scrollUnsubRef.current = null;
      }
    };
  }, [priority, shouldLoad, isQueued, tryQueue]);

  // Intersection Observer for lazy loading with queue
  useEffect(() => {
    if (priority || shouldLoad || isQueued) {
      // Clean up observer if we're already loading/loaded
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }
    
    const element = containerRef.current;
    if (!element) return;
    
    // Create observer with reduced sensitivity to prevent rapid firing on fast scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          isInViewportRef.current = entry.isIntersecting;
          
          if (entry.isIntersecting) {
            // Debounce to prevent rapid-fire triggers during fast scrolling
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }
            
            const isIntersectingAtSchedule = entry.isIntersecting;
            debounceTimerRef.current = setTimeout(() => {
              // Only call tryQueue if the element was still intersecting at the time of scheduling
              if (isIntersectingAtSchedule) {
                tryQueue();
              }
            }, 150); // 150ms debounce
          }
        });
      },
      {
        rootMargin: '50px', // Reduced from 100px - less aggressive prefetching
        threshold: 0.1 // Increased from 0.01 - require more visibility before triggering
      }
    );
    
    observerRef.current = observer;
    observer.observe(element);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [priority, shouldLoad, isQueued, tryQueue]);
  
  // Don't render anything unless explicitly shown
  if (!show) return null;
  
  // If forcePhotoId is provided, temporarily override the person's preferredPhotoId
  const personWithForcedPhoto = forcePhotoId ? {
    ...person,
    preferredPhotoId: forcePhotoId
  } : person;
  
  const imageInfo = getPersonImage(personWithForcedPhoto, groupPhotos, !!forcePhotoId);

  const renderContent = () => {
    // Show placeholder until image should load and is loaded
    const showPlaceholder = !shouldLoad || !isLoaded;
    
    if (!shouldLoad) {
      return (
        <div 
          className={`w-full h-full flex items-center justify-center font-bold text-blue-400/30 bg-slate-800/30 ${className}`}
        >
          {imageInfo.placeholder || person.name.charAt(0)}
        </div>
      );
    }

    if (imageInfo.type === 'individual' && imageInfo.src && !imageError) {
      return (
        <>
          {/* Keep placeholder visible until image loads for smooth transition */}
          {showPlaceholder && (
            <div 
              className={`absolute inset-0 w-full h-full flex items-center justify-center font-bold text-blue-400/30 bg-slate-800/30 ${className}`}
            >
              {imageInfo.placeholder || person.name.charAt(0)}
            </div>
          )}
          <Image
            src={imageInfo.src}
            alt={person.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
            onError={() => {
              if (!isMountedRef.current) return;
              crashLogger.log('error', `Image load error: ${person.name} (${imageInfo.src})`);
              setImageError(true);
              if (onLoadDoneRef.current) {
                onLoadDoneRef.current();
                onLoadDoneRef.current = null;
              }
            }}
            onLoad={() => {
              if (!isMountedRef.current) return;
              crashLogger.log('image', `Image loaded: ${person.name}`);
              setIsLoaded(true);
              if (onLoadDoneRef.current) {
                onLoadDoneRef.current();
                onLoadDoneRef.current = null;
              }
            }}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
        </>
      );
    }

    if (imageInfo.type === 'cropped-group' && imageInfo.src && !imageError) {
      const { x, y, width, height } = imageInfo.crop || { x: 0, y: 0, width: 100, height: 100 };
      const rotation = imageInfo.rotation || 0;
      
      // Calculate center of crop relative to the image
      // x, y, width, height are percentages of the image
      const cx = x + width / 2;
      const cy = y + height / 2;

      return (
        <div 
          className={`relative w-full h-full overflow-hidden transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={imageInfo.src}
            alt={person.name}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: `${10000 / width}%`,
              height: `${10000 / height}%`,
              transformOrigin: `${cx}% ${cy}%`,
              transform: `translate(-${cx}%, -${cy}%) rotate(${rotation}deg)`,
              maxWidth: 'none',
              maxHeight: 'none',
            }}
            onError={() => {
              if (!isMountedRef.current) return;
              setImageError(true);
              if (onLoadDoneRef.current) {
                onLoadDoneRef.current();
                onLoadDoneRef.current = null;
              }
            }}
            onLoad={() => {
              if (!isMountedRef.current) return;
              setIsLoaded(true);
              if (onLoadDoneRef.current) {
                onLoadDoneRef.current();
                onLoadDoneRef.current = null;
              }
            }}
          />
        </div>
      );
    }

    return (
      <div className={`w-full h-full flex items-center justify-center font-bold text-blue-400/30 ${className}`}>
        {imageInfo.placeholder || person.name.charAt(0)}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {renderContent()}
    </div>
  );
}
