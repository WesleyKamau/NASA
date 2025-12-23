/**
 * Data validation script for people.json
 * Run with: npm run validate-data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '../data/people.json');

interface PhotoLocation {
  photoId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Person {
  id: string;
  name: string;
  description: string;
  category: 'staff' | 'interns' | 'girlfriend' | 'family' | 'sil-lab' | 'astronaut';
  individualPhoto: string | null;
  photoLocations: PhotoLocation[];
  hidden?: boolean;
}

interface GroupPhoto {
  id: string;
  name: string;
  imagePath: string;
  category: 'staff' | 'interns' | 'girlfriend' | 'family' | 'sil-lab' | 'astronaut';
}

interface PeopleData {
  people: Person[];
  groupPhotos: GroupPhoto[];
}

function validateData() {
  console.log('🔍 Validating people.json...\n');

  let hasErrors = false;

  try {
    const data: PeopleData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // Validate people
    console.log(`📋 Found ${data.people.length} people`);
    
    const ids = new Set<string>();
    const photoIds = new Set(data.groupPhotos.map(p => p.id));

    data.people.forEach((person, index) => {
      const errors: string[] = [];

      // Check for required fields
      if (!person.id) errors.push('Missing id');
      if (!person.name) errors.push('Missing name');
      if (!person.category) errors.push('Missing category');

      // Check for duplicate IDs
      if (ids.has(person.id)) {
        errors.push(`Duplicate ID: ${person.id}`);
      }
      ids.add(person.id);

      // Validate category
      if (person.category && !['staff', 'interns', 'girlfriend', 'family', 'sil-lab', 'astronaut'].includes(person.category)) {
        errors.push(`Invalid category: ${person.category}`);
      }

      // Validate photo locations
      if (person.photoLocations) {
        person.photoLocations.forEach((loc, locIndex) => {
          if (!photoIds.has(loc.photoId)) {
            errors.push(`Invalid photoId at location ${locIndex}: ${loc.photoId}`);
          }
          if (loc.x < 0 || loc.x > 100) {
            errors.push(`Invalid x coordinate: ${loc.x} (must be 0-100)`);
          }
          if (loc.y < 0 || loc.y > 100) {
            errors.push(`Invalid y coordinate: ${loc.y} (must be 0-100)`);
          }
          if (loc.width <= 0 || loc.width > 100) {
            errors.push(`Invalid width: ${loc.width} (must be 0-100)`);
          }
          if (loc.height <= 0 || loc.height > 100) {
            errors.push(`Invalid height: ${loc.height} (must be 0-100)`);
          }
        });
      }

      if (errors.length > 0) {
        console.log(`❌ Person ${index + 1} (${person.name || person.id}):`);
        errors.forEach(err => console.log(`   - ${err}`));
        hasErrors = true;
      }
    });

    // Validate group photos
    console.log(`\n📸 Found ${data.groupPhotos.length} group photos`);
    
    data.groupPhotos.forEach((photo, index) => {
      const errors: string[] = [];

      if (!photo.id) errors.push('Missing id');
      if (!photo.name) errors.push('Missing name');
      if (!photo.imagePath) errors.push('Missing imagePath');
      if (!photo.category) errors.push('Missing category');

      if (photo.category && !['staff', 'interns', 'girlfriend', 'family', 'sil-lab', 'astronaut'].includes(photo.category)) {
        errors.push(`Invalid category: ${photo.category}`);
      }

      if (errors.length > 0) {
        console.log(`❌ Photo ${index + 1} (${photo.name || photo.id}):`);
        errors.forEach(err => console.log(`   - ${err}`));
        hasErrors = true;
      }
    });

    // Summary statistics
    console.log('\n📊 Statistics:');
    console.log(`   - Staff members: ${data.people.filter(p => p.category === 'staff').length}`);
    console.log(`   - Interns: ${data.people.filter(p => p.category === 'interns').length}`);
    console.log(`   - Girlfriend: ${data.people.filter(p => p.category === 'girlfriend').length}`);
    console.log(`   - Family: ${data.people.filter(p => p.category === 'family').length}`);
    console.log(`   - SIL Lab: ${data.people.filter(p => p.category === 'sil-lab').length}`);
    console.log(`   - Astronauts: ${data.people.filter(p => p.category === 'astronaut').length}`);
    console.log(`   - Hidden from display: ${data.people.filter(p => p.hidden).length}`);
    console.log(`   - With individual photos: ${data.people.filter(p => p.individualPhoto).length}`);
    console.log(`   - In group photos: ${data.people.filter(p => p.photoLocations.length > 0).length}`);
    console.log(`   - Not in any photo: ${data.people.filter(p => !p.individualPhoto && p.photoLocations.length === 0).length}`);

    if (!hasErrors) {
      console.log('\n✅ All validations passed!');
    } else {
      console.log('\n❌ Validation failed - please fix the errors above');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error reading or parsing people.json:', error);
    process.exit(1);
  }
}

validateData();
