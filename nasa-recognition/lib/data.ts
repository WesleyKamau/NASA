import { PeopleData, Category, GroupPhoto } from '@/types';
import peopleData from '@/data/people.json';

export function getPeopleData(): PeopleData {
  const data = peopleData as PeopleData;
  
  // In a server-side context, we could dynamically load dimensions
  // For now, rely on dimensions from JSON which should be accurate
  return data;
}

export function getPersonById(id: string) {
  const data = getPeopleData();
  return data.people.find(person => person.id === id);
}

export function getPeopleByCategory(category: Category) {
  const data = getPeopleData();
  return data.people.filter(person => person.category === category);
}

export function getGroupPhotosByCategory(category: Category) {
  const data = getPeopleData();
  return data.groupPhotos.filter(photo => photo.category === category);
}
