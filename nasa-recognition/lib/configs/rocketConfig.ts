// Shared rocket configuration constants
export const ROCKET_CONFIG = {
  ENABLE_ROCKET: true, // Set to false to disable the rocket animation
  ROCKET_SIZE: 58, // Controls the entire size of the rocket and glow
  ROCKET_SPEED: 4,
  LAUNCH_INITIAL_DELAY_MS: 5000, // Initial delay before the first launch
  BASE_LAUNCH_INTERVAL_MS: 60000, // Base interval between launches
  RANDOMIZE_LAUNCH_INTERVALS: true, // Allow interval jitter
  LAUNCH_INTERVAL_JITTER_PERCENT: 0.25, // +/- 25% of the base interval
  VIBRATION_INTENSITY: 0.5,
  ENGINE_GLOW_OFFSET_X: 0,
  ENGINE_GLOW_OFFSET_Y: 200,
} as const;
