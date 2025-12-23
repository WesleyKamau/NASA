import {
  getEffectivePeopleCount,
  getBaseHighlightInterval,
  getHighlightDuration,
  isLastPersonInCycle,
} from '@/lib/autoCycleUtils';
import { PHOTO_CAROUSEL_AUTO_CYCLE_CONFIG } from '@/lib/configs/componentsConfig';

describe('autoCycleUtils', () => {
  const { 
    PHOTO_CYCLE_DURATION_MS, 
    MAX_PEOPLE_PER_PHOTO_CYCLE, 
    FIRST_LAST_HIGHLIGHT_PADDING_MS 
  } = PHOTO_CAROUSEL_AUTO_CYCLE_CONFIG;

  describe('getEffectivePeopleCount', () => {
    it('returns the actual count when below max', () => {
      expect(getEffectivePeopleCount(3)).toBe(3);
      expect(getEffectivePeopleCount(5)).toBe(5);
    });

    it('caps the count at MAX_PEOPLE_PER_PHOTO_CYCLE', () => {
      expect(getEffectivePeopleCount(MAX_PEOPLE_PER_PHOTO_CYCLE + 5)).toBe(MAX_PEOPLE_PER_PHOTO_CYCLE);
      expect(getEffectivePeopleCount(100)).toBe(MAX_PEOPLE_PER_PHOTO_CYCLE);
    });

    it('returns minimum of 1 for zero or negative counts', () => {
      expect(getEffectivePeopleCount(0)).toBe(1);
      expect(getEffectivePeopleCount(-1)).toBe(1);
    });
  });

  describe('getBaseHighlightInterval', () => {
    it('calculates base interval correctly', () => {
      const expectedInterval = PHOTO_CYCLE_DURATION_MS / 5;
      expect(getBaseHighlightInterval(5)).toBe(expectedInterval);
    });

    it('handles single person', () => {
      expect(getBaseHighlightInterval(1)).toBe(PHOTO_CYCLE_DURATION_MS);
    });

    it('divides evenly for different counts', () => {
      expect(getBaseHighlightInterval(2)).toBe(PHOTO_CYCLE_DURATION_MS / 2);
      expect(getBaseHighlightInterval(4)).toBe(PHOTO_CYCLE_DURATION_MS / 4);
    });
  });

  describe('getHighlightDuration', () => {
    it('adds padding to first person', () => {
      const baseInterval = PHOTO_CYCLE_DURATION_MS / 5;
      const expected = baseInterval + FIRST_LAST_HIGHLIGHT_PADDING_MS;
      expect(getHighlightDuration(0, 5)).toBe(expected);
    });

    it('adds padding to last person', () => {
      const baseInterval = PHOTO_CYCLE_DURATION_MS / 5;
      const expected = baseInterval + FIRST_LAST_HIGHLIGHT_PADDING_MS;
      expect(getHighlightDuration(4, 5)).toBe(expected);
    });

    it('returns base interval for middle people', () => {
      const baseInterval = PHOTO_CYCLE_DURATION_MS / 5;
      expect(getHighlightDuration(1, 5)).toBe(baseInterval);
      expect(getHighlightDuration(2, 5)).toBe(baseInterval);
      expect(getHighlightDuration(3, 5)).toBe(baseInterval);
    });

    it('handles single person (both first and last)', () => {
      const baseInterval = PHOTO_CYCLE_DURATION_MS;
      const expected = baseInterval + FIRST_LAST_HIGHLIGHT_PADDING_MS;
      expect(getHighlightDuration(0, 1)).toBe(expected);
    });
  });

  describe('isLastPersonInCycle', () => {
    it('returns true for last person index', () => {
      expect(isLastPersonInCycle(4, 5)).toBe(true);
      expect(isLastPersonInCycle(2, 3)).toBe(true);
    });

    it('returns true for indices beyond last person', () => {
      expect(isLastPersonInCycle(5, 5)).toBe(true);
      expect(isLastPersonInCycle(10, 5)).toBe(true);
    });

    it('returns false for non-last indices', () => {
      expect(isLastPersonInCycle(0, 5)).toBe(false);
      expect(isLastPersonInCycle(3, 5)).toBe(false);
    });

    it('handles single person', () => {
      expect(isLastPersonInCycle(0, 1)).toBe(true);
    });
  });
});
