'use client';

import { Person, GroupPhoto } from '@/types';
import PersonImage from './PersonImage';

interface PersonCardProps {
  person: Person;
  groupPhotos: GroupPhoto[];
  onClick?: () => void;
  idPrefix?: string;
  priority?: boolean;
}

export default function PersonCard({ person, groupPhotos, onClick, idPrefix = '', priority = false }: PersonCardProps) {
  const isWesley = person.id === 'wesley-kamau';
  
  return (
    <button
      id={`person-card-${idPrefix}${person.id}`}
      onClick={onClick}
      className={`group relative w-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-lg p-2 sm:p-3 transition-all duration-300 cursor-pointer border border-slate-700/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 touch-manipulation ${
        isWesley ? 'ring-2 ring-blue-500/50' : ''
      }`}
      aria-label={`View ${person.name}'s profile`}
    >
      {/* Photo */}
      <div className="w-full aspect-square mb-1.5 sm:mb-2 rounded-lg overflow-hidden bg-slate-800/50 relative">
        <PersonImage 
          person={person} 
          groupPhotos={groupPhotos} 
          className="text-3xl sm:text-4xl" 
          priority={priority}
        />
        
        {/* Overlay for desktop hover - hidden on touch devices */}
        <div className="hidden sm:flex absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-end p-3">
          <p className="text-white text-sm font-medium">
            Click to view
          </p>
        </div>
      </div>

      {/* Name */}
      <h3 className="text-white font-semibold text-sm sm:text-base mb-0.5 truncate text-left">
        {person.name}
      </h3>

      {/* Description */}
      <p className="text-slate-300 text-xs line-clamp-1 text-left">
        {person.description}
      </p>
    </button>
  );
}
