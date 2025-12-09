'use client';

import { Person } from '@/types';
import Image from 'next/image';
import { useState } from 'react';

interface PersonCardProps {
  person: Person;
  onClick?: () => void;
  onPhotoClick?: () => void;
}

export default function PersonCard({ person, onClick, onPhotoClick }: PersonCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasGroupPhoto = person.photoLocations && person.photoLocations.length > 0;

  return (
    <div
      onClick={onClick}
      className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer hover:-translate-y-1"
    >
      {/* Photo */}
      <div className="w-full aspect-square mb-3 rounded-lg overflow-hidden bg-slate-800/50 relative">
        {person.individualPhoto && !imageError ? (
          <Image
            src={person.individualPhoto}
            alt={person.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-blue-400/30">
            {person.name.charAt(0)}
          </div>
        )}
        
        {/* Zoom to group photo button */}
        {hasGroupPhoto && onPhotoClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPhotoClick();
            }}
            className="absolute top-2 right-2 p-2 bg-blue-500/90 hover:bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
            title="Zoom to face in group photo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <p className="text-white text-sm font-medium">
            {hasGroupPhoto && onPhotoClick ? 'Click card for details • 🔍 for photo' : 'Click to view'}
          </p>
        </div>
      </div>

      {/* Name */}
      <h3 className="text-white font-semibold text-lg mb-1 truncate">
        {person.name}
      </h3>

      {/* Description */}
      <p className="text-slate-300 text-sm line-clamp-2">
        {person.description}
      </p>

      {/* Category badge */}
      <div className="absolute top-2 right-2">
        <span className={`text-xs px-2 py-1 rounded-full ${
          person.category === 'staff' 
            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
        }`}>
          {person.category}
        </span>
      </div>
    </div>
  );
}
