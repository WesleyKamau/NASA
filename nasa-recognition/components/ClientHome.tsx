'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { JSX } from 'react';
import dynamic from 'next/dynamic';
import { GroupPhoto, Person } from '@/types';
import { useLoadingContext } from '@/components/LoadingWrapper';
import { GENERAL_COMPONENT_CONFIG } from '@/lib/configs/componentsConfig';

// Dynamic imports - only the active view and background are loaded
const DualColumnView = dynamic(() => import('@/components/views/DualColumnView'));
const MobileLandscapeView = dynamic(() => import('@/components/views/MobileLandscapeView'));
const DesktopPortraitView = dynamic(() => import('@/components/views/DesktopPortraitView'));
const MobilePortraitView = dynamic(() => import('@/components/views/MobilePortraitView'));
const TabletPortraitView = dynamic(() => import('@/components/views/TabletPortraitView'));
const GalaxyBackground = dynamic(() => import('@/components/GalaxyBackground'));
const StarfieldBackground = dynamic(() => import('@/components/StarfieldBackground'));

interface ClientHomeProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
}

export default function ClientHome({ groupPhotos, people }: ClientHomeProps) {
  const [useSplitView, setUseSplitView] = useState(false);
  const [useCompactSplit, setUseCompactSplit] = useState(false);
  const [useMobilePortrait, setUseMobilePortrait] = useState(false);
  const [useTabletPortrait, setUseTabletPortrait] = useState(false);
  const loadingContext = useLoadingContext();
  const hasSignaledLoaded = useRef(false);
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Signal assets loaded immediately - images lazy-load via Next.js Image
  useEffect(() => {
    if (!hasSignaledLoaded.current) {
      hasSignaledLoaded.current = true;
      loadingContext?.setAssetsLoaded(true);
    }
  }, [loadingContext]);

  const checkLayout = useCallback(() => {
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasHover = window.matchMedia('(hover: hover)').matches;
    const width = window.innerWidth;
    const isXL = width >= GENERAL_COMPONENT_CONFIG.DUAL_COLUMN_THRESHOLD_WIDTH;

    const isPortraitPhone = !isLandscape && width < 768 && isTouchDevice;
    const isTabletPortrait = !isLandscape && width >= 768 && width <= 1024 && isTouchDevice && !hasHover;
    const isMobileLandscape = isLandscape && isTouchDevice && !hasHover;
    const isDesktopSplitView = isXL;

    setUseMobilePortrait(isPortraitPhone);
    setUseTabletPortrait(isTabletPortrait);

    const shouldUseSplitView = isDesktopSplitView || isMobileLandscape;
    setUseSplitView(shouldUseSplitView);
    setUseCompactSplit(!isXL && shouldUseSplitView);
  }, []);

  useEffect(() => {
    checkLayout();

    const handleResize = () => {
      // Debounce resize events to avoid excessive state updates
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(checkLayout, 150);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', checkLayout);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', checkLayout);
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    };
  }, [checkLayout]);

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
