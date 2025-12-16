'use client';

import { Person, GroupPhoto } from '@/types';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { getPersonImage } from '@/lib/imageUtils';
import { imageLoadQueue } from '@/lib/imageLoadQueue';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isQueued, setIsQueued] = useState(false);
  const onLoadDoneRef = useRef<(() => void) | null>(null);
  
  // Cleanup on unmount to prevent queue stalling
  useEffect(() => {
    return () => {
      if (onLoadDoneRef.current) {
        onLoadDoneRef.current();
        onLoadDoneRef.current = null;
      }
    };
  }, []);

  // Intersection Observer for lazy loading with queue
  useEffect(() => {
    if (priority || shouldLoad || isQueued) return; // Skip if already loading or queued
    
    const element = containerRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Add to queue instead of loading immediately
            setIsQueued(true);
            imageLoadQueue.enqueue((done) => {
              onLoadDoneRef.current = done;
              setShouldLoad(true);
            });
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Increased margin for smoother loading
        threshold: 0.01
      }
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [priority, shouldLoad, isQueued]);
  
  // Don't render anything unless explicitly shown
  if (!show) return null;
  
  // If forcePhotoId is provided, temporarily override the person's preferredPhotoId
  const personWithForcedPhoto = forcePhotoId ? {
    ...person,
    preferredPhotoId: forcePhotoId
  } : person;
  
  const imageInfo = getPersonImage(personWithForcedPhoto, groupPhotos, !!forcePhotoId);

  const renderContent = () => {
    // Show placeholder until image should load
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
        <Image
          src={imageInfo.src}
          alt={person.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover ${className}`}
          onError={() => {
            setImageError(true);
            if (onLoadDoneRef.current) {
              onLoadDoneRef.current();
              onLoadDoneRef.current = null;
            }
          }}
          onLoad={() => {
            if (onLoadDoneRef.current) {
              onLoadDoneRef.current();
              onLoadDoneRef.current = null;
            }
          }}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
        />
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
        <div className="relative w-full h-full overflow-hidden">
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
              setImageError(true);
              if (onLoadDoneRef.current) {
                onLoadDoneRef.current();
                onLoadDoneRef.current = null;
              }
            }}
            onLoad={() => {
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
