import { Person, GroupPhoto } from '@/types';
import faceCrops from '@/lib/generated/faceCrops.json';

// Pre-baked face crops (scripts/generate-face-crops.mjs). Serving these tiny
// files instead of CSS-cropping the full group photo keeps phones from
// decoding multi-megapixel images once per card — the main OOM-crash source.
const FACE_CROPS: Record<string, string> = faceCrops;

export interface PersonImageInfo {
  /** 'cropped-static' is a pre-baked face crop file — render it like an
   *  individual photo but stretched (object-fill) to match the legacy CSS
   *  crop's framing. */
  type: 'individual' | 'cropped-static' | 'cropped-group' | 'placeholder';
  src?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  rotation?: number;
  placeholder?: string;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Get the display image for a person.
 * Priority:
 * 1. Individual photo if available
 * 2. Preferred group photo if specified
 * 3. First tagged group photo
 * 4. Placeholder (first letter of name)
 */
export function getPersonImage(person: Person, groupPhotos: GroupPhoto[], ignoreRotation = false): PersonImageInfo {
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

  // Prefer the pre-baked crop file when one exists (rotation already baked
  // in, so ignoreRotation needs the legacy path)
  const preCropped = FACE_CROPS[`${person.id}|${photoLocation.photoId}`];
  if (preCropped && !(ignoreRotation && photoLocation.rotation)) {
    return {
      type: 'cropped-static',
      src: preCropped,
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
    rotation: ignoreRotation ? 0 : (photoLocation.rotation || 0),
    crop: { x, y, width, height },
  };
}
