import { getPeopleData } from '@/lib/data';
import StarfieldBackground from '@/components/StarfieldBackground';
import GalaxyBackground from '@/components/GalaxyBackground';
import SLSRocket from '@/components/SLSRocket';
import ClientHome from '@/components/ClientHome';

export default function Home() {
  const data = getPeopleData();

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
