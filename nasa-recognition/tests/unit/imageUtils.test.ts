import { getPersonImage } from '@/lib/imageUtils';
import { GroupPhoto, Person } from '@/types';

const groupPhotos: GroupPhoto[] = [
  { id: 'p1', name: 'Photo 1', imagePath: '/p1.jpg', category: 'interns', width: 1000, height: 500 },
  { id: 'p2', name: 'Photo 2', imagePath: '/p2.jpg', category: 'staff', width: 2000, height: 1000 },
];

const basePerson: Person = {
  id: 'x',
  name: 'Xavier',
  description: '',
  category: 'interns',
  individualPhoto: null,
  photoLocations: [],
};

describe('imageUtils.getPersonImage', () => {
  it('returns individual photo when available', () => {
    const person: Person = { ...basePerson, individualPhoto: '/me.jpg' };
    const info = getPersonImage(person, groupPhotos);
    expect(info.type).toBe('individual');
    expect(info.src).toBe('/me.jpg');
  });

  it('returns placeholder when no locations', () => {
    const person: Person = { ...basePerson, name: 'Alice' };
    const info = getPersonImage(person, groupPhotos);
    expect(info.type).toBe('placeholder');
    expect(info.placeholder).toBe('A');
  });

  it('uses preferred group photo crop and computes background', () => {
    const person: Person = {
      ...basePerson,
      preferredPhotoId: 'p2',
      photoLocations: [
        { photoId: 'p1', x: 10, y: 20, width: 30, height: 40 },
        { photoId: 'p2', x: 5, y: 10, width: 20, height: 10, rotation: 15 },
      ],
    };
    const info = getPersonImage(person, groupPhotos);
    expect(info.type).toBe('cropped-group');
    expect(info.src).toBe('/p2.jpg');
    expect(info.backgroundSize).toBe(`${10000 / 20}% ${10000 / 10}%`);
    // xPos = (5/(100-20))*100 = 6.25; yPos = (10/(100-10))*100 ≈ 11.111...
    expect(info.backgroundPosition).toMatch(/^6\.25% 11\./);
    expect(info.rotation).toBe(15);
    expect(info.crop).toEqual({ x: 5, y: 10, width: 20, height: 10 });
  });

  it('falls back to first location when preferred missing', () => {
    const person: Person = {
      ...basePerson,
      preferredPhotoId: 'missing',
      photoLocations: [ { photoId: 'p1', x: 1, y: 2, width: 3, height: 4 } ],
    };
    const info = getPersonImage(person, groupPhotos);
    expect(info.src).toBe('/p1.jpg');
  });

  it('ignores rotation when requested', () => {
    const person: Person = {
      ...basePerson,
      photoLocations: [ { photoId: 'p1', x: 1, y: 2, width: 3, height: 4, rotation: 123 } ],
    };
    const info = getPersonImage(person, groupPhotos, true);
    expect(info.rotation).toBe(0);
  });
});
