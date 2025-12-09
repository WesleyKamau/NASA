'use client';

import { Person, GroupPhoto } from '@/types';
import PersonImage from './PersonImage';

interface PersonCardProps {
  person: Person;
  groupPhotos: GroupPhoto[];
  onClick?: () => void;
}

export default function PersonCard({ person, groupPhotos, onClick }: PersonCardProps) {
  const isWesley = person.id === 'wesley-kamau';
  
  return (
    <div
      onClick={onClick}
      className={`group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-lg p-4 transition-all duration-300 hover:shadow-lg cursor-pointer hover:-translate-y-1 ${
        // isWesley 
        //   ? 'border-2 animate-rainbow-border hover:shadow-rainbow-glow' 
        //   : 
          'border border-slate-700/50 hover:border-blue-500/50 hover:shadow-blue-500/20'
      }`}
    >
      {/* Photo */}
      <div className="w-full aspect-square mb-3 rounded-lg overflow-hidden bg-slate-800/50 relative">
        <PersonImage person={person} groupPhotos={groupPhotos} className="text-4xl" />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <p className="text-white text-sm font-medium">
            Click to view
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
            : person.category === 'girlfriend'
              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
              : person.category === 'family'
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : person.category === 'sil-lab'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
        }`}>
          {person.category === 'sil-lab' ? 'SIL Lab' : person.category}
        </span>
      </div>
    </div>
  );
}
