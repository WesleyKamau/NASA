export type Category = 'staff' | 'interns' | 'girlfriend' | 'family' | 'sil-lab';

export interface PhotoLocation {
  photoId: string;
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // percentage width
  height: number; // percentage height
  rotation?: number; // rotation in degrees (0-360)
}

export interface Person {
  id: string;
  name: string;
  description: string;
  category: Category;
  individualPhoto: string | null;
  photoLocations: PhotoLocation[];
  preferredPhotoId?: string; // Which group photo to use as their display image
  hidden?: boolean; // Hide from front-end grid display
  linkedIn?: string; // LinkedIn profile URL
}

export interface GroupPhoto {
  id: string;
  name: string;
  imagePath: string;
  category: Category;
  width: number;
  height: number;
  defaultZoom?: number; // Default zoom level when zoom button is pressed (default: 2.0)
  zoomTranslation?: { x: number; y: number }; // Translation offset when zooming (in pixels)
}

export interface PeopleData {
  people: Person[];
  groupPhotos: GroupPhoto[];
}
