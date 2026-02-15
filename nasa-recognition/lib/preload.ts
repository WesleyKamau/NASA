/**
 * Preload utilities - intentionally minimal.
 *
 * Images are handled by Next.js Image component with lazy loading
 * and the existing ImageLoadQueue for controlled concurrent loading.
 * No eager preloading is needed - it was downloading 15MB+ on mount.
 */

// This file is kept as a stub to avoid breaking any remaining imports.
// The preloadAll function now resolves immediately.
export function preloadAll(): Promise<void> {
  return Promise.resolve();
}
