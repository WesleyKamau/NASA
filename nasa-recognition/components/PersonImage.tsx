'use client';

import { Person, GroupPhoto } from '@/types';
import Image from 'next/image';
import { useState } from 'react';
import { getPersonImage } from '@/lib/imageUtils';

interface PersonImageProps {
  person: Person;
  groupPhotos: GroupPhoto[];
  className?: string;
}

export default function PersonImage({ person, groupPhotos, className = '' }: PersonImageProps) {
  const [imageError, setImageError] = useState(false);
  const imageInfo = getPersonImage(person, groupPhotos);

  if (imageInfo.type === 'individual' && imageInfo.src && !imageError) {
    return (
      <Image
        src={imageInfo.src}
        alt={person.name}
        fill
        className={`object-cover ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  if (imageInfo.type === 'cropped-group' && imageInfo.src && !imageError) {
    return (
      <div 
        className="relative w-full h-full"
        style={{
          backgroundImage: `url(${imageInfo.src})`,
          backgroundSize: `${imageInfo.backgroundSize}`,
          backgroundPosition: `${imageInfo.backgroundPosition}`,
          backgroundRepeat: 'no-repeat',
        }}
      />
    );
  }

  return (
    <div className={`w-full h-full flex items-center justify-center font-bold text-blue-400/30 ${className}`}>
      {imageInfo.placeholder || person.name.charAt(0)}
    </div>
  );
}
