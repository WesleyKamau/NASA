'use client';

import { useState, useEffect } from 'react';
import CoordinatePicker from '@/components/CoordinatePicker';
import { getPeopleData } from '@/lib/data';
import { Person, PhotoLocation, Category } from '@/types';

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  personId: string;
  personName: string;
  photoId: string;
  useAsProfilePhoto?: boolean;
  category?: Category;
  description?: string;
  rotation?: number;
}

export default function SetupPage() {
  const data = getPeopleData();
  const [allRectangles, setAllRectangles] = useState<Rectangle[]>([]);
  const [initialRectangleIds, setInitialRectangleIds] = useState<Set<string>>(new Set());
  const [showExistingRectangles, setShowExistingRectangles] = useState(true);

  // Load all existing coordinates on mount
  useEffect(() => {
    const existingRects: Rectangle[] = [];
    const initialIds = new Set<string>();
    data.people.forEach(person => {
      person.photoLocations.forEach(location => {
        const rectId = `${person.id}-${location.photoId}`;
        initialIds.add(rectId);
        existingRects.push({
          x: location.x,
          y: location.y,
          width: location.width,
          height: location.height,
          personId: person.id,
          personName: person.name,
          photoId: location.photoId,
          useAsProfilePhoto: person.preferredPhotoId === location.photoId,
          rotation: location.rotation || 0,
        });
      });
    });
    setAllRectangles(existingRects);
    setInitialRectangleIds(initialIds);
  }, []);

  const handleRectanglesChange = (photoId: string, rectangles: Rectangle[]) => {
    // Remove old rectangles for this photo and add new ones
    setAllRectangles(prev => [
      ...prev.filter(r => r.photoId !== photoId),
      ...rectangles.map(r => ({ ...r, photoId }))
    ]);
  };

  const toggleProfilePhoto = (personId: string, photoId: string) => {
    setAllRectangles(prev => prev.map(rect => {
      if (rect.personId === personId) {
        // If clicking the same photo that's already selected, deselect it
        // Otherwise, only the clicked photo should be marked
        return {
          ...rect,
          useAsProfilePhoto: rect.photoId === photoId ? !rect.useAsProfilePhoto : false
        };
      }
      return rect;
    }));
  };

  const generateFullJSON = () => {
    // Get all unique person IDs from rectangles
    const allPersonIds = new Set(allRectangles.map(r => r.personId));
    
    // Create array for all people (existing + new)
    const allPeopleArray: Person[] = [];
    
    allPersonIds.forEach(personId => {
      const personRects = allRectangles.filter(r => r.personId === personId);
      const firstRect = personRects[0];
      
      // Check if this person already exists in data
      const existingPerson = data.people.find(p => p.id === personId);
      
      const photoLocations: PhotoLocation[] = personRects.map(rect => ({
        photoId: rect.photoId,
        x: parseFloat(rect.x.toFixed(2)),
        y: parseFloat(rect.y.toFixed(2)),
        width: parseFloat(rect.width.toFixed(2)),
        height: parseFloat(rect.height.toFixed(2)),
        ...(rect.rotation && rect.rotation !== 0 ? { rotation: rect.rotation } : {}),
      }));

      // Find which photo (if any) is marked as profile photo
      const profilePhotoRect = personRects.find(r => r.useAsProfilePhoto);
      
      if (existingPerson) {
        // Update existing person
        allPeopleArray.push({
          ...existingPerson,
          photoLocations,
          preferredPhotoId: profilePhotoRect?.photoId || existingPerson.preferredPhotoId,
        });
      } else {
        // Create new person
        allPeopleArray.push({
          id: personId,
          name: firstRect.personName,
          description: firstRect.description || '',
          category: firstRect.category || 'staff',
          individualPhoto: null,
          photoLocations,
          preferredPhotoId: profilePhotoRect?.photoId,
        });
      }
    });
    
    // Add people who aren't in any photos
    data.people.forEach(person => {
      if (!allPersonIds.has(person.id)) {
        allPeopleArray.push({
          ...person,
          photoLocations: [],
        });
      }
    });

    return { 
      people: allPeopleArray,
      groupPhotos: data.groupPhotos
    };
  };

  const copyToClipboard = () => {
    const json = JSON.stringify(generateFullJSON(), null, 2);
    navigator.clipboard.writeText(json);
    alert(`Complete JSON copied to clipboard! ${allRectangles.length} people mapped across ${data.groupPhotos.length} photos.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Photo Coordinate Setup
          </h1>
          <p className="text-slate-400 mb-6">
            Use this tool to map face locations in your group photos. Existing coordinates are loaded automatically.
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={() => setShowExistingRectangles(!showExistingRectangles)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                showExistingRectangles
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {showExistingRectangles ? '👁️ Existing Rectangles Visible' : '👁️‍🗨️ Existing Rectangles Hidden'}
            </button>
          </div>
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
                rectangles={allRectangles.filter(r => r.photoId === photo.id)}
                initialRectangleIds={initialRectangleIds}
                hideInitialRectangles={!showExistingRectangles}
                onRectanglesChange={(rects) => handleRectanglesChange(photo.id, rects)}
                onToggleProfilePhoto={toggleProfilePhoto}
              />
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <button
            onClick={copyToClipboard}
            disabled={allRectangles.length === 0}
            className="px-8 py-4 bg-green-500 text-white text-lg font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
          >
            📋 Copy Complete JSON for All Photos ({allRectangles.length} people mapped)
          </button>
          
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
