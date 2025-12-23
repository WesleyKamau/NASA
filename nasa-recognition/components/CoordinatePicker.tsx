'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Person, Category, GroupPhoto } from '@/types';
import PersonPreview from './PersonPreview';

interface CoordinatePickerProps {
  imagePath: string;
  photoId: string;
  allPeople: Person[];
  groupPhotos: GroupPhoto[];
  rectangles: Rectangle[];
  initialRectangleIds: Set<string>;
  hideInitialRectangles: boolean;
  onRectanglesChange: (rectangles: Rectangle[]) => void;
  onToggleProfilePhoto: (personId: string, photoId: string) => void;
}

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

export default function CoordinatePicker({ imagePath, photoId, allPeople, groupPhotos, rectangles, initialRectangleIds, hideInitialRectangles, onRectanglesChange, onToggleProfilePhoto }: CoordinatePickerProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [showPersonPicker, setShowPersonPicker] = useState(false);
  const [pendingRect, setPendingRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonCategory, setNewPersonCategory] = useState<Category>('staff');
  const [newPersonDescription, setNewPersonDescription] = useState('');
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
  const [selectedRectIndex, setSelectedRectIndex] = useState<number | null>(null);
  const [editingRotation, setEditingRotation] = useState<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

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

  // Prevent page scroll when zooming with mouse wheel
  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      const newZoom = Math.max(1, Math.min(5, zoom + delta));
      
      if (newZoom !== zoom) {
        if (newZoom === 1) {
          // Reset to center when zooming back to 1
          setZoom(1);
          setPan({ x: 0, y: 0 });
        } else {
          // Get the position of the mouse relative to the center of the container
          const offsetX = mouseX - rect.width / 2;
          const offsetY = mouseY - rect.height / 2;
          
          // Calculate the point in the original image that's under the mouse
          const pointX = (offsetX - pan.x) / zoom;
          const pointY = (offsetY - pan.y) / zoom;
          
          // Calculate new pan so that same point stays under mouse
          const newPanX = offsetX - pointX * newZoom;
          const newPanY = offsetY - pointY * newZoom;
          
          setZoom(newZoom);
          setPan({ x: newPanX, y: newPanY });
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [zoom, pan]);

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
      onRectanglesChange(updated);
      setDragStart({ x, y });
    } else if (isResizing && resizeIndex !== null) {
      const oldRect = rectangles[resizeIndex];
      const newRect = { ...oldRect };

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
      onRectanglesChange(updated);
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
        photoId: photoId,
      };
      onRectanglesChange(updated);
    } else {
      // This is the first time mapping this person, set as profile photo
      onRectanglesChange([...rectangles, {
        ...pendingRect,
        personId: person.id,
        personName: person.name,
        photoId: photoId,
        useAsProfilePhoto: true,
        rotation: 0,
      }]);
    }

    setShowPersonPicker(false);
    setPendingRect(null);
    setNewPersonName('');
    setNewPersonCategory('staff');
    setNewPersonDescription('');
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

    // For a brand new person, this is their first photo so mark it as profile photo
    onRectanglesChange([...rectangles, {
      ...pendingRect,
      personId: newPersonId,
      personName: newPersonName.trim(),
      photoId: photoId,
      useAsProfilePhoto: true,
      category: newPersonCategory,
      description: newPersonDescription.trim(),
      rotation: 0,
    }]);

    setShowPersonPicker(false);
    setPendingRect(null);
    setNewPersonName('');
    setNewPersonCategory('staff');
    setNewPersonDescription('');
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
        setNewPersonCategory('staff');
        setNewPersonDescription('');
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
      setNewPersonCategory('staff');
      setNewPersonDescription('');
      setIsCreatingNew(false);
    }
  };

  const removeRectangle = (index: number) => {
    onRectanglesChange(rectangles.filter((_, i) => i !== index));
    if (selectedRectIndex === index) {
      setSelectedRectIndex(null);
    }
  };

  // Create a mock person object for the preview
  const getPreviewPerson = (rect: Rectangle): Person | null => {
    if (selectedRectIndex === null) return null;
    
    return {
      id: rect.personId,
      name: rect.personName,
      description: rect.description || '',
      category: rect.category || 'staff',
      individualPhoto: null,
      photoLocations: [{
        photoId: photoId,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        rotation: rect.rotation || 0,
      }],
      preferredPhotoId: photoId,
    };
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editing area */}
        <div className="lg:col-span-2">
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
          ref={imageContainerRef}
          className="relative w-full bg-slate-900 rounded-lg overflow-hidden cursor-crosshair"
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
              onMouseUp={() => {
                if (isPanning) {
                  setIsPanning(false);
                } else {
                  handleMouseUp();
                }
              }}
              onMouseLeave={() => {
                if (isPanning) {
                  setIsPanning(false);
                } else {
                  handleMouseUp();
                }
              }}
              onContextMenu={(e) => e.preventDefault()}
            >
            {/* Saved rectangles */}
            {rectangles.map((rect, idx) => {
              const isInitialRect = initialRectangleIds.has(`${rect.personId}-${rect.photoId}`);
              const isHidden = hideInitialRectangles && isInitialRect;
              
              // Don't render hidden rectangles at all
              if (isHidden) return null;
              
              return (
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
              );
            })}

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
      </div>

      {rectangles.length > 0 && (
        <div className="mt-6 bg-slate-900 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Mapped People:</h3>
          <div className="space-y-2">
            {rectangles.map((rect, idx) => (
              <div
                key={idx}
                className={`bg-slate-700 px-4 py-2 rounded-lg text-sm text-white transition-colors ${
                  selectedRectIndex === idx ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="font-medium">{rect.personName}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rect.useAsProfilePhoto || false}
                        onChange={() => onToggleProfilePhoto(rect.personId, photoId)}
                        className="w-4 h-4 rounded border-slate-500 bg-slate-600 text-blue-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300">Use as profile photo</span>
                    </label>
                    <button
                      onClick={() => setSelectedRectIndex(selectedRectIndex === idx ? null : idx)}
                      className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 bg-slate-600 rounded"
                    >
                      {selectedRectIndex === idx ? 'Hide' : 'Edit'}
                    </button>
                    <button
                      onClick={() => removeRectangle(idx)}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                {/* Rotation control - show when this rect is selected */}
                {selectedRectIndex === idx && (
                  <div className="mt-2 pt-2 border-t border-slate-600 space-y-3">
                    {/* Rotation */}
                    <div>
                      <label className="block text-slate-300 text-xs mb-1">
                        Rotation: {rect.rotation || 0}°
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={editingRotation ?? rect.rotation ?? 0}
                          onChange={(e) => {
                            const newRotation = parseInt(e.target.value);
                            setEditingRotation(newRotation);
                            const updated = [...rectangles];
                            updated[idx] = { ...updated[idx], rotation: newRotation };
                            onRectanglesChange(updated);
                          }}
                          className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((editingRotation ?? rect.rotation ?? 0) / 360) * 100}%, #475569 ${((editingRotation ?? rect.rotation ?? 0) / 360) * 100}%, #475569 100%)`
                          }}
                        />
                        <input
                          type="number"
                          min="0"
                          max="360"
                          value={editingRotation ?? rect.rotation ?? 0}
                          onChange={(e) => {
                            const newRotation = Math.max(0, Math.min(360, parseInt(e.target.value) || 0));
                            setEditingRotation(newRotation);
                            const updated = [...rectangles];
                            updated[idx] = { ...updated[idx], rotation: newRotation };
                            onRectanglesChange(updated);
                          }}
                          onBlur={() => setEditingRotation(null)}
                          className="w-16 px-2 py-1 bg-slate-600 text-white rounded text-xs text-center"
                        />
                        <button
                          onClick={() => {
                            setEditingRotation(0);
                            const updated = [...rectangles];
                            updated[idx] = { ...updated[idx], rotation: 0 };
                            onRectanglesChange(updated);
                          }}
                          className="text-xs px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Position Controls */}
                    <div>
                      <label className="block text-slate-300 text-xs mb-1">Position</label>
                      <div className="grid grid-cols-3 gap-1">
                        <div></div>
                        <button
                          onClick={() => {
                            const updated = [...rectangles];
                            updated[idx] = { ...updated[idx], y: Math.max(0, rect.y - 0.5) };
                            onRectanglesChange(updated);
                          }}
                          className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs"
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <div></div>
                        <button
                          onClick={() => {
                            const updated = [...rectangles];
                            updated[idx] = { ...updated[idx], x: Math.max(0, rect.x - 0.5) };
                            onRectanglesChange(updated);
                          }}
                          className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs"
                          title="Move Left"
                        >
                          ◄
                        </button>
                        <button
                          onClick={() => {
                            const updated = [...rectangles];
                            updated[idx] = { ...updated[idx], x: rect.x, y: rect.y };
                            onRectanglesChange(updated);
                          }}
                          className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs"
                          title="Center"
                        >
                          ●
                        </button>
                        <button
                          onClick={() => {
                            const updated = [...rectangles];
                            updated[idx] = { ...updated[idx], x: Math.min(100 - rect.width, rect.x + 0.5) };
                            onRectanglesChange(updated);
                          }}
                          className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs"
                          title="Move Right"
                        >
                          ►
                        </button>
                        <div></div>
                        <button
                          onClick={() => {
                            const updated = [...rectangles];
                            updated[idx] = { ...updated[idx], y: Math.min(100 - rect.height, rect.y + 0.5) };
                            onRectanglesChange(updated);
                          }}
                          className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs"
                          title="Move Down"
                        >
                          ▼
                        </button>
                        <div></div>
                      </div>
                    </div>

                    {/* Size Controls */}
                    <div>
                      <label className="block text-slate-300 text-xs mb-1">Size</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const updated = [...rectangles];
                            const newWidth = Math.max(1, rect.width - 0.5);
                            const newHeight = Math.max(1, rect.height - 0.5);
                            updated[idx] = { 
                              ...updated[idx], 
                              width: newWidth,
                              height: newHeight,
                              x: rect.x + (rect.width - newWidth) / 2,
                              y: rect.y + (rect.height - newHeight) / 2,
                            };
                            onRectanglesChange(updated);
                          }}
                          className="flex-1 px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs"
                          title="Zoom Out"
                        >
                          🔍−
                        </button>
                        <button
                          onClick={() => {
                            const updated = [...rectangles];
                            const newWidth = Math.min(100, rect.width + 0.5);
                            const newHeight = Math.min(100, rect.height + 0.5);
                            const newX = Math.max(0, rect.x - (newWidth - rect.width) / 2);
                            const newY = Math.max(0, rect.y - (newHeight - rect.height) / 2);
                            updated[idx] = { 
                              ...updated[idx], 
                              width: newWidth,
                              height: newHeight,
                              x: newX,
                              y: newY,
                            };
                            onRectanglesChange(updated);
                          }}
                          className="flex-1 px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs"
                          title="Zoom In"
                        >
                          🔍+
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
                  {filteredPeople.map((person, idx) => {
                    const alreadyMapped = rectangles.some(r => r.personId === person.id);
                    
                    return (
                    <button
                      key={person.id}
                      onClick={() => handlePersonSelect(person)}
                      className={`w-full text-left px-4 py-2 rounded transition-colors ${
                        idx === selectedIndex
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">{person.name}</div>
                          <div className="text-xs opacity-75">{person.category} • {person.description}</div>
                        </div>
                        {alreadyMapped && (
                          <div className="ml-2 text-green-400 text-sm font-semibold">✓ Mapped</div>
                        )}
                      </div>
                    </button>
                    );
                  })}
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
                </div>

                <div className="mb-4">
                  <label className="block text-white font-semibold mb-2">Category</label>
                  <select
                    value={newPersonCategory}
                    onChange={(e) => setNewPersonCategory(e.target.value as Category)}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="staff">Staff</option>
                    <option value="interns">Interns</option>
                    <option value="girlfriend">Girlfriend</option>
                    <option value="family">Family</option>
                    <option value="sil-lab">SIL Lab</option>
                    <option value="astronaut">Astronaut</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-white font-semibold mb-2">Description</label>
                  <input
                    type="text"
                    value={newPersonDescription}
                    onChange={(e) => setNewPersonDescription(e.target.value)}
                    placeholder="Enter description..."
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      setNewPersonCategory('staff');
                      setNewPersonDescription('');
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
                  setNewPersonCategory('staff');
                  setNewPersonDescription('');
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
          <li>Check &quot;Use as profile photo&quot; to set this as the person&apos;s display image (only one per person)</li>
          <li>Click &quot;Edit&quot; on any mapped person to adjust rotation</li>
          <li>Repeat for all people in all photos</li>
          <li>Click the green &quot;Copy Complete JSON&quot; button at the bottom when done</li>
          <li>Paste the complete JSON directly into your people.json file (replaces entire file)</li>
        </ol>
      </div>
        </div>
        
        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            {selectedRectIndex !== null && rectangles[selectedRectIndex] && (
              <PersonPreview
                person={getPreviewPerson(rectangles[selectedRectIndex])!}
                groupPhotos={groupPhotos}
                title="Person Preview"
              />
            )}
            {selectedRectIndex === null && (
              <div className="bg-slate-800 rounded-lg p-6 text-center text-slate-400">
                <p className="mb-2">No person selected</p>
                <p className="text-sm">Click &quot;Edit&quot; on a mapped person to see a preview with rotation applied</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
