import { getPeopleData, getPersonById, getPeopleByCategory, getGroupPhotosByCategory } from '@/lib/data';
import { Category } from '@/types';

describe('data selectors', () => {
  it('loads people data', () => {
    const data = getPeopleData();
    expect(Array.isArray(data.people)).toBe(true);
    expect(Array.isArray(data.groupPhotos)).toBe(true);
    // sanity: required fields exist
    const person = data.people[0];
    expect(person).toHaveProperty('id');
    expect(person).toHaveProperty('name');
  });

  it('gets person by id', () => {
    const data = getPeopleData();
    const anyId = data.people[0]?.id;
    if (!anyId) return; // nothing to assert if data empty
    const person = getPersonById(anyId);
    expect(person?.id).toBe(anyId);
  });

  it('filters by category', () => {
    const data = getPeopleData();
    const categories = new Set(data.people.map(p => p.category));
    for (const cat of categories) {
      const list = getPeopleByCategory(cat as Category);
      expect(list.every(p => p.category === cat)).toBe(true);
    }
  });

  it('filters group photos by category', () => {
    const data = getPeopleData();
    const categories = new Set(data.groupPhotos.map(p => p.category));
    for (const cat of categories) {
      const list = getGroupPhotosByCategory(cat as Category);
      expect(list.every(p => p.category === cat)).toBe(true);
    }
  });
});
