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
  AUTO_RESUME_SECONDS: 20,              // Resume auto cycles after this many seconds of inactivity
  
  // Transition timings
  SMOOTH_TRANSITION_DURATION_MS: 300,
  FADE_DURATION_MS: 220,
} as const;

// ============================================================================
// Bidirectional Highlighting Configuration
// ============================================================================

export const BIDIRECTIONAL_HIGHLIGHT_CONFIG = {
  // When a user hovers/taps a tile, should the corresponding face highlight in carousel?
  // Set to false to disable tile hover → face highlight
  ENABLE_TILE_HOVER_HIGHLIGHT: true,
  
  // Highlight appearance
  HIGHLIGHT_DURATION_MS: 300,           // Smooth transition duration for highlights
  
  // Scale factor for tile glow effect
  GLOW_INTENSITY: 0.6,                  // 0-1, controls shadow intensity
} as const;

// ============================================================================
// Galaxy Background Configuration
// ============================================================================

export const GALAXY_CONFIG = {
  // Camera and view settings
  FOCAL: [0.5, 0.5] as [number, number],
  ROTATION: [1.0, 0.0] as [number, number],
  
  // Star properties
  STAR_SPEED: 0.5,
  DENSITY: 1,
  HUE_SHIFT: 140,
  GLOW_INTENSITY: 0.3,
  SATURATION: 0.0,
  TWINKLE_INTENSITY: 0.3,
  
  // Animation settings
  DISABLE_ANIMATION: false,
  SPEED: 1.0,
  ROTATION_SPEED: 0.1,
  
  // Interaction settings
  MOUSE_INTERACTION: true,
  MOUSE_REPULSION: true,
  REPULSION_STRENGTH: 2,
  AUTO_CENTER_REPULSION: 0,
  
  // Rendering
  TRANSPARENT: true,
} as const;

// ============================================================================
// Starfield Background Configuration
// ============================================================================

export const STARFIELD_CONFIG = {
  // Star generation
  NUM_STARS: 200,
  
  // Star properties
  MIN_SIZE: 0,
  MAX_SIZE: 2,
  MIN_SPEED: 0.1,
  MAX_SPEED: 0.6,
  MIN_OPACITY: 0.5,
  MAX_OPACITY: 1.0,
  
  // Animation
  TRAIL_OPACITY: 0.1,              // Background fade for motion trail effect
  BACKGROUND_COLOR: 'rgba(3, 7, 18, 0.1)',
  GRADIENT_START: '#030712',
  GRADIENT_END: '#0f172a',
  
  // Twinkle effect
  TWINKLE_SPEED: 0.001,            // Speed of the twinkle animation
  TWINKLE_AMPLITUDE: 0.3,          // How much the opacity varies
  TWINKLE_BASE: 0.7,               // Base opacity for twinkling
  
  // Fade in
  FADE_DURATION_MS: 1000,          // Duration of initial fade-in
} as const;

// ============================================================================
// Loading Screen Configuration
// ============================================================================

export const LOADING_SCREEN_CONFIG = {
  // Background style toggles
  SHOW_STARS: true,               // Set to true for the starry background
  SHOW_GRID: false,                 // Set to true for the technical grid background
  
  // Animation settings
  MIN_LOADING_TIME_MS: 2000,
  FADE_OUT_MS: 1000,
} as const;
