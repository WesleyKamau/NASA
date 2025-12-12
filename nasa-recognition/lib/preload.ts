import { GroupPhoto, Person } from '@/types';

// Cache the preload container to avoid repeated DOM queries
let preloadImagesContainer: HTMLElement | null = null;

/**
 * Get or create the preload images container
 */
function getPreloadImagesContainer(): HTMLElement {
  if (!preloadImagesContainer || !document.body.contains(preloadImagesContainer)) {
    preloadImagesContainer = document.createElement('div');
    preloadImagesContainer.id = 'preload-images-container';
    preloadImagesContainer.style.position = 'absolute';
    preloadImagesContainer.style.left = '-9999px';
    preloadImagesContainer.style.visibility = 'hidden';
    document.body.appendChild(preloadImagesContainer);
  }
  return preloadImagesContainer;
}

/**
 * Preload an image by creating an Image element and adding it to a hidden container.
 * This ensures the browser caches the image for faster loading when actually displayed.
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
    
    // Add to dedicated container to ensure browser caches it properly
    img.style.display = 'none';
    img.setAttribute('data-preload', 'true');
    
    const container = getPreloadImagesContainer();
    container.appendChild(img);
  });
}

/**
 * Preload all carousel images
 */
export async function preloadCarouselImages(groupPhotos: GroupPhoto[]): Promise<void> {
  const promises = groupPhotos.map(photo => preloadImage(photo.imagePath));
  const results = await Promise.allSettled(promises);
  
  // Log any failed preloads
  results.forEach((result, idx) => {
    if (result.status === 'rejected') {
      console.warn(`Failed to preload carousel image ${groupPhotos[idx].imagePath}:`, result.reason);
    }
  });
}

/**
 * Preload all person individual images
 */
export async function preloadPersonImages(people: Person[]): Promise<void> {
  const validPeople = people.filter(person => person.individualPhoto);
  const promises = validPeople.map(person => preloadImage(person.individualPhoto!));
  const results = await Promise.allSettled(promises);
  
  // Log any failed preloads
  results.forEach((result, idx) => {
    if (result.status === 'rejected') {
      console.warn(`Failed to preload person image ${validPeople[idx].individualPhoto}:`, result.reason);
    }
  });
}

/**
 * Pre-render SVG highlight rectangles for the carousel.
 * The highlight rectangles are embedded in the carousel component as SVG,
 * so we create invisible elements to ensure they're rendered.
 */
export async function preloadCarouselHighlights(groupPhotos: GroupPhoto[], people: Person[]): Promise<void> {
  // Check if container already exists and remove it to avoid duplicates
  const existingContainer = document.getElementById('preload-highlights-container');
  if (existingContainer) {
    existingContainer.remove();
  }
  
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
        svg.setAttributeNS(null, 'width', '100');
        svg.setAttributeNS(null, 'height', '100');
        
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
  
  // Clean up highlights after rendering completes
  // Double requestAnimationFrame ensures the browser has completed a full paint cycle
  // First frame: browser commits the DOM changes
  // Second frame: browser has rendered the SVG elements and they're cached
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      cleanupHighlights();
    });
  });
}

// Guard to prevent multiple concurrent preload calls
let isPreloading = false;
let preloadAllPromise: Promise<void> | null = null;

/**
 * Comprehensive preload function: loads carousel images, person images, and highlights
 */
export function preloadAll(groupPhotos: GroupPhoto[], people: Person[]): Promise<void> {
  // Return existing promise if already preloading
  if (isPreloading && preloadAllPromise) {
    return preloadAllPromise;
  }
  
  isPreloading = true;
  preloadAllPromise = (async () => {
    try {
      // Start all preloads in parallel and wait for all to settle
      const results = await Promise.allSettled([
        preloadCarouselImages(groupPhotos),
        preloadPersonImages(people),
        preloadCarouselHighlights(groupPhotos, people)
      ]);

      // Log any errors from the settled promises
      results.forEach((result, idx) => {
        if (result.status === 'rejected') {
          const preloadName = ['Carousel Images', 'Person Images', 'Carousel Highlights'][idx];
          console.warn(`Preload error in ${preloadName}:`, result.reason);
        }
      });
    } finally {
      isPreloading = false;
      preloadAllPromise = null;
    }
  })();
  
  return preloadAllPromise;
}

/**
 * Clean up preloaded highlight container and preloaded images
 */
export function cleanupHighlights(): void {
  const highlightContainer = document.getElementById('preload-highlights-container');
  if (highlightContainer) {
    highlightContainer.remove();
  }
  
  // Clean up preloaded images container and reset cache
  if (preloadImagesContainer && document.body.contains(preloadImagesContainer)) {
    preloadImagesContainer.remove();
    preloadImagesContainer = null;
  }
}
