'use client';

import { useState, useEffect } from 'react';
import Galaxy from './Galaxy';

// Stable references — inline literals would recreate the WebGL context on
// every re-render because Galaxy's effect depends on these props.
const GALAXY_FOCAL: [number, number] = [0.5, 0.5];
const GALAXY_ROTATION: [number, number] = [1.0, 0.0];

export default function GalaxyBackground() {
  const [ready, setReady] = useState(false);

  // Fade in after a brief delay to let the WebGL canvas render its first frame.
  // While waiting, keep the signature curtain down so it never reveals onto a
  // black rectangle where the galaxy should be.
  useEffect(() => {
    const release = window.__wkSignature?.hold?.();
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setReady(true);
        release?.();
      });
    });
    return () => {
      cancelAnimationFrame(id);
      release?.();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none bg-black transition-opacity duration-700"
      aria-hidden
      style={{ opacity: ready ? 1 : 0, backgroundColor: '#000' }}
    >
      <Galaxy
        focal={GALAXY_FOCAL}
        rotation={GALAXY_ROTATION}
        starSpeed={0.25}
        density={1.2}
        hueShift={200}
        speed={0.4}
        mouseInteraction={false}
        glowIntensity={0.1}
        saturation={0.08}
        mouseRepulsion={false}
        twinkleIntensity={0.4}
        rotationSpeed={0.05}
        repulsionStrength={0}
        autoCenterRepulsion={0}
        transparent={false}
      />
    </div>
  );
}
