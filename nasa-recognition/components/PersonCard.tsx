'use client';

import { Person } from '@/types';
import Image from 'next/image';
import { useState } from 'react';

interface PersonCardProps {
  person: Person;
  onClick?: () => void;
}

export default function PersonCard({ person, onClick }: PersonCardProps) {
  const [imageError, setImageError] = useState(false);

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
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <p className="text-white text-sm font-medium">Click to view</p>
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
