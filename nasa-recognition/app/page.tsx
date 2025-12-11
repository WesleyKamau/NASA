import { getPeopleData } from '@/lib/data';
import { preloadAll } from '@/lib/preload';
import StarfieldBackground from '@/components/StarfieldBackground';
import GalaxyBackground from '@/components/GalaxyBackground';
import SLSRocket from '@/components/SLSRocket';
import ClientHome from '@/components/ClientHome';

export default function Home() {
  const data = getPeopleData();

  // Preload all images and highlights on initial load
  if (typeof window !== 'undefined') {
    preloadAll(data.groupPhotos, data.people).catch(error => {
      console.error('Failed to preload assets:', error);
    });
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated backgrounds: legacy starfield on mobile/tablet, galaxy on desktop */}
      <div className="xl:hidden">
        <StarfieldBackground />
      </div>
      <div className="hidden xl:block">
        <GalaxyBackground />
      </div>
      
      {/* Flying SLS rocket decoration - positioned absolutely within page */}
      <div className="absolute inset-0 pointer-events-none overflow-x-hidden">
        <SLSRocket />
      </div>

      {/* Client-side layout decision based on orientation and device type */}
      <ClientHome 
        groupPhotos={data.groupPhotos}
        people={data.people}
      />
    </div>
  );
}
