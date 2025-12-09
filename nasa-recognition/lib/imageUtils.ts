import { Person, GroupPhoto } from '@/types';

export interface PersonImageInfo {
  type: 'individual' | 'cropped-group' | 'placeholder';
  src?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  placeholder?: string;
}

/**
 * Get the display image for a person.
 * Priority:
 * 1. Individual photo if available
 * 2. Preferred group photo if specified
 * 3. First tagged group photo
 * 4. Placeholder (first letter of name)
 */
export function getPersonImage(person: Person, groupPhotos: GroupPhoto[]): PersonImageInfo {
  // Use individual photo if available
  if (person.individualPhoto) {
    return {
      type: 'individual',
      src: person.individualPhoto,
    };
  }

  // Check if they have any photo locations
  if (person.photoLocations.length === 0) {
    return {
      type: 'placeholder',
      placeholder: person.name.charAt(0),
    };
  }

  // Find the photo to use
  let photoLocation;
  
  if (person.preferredPhotoId) {
    // Use preferred photo if specified
    photoLocation = person.photoLocations.find(
      loc => loc.photoId === person.preferredPhotoId
    );
  }
  
  // Fall back to first photo location if preferred not found or not specified
  if (!photoLocation) {
    photoLocation = person.photoLocations[0];
  }

  // Find the group photo
  const groupPhoto = groupPhotos.find(gp => gp.id === photoLocation!.photoId);
  
  if (!groupPhoto) {
    return {
      type: 'placeholder',
      placeholder: person.name.charAt(0),
    };
  }

  // Calculate the crop/zoom for background-image
  const { x, y, width, height } = photoLocation;
  
  const backgroundSize = `${10000 / width}% ${10000 / height}%`;
  
  // Calculate background position to show the correct crop
  // When using percentages for background-position, the value P% means:
  // "Align the point P% across the image with the point P% across the container"
  // We want to align the top-left of our crop (x, y) with the top-left of the container (0, 0).
  // The formula to achieve this is: P = (x / (100 - width)) * 100
  const xPos = width >= 100 ? 0 : (x / (100 - width)) * 100;
  const yPos = height >= 100 ? 0 : (y / (100 - height)) * 100;
  
  const backgroundPosition = `${xPos}% ${yPos}%`;

  return {
    type: 'cropped-group',
    src: groupPhoto.imagePath,
    backgroundSize,
    backgroundPosition,
  };
}
