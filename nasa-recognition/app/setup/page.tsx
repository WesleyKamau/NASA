'use client';

import { useState, useEffect } from 'react';
import CoordinatePicker from '@/components/CoordinatePicker';
import PersonImage from '@/components/PersonImage';
import { getPeopleData } from '@/lib/data';
import { Person, PhotoLocation, Category, GroupPhoto } from '@/types';

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
  linkedIn?: string;
  rotation?: number;
}

interface PersonDetails {
  id: string;
  name: string;
  description: string;
  linkedIn: string;
  category: Category;
}


export default function SetupPage() {
  const data = getPeopleData();
  const [allRectangles, setAllRectangles] = useState<Rectangle[]>([]);
  const [initialRectangleIds, setInitialRectangleIds] = useState<Set<string>>(new Set());
  const [showExistingRectangles, setShowExistingRectangles] = useState(true);
  const [editingPerson, setEditingPerson] = useState<PersonDetails | null>(null);
  const [personDetails, setPersonDetails] = useState<Map<string, PersonDetails>>(new Map());

  // Load all existing data on mount
  useEffect(() => {
    const existingRects: Rectangle[] = [];
    const initialIds = new Set<string>();
    const detailsMap = new Map<string, PersonDetails>();
    
    data.people.forEach(person => {
      // Initialize personDetails from actual data
      detailsMap.set(person.id, {
        id: person.id,
        name: person.name,
        description: person.description || '',
        linkedIn: person.linkedIn || '',
        category: person.category || 'staff',
      });
      
      
      person.photoLocations.forEach(location => {
        const rectId = `${person.id}-${location.photoId}`;
        initialIds.add(rectId);
        const details = detailsMap.get(person.id);
        if (!details) return; // Safety check, though this should never happen
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
          description: details.description,
          linkedIn: details.linkedIn,
          category: details.category,
        });
      });
    });
    
    setPersonDetails(detailsMap);
    setAllRectangles(existingRects);
    setInitialRectangleIds(initialIds);
  }, [data]);

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

  const openPersonEditor = (personId: string, personName: string) => {
    const existing = personDetails.get(personId);
    setEditingPerson(existing || {
      id: personId,
      name: personName,
      description: '',
      linkedIn: '',
      category: 'staff',
    });
  };

  const savePersonDetails = (details: PersonDetails) => {
    const updated = new Map(personDetails);
    updated.set(details.id, details);
    setPersonDetails(updated);
    
    // Update rectangles with new details
    setAllRectangles(prev => prev.map(rect => {
      if (rect.personId === details.id) {
        return {
          ...rect,
          description: details.description,
          linkedIn: details.linkedIn,
          category: details.category,
        };
      }
      return rect;
    }));
    
    setEditingPerson(null);
  };

  const generateFullJSON = () => {
    // Get all unique person IDs from rectangles
    const allPersonIds = new Set(allRectangles.map(r => r.personId));
    
    // Create array for all people (existing + new)
    const allPeopleArray: Person[] = [];
    
    allPersonIds.forEach(personId => {
      const personRects = allRectangles.filter(r => r.personId === personId);
      const firstRect = personRects[0];
      const details = personDetails.get(personId);
      
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
          description: details?.description || existingPerson.description,
          category: details?.category || existingPerson.category,
          ...(details?.linkedIn && { linkedIn: details.linkedIn }),
        });
      } else {
        // Create new person
        allPeopleArray.push({
          id: personId,
          name: details?.name || firstRect.personName,
          description: details?.description || '',
          category: details?.category || 'staff',
          individualPhoto: null,
          photoLocations,
          preferredPhotoId: profilePhotoRect?.photoId,
          ...(details?.linkedIn && { linkedIn: details.linkedIn }),
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
          
          <div className="flex justify-center gap-4 flex-wrap">
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
            
            {allRectangles.length > 0 && (
              <div className="text-slate-300 text-sm">
                {new Set(allRectangles.map(r => r.personId)).size} people mapped
              </div>
            )}
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
                onRectanglesChange={(rects) => {
                  setAllRectangles(prev => [
                    ...prev.filter(r => r.photoId !== photo.id),
                    ...rects.map(r => ({ 
                      ...r, 
                      photoId: photo.id,
                      description: personDetails.get(r.personId)?.description,
                      linkedIn: personDetails.get(r.personId)?.linkedIn,
                      category: personDetails.get(r.personId)?.category,
                    }))
                  ]);
                }}
                onToggleProfilePhoto={toggleProfilePhoto}
              />
            </div>
          ))}
        </div>

        {/* Person Details Summary Section */}
        {Array.from(new Set(allRectangles.map(r => r.personId))).length > 0 && (
          <div className="mt-12 bg-slate-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Person Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from(new Set(allRectangles.map(r => r.personId))).map(personId => {
                const rects = allRectangles.filter(r => r.personId === personId);
                const firstRect = rects[0];
                const details = personDetails.get(personId);
                
                return (
                  <div key={personId} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg mb-2">{firstRect.personName}</h3>
                        {details?.description && (
                          <p className="text-slate-300 text-sm mb-2 line-clamp-2">{details.description}</p>
                        )}
                        {details?.linkedIn && (
                          <p className="text-blue-400 text-sm mb-2">🔗 LinkedIn added</p>
                        )}
                        <p className="text-slate-400 text-xs">{rects.length} {rects.length === 1 ? 'photo' : 'photos'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => openPersonEditor(personId, firstRect.personName)}
                          className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors whitespace-nowrap"
                        >
                          Edit
                        </button>
                        <div className="flex gap-1 text-xs">
                          {!details?.description && (
                            <span className="text-slate-400 px-2 py-1 bg-slate-600 rounded">no desc</span>
                          )}
                          {!details?.linkedIn && (
                            <span className="text-slate-400 px-2 py-1 bg-slate-600 rounded">no link</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

      {/* Person Detail Editor Modal */}
      {editingPerson && (
        <PersonDetailModal
          person={editingPerson}
          personData={data.people.find(p => p.id === editingPerson.id)}
          rectangles={allRectangles.filter(r => r.personId === editingPerson.id)}
          groupPhotos={data.groupPhotos}
          onSave={savePersonDetails}
          onClose={() => setEditingPerson(null)}
        />
      )}
    </div>
  );
}

interface PersonDetailModalProps {
  person: PersonDetails;
  personData?: Person;
  rectangles: Rectangle[];
  groupPhotos: GroupPhoto[];
  onSave: (details: PersonDetails) => void;
  onClose: () => void;
}

function PersonDetailModal({ person, personData, rectangles, groupPhotos, onSave, onClose }: PersonDetailModalProps) {
  const [formData, setFormData] = useState<PersonDetails>(person);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Get unique photos this person appears in
  const photoNames = new Set(
    rectangles
      .map(r => {
        const photo = groupPhotos.find(p => p.id === r.photoId);
        return photo?.name;
      })
      .filter((name): name is string => name !== undefined)
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{person.name}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Person Face Preview */}
          {personData && (
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-slate-600">
                <PersonImage person={personData} groupPhotos={groupPhotos} className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Photos Preview */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Appears in Photos:</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(photoNames).map(name => (
                <span key={name} className="bg-slate-700 text-slate-200 px-3 py-1 rounded text-sm">
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="staff">Staff</option>
              <option value="interns">Interns</option>
              <option value="girlfriend">Girlfriend</option>
              <option value="family">Family</option>
              <option value="sil-lab">SIL Lab</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add a bio, role, or interesting fact about this person..."
              rows={5}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none placeholder-slate-400"
            />
            <p className="text-slate-400 text-xs mt-1">
              {formData.description.length} characters
            </p>
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              value={formData.linkedIn}
              onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none placeholder-slate-400"
            />
            <p className="text-slate-400 text-xs mt-1">
              Optional - used to link to their LinkedIn profile
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
            >
              Save Details
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
