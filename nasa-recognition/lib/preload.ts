import { GroupPhoto, Person } from '@/types';

/**
 * Preload an image by creating an Image object and setting its src.
 * The image is loaded into memory but is not added to the DOM.
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
}

/**
 * Preload all carousel images
 */
export async function preloadCarouselImages(groupPhotos: GroupPhoto[]): Promise<void> {
  const promises = groupPhotos.map(photo => preloadImage(photo.imagePath));
  try {
    await Promise.all(promises);
  } catch (error) {
    console.warn('Some carousel images failed to preload:', error);
  }
}

/**
 * Preload all person individual images
 */
export async function preloadPersonImages(people: Person[]): Promise<void> {
  const validPersonImages = people
    .filter(person => person.individualPhoto)
    .map(person => preloadImage(person.individualPhoto!));
  
  try {
    await Promise.all(validPersonImages);
  } catch (error) {
    console.warn('Some person images failed to preload:', error);
  }
}

/**
 * Create SVG highlight elements for preloading rendering
 * The highlight rectangles are embedded in the carousel component as SVG,
 * so we create invisible elements (using opacity: 0 and off-screen positioning)
 * to ensure they're rendered by the browser and preload the SVG rendering pipeline.
 */
export async function createHighlightElements(groupPhotos: GroupPhoto[], people: Person[]): Promise<void> {
  const highlightContainer = document.createElement('div');
  highlightContainer.style.opacity = '0';
  highlightContainer.style.pointerEvents = 'none';
  highlightContainer.style.position = 'absolute';
  highlightContainer.style.left = '-9999px';
  highlightContainer.id = 'preload-highlights-container';
  
  // Create SVG elements for each highlight rectangle to preload rendering
  groupPhotos.forEach(photo => {
    const photoPersons = people.filter(person => 
      person.photoLocations.some(loc => loc.photoId === photo.id)
    );
    
    photoPersons.forEach(person => {
      const location = person.photoLocations.find(loc => loc.photoId === photo.id);
      if (location) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttributeNS(null, 'viewBox', '0 0 100 100');
        svg.setAttributeNS(null, 'width', '1');
        svg.setAttributeNS(null, 'height', '1');
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttributeNS(null, 'x', String(location.x));
        rect.setAttributeNS(null, 'y', String(location.y));
        rect.setAttributeNS(null, 'width', String(location.width));
        rect.setAttributeNS(null, 'height', String(location.height));
        rect.setAttributeNS(null, 'fill', 'none');
        rect.setAttributeNS(null, 'stroke', 'rgb(250 204 21)');
        rect.setAttributeNS(null, 'stroke-width', '1');
        
        svg.appendChild(rect);
        highlightContainer.appendChild(svg);
      }
    });
  });
  
  document.body.appendChild(highlightContainer);
  
  // Clean up after a short delay to allow rendering
  setTimeout(() => {
    cleanupHighlights();
  }, 1000);
}

/**
 * Comprehensive preload function: loads carousel images, person images, and highlights
 */
export async function preloadAll(groupPhotos: GroupPhoto[], people: Person[]): Promise<void> {
  try {
    // Start all preloads in parallel
    await Promise.all([
      preloadCarouselImages(groupPhotos),
      preloadPersonImages(people),
      createHighlightElements(groupPhotos, people)
    ]);
  } catch (error) {
    console.warn('Preload error:', error);
  }
}

/**
 * Clean up preloaded highlight container
 */
export function cleanupHighlights(): void {
  const container = document.getElementById('preload-highlights-container');
  if (container) {
    container.remove();
  }
}
