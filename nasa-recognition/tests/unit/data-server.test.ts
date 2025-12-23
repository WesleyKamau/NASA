/**
 * Tests fallback and dynamic dimension enrichment for server data loader.
 */
import { getPeopleDataWithDimensions } from '@/lib/data-server';

jest.mock('fs', () => ({
  existsSync: jest.fn(() => false),
  readFileSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: (...parts: string[]) => parts.join('/'),
}));

jest.mock('image-size', () => jest.fn(() => ({ width: 1234, height: 567 })));

describe('data-server getPeopleDataWithDimensions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uses fallback dimensions when file does not exist', () => {
    const fs = require('fs');
    fs.existsSync.mockReturnValue(false);

    const data = getPeopleDataWithDimensions();
    for (const photo of data.groupPhotos) {
      expect(photo.width).toBeGreaterThan(0);
      expect(photo.height).toBeGreaterThan(0);
    }
  });

  it('enriches dimensions when file exists', () => {
    const fs = require('fs');
    fs.existsSync.mockReturnValue(true);
    const sizeOf = require('image-size');

    const data = getPeopleDataWithDimensions();
    for (const photo of data.groupPhotos) {
      expect(photo.width).toBe(1234);
      expect(photo.height).toBe(567);
    }
    expect(sizeOf).toHaveBeenCalled();
  });
});
