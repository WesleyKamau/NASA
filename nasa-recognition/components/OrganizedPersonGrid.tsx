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
  uniformLayout?: boolean;
  useTabletSizing?: boolean;
  highlightedPersonId?: string | null;
  onPersonHover?: (personId: string | null) => void;
  onImageLoad?: (personId: string) => void;
}

const categoryOrder: Category[] = ['family', 'staff', 'sil-lab', 'interns'];

const categoryLabels: Record<Category, string> = {
  'family': 'Family',
  // 'girlfriend': 'Special Guest',
  'staff': 'Staff & Mentors',
  'sil-lab': 'SIL Lab',
  'interns': 'Fellow Interns'
};

export default function OrganizedPersonGrid({ people, groupPhotos, onPersonClick, idPrefix = '', uniformLayout = false, useTabletSizing = false, highlightedPersonId = null, onPersonHover, onImageLoad }: OrganizedPersonGridProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const handlePersonClick = (person: Person) => {
    if (onPersonClick) {
      onPersonClick(person);
    } else {
      setSelectedPerson(person);
    }
  };

  // Filter out hidden people
  const visiblePeople = people.filter(person => !person.hidden);

  if (uniformLayout) {
    // Uniform layout: all people sorted by category, then alphabetically, including Wesley
    // Filter Wesley only once for merging into family
    const wesleyPeople = visiblePeople.filter(p => p.id === 'wesley-kamau');

    const allPeopleByCategory = categoryOrder.reduce((acc, category) => {
      let categoryPeople = visiblePeople.filter(p =>
        p.category === category && p.id !== 'wesley-kamau'
      );

      // Merge Wesley into family
      if (category === 'family') {
        categoryPeople = [...categoryPeople, ...wesleyPeople];
      }

      // Sort alphabetically by name
      categoryPeople.sort((a, b) => a.name.localeCompare(b.name));

      if (categoryPeople.length > 0) {
        acc[category] = categoryPeople;
      }
      return acc;
    }, {} as Record<Category, Person[]>);

    const gapClass = useTabletSizing ? "gap-3 sm:gap-4" : "gap-2 sm:gap-3";
    const itemClass = useTabletSizing 
      ? "w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] md:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-0.75rem)] xl:w-[calc(25%-0.75rem)]"
      : "w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-0.75rem)]";

    return (
      <>
        <div className="w-full space-y-4 sm:space-y-5" data-testid="person-grid">
          {categoryOrder.map(category => {
            const categoryPeople = allPeopleByCategory[category];
            if (!categoryPeople || categoryPeople.length === 0) return null;

            return (
              <div key={category}>
                <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-center gradient-text">
                  {categoryLabels[category]}
                </h2>
                <div className={`flex flex-wrap justify-center ${gapClass}`}>
                  {categoryPeople.map((person) => (
                    <div key={person.id} className={itemClass}>
                      <PersonCard
                        person={person}
                        groupPhotos={groupPhotos}
                        onClick={() => handlePersonClick(person)}
                        idPrefix={idPrefix}
                        priority={false}
                        isHighlighted={highlightedPersonId === person.id}
                        onMouseEnter={() => onPersonHover?.(person.id)}
                        onMouseLeave={() => onPersonHover?.(null)}
                        onImageLoad={() => onImageLoad?.(person.id)}
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

  // Original layout with Wesley featured separately
  // Filter out Wesley from visible people for categories
  const visiblePeopleExceptWesley = visiblePeople.filter(person => person.id !== 'wesley-kamau');

  // Group people by category
  const peopleByCategory = categoryOrder.reduce((acc, category) => {
    let categoryPeople = visiblePeopleExceptWesley.filter(p => p.category === category);
    
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
      <div className="w-full space-y-12" data-testid="person-grid">
        {/* Me first */}
        {wesley && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-center gradient-text">
              Me
            </h2>
            <div className="flex justify-center">
              <div className="w-full max-w-xs md:max-w-sm">
                <PersonCard
                  person={wesley}
                  groupPhotos={groupPhotos}
                  onClick={() => handlePersonClick(wesley)}
                  idPrefix={idPrefix}
                  priority={true}
                  isHighlighted={highlightedPersonId === wesley.id}
                  onMouseEnter={() => onPersonHover?.(wesley.id)}
                  onMouseLeave={() => onPersonHover?.(null)}
                  onImageLoad={() => onImageLoad?.(wesley.id)}
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
                <div className="flex items-center gap-3 sm:gap-4 my-4 sm:my-5">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                  <div className="text-slate-500 text-sm animate-spin-slow">✦</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                </div>
              )}

              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center gradient-text">
                {categoryLabels[category]}
              </h2>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {categoryPeople.map((person) => (
                  <div key={person.id} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] md:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-0.75rem)] xl:w-[calc(25%-0.75rem)]">
                    <PersonCard
                      person={person}
                      groupPhotos={groupPhotos}
                      onClick={() => handlePersonClick(person)}
                      idPrefix={idPrefix}
                      priority={false}
                      isHighlighted={highlightedPersonId === person.id}
                      onMouseEnter={() => onPersonHover?.(person.id)}
                      onMouseLeave={() => onPersonHover?.(null)}
                      onImageLoad={() => onImageLoad?.(person.id)}
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
