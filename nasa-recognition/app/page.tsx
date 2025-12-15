import { getPeopleDataWithDimensions } from '@/lib/data-server';
import SLSRocket from '@/components/SLSRocket';
import ClientHome from '@/components/ClientHome';
import { GENERAL_COMPONENT_CONFIG } from '@/lib/configs/componentsConfig';

export default function Home() {
  const data = getPeopleDataWithDimensions();

  const rocketZIndex = GENERAL_COMPONENT_CONFIG.ROCKET_POSITION === 'on_top_of_blur' ? 'z-30' : 'z-10';

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      
      {/* Flying SLS rocket decoration - positioned absolutely within page */}
      <div className={`absolute inset-0 pointer-events-none overflow-x-hidden ${rocketZIndex}`}>
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
