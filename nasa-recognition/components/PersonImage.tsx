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
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`object-cover ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  if (imageInfo.type === 'cropped-group' && imageInfo.src && !imageError) {
    const { x, y, width, height } = imageInfo.crop || { x: 0, y: 0, width: 100, height: 100 };
    const rotation = imageInfo.rotation || 0;
    
    // Calculate center of crop relative to the image
    // x, y, width, height are percentages of the image
    const cx = x + width / 2;
    const cy = y + height / 2;

    return (
      <div className="relative w-full h-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={imageInfo.src}
          alt={person.name}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: `${10000 / width}%`,
            height: `${10000 / height}%`,
            transformOrigin: `${cx}% ${cy}%`,
            transform: `translate(-${cx}%, -${cy}%) rotate(${rotation}deg)`,
            maxWidth: 'none',
            maxHeight: 'none',
          }}
        />
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex items-center justify-center font-bold text-blue-400/30 ${className}`}>
      {imageInfo.placeholder || person.name.charAt(0)}
    </div>
  );
}
