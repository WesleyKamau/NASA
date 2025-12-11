'use client';

import { Person, GroupPhoto, Category } from '@/types';
import PersonCard from './PersonCard';
import { useState } from 'react';
import PersonModal from './PersonModal';

interface OrganizedPersonGridProps {
  people: Person[];
  groupPhotos: GroupPhoto[];
  onPersonClick?: (person: Person) => void;
  idPrefix?: string;
}

const categoryOrder: Category[] = ['family', 'staff', 'sil-lab', 'interns'];

const categoryLabels: Record<Category, string> = {
  'family': 'Family & Special Guest',
  'girlfriend': 'Special Guest',
  'staff': 'Staff & Mentors',
  'sil-lab': 'SIL Lab',
  'interns': 'Fellow Interns'
};

export default function OrganizedPersonGrid({ people, groupPhotos, onPersonClick, idPrefix = '' }: OrganizedPersonGridProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const handlePersonClick = (person: Person) => {
    if (onPersonClick) {
      onPersonClick(person);
    } else {
      setSelectedPerson(person);
    }
  };

  // Filter out hidden people and me (Wesley)
  const visiblePeople = people.filter(person => 
    !person.hidden && person.id !== 'wesley-kamau'
  );

  // Group people by category
  const peopleByCategory = categoryOrder.reduce((acc, category) => {
    let categoryPeople = visiblePeople.filter(p => p.category === category);
    
    // Merge girlfriend into family
    if (category === 'family') {
      const girlfriend = visiblePeople.filter(p => p.category === 'girlfriend');
      categoryPeople = [...categoryPeople, ...girlfriend];
    }

    // Sort alphabetically by name
    categoryPeople.sort((a, b) => a.name.localeCompare(b.name));

    if (categoryPeople.length > 0) {
      acc[category] = categoryPeople;
    }
    return acc;
  }, {} as Record<Category, Person[]>);

  // Get Wesley separately to display first
  const wesley = people.find(p => p.id === 'wesley-kamau');

  return (
    <>
      <div className="w-full space-y-12">
        {/* Me first */}
        {wesley && (
          <div>
            <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text mb-4">
              Me
            </h3>
            <div className="flex justify-center">
              <div className="w-full max-w-xs md:max-w-sm">
                <PersonCard
                  person={wesley}
                  groupPhotos={groupPhotos}
                  onClick={() => handlePersonClick(wesley)}
                  idPrefix={idPrefix}
                  priority={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main categories */}
        {categoryOrder.map(category => {
          const categoryPeople = peopleByCategory[category];
          if (!categoryPeople || categoryPeople.length === 0) return null;

          const isInterns = category === 'interns';

          return (
            <div key={category}>
              {/* Add a visual separator before interns */}
              {isInterns && (
                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                  <div className="text-slate-500 text-sm animate-spin-slow">✦</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                </div>
              )}

              <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text mb-4 text-center">
                {categoryLabels[category]}
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                {categoryPeople.map((person) => (
                  <div key={person.id} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] md:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-0.75rem)] xl:w-[calc(25%-0.75rem)]">
                    <PersonCard
                      person={person}
                      groupPhotos={groupPhotos}
                      onClick={() => handlePersonClick(person)}
                      idPrefix={idPrefix}
                      priority={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!onPersonClick && selectedPerson && (
        <PersonModal
          person={selectedPerson}
          groupPhotos={groupPhotos}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </>
  );
}
