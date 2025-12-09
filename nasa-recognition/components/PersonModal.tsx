'use client';

import { Person, GroupPhoto } from '@/types';
import { useEffect } from 'react';
import PersonImage from './PersonImage';

interface PersonModalProps {
  person: Person;
  groupPhotos: GroupPhoto[];
  onClose: () => void;
}

export default function PersonModal({ person, groupPhotos, onClose }: PersonModalProps) {
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
            <PersonImage person={person} groupPhotos={groupPhotos} className="text-6xl" />
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col">
            <div className="mb-2">
              <span className={`text-xs px-3 py-1 rounded-full ${
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

            <h2 className="text-3xl font-bold text-white mb-4">
              {person.name}
            </h2>

            <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
              <p className="text-slate-300 text-lg leading-relaxed">
                {person.description}
              </p>
            </div>

            {/* LinkedIn */}
            {person.linkedIn && (
              <a
                href={person.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                View LinkedIn Profile
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
