import { PeopleData, Category } from '@/types';
import peopleData from '@/data/people.json';

export function getPeopleData(): PeopleData {
  return peopleData as PeopleData;
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
