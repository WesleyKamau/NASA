import { PeopleData } from '@/types';
import peopleData from '@/data/people.json';

export function getPeopleData(): PeopleData {
  return peopleData as PeopleData;
}

export function getPersonById(id: string) {
  const data = getPeopleData();
  return data.people.find(person => person.id === id);
}

export function getPeopleByCategory(category: 'staff' | 'interns') {
  const data = getPeopleData();
  return data.people.filter(person => person.category === category);
}

export function getGroupPhotosByCategory(category: 'staff' | 'interns') {
  const data = getPeopleData();
  return data.groupPhotos.filter(photo => photo.category === category);
}
