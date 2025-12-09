'use client';

import { GroupPhoto, Person } from '@/types';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import PersonModal from './PersonModal';

interface InteractiveGroupPhotoProps {
  groupPhoto: GroupPhoto;
  people: Person[];
  zoomToPerson?: string | null; // Person ID to zoom to
  onZoomChange?: (personId: string | null) => void;
}

export default function InteractiveGroupPhoto({ groupPhoto, people, zoomToPerson, onZoomChange }: InteractiveGroupPhotoProps) {
  const [hoveredPerson, setHoveredPerson] = useState<Person | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [zoomedPerson, setZoomedPerson] = useState<Person | null>(null);

  // Handle external zoom requests
  useEffect(() => {
    if (zoomToPerson) {
      const person = people.find(p => p.id === zoomToPerson);
      if (person) {
        setZoomedPerson(person);
      }
    } else {
      setZoomedPerson(null);
    }
  }, [zoomToPerson, people]);

  const handleZoomReset = () => {
    setZoomedPerson(null);
    onZoomChange?.(null);
  };

  // Get people who are in this photo
  const peopleInPhoto = people.filter(person =>
    person.photoLocations.some(loc => loc.photoId === groupPhoto.id)
  );

  return (
    <>
      <div className="w-full">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          {groupPhoto.name}
        </h2>

        <div className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-slate-700/50">
          {/* The group photo */}
          <div className="relative w-full bg-slate-800/50">
            <div
              style={{
                transform: zoomedPerson ? (() => {
                  const location = zoomedPerson.photoLocations.find(loc => loc.photoId === groupPhoto.id);
                  if (!location) return 'scale(1)';
                  
                  // Calculate zoom to fit face with padding
                  const zoomX = 100 / location.width;
                  const zoomY = 100 / location.height;
                  const zoom = Math.min(zoomX, zoomY, 3) * 0.8; // Cap at 3x, add padding
                  
                  // Calculate translation to center the face
                  const centerX = location.x + location.width / 2;
                  const centerY = location.y + location.height / 2;
                  const translateX = (50 - centerX) * zoom;
                  const translateY = (50 - centerY) * zoom;
                  
                  return `scale(${zoom}) translate(${translateX}%, ${translateY}%)`;
                })() : 'scale(1)',
                transformOrigin: 'center center',
                transition: 'transform 0.5s ease-in-out',
              }}
            >
              <Image
                src={groupPhoto.imagePath}
                alt={groupPhoto.name}
                width={1600}
                height={1000}
                className="w-full h-auto object-contain"
                priority
              />

              {/* Clickable regions overlay */}
              <div className="absolute inset-0">
              {peopleInPhoto.map((person) => {
                const location = person.photoLocations.find(
                  loc => loc.photoId === groupPhoto.id
                );
                
                if (!location) return null;

                const isHovered = hoveredPerson?.id === person.id;

                return (
                  <div
                    key={person.id}
                    className="absolute cursor-pointer group"
                    style={{
                      left: `${location.x}%`,
                      top: `${location.y}%`,
                      width: `${location.width}%`,
                      height: `${location.height}%`,
                    }}
                    onMouseEnter={() => setHoveredPerson(person)}
                    onMouseLeave={() => setHoveredPerson(null)}
                    onClick={() => setSelectedPerson(person)}
                  >
                    {/* Hover highlight overlay */}
                    <div
                      className={`absolute inset-0 border-4 rounded-lg transition-all duration-200 ${
                        isHovered
                          ? 'border-blue-400 bg-blue-400/20 shadow-lg shadow-blue-500/50'
                          : 'border-transparent bg-transparent'
                      }`}
                    />

                    {/* Name tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 animate-fadeIn">
                        <div className="bg-slate-900/95 backdrop-blur-sm border border-blue-500/50 rounded-lg px-4 py-2 shadow-xl shadow-blue-500/30 whitespace-nowrap">
                          <p className="text-white font-semibold text-sm">
                            {person.name}
                          </p>
                          <p className="text-slate-300 text-xs">
                            {person.description}
                          </p>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                          <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-blue-500/50" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            </div>
          </div>

          {/* Info banner */}
          {peopleInPhoto.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center p-6">
                <p className="text-white text-lg mb-2">
                  📸 Photo locations not yet configured
                </p>
                <p className="text-slate-300 text-sm">
                  Add face coordinates to people.json to make this photo interactive
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        {peopleInPhoto.length > 0 && (
          <div className="mt-4 text-center flex items-center justify-center gap-4">
            <p className="text-slate-400 text-sm">
              Hover over faces to see names • {peopleInPhoto.length} people tagged
            </p>
            {zoomedPerson && (
              <button
                onClick={handleZoomReset}
                className="px-4 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                Reset Zoom
              </button>
            )}
          </div>
        )}
      </div>

      {selectedPerson && (
        <PersonModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </>
  );
}
