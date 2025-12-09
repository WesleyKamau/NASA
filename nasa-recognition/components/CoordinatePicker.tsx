'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Person, PhotoLocation } from '@/types';

interface CoordinatePickerProps {
  imagePath: string;
  photoId: string;
  allPeople: Person[];
  groupPhotos: Array<{ id: string; name: string; imagePath: string; category: string }>;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  personId: string;
  personName: string;
}

export default function CoordinatePicker({ imagePath, photoId, allPeople, groupPhotos }: CoordinatePickerProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [showPersonPicker, setShowPersonPicker] = useState(false);
  const [pendingRect, setPendingRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [newPersonName, setNewPersonName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeIndex, setResizeIndex] = useState<number | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Load existing coordinates on mount
  useEffect(() => {
    const existingRects: Rectangle[] = [];
    allPeople.forEach(person => {
      const location = person.photoLocations.find(loc => loc.photoId === photoId);
      if (location) {
        existingRects.push({
          x: location.x,
          y: location.y,
          width: location.width,
          height: location.height,
          personId: person.id,
          personName: person.name,
        });
      }
    });
    setRectangles(existingRects);
  }, [allPeople, photoId]);

  // Track shift key for square drawing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const filteredPeople = allPeople.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentRect({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing && !isResizing && !isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (isDrawing) {
      let width = Math.abs(x - startPos.x);
      let height = Math.abs(y - startPos.y);

      // If shift is pressed, make it a 1:1 square (accounting for aspect ratio)
      if (isShiftPressed) {
        // Get the actual pixel size to determine which dimension is larger
        const widthPx = (width / 100) * rect.width;
        const heightPx = (height / 100) * rect.height;
        
        // Use the larger dimension to make a square in screen space
        const sizePx = Math.max(widthPx, heightPx);
        
        // Convert back to percentages (1:1 in screen space)
        width = (sizePx / rect.width) * 100;
        height = (sizePx / rect.height) * 100;
      }

      setCurrentRect({
        x: Math.min(startPos.x, x),
        y: Math.min(startPos.y, y),
        width,
        height,
      });
    } else if (isDragging && dragIndex !== null) {
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;
      
      const oldRect = rectangles[dragIndex];
      const newRect = {
        ...oldRect,
        x: oldRect.x + deltaX,
        y: oldRect.y + deltaY,
      };
      
      const updated = [...rectangles];
      updated[dragIndex] = newRect;
      setRectangles(updated);
      setDragStart({ x, y });
    } else if (isResizing && resizeIndex !== null) {
      const oldRect = rectangles[resizeIndex];
      let newRect = { ...oldRect };

      if (resizeHandle.includes('right')) {
        newRect.width = Math.max(1, x - oldRect.x);
      }
      if (resizeHandle.includes('left')) {
        const newX = Math.min(x, oldRect.x + oldRect.width - 1);
        newRect.width = oldRect.width + (oldRect.x - newX);
        newRect.x = newX;
      }
      if (resizeHandle.includes('bottom')) {
        newRect.height = Math.max(1, y - oldRect.y);
      }
      if (resizeHandle.includes('top')) {
        const newY = Math.min(y, oldRect.y + oldRect.height - 1);
        newRect.height = oldRect.height + (oldRect.y - newY);
        newRect.y = newY;
      }

      // If shift is pressed during resize, constrain to square
      if (isShiftPressed) {
        const widthPx = (newRect.width / 100) * rect.width;
        const heightPx = (newRect.height / 100) * rect.height;
        const sizePx = Math.max(widthPx, heightPx);
        
        const squareWidth = (sizePx / rect.width) * 100;
        const squareHeight = (sizePx / rect.height) * 100;
        
        // Adjust based on which handle is being dragged
        if (resizeHandle.includes('right') || resizeHandle.includes('left')) {
          newRect.height = squareHeight;
          if (resizeHandle.includes('top')) {
            newRect.y = oldRect.y + oldRect.height - squareHeight;
          }
        }
        if (resizeHandle.includes('bottom') || resizeHandle.includes('top')) {
          newRect.width = squareWidth;
          if (resizeHandle.includes('left')) {
            newRect.x = oldRect.x + oldRect.width - squareWidth;
          }
        }
        // For corner handles, both dimensions are already set
        if (resizeHandle.includes('-')) {
          newRect.width = squareWidth;
          newRect.height = squareHeight;
          
          if (resizeHandle.includes('left')) {
            newRect.x = oldRect.x + oldRect.width - squareWidth;
          }
          if (resizeHandle.includes('top')) {
            newRect.y = oldRect.y + oldRect.height - squareHeight;
          }
        }
      }

      const updated = [...rectangles];
      updated[resizeIndex] = newRect;
      setRectangles(updated);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragIndex(null);
      return;
    }

    if (isResizing) {
      setIsResizing(false);
      setResizeIndex(null);
      setResizeHandle('');
      return;
    }

    if (!isDrawing || !currentRect || currentRect.width < 0.5 || currentRect.height < 0.5) {
      setIsDrawing(false);
      setCurrentRect(null);
      return;
    }

    setPendingRect(currentRect);
    setShowPersonPicker(true);
    setSearchTerm('');
    setSelectedIndex(0);
    setIsDrawing(false);
    setCurrentRect(null);
  };

  const handlePersonSelect = (person: Person) => {
    if (!pendingRect) return;

    // Check if person already has a rectangle, update it
    const existingIndex = rectangles.findIndex(r => r.personId === person.id);
    if (existingIndex >= 0) {
      const updated = [...rectangles];
      updated[existingIndex] = {
        ...pendingRect,
        personId: person.id,
        personName: person.name,
      };
      setRectangles(updated);
    } else {
      setRectangles([...rectangles, {
        ...pendingRect,
        personId: person.id,
        personName: person.name,
      }]);
    }

    setShowPersonPicker(false);
    setPendingRect(null);
    setNewPersonName('');
    setIsCreatingNew(false);
  };

  const handleCreateNewPerson = () => {
    if (!pendingRect || !newPersonName.trim()) return;

    // Generate a unique ID for the new person
    const newPersonId = newPersonName.toLowerCase().replace(/\s+/g, '-');
    
    // Check if this ID already exists
    const exists = rectangles.some(r => r.personId === newPersonId);
    if (exists) {
      alert('A person with this name already exists!');
      return;
    }

    setRectangles([...rectangles, {
      ...pendingRect,
      personId: newPersonId,
      personName: newPersonName.trim(),
    }]);

    setShowPersonPicker(false);
    setPendingRect(null);
    setNewPersonName('');
    setIsCreatingNew(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isCreatingNew) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCreateNewPerson();
      } else if (e.key === 'Escape') {
        setIsCreatingNew(false);
        setNewPersonName('');
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredPeople.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredPeople[selectedIndex]) {
      e.preventDefault();
      handlePersonSelect(filteredPeople[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowPersonPicker(false);
      setPendingRect(null);
      setNewPersonName('');
      setIsCreatingNew(false);
    }
  };

  const removeRectangle = (index: number) => {
    setRectangles(rectangles.filter((_, i) => i !== index));
  };

  const generateFullJSON = () => {
    // Create a copy of all people data
    const updatedPeople = allPeople.map(person => {
      const rect = rectangles.find(r => r.personId === person.id);
      
      // Filter out existing location for this photo and add new one if exists
      const otherLocations = person.photoLocations.filter(loc => loc.photoId !== photoId);
      
      const photoLocations: PhotoLocation[] = rect 
        ? [
            ...otherLocations,
            {
              photoId: photoId,
              x: parseFloat(rect.x.toFixed(2)),
              y: parseFloat(rect.y.toFixed(2)),
              width: parseFloat(rect.width.toFixed(2)),
              height: parseFloat(rect.height.toFixed(2)),
            }
          ]
        : otherLocations;

      return {
        ...person,
        photoLocations,
      };
    });

    return { 
      people: updatedPeople,
      groupPhotos: groupPhotos
    };
  };

  const copyToClipboard = () => {
    const json = JSON.stringify(generateFullJSON(), null, 2);
    navigator.clipboard.writeText(json);
    alert('Complete JSON copied to clipboard! You can paste this directly into people.json to replace the entire file.');
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Photo Coordinate Picker</h2>
        <p className="text-slate-300 mb-4">
          Click and drag to create rectangles around each person&apos;s face. 
          Hold <kbd className="px-2 py-1 bg-slate-700 rounded">Shift</kbd> while dragging to create squares.
          Select their name from the dropdown. Existing coordinates are already loaded.
        </p>
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(1, zoom - 0.25))}
              className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600"
              disabled={zoom <= 1}
            >
              -
            </button>
            <span className="text-white font-semibold min-w-[60px] text-center">{(zoom * 100).toFixed(0)}%</span>
            <button
              onClick={() => setZoom(Math.min(5, zoom + 0.25))}
              className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600"
              disabled={zoom >= 5}
            >
              +
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600"
              disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
            >
              Reset
            </button>
          </div>
          <span className="text-slate-400 text-sm">Use mouse wheel to zoom, {zoom > 1 ? 'right-click + drag to pan' : ''}</span>
        </div>
        
        <div 
          className="relative w-full bg-slate-900 rounded-lg overflow-hidden cursor-crosshair"
          onWheel={(e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoom(Math.max(1, Math.min(5, zoom + delta)));
          }}
        >
          <div
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            <Image
              src={imagePath}
              alt="Group photo"
              width={1600}
              height={1000}
              className="w-full h-auto object-contain"
              draggable={false}
            />
          
            <div
              className="absolute inset-0"
              onMouseDown={(e) => {
                if (e.button === 2 && zoom > 1) {
                  // Right click for panning when zoomed
                  e.preventDefault();
                  setIsPanning(true);
                  setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
                } else if (e.button === 0) {
                  handleMouseDown(e);
                }
              }}
              onMouseMove={(e) => {
                if (isPanning) {
                  setPan({
                    x: e.clientX - panStart.x,
                    y: e.clientY - panStart.y,
                  });
                } else {
                  handleMouseMove(e);
                }
              }}
              onMouseUp={(e) => {
                if (isPanning) {
                  setIsPanning(false);
                } else {
                  handleMouseUp();
                }
              }}
              onMouseLeave={(e) => {
                if (isPanning) {
                  setIsPanning(false);
                } else {
                  handleMouseUp();
                }
              }}
              onContextMenu={(e) => e.preventDefault()}
            >
            {/* Saved rectangles */}
            {rectangles.map((rect, idx) => (
              <div
                key={idx}
                className="absolute border-2 border-green-400 bg-green-400/20 group cursor-move"
                style={{
                  left: `${rect.x}%`,
                  top: `${rect.y}%`,
                  width: `${rect.width}%`,
                  height: `${rect.height}%`,
                  pointerEvents: 'auto',
                }}
                onMouseDown={(e) => {
                  // Only start dragging if clicking on the rectangle body (not handles or buttons)
                  if (e.target === e.currentTarget) {
                    e.preventDefault();
                    e.stopPropagation();
                    const container = e.currentTarget.parentElement?.parentElement;
                    if (container) {
                      const containerRect = container.getBoundingClientRect();
                      const x = ((e.clientX - containerRect.left) / containerRect.width) * 100;
                      const y = ((e.clientY - containerRect.top) / containerRect.height) * 100;
                      setIsDragging(true);
                      setDragIndex(idx);
                      setDragStart({ x, y });
                    }
                  }
                }}
              >
                <div className="absolute -top-8 left-0 bg-green-400 text-black text-xs px-2 py-1 rounded whitespace-nowrap flex items-center gap-2" style={{ pointerEvents: 'auto' }}>
                  <span>{rect.personName}</span>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeRectangle(idx);
                    }}
                    className="bg-red-500 text-white px-1 rounded hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Resize handles */}
                <div 
                  className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-green-400 cursor-nw-resize"
                  style={{ pointerEvents: 'auto' }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsResizing(true);
                    setResizeIndex(idx);
                    setResizeHandle('top-left');
                  }}
                />
                <div 
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-green-400 cursor-n-resize"
                  style={{ pointerEvents: 'auto' }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsResizing(true);
                    setResizeIndex(idx);
                    setResizeHandle('top');
                  }}
                />
                <div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-green-400 cursor-ne-resize"
                  style={{ pointerEvents: 'auto' }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsResizing(true);
                    setResizeIndex(idx);
                    setResizeHandle('top-right');
                  }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-white border border-green-400 cursor-e-resize"
                  style={{ pointerEvents: 'auto' }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsResizing(true);
                    setResizeIndex(idx);
                    setResizeHandle('right');
                  }}
                />
                <div 
                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-green-400 cursor-se-resize"
                  style={{ pointerEvents: 'auto' }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsResizing(true);
                    setResizeIndex(idx);
                    setResizeHandle('bottom-right');
                  }}
                />
                <div 
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-green-400 cursor-s-resize"
                  style={{ pointerEvents: 'auto' }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsResizing(true);
                    setResizeIndex(idx);
                    setResizeHandle('bottom');
                  }}
                />
                <div 
                  className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-green-400 cursor-sw-resize"
                  style={{ pointerEvents: 'auto' }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsResizing(true);
                    setResizeIndex(idx);
                    setResizeHandle('bottom-left');
                  }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-white border border-green-400 cursor-w-resize"
                  style={{ pointerEvents: 'auto' }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsResizing(true);
                    setResizeIndex(idx);
                    setResizeHandle('left');
                  }}
                />
              </div>
            ))}

            {/* Current drawing rectangle */}
            {isDrawing && currentRect && (
              <div
                className="absolute border-2 border-blue-400 bg-blue-400/20"
                style={{
                  left: `${currentRect.x}%`,
                  top: `${currentRect.y}%`,
                  width: `${currentRect.width}%`,
                  height: `${currentRect.height}%`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
          <div className="flex gap-4">
            <button
              onClick={copyToClipboard}
              disabled={rectangles.length === 0}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Copy Complete JSON ({rectangles.length} people mapped)
            </button>
            <button
              onClick={() => {
                if (confirm('Clear all rectangles for this photo?')) {
                  setRectangles([]);
                }
              }}
              disabled={rectangles.length === 0}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear All
            </button>
          </div>

          {rectangles.length > 0 && (
            <div className="bg-slate-900 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Mapped People:</h3>
              <div className="flex flex-wrap gap-2">
                {rectangles.map((rect, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-700 px-3 py-1 rounded-full text-sm text-white flex items-center gap-2"
                  >
                    {rect.personName}
                    <button
                      onClick={() => removeRectangle(idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Person Picker Modal */}
      {showPersonPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => {
            setShowPersonPicker(false);
            setPendingRect(null);
          }}
        >
          <div
            className="bg-slate-800 rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Select Person</h3>
            
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type to search..."
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />

            {!isCreatingNew ? (
              <>
                <div className="max-h-96 overflow-y-auto space-y-1 mb-4">
                  {filteredPeople.map((person, idx) => (
                    <button
                      key={person.id}
                      onClick={() => handlePersonSelect(person)}
                      className={`w-full text-left px-4 py-2 rounded transition-colors ${
                        idx === selectedIndex
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      }`}
                    >
                      <div className="font-semibold">{person.name}</div>
                      <div className="text-xs opacity-75">{person.category} • {person.description}</div>
                    </button>
                  ))}
                  {filteredPeople.length === 0 && (
                    <div className="text-center text-slate-400 py-4">
                      No matching people found
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-2"
                >
                  + Create New Person
                </button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-white font-semibold mb-2">New Person Name</label>
                  <input
                    type="text"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter full name..."
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    autoFocus
                  />
                  <p className="text-slate-400 text-xs mt-1">
                    Press Enter to create, Esc to go back
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCreateNewPerson}
                    disabled={!newPersonName.trim()}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingNew(false);
                      setNewPersonName('');
                    }}
                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                  >
                    Back
                  </button>
                </div>
              </>
            )}

            {!isCreatingNew && (
              <button
                onClick={() => {
                  setShowPersonPicker(false);
                  setPendingRect(null);
                  setNewPersonName('');
                  setIsCreatingNew(false);
                }}
                className="mt-4 w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
              >
                Cancel (Esc)
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-3">Instructions</h3>
        <ol className="text-slate-300 space-y-2 list-decimal list-inside">
          <li>Click and drag to draw a rectangle around a person&apos;s face</li>
          <li>Hold Shift while dragging to create a square</li>
          <li>Click and drag any rectangle to move it</li>
          <li>Drag the resize handles on any rectangle to adjust size and shape</li>
          <li>Hold Shift while resizing to maintain a square shape</li>
          <li>Type to search for an existing person or click &quot;Create New Person&quot;</li>
          <li>Press Enter or click to confirm</li>
          <li>Click the X button on any rectangle to delete it</li>
          <li>Repeat for all people in the photo</li>
          <li>Click &quot;Copy Complete JSON&quot; when done</li>
          <li>Paste the complete JSON directly into your people.json file (replaces entire file)</li>
        </ol>
      </div>
    </div>
  );
}
