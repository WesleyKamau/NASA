import CoordinatePicker from '@/components/CoordinatePicker';
import { getPeopleData } from '@/lib/data';

export default function SetupPage() {
  const data = getPeopleData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Photo Coordinate Setup
          </h1>
          <p className="text-slate-400">
            Use this tool to map face locations in your group photos. Existing coordinates are loaded automatically.
          </p>
        </header>

        <div className="space-y-12">
          {data.groupPhotos.map((photo) => (
            <div key={photo.id}>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {photo.name}
              </h2>
              <CoordinatePicker
                imagePath={photo.imagePath}
                photoId={photo.id}
                allPeople={data.people}
                groupPhotos={data.groupPhotos}
              />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ← Back to Main Page
          </a>
        </div>
      </div>
    </div>
  );
}
