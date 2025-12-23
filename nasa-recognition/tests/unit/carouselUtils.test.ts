import { Person } from '@/types';
import { getPeopleInPhoto, shuffleArray, startAutoCycle, AutoCycleTimers } from '@/lib/carouselUtils';
// import { useRef } from 'react';

// Mock the auto cycle utils
jest.mock('@/lib/autoCycleUtils', () => ({
  getEffectivePeopleCount: jest.fn((count: number) => Math.min(count, 8)),
  getHighlightDuration: jest.fn(() => 2000),
  isLastPersonInCycle: jest.fn((index: number, count: number) => index >= count - 1),
}));

jest.useFakeTimers();

describe('carouselUtils', () => {
  const mockPeople: Person[] = [
    {
      id: 'person-1',
      name: 'Alice',
      description: 'Developer',
      category: 'staff',
      individualPhoto: null,
      photoLocations: [
        { photoId: 'photo-1', x: 10, y: 20, width: 15, height: 15 },
        { photoId: 'photo-2', x: 30, y: 40, width: 15, height: 15 },
      ],
    },
    {
      id: 'person-2',
      name: 'Bob',
      description: 'Designer',
      category: 'staff',
      individualPhoto: null,
      photoLocations: [
        { photoId: 'photo-1', x: 50, y: 60, width: 10, height: 10 },
      ],
    },
    {
      id: 'person-3',
      name: 'Charlie',
      description: 'Manager',
      category: 'staff',
      individualPhoto: null,
      photoLocations: [
        { photoId: 'photo-3', x: 20, y: 30, width: 12, height: 12 },
      ],
    },
  ];

  describe('getPeopleInPhoto', () => {
    it('returns people in the specified photo', () => {
      const result = getPeopleInPhoto(mockPeople, 'photo-1');
      expect(result).toHaveLength(2);
      expect(result.map(p => p.id)).toEqual(['person-1', 'person-2']);
    });

    it('returns empty array when no people in photo', () => {
      const result = getPeopleInPhoto(mockPeople, 'photo-nonexistent');
      expect(result).toHaveLength(0);
    });

    it('handles person in multiple photos', () => {
      const result = getPeopleInPhoto(mockPeople, 'photo-2');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('person-1');
    });
  });

  describe('shuffleArray', () => {
    it('returns array with same length', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      expect(shuffled).toHaveLength(arr.length);
    });

    it('contains all original elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    it('does not mutate original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      shuffleArray(arr);
      expect(arr).toEqual(original);
    });

    it('handles empty array', () => {
      const shuffled = shuffleArray([]);
      expect(shuffled).toEqual([]);
    });

    it('handles single element array', () => {
      const shuffled = shuffleArray([1]);
      expect(shuffled).toEqual([1]);
    });
  });

  describe('startAutoCycle', () => {
    let setHighlightedPersonIndex: jest.Mock;
    let setCurrentPhotoIndex: jest.Mock;
    let timers: AutoCycleTimers;

    beforeEach(() => {
      jest.clearAllMocks();
      jest.clearAllTimers();
      setHighlightedPersonIndex = jest.fn();
      setCurrentPhotoIndex = jest.fn();
      timers = {
        highlightTimer: { current: undefined },
        autoCycleResetTimer: { current: undefined },
        transitionDelayTimer: { current: undefined },
      };
    });

    afterEach(() => {
      jest.clearAllTimers();
    });

    it('does not start cycle when disabled', () => {
      const cleanup = startAutoCycle({
        enabled: false,
        peopleInPhotoCount: 5,
        groupPhotosLength: 2,
        setHighlightedPersonIndex,
        setCurrentPhotoIndex,
        timers,
      });

      jest.advanceTimersByTime(5000);
      expect(setHighlightedPersonIndex).not.toHaveBeenCalled();

      cleanup();
    });

    it('does not start cycle when no people', () => {
      const cleanup = startAutoCycle({
        enabled: true,
        peopleInPhotoCount: 0,
        groupPhotosLength: 2,
        setHighlightedPersonIndex,
        setCurrentPhotoIndex,
        timers,
      });

      jest.advanceTimersByTime(5000);
      expect(setHighlightedPersonIndex).not.toHaveBeenCalled();

      cleanup();
    });

    it('sets initial highlight to 0 when starting fresh', () => {
      startAutoCycle({
        enabled: true,
        peopleInPhotoCount: 5,
        groupPhotosLength: 1,
        setHighlightedPersonIndex,
        setCurrentPhotoIndex,
        timers,
        currentHighlightIndex: 0,
      });

      expect(setHighlightedPersonIndex).toHaveBeenCalledWith(0);
    });

    it('schedules highlight changes', () => {
      startAutoCycle({
        enabled: true,
        peopleInPhotoCount: 3,
        groupPhotosLength: 1,
        setHighlightedPersonIndex,
        setCurrentPhotoIndex,
        timers,
      });

      // Clear initial call
      setHighlightedPersonIndex.mockClear();

      // Advance time to trigger next highlight
      jest.advanceTimersByTime(2000);

      expect(setHighlightedPersonIndex).toHaveBeenCalled();
    });

    it('clears timers on cleanup', () => {
      const cleanup = startAutoCycle({
        enabled: true,
        peopleInPhotoCount: 5,
        groupPhotosLength: 2,
        setHighlightedPersonIndex,
        setCurrentPhotoIndex,
        timers,
      });

      // Create some timers
      jest.advanceTimersByTime(1000);

      // Cleanup should clear them
      cleanup();

      // Advance time - should not trigger anything
      const callsBefore = setHighlightedPersonIndex.mock.calls.length;
      jest.advanceTimersByTime(5000);
      const callsAfter = setHighlightedPersonIndex.mock.calls.length;

      expect(callsAfter).toBe(callsBefore);
    });

    it('advances to next photo when multiple photos exist', () => {
      // Mock isLastPersonInCycle to return true immediately
      const { isLastPersonInCycle } = require('@/lib/autoCycleUtils');
      isLastPersonInCycle.mockReturnValue(true);

      startAutoCycle({
        enabled: true,
        peopleInPhotoCount: 2,
        groupPhotosLength: 3,
        setHighlightedPersonIndex,
        setCurrentPhotoIndex,
        timers,
      });

      setHighlightedPersonIndex.mockClear();
      setCurrentPhotoIndex.mockClear();

      // Trigger the highlight timer
      jest.advanceTimersByTime(2000);

      // Should schedule photo transition
      jest.advanceTimersByTime(100);
      expect(setCurrentPhotoIndex).toHaveBeenCalled();

      // Should reset highlight after transition
      jest.advanceTimersByTime(400);
      expect(setHighlightedPersonIndex).toHaveBeenCalledWith(0);
    });
  });
});
