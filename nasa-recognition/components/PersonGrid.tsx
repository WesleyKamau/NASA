'use client';

import { Person } from '@/types';
import PersonCard from './PersonCard';
import { useState } from 'react';
import PersonModal from './PersonModal';

interface PersonGridProps {
  people: Person[];
  title?: string;
  onPhotoClick?: (personId: string) => void;
}

export default function PersonGrid({ people, title, onPhotoClick }: PersonGridProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  return (
    <>
      <div className="w-full">
        {title && (
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            {title}
          </h2>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {people.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              onClick={() => setSelectedPerson(person)}
              onPhotoClick={onPhotoClick ? () => onPhotoClick(person.id) : undefined}
            />
          ))}
        </div>
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
