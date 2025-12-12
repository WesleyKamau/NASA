/**
 * Component Configuration Constants
 * Centralized configuration for all component behavior
 */

// ============================================================================
// Mobile Photo Carousel Configuration
// ============================================================================

export const MOBILE_PHOTO_CAROUSEL_CONFIG = {
  // Container aspect ratio (width / height) - used for letterboxing calculations
  CONTAINER_ASPECT_RATIO: 3 / 4,
  
  // Face transition feature settings
  ENABLE_FACE_TRANSITION: false,           // Set to false to disable the face fade overlay
  FACE_FADE_DELAY_MS: 80,                  // Delay before starting crossfade so movement is visible
  FACE_FADE_DURATION_MS: 220,              // Duration of the actual fade between faces
  FACE_TRANSITION_TOTAL_MS: 350,           // Total overlay lifetime to avoid lingering
  
  // Face highlighting configuration
  MAX_VISIBLE_LABELS: 1,
  FACE_HITBOX_PADDING: 10,                 // Percentage padding to expand face hitboxes
  
  // Debug settings
  SHOW_DEBUG_HITBOXES: false,              // Can be toggled for development
} as const;

// ============================================================================
// SLS Rocket Configuration
// ============================================================================

export const SLS_ROCKET_CONFIG = {
  // Glow size calculation: based on rocket size (approx 50% of rocket width)
  GLOW_SIZE_MULTIPLIER: 0.53,
} as const;

// ============================================================================
// OG Generator Configuration
// ============================================================================

export const OG_GENERATOR_CONFIG = {
  // Font options available in the generator
  AVAILABLE_FONTS: [
    { name: 'Geist Sans', value: 'var(--font-geist-sans)' },
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Helvetica Neue', value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
    { name: 'System UI', value: 'system-ui, sans-serif' },
    { name: 'Monospace', value: 'var(--font-geist-mono)' },
  ] as const,
} as const;

// ============================================================================
// General Component Settings
// ============================================================================

export const GENERAL_COMPONENT_CONFIG = {
  // Auto-highlight settings for carousels
  AUTO_HIGHLIGHT_DELAY_MS: 100,
  AUTO_HIGHLIGHT_RESUME_MS: 400,
  
  // Transition timings
  SMOOTH_TRANSITION_DURATION_MS: 300,
  FADE_DURATION_MS: 220,
} as const;
