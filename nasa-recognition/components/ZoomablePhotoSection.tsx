'use client';

import { useState } from 'react';
import { Person, GroupPhoto } from '@/types';
import InteractiveGroupPhoto from './InteractiveGroupPhoto';
import PersonGrid from './PersonGrid';

interface ZoomablePhotoSectionProps {
  people: Person[];
  groupPhotos: GroupPhoto[];
  title: string;
}

export default function ZoomablePhotoSection({ people, groupPhotos, title }: ZoomablePhotoSectionProps) {
  const [zoomToPersonId, setZoomToPersonId] = useState<string | null>(null);

  return (
    <section className="mb-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-2">
          {title}
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
      </div>

      {/* Group Photos */}
      {groupPhotos.length > 0 && (
        <div className="mb-12 space-y-12" data-photo-section={title}>
          {groupPhotos.map((photo) => (
            <InteractiveGroupPhoto
              key={photo.id}
              groupPhoto={photo}
              people={people}
              zoomToPerson={zoomToPersonId}
              onZoomChange={setZoomToPersonId}
            />
          ))}
        </div>
      )}

      {/* Person Grid */}
      <PersonGrid 
        people={people} 
        onPhotoClick={(personId) => {
          setZoomToPersonId(personId);
          // Scroll to group photos
          const photoSection = document.querySelector(`[data-photo-section="${title}"]`);
          if (photoSection) {
            photoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
      />
    </section>
  );
}
