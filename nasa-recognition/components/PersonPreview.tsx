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
    <div className="bg-slate-800 rounded-lg p-4">
      {title && <h3 className="text-white font-semibold mb-3">{title}</h3>}
      <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-900 relative mb-2">
        <PersonImage person={person} groupPhotos={groupPhotos} className="text-6xl" />
      </div>
      <p className="text-white font-medium text-center">{person.name}</p>
    </div>
  );
}
