'use client';

import { Person } from '@/types';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface PersonModalProps {
  person: Person;
  onClose: () => void;
}

export default function PersonModal({ person, onClose }: PersonModalProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 max-w-2xl w-full shadow-2xl shadow-blue-500/20 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-700/50 hover:bg-slate-600/50 text-white transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Photo */}
          <div className="w-full md:w-1/3 aspect-square rounded-lg overflow-hidden bg-slate-800/50 relative flex-shrink-0">
            {person.individualPhoto && !imageError ? (
              <Image
                src={person.individualPhoto}
                alt={person.name}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-blue-400/30">
                {person.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col">
            <div className="mb-2">
              <span className={`text-xs px-3 py-1 rounded-full ${
                person.category === 'staff' 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}>
                {person.category}
              </span>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
              {person.name}
            </h2>

            <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
              <p className="text-slate-300 text-lg leading-relaxed">
                {person.description}
              </p>
            </div>

            {person.photoLocations.length > 0 && (
              <p className="text-slate-400 text-sm mt-auto">
                Featured in {person.photoLocations.length} group photo{person.photoLocations.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
