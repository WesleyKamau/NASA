# Migration Guide: Integrating into a Larger Next.js App

When you're ready to integrate this NASA recognition page into your main Next.js application, follow this guide.

## Current Standalone Structure

Right now, this is a standalone Next.js app:
```
nasa-recognition/
├── app/
│   ├── page.tsx          ← Root page (/)
│   └── setup/page.tsx    ← Setup page (/setup)
```

## Future Integrated Structure

You'll want it as a route in your main app:
```
your-main-app/
├── app/
│   ├── page.tsx                      ← Your main homepage
│   ├── nasa-recognition/
│   │   ├── page.tsx                  ← NASA recognition page
│   │   └── setup/page.tsx            ← Setup page
│   └── ...other routes
```

## Migration Steps

### Step 1: Copy the Route

1. In your main app, create the route folder:
   ```bash
   mkdir -p app/nasa-recognition
   mkdir -p app/nasa-recognition/setup
   ```

2. Copy the page files:
   ```bash
   # From nasa-recognition project
   cp app/page.tsx ../your-main-app/app/nasa-recognition/page.tsx
   cp app/setup/page.tsx ../your-main-app/app/nasa-recognition/setup/page.tsx
   ```

### Step 2: Move Components

If you want to share components across your app:

1. Copy components to a shared location:
   ```bash
   # Option A: App-level components
   cp -r components ../your-main-app/components/nasa-recognition/

   # Option B: Route-level components
   cp -r components ../your-main-app/app/nasa-recognition/components/
   ```

2. Update imports in the page files:
   ```typescript
   // Before (standalone):
   import PersonGrid from '@/components/PersonGrid';

   // After (Option A):
   import PersonGrid from '@/components/nasa-recognition/PersonGrid';

   // After (Option B):
   import PersonGrid from './components/PersonGrid';
   ```

### Step 3: Move Data and Types

1. Copy data folder:
   ```bash
   # Option A: Public data
   cp -r data ../your-main-app/data/nasa-recognition/

   # Option B: Route-specific
   cp -r data ../your-main-app/app/nasa-recognition/data/
   ```

2. Copy types:
   ```bash
   # Option A: Shared types
   cp -r types ../your-main-app/types/nasa-recognition/

   # Option B: Route-specific
   cp -r types ../your-main-app/app/nasa-recognition/types/
   ```

3. Update imports:
   ```typescript
   // Update in lib/data.ts and components
   import { PeopleData } from '@/types/nasa-recognition';
   import peopleData from '@/data/nasa-recognition/people.json';
   ```

### Step 4: Move Lib/Utilities

```bash
# Option A: Shared lib
cp -r lib ../your-main-app/lib/nasa-recognition/

# Option B: Route-specific
cp -r lib ../your-main-app/app/nasa-recognition/lib/
```

### Step 5: Move Public Assets

```bash
# Copy photos
cp -r public/photos ../your-main-app/public/nasa-recognition/
```

Update image paths in `data/people.json`:
```json
{
  "imagePath": "/nasa-recognition/staff-group.jpg"
}
```

### Step 6: Merge Styles

#### Option A: Keep Separate
Create a NASA-specific CSS file:
```bash
cp app/globals.css ../your-main-app/app/nasa-recognition/styles.css
```

Import in the layout or page:
```typescript
import './styles.css';
```

#### Option B: Merge into Global Styles
Copy the custom animations from `globals.css` to your main app's global CSS file:
```css
/* Add to your main globals.css */
@keyframes fadeIn { ... }
@keyframes scaleIn { ... }
@keyframes float { ... }
```

### Step 7: Update Package Dependencies

If your main app is missing any dependencies:
```bash
# These are likely already in your main app
# But check and install if needed
npm install next react react-dom
```

## Recommended Structure

For best organization:

```
your-main-app/
├── app/
│   ├── nasa-recognition/
│   │   ├── components/          ← Route-specific components
│   │   │   ├── PersonCard.tsx
│   │   │   ├── PersonGrid.tsx
│   │   │   ├── PersonModal.tsx
│   │   │   ├── InteractiveGroupPhoto.tsx
│   │   │   ├── StarfieldBackground.tsx
│   │   │   ├── FloatingRocket.tsx
│   │   │   └── CoordinatePicker.tsx
│   │   ├── lib/
│   │   │   └── data.ts          ← Data access functions
│   │   ├── types/
│   │   │   └── index.ts         ← TypeScript types
│   │   ├── data/
│   │   │   └── people.json      ← People data
│   │   ├── page.tsx             ← Main page
│   │   ├── setup/
│   │   │   └── page.tsx         ← Setup page
│   │   └── styles.css           ← NASA-specific styles (optional)
│   └── ...other routes
├── public/
│   └── nasa-recognition/
│       └── photos/              ← Photos
└── ...
```

## Import Path Adjustments

### Before (Standalone)
```typescript
import { getPeopleData } from '@/lib/data';
import PersonGrid from '@/components/PersonGrid';
import { Person } from '@/types';
```

### After (Integrated - Relative Paths)
```typescript
import { getPeopleData } from './lib/data';
import PersonGrid from './components/PersonGrid';
import { Person } from './types';
```

### After (Integrated - Absolute Paths)
Update `tsconfig.json` with path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@/nasa/*": ["./app/nasa-recognition/*"]
    }
  }
}
```

Then use:
```typescript
import { getPeopleData } from '@/nasa/lib/data';
import PersonGrid from '@/nasa/components/PersonGrid';
import { Person } from '@/nasa/types';
```

## Navigation Integration

### Add to Your Main Nav

In your main app's navigation component:
```typescript
<nav>
  <Link href="/">Home</Link>
  <Link href="/nasa-recognition">NASA Recognition</Link>
  <Link href="/about">About</Link>
</nav>
```

### Breadcrumbs

```typescript
// In app/nasa-recognition/page.tsx
export default function NASARecognitionPage() {
  return (
    <>
      <Breadcrumbs>
        <Link href="/">Home</Link>
        <span>NASA Recognition</span>
      </Breadcrumbs>
      {/* Rest of page */}
    </>
  );
}
```

## Shared Layout Considerations

### Option 1: Use Main App Layout
The page will automatically inherit from `app/layout.tsx`.

### Option 2: Custom NASA Layout
Create `app/nasa-recognition/layout.tsx`:
```typescript
export default function NASALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="nasa-recognition-section">
      {children}
    </div>
  );
}
```

## Background Animation Considerations

The `StarfieldBackground` component uses `fixed` positioning. In a larger app:

### Option A: Route-Specific Background
Keep it in the page component - it will only appear on NASA routes.

### Option B: Conditional Background
In your main layout:
```typescript
'use client';
import { usePathname } from 'next/navigation';
import StarfieldBackground from '@/nasa/components/StarfieldBackground';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isNASARoute = pathname.startsWith('/nasa-recognition');

  return (
    <html>
      <body>
        {isNASARoute && <StarfieldBackground />}
        {children}
      </body>
    </html>
  );
}
```

## Metadata Management

In your integrated `app/nasa-recognition/page.tsx`:
```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NASA Recognition | Your App Name',
  description: 'Recognizing the amazing people from my NASA internship',
};
```

## Testing After Migration

1. **Development server**:
   ```bash
   npm run dev
   ```

2. **Check routes**:
   - http://localhost:3000/nasa-recognition
   - http://localhost:3000/nasa-recognition/setup

3. **Verify**:
   - ✅ All people load correctly
   - ✅ Photos display
   - ✅ Animations work
   - ✅ Modals open
   - ✅ Coordinate picker functions
   - ✅ Navigation integrates smoothly

4. **Run validation**:
   ```bash
   npm run validate-data
   ```

## Build Verification

```bash
npm run build
```

Ensure:
- No build errors
- All routes generated
- Images optimized
- TypeScript checks pass

## Example Migration Script

Create `migrate.sh`:
```bash
#!/bin/bash

# Set paths
SOURCE="./nasa-recognition"
TARGET="../your-main-app"

# Create directories
mkdir -p "$TARGET/app/nasa-recognition/setup"
mkdir -p "$TARGET/public/nasa-recognition"

# Copy route files
cp "$SOURCE/app/page.tsx" "$TARGET/app/nasa-recognition/"
cp "$SOURCE/app/setup/page.tsx" "$TARGET/app/nasa-recognition/setup/"

# Copy supporting files
cp -r "$SOURCE/components" "$TARGET/app/nasa-recognition/"
cp -r "$SOURCE/lib" "$TARGET/app/nasa-recognition/"
cp -r "$SOURCE/types" "$TARGET/app/nasa-recognition/"
cp -r "$SOURCE/data" "$TARGET/app/nasa-recognition/"

# Copy public assets
cp -r "$SOURCE/public/photos" "$TARGET/public/nasa-recognition/"

echo "✅ Migration complete!"
echo "Next steps:"
echo "1. Update import paths in the copied files"
echo "2. Update photo paths in people.json"
echo "3. Test at http://localhost:3000/nasa-recognition"
```

## Rollback Plan

Keep the standalone app as a backup:
1. Don't delete the nasa-recognition folder
2. Tag it in git: `git tag v1.0-standalone`
3. Can always return to working state

## Tips for Success

1. **Do it incrementally**: Copy one piece at a time, test, then continue
2. **Use git**: Commit after each successful step
3. **Test thoroughly**: Check all features work in the new structure
4. **Update paths carefully**: This is the most common source of errors
5. **Keep documentation**: Update your main app's README

## Common Issues

### Images Not Loading
**Cause**: Incorrect paths after migration
**Fix**: Update `imagePath` in people.json to include route prefix

### Components Not Found
**Cause**: Import paths not updated
**Fix**: Search and replace import paths

### Styles Not Applied
**Cause**: CSS not imported
**Fix**: Import route-specific CSS or merge into global styles

### TypeScript Errors
**Cause**: Type import paths broken
**Fix**: Update paths in tsconfig.json or use relative imports

## Cleanup

After successful migration:
1. Test everything thoroughly
2. Update your main app's documentation
3. Remove the standalone nasa-recognition folder (or archive it)
4. Update deployment configs if needed

---

**This migration should take about 30-60 minutes and is straightforward since the code is already Next.js-native!** 🚀
