'use client';

import { useState, useEffect } from 'react';
import Galaxy from './Galaxy';

export default function GalaxyBackground() {
  const [ready, setReady] = useState(false);

  // Fade in after a brief delay to let the WebGL canvas render its first frame
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setReady(true);
      });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-700"
      aria-hidden
      style={{ opacity: ready ? 1 : 0 }}
    >
      <Galaxy
        focal={[0.5, 0.5]}
        rotation={[1.0, 0.0]}
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
        transparent={true}
      />
    </div>
  );
}
