export type Category = 'staff' | 'interns' | 'girlfriend' | 'family';

export interface PhotoLocation {
  photoId: string;
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // percentage width
  height: number; // percentage height
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
}

export interface GroupPhoto {
  id: string;
  name: string;
  imagePath: string;
  category: Category;
  width: number;
  height: number;
}

export interface PeopleData {
  people: Person[];
  groupPhotos: GroupPhoto[];
}
