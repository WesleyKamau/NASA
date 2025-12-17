'use client';

import { Person, GroupPhoto } from '@/types';
import React from 'react';

interface CenterIndicatorProps {
  show: boolean;
  position: { x: number; y: number };
  scale: number;
  currentPhoto: GroupPhoto;
  shuffledPeople: Person[];
  isAutoHighlighting: boolean;
  centerIndicatorForce: number;
  convertPhotoToContainerCoords: (location: PhotoLocation) => PhotoLocation;
  containerRef: React.RefObject<HTMLDivElement | null>;
  FACE_HITBOX_PADDING: number;
  onHighlightedPersonChange?: (personId: string | null) => void;
}

export default function CenterIndicator({
  show,
  position,
  scale,
  currentPhoto,
  shuffledPeople,
  isAutoHighlighting,
  centerIndicatorForce,
  convertPhotoToContainerCoords,
  containerRef,
  FACE_HITBOX_PADDING,
  onHighlightedPersonChange,
}: CenterIndicatorProps) {
  if (!show || !containerRef.current) return null;

  const rect = containerRef.current.getBoundingClientRect();
  const imageCenterOffsetX = -position.x / (rect.width * scale) * 100;
  const imageCenterOffsetY = -position.y / (rect.height * scale) * 100;

  const visibleCenterX = 50 + imageCenterOffsetX;
  const visibleCenterY = 50 + imageCenterOffsetY;

  // Find the closest person whose expanded hitbox contains the center point
  const closestPersonData = React.useMemo(() => {
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
          const isInside =
            visibleCenterX >= expandedX &&
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
        .filter((item): item is { person: Person; location: PhotoLocation; expandedLocation: PhotoLocation; distance: number } => item !== null)
        .sort((a, b) => a.distance - b.distance);

      if (peopleInsideHitbox.length > 0) {
        closestPerson = peopleInsideHitbox[0].person;
        // Use the actual face location, not the expanded hitbox
        closestLocation = peopleInsideHitbox[0].location;
      }
    }

    return { closestPerson, closestLocation };
  }, [isAutoHighlighting, shuffledPeople, currentPhoto.id, visibleCenterX, visibleCenterY, FACE_HITBOX_PADDING, centerIndicatorForce]);

  // Notify parent of highlighted person change
  React.useEffect(() => {
    if (!isAutoHighlighting) {
      onHighlightedPersonChange?.(closestPersonData.closestPerson?.id || null);
    }
  }, [closestPersonData.closestPerson?.id, isAutoHighlighting, onHighlightedPersonChange]);

  // Calculate average face rectangle size for the circle
  const avgFaceSize =
    shuffledPeople.reduce((sum, p) => {
      const loc = p.photoLocations.find(l => l.photoId === currentPhoto.id);
      if (!loc) return sum;
      return sum + Math.max(loc.width, loc.height);
    }, 0) / Math.max(shuffledPeople.length, 1);

  // If a person is selected, morph to their rectangle
  if (closestPersonData.closestLocation) {
    const adjustedLocation = convertPhotoToContainerCoords(closestPersonData.closestLocation);
    return (
      <div
        className="absolute z-50 pointer-events-none"
        data-testid="center-indicator"
        style={{
          left: `${adjustedLocation.x}%`,
          top: `${adjustedLocation.y}%`,
          width: `${adjustedLocation.width}%`,
          height: `${adjustedLocation.height}%`,
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          filter: 'blur(0.3px)',
        }}
      >
        <div className="absolute inset-0 bg-white/20 border-2 border-white/60 rounded-lg shadow-lg" />
      </div>
    );
  }

  // Otherwise, show as a circle at the center with motion blur
  const circleSize = avgFaceSize; // This is in percentage

  return (
    <div
      className="absolute z-50 pointer-events-none"
      data-testid="center-indicator"
      style={{
        left: `${visibleCenterX}%`,
        top: `${visibleCenterY}%`,
        transform: 'translate(-50%, -50%)',
        transition: 'left 0.1s ease-out, top 0.1s ease-out',
        filter: 'blur(1.5px)',
        willChange: 'left, top',
      }}
    >
      <div
        className="bg-white/20 border-2 border-white/60 rounded-full shadow-lg"
        style={{
          width: `${circleSize}vw`,
          height: `${circleSize}vw`,
          aspectRatio: '1 / 1',
          filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.4))',
        }}
      />
    </div>
  );
}
