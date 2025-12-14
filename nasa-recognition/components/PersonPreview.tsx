'use client';

import { Person, GroupPhoto } from '@/types';
import PersonImage from './PersonImage';

interface PersonPreviewProps {
  person: Person;
  groupPhotos: GroupPhoto[];
  title?: string;
}

export default function PersonPreview({ person, groupPhotos, title }: PersonPreviewProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl p-4 border border-white/10 backdrop-blur-xl">
      {title && <h3 className="text-white font-semibold mb-3 text-sm tracking-wide">{title}</h3>}
      <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-900/40 relative mb-3 border border-white/5">
        <PersonImage person={person} groupPhotos={groupPhotos} className="text-6xl" />
      </div>
      <p className="text-white font-medium text-center text-sm">{person.name}</p>
    </div>
  );
}
