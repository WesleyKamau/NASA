
"use client";

import React, { useState, useEffect } from 'react';
import { Person, PhotoLocation } from '@/types';

interface PersonHighlightProps {
  photoId: string;
  allPeople: Person[];
  photoDimensions: { width: number; height: number };
}

const PersonHighlight: React.FC<PersonHighlightProps> = ({ photoId, allPeople, photoDimensions }) => {
  const [highlightedPerson, setHighlightedPerson] = useState<{ person: Person; location: PhotoLocation } | null>(null);

  useEffect(() => {
    // Find all people in this photo
    const peopleInPhoto = allPeople
      .map(person => {
        const location = person.photoLocations.find((loc: PhotoLocation) => loc.photoId === photoId);
        return location ? { person, location } : null;
      })
      .filter((item): item is { person: Person; location: PhotoLocation } => item !== null);

    if (peopleInPhoto.length === 0) return;

    let currentIndex = -1;
    const shuffledPeople = [...peopleInPhoto].sort(() => 0.5 - Math.random());

    const cycle = () => {
      currentIndex = (currentIndex + 1) % shuffledPeople.length;
      setHighlightedPerson(shuffledPeople[currentIndex]);
    };

    cycle(); // Initial highlight
    const interval = setInterval(cycle, 2500); // 2.5 seconds per person

    return () => clearInterval(interval);
  }, [photoId, allPeople]);

  if (!highlightedPerson) {
    return null;
  }

  const { person, location } = highlightedPerson;
  const { x, y, width: cropWidth, height: cropHeight } = location;
  const { width, height } = photoDimensions;

  // Calculate position and size based on original photo dimensions
  const left = `${x + cropWidth / 2}%`;
  const top = `${y + cropHeight / 2}%`;
  const diameter = `${Math.min(cropWidth, cropHeight)}%`;

  return (
    <div
      className="absolute transition-all duration-1000 ease-in-out"
      style={{
        left,
        top,
        width: diameter,
        paddingBottom: diameter, // to maintain aspect ratio for circle
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="absolute inset-0 border-4 border-blue-400 rounded-full shadow-lg bg-blue-400/20 animate-pulse"></div>
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2">
        <div className="bg-slate-900/90 backdrop-blur-sm text-white text-center p-2 rounded-md shadow-lg whitespace-nowrap">
          <p className="font-bold">{person.name}</p>
          <p className="text-xs text-slate-300">{person.description}</p>
        </div>
      </div>
    </div>
  );
};

export default PersonHighlight;
