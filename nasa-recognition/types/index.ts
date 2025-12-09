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
  category: 'staff' | 'interns';
  individualPhoto: string | null;
  photoLocations: PhotoLocation[];
}

export interface GroupPhoto {
  id: string;
  name: string;
  imagePath: string;
  category: 'staff' | 'interns';
}

export interface PeopleData {
  people: Person[];
  groupPhotos: GroupPhoto[];
}
