'use client';

import { Person, GroupPhoto } from '@/types';
import PersonImage from './PersonImage';

interface PersonCardProps {
  person: Person;
  groupPhotos: GroupPhoto[];
  onClick?: () => void;
  idPrefix?: string;
  priority?: boolean;
  isHighlighted?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function PersonCard({ person, groupPhotos, onClick, idPrefix = '', priority = false, isHighlighted = false, onMouseEnter, onMouseLeave }: PersonCardProps) {
  const isWesley = person.id === 'wesley-kamau';
  
  return (
    <button
      id={`person-card-${idPrefix}${person.id}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group relative w-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-3 sm:p-4 transition-all duration-300 cursor-pointer border border-white/10 hover:border-blue-400/60 hover:shadow-[0_0_30px_rgba(96,165,250,0.3)] hover:scale-105 active:scale-95 touch-manipulation ${
        isHighlighted 
          ? 'border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-105' 
          : ''
      } ${
        isWesley ? 'ring-2 ring-blue-400/60 ring-offset-2 ring-offset-black' : ''
      }`}
      aria-label={`View ${person.name}'s profile`}
    >
      {/* Photo */}
      <div className="w-full aspect-square mb-2 sm:mb-3 rounded-xl overflow-hidden bg-slate-800/30 relative">
        <PersonImage 
          person={person} 
          groupPhotos={groupPhotos} 
          className="text-3xl sm:text-4xl" 
          priority={priority}
        />
        
        {/* Overlay for desktop hover - hidden on touch devices */}
        <div className="hidden sm:flex absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-end p-4">
          <p className="text-white text-sm font-medium">
            View profile
          </p>
        </div>
      </div>

      {/* Name */}
      <h3 className="text-white font-semibold text-sm sm:text-base mb-1 truncate text-left tracking-tight">
        {person.name}
      </h3>

      {/* Description */}
      <p className="text-slate-400 text-xs sm:text-xs line-clamp-1 text-left font-light">
        {person.description}
      </p>
    </button>
  );
}
