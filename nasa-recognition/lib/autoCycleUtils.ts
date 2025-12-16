/**
 * Auto-cycle utility functions for photo carousel highlighting
 */

import { PHOTO_CAROUSEL_AUTO_CYCLE_CONFIG } from './configs/componentsConfig';

const { 
  PHOTO_CYCLE_DURATION_MS, 
  MAX_PEOPLE_PER_PHOTO_CYCLE, 
  FIRST_LAST_HIGHLIGHT_PADDING_MS 
} = PHOTO_CAROUSEL_AUTO_CYCLE_CONFIG;

/**
 * Calculate the effective number of people to cycle through for a photo
 * @param actualPeopleCount - The actual number of people in the photo
 * @returns The effective count (capped by config max, minimum 1)
 */
export function getEffectivePeopleCount(actualPeopleCount: number): number {
  return Math.max(1, Math.min(actualPeopleCount, MAX_PEOPLE_PER_PHOTO_CYCLE));
}

/**
 * Calculate the base highlight interval (duration divided by effective people count)
 * @param effectivePeopleCount - Number of people to cycle through
 * @returns Base interval in milliseconds
 */
export function getBaseHighlightInterval(effectivePeopleCount: number): number {
  return PHOTO_CYCLE_DURATION_MS / effectivePeopleCount;
}

/**
 * Calculate the highlight duration for a specific person index
 * First person: base interval + padding
 * Middle people: base interval  
 * Last person: base interval + padding
 * 
 * @param personIndex - Current person index (0-based)
 * @param effectivePeopleCount - Total people to cycle through
 * @returns Duration in milliseconds for this person's highlight
 */
export function getHighlightDuration(personIndex: number, effectivePeopleCount: number): number {
  const baseInterval = getBaseHighlightInterval(effectivePeopleCount);
  const isFirstPerson = personIndex === 0;
  const isLastPerson = personIndex === effectivePeopleCount - 1;
  
  if (isFirstPerson || isLastPerson) {
    return baseInterval + FIRST_LAST_HIGHLIGHT_PADDING_MS;
  }
  
  return baseInterval;
}

/**
 * Check if the current index is the last person in the cycle
 * @param personIndex - Current person index (0-based)
 * @param effectivePeopleCount - Total people to cycle through
 * @returns True if this is the last person before photo scroll
 */
export function isLastPersonInCycle(personIndex: number, effectivePeopleCount: number): boolean {
  return personIndex >= effectivePeopleCount - 1;
}
