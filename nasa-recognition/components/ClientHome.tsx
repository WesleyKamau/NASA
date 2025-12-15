'use client';

import { useEffect, useState, useRef } from 'react';
import type { JSX } from 'react';
import { GroupPhoto, Person } from '@/types';
import { preloadAll } from '@/lib/preload';
import { useLoadingContext } from '@/components/LoadingWrapper';
import DualColumnView from '@/components/views/DualColumnView';
import MobileLandscapeView from '@/components/views/MobileLandscapeView';
import DesktopPortraitView from '@/components/views/DesktopPortraitView';
import MobilePortraitView from '@/components/views/MobilePortraitView';
import TabletPortraitView from '@/components/views/TabletPortraitView';
import { GENERAL_COMPONENT_CONFIG } from '@/lib/configs/componentsConfig';
import GalaxyBackground from '@/components/GalaxyBackground';
import StarfieldBackground from '@/components/StarfieldBackground';

interface ClientHomeProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
}

export default function ClientHome({ groupPhotos, people }: ClientHomeProps) {
  const [useSplitView, setUseSplitView] = useState(false);
  const [useCompactSplit, setUseCompactSplit] = useState(false);
  const [useMobilePortrait, setUseMobilePortrait] = useState(false);
  const [useTabletPortrait, setUseTabletPortrait] = useState(false);
  const hasPreloaded = useRef(false);
  const loadingContext = useLoadingContext();

  // Preload all images and highlights on component mount
  useEffect(() => {
    if (!hasPreloaded.current) {
      hasPreloaded.current = true;
      preloadAll(groupPhotos, people)
        .then(() => {
          // Signal that assets are loaded
          loadingContext?.setAssetsLoaded(true);
        })
        .catch(error => {
          console.error('Failed to preload assets:', error);
          // Even if preload fails, don't block the UI
          loadingContext?.setAssetsLoaded(true);
        });
    }
  }, [groupPhotos, people, loadingContext]);

  useEffect(() => {
    const checkLayout = () => {
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const hasHover = window.matchMedia('(hover: hover)').matches;
      const width = window.innerWidth;
      const isXL = width >= GENERAL_COMPONENT_CONFIG.DUAL_COLUMN_THRESHOLD_WIDTH;
      
      // Determine device type in a hierarchical manner
      // Priority order: mobile portrait → tablet portrait → landscape split view → desktop portrait → dual column
      
      // 1. Mobile portrait: narrow portrait touch devices
      const isPortraitPhone = !isLandscape && width < 768 && isTouchDevice;
      
      // 2. Tablet portrait: medium-width portrait touch devices without hover (excludes touch-capable desktops)
      // iPad Pro portrait is 1024px, so we include the 768-1024px range
      const isTabletPortrait = !isLandscape && width >= 768 && width <= 1024 && isTouchDevice && !hasHover;
      
      // 3. Mobile landscape: touch devices in landscape (tablets/phones rotated)
      // Must not be a desktop (no hover) and must be touch-enabled
      const isMobileLandscape = isLandscape && isTouchDevice && !hasHover;
      
      // 4. Desktop split view (dual column): XL screens regardless of orientation
      const isDesktopSplitView = isXL;
      
      // Set view states
      setUseMobilePortrait(isPortraitPhone);
      setUseTabletPortrait(isTabletPortrait);
      
      // Use split view for: XL desktop screens OR mobile landscape
      const shouldUseSplitView = isDesktopSplitView || isMobileLandscape;
      setUseSplitView(shouldUseSplitView);
      
      // Compact split is for mobile landscape (below XL threshold)
      setUseCompactSplit(!isXL && shouldUseSplitView);
    };

    checkLayout();
    window.addEventListener('resize', checkLayout);
    window.addEventListener('orientationchange', checkLayout);
    
    return () => {
      window.removeEventListener('resize', checkLayout);
      window.removeEventListener('orientationchange', checkLayout);
    };
  }, []);

  // Determine which view and background to use
  const getActiveViewAndBackground = (): { view: JSX.Element; background: 'starfield' | 'galaxy' } => {
    if (useMobilePortrait) {
      return {
        view: <MobilePortraitView groupPhotos={groupPhotos} people={people} />,
        background: GENERAL_COMPONENT_CONFIG.BACKGROUND_BY_VIEW.MOBILE_PORTRAIT,
      };
    }

    if (useTabletPortrait) {
      return {
        view: <TabletPortraitView groupPhotos={groupPhotos} people={people} />,
        background: GENERAL_COMPONENT_CONFIG.BACKGROUND_BY_VIEW.TABLET_PORTRAIT,
      };
    }

    if (useSplitView) {
      if (useCompactSplit) {
        return {
          view: <MobileLandscapeView groupPhotos={groupPhotos} people={people} />,
          background: GENERAL_COMPONENT_CONFIG.BACKGROUND_BY_VIEW.MOBILE_LANDSCAPE,
        };
      }
      return {
        view: <DualColumnView groupPhotos={groupPhotos} people={people} />,
        background: GENERAL_COMPONENT_CONFIG.BACKGROUND_BY_VIEW.DUAL_COLUMN,
      };
    }

    return {
      view: <DesktopPortraitView groupPhotos={groupPhotos} people={people} />,
      background: GENERAL_COMPONENT_CONFIG.BACKGROUND_BY_VIEW.DESKTOP_PORTRAIT,
    };
  };

  const { view, background } = getActiveViewAndBackground();

  return (
    <>
      {/* Background */}
      <div className={`fixed inset-0 z-0 ${GENERAL_COMPONENT_CONFIG.BACKGROUND_GRADIENT ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-black' : ''}`}>
        {background === 'galaxy' ? (
          <GalaxyBackground />
        ) : (
          <StarfieldBackground />
        )}
      </div>
      
      {view}
    </>
  );
}
