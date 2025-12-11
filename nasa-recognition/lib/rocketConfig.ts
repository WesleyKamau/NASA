// Shared rocket configuration constants
export const ROCKET_CONFIG = {
  ENABLE_ROCKET: true, // Set to false to disable the rocket animation
  ROCKET_SIZE: 58, // Controls the entire size of the rocket and glow
  ROCKET_SPEED: 4,
  LAUNCH_INTERVAL: 60000, // milliseconds
  VIBRATION_INTENSITY: 0.5,
  ENGINE_GLOW_OFFSET_X: 0,
  ENGINE_GLOW_OFFSET_Y: 200,
} as const;
