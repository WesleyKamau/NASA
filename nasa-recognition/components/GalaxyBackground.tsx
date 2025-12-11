'use client';

import Galaxy from './Galaxy';

export default function GalaxyBackground() {
  return (
    <div className="fixed inset-0 z-0" aria-hidden>
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
