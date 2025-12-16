import { GENERAL_COMPONENT_CONFIG, MOBILE_PHOTO_CAROUSEL_CONFIG, SLS_ROCKET_CONFIG, BIDIRECTIONAL_HIGHLIGHT_CONFIG, GALAXY_CONFIG, STARFIELD_CONFIG, LOADING_SCREEN_CONFIG } from '@/lib/configs/componentsConfig';
import { SITE_CONFIG } from '@/lib/configs/siteConfig';
import { ROCKET_CONFIG } from '@/lib/configs/rocketConfig';
import { OG_IMAGE_CONFIG } from '@/lib/configs/ogConfig';

describe('configs invariants', () => {
  it('GENERAL_COMPONENT_CONFIG has expected shapes', () => {
    expect(typeof GENERAL_COMPONENT_CONFIG.DUAL_COLUMN_THRESHOLD_WIDTH).toBe('number');
    expect(['starfield','galaxy']).toContain(GENERAL_COMPONENT_CONFIG.BACKGROUND_TYPE);
    expect(GENERAL_COMPONENT_CONFIG.BACKGROUND_BY_VIEW).toBeTruthy();
    expect(GENERAL_COMPONENT_CONFIG.AUTO_RESUME_SECONDS).toBeGreaterThan(0);
  });

  it('MOBILE_PHOTO_CAROUSEL_CONFIG values are sane', () => {
    expect(MOBILE_PHOTO_CAROUSEL_CONFIG.CONTAINER_ASPECT_RATIO).toBeGreaterThan(0);
    expect(MOBILE_PHOTO_CAROUSEL_CONFIG.FACE_HITBOX_PADDING).toBeGreaterThanOrEqual(0);
  });

  it('SLS_ROCKET_CONFIG and ROCKET_CONFIG within ranges', () => {
    expect(SLS_ROCKET_CONFIG.GLOW_SIZE_MULTIPLIER).toBeGreaterThan(0);
    expect(ROCKET_CONFIG.ROCKET_SIZE).toBeGreaterThan(0);
    expect(ROCKET_CONFIG.LAUNCH_INTERVAL_JITTER_PERCENT).toBeGreaterThanOrEqual(0);
  });

  it('BIDIRECTIONAL_HIGHLIGHT_CONFIG and backgrounds valid', () => {
    expect(typeof BIDIRECTIONAL_HIGHLIGHT_CONFIG.ENABLE_TILE_HOVER_HIGHLIGHT).toBe('boolean');
    expect(BIDIRECTIONAL_HIGHLIGHT_CONFIG.GLOW_INTENSITY).toBeGreaterThanOrEqual(0);
  });

  it('GALAXY and STARFIELD configs numeric and sensible', () => {
    expect(GALAXY_CONFIG.FOCAL.length).toBe(2);
    expect(STARFIELD_CONFIG.NUM_STARS).toBeGreaterThan(0);
  });

  it('LOADING_SCREEN_CONFIG has positive durations', () => {
    expect(LOADING_SCREEN_CONFIG.MIN_LOADING_TIME_MS).toBeGreaterThanOrEqual(0);
    expect(LOADING_SCREEN_CONFIG.FADE_OUT_MS).toBeGreaterThan(0);
  });

  it('SITE and OG configs valid', () => {
    expect(SITE_CONFIG.title).toBeTruthy();
    expect(typeof OG_IMAGE_CONFIG.rocketRotation).toBe('number');
    expect(typeof OG_IMAGE_CONFIG.showRocket).toBe('boolean');
  });
});
