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
      const isXL = window.innerWidth >= GENERAL_COMPONENT_CONFIG.DUAL_COLUMN_THRESHOLD_WIDTH;
      const isPortraitPhone = !isLandscape && window.innerWidth < 768 && isTouchDevice;
      // Tablet portrait requires touch AND no hover (to exclude desktops with touch)
      // iPad Pro portrait is 1024px, so we need to include that range
      const isTabletPortrait = !isLandscape && window.innerWidth >= 768 && window.innerWidth <= 1024 && isTouchDevice && !hasHover;
      
      // Use MobilePortraitView for portrait phones
      setUseMobilePortrait(isPortraitPhone);
      setUseTabletPortrait(isTabletPortrait);
      
      // Use split view on:
      // 1. XL screens (desktop) - use full DualColumnView
      // 2. Touch devices in landscape orientation (that are not desktops) - use MobileLandscapeView
      const shouldUseSplitView = isXL || (isTouchDevice && isLandscape && !isPortraitPhone && !hasHover);
      setUseSplitView(shouldUseSplitView);
      
      // Determine if we should use compact version
      setUseCompactSplit(window.innerWidth < GENERAL_COMPONENT_CONFIG.DUAL_COLUMN_THRESHOLD_WIDTH && shouldUseSplitView);
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
