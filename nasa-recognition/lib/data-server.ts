import 'server-only';
import { PeopleData, GroupPhoto } from '@/types';
import peopleData from '@/data/people.json';
import sizeOf from 'image-size';
import path from 'path';
import fs from 'fs';

export function getPeopleDataWithDimensions(): PeopleData {
  const data = peopleData as PeopleData;
  
  // Dynamically load image dimensions for group photos
  const photosWithDimensions = data.groupPhotos.map((photo: GroupPhoto) => {
    try {
      const imagePath = path.join(process.cwd(), 'public', photo.imagePath);
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        const dimensions = sizeOf(imageBuffer);
        return {
          ...photo,
          width: dimensions.width ?? photo.width ?? 1600,
          height: dimensions.height ?? photo.height ?? 1200,
        };
      }
    } catch (error) {
      console.warn(`Could not read dimensions for ${photo.imagePath}:`, error);
    }
    // Fallback to existing dimensions or defaults
    return {
      ...photo,
      width: photo.width || 1600,
      height: photo.height || 1200,
    };
  });
  
  return {
    ...data,
    groupPhotos: photosWithDimensions,
  };
}
