// Shared rocket configuration constants
export const ROCKET_CONFIG = {
  ENABLE_ROCKET: true, // Set to false to disable the rocket animation
  ROCKET_SIZE: 120,
  ROCKET_SPEED: 8,
  LAUNCH_INTERVAL: 60000, // milliseconds
  VIBRATION_INTENSITY: 1,
  ENGINE_GLOW_OFFSET_X: 0,
  ENGINE_GLOW_OFFSET_Y: 200,
} as const;
