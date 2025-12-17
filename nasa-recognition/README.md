# MSFC Book of Faces

A beautiful, interactive single-page application to recognize and honor the amazing people from my NASA internship experience. Features NASA-inspired space theming with subtle animations and interactive group photos.

## 🚀 Features

- **Interactive Group Photos**: Click on faces in group photos to view person details
- **Person Grid**: Browse all people in a responsive tile grid
- **NASA Space Theme**: Animated starfield background and floating rocket
- **Responsive Design**: Works beautifully on all device sizes
- **Easy Data Management**: Simple JSON-based data structure

## 🛠️ Getting Started

### Installation

```bash
cd nasa-recognition
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 🧪 Testing

This project includes comprehensive test coverage with both unit/integration tests and end-to-end tests.

### Unit & Integration Tests

Run Jest tests for components and utilities:

```bash
npm run test:unit
```

### E2E Tests

End-to-end tests use Playwright across 9 browser configurations (Chrome, Firefox, Safari, mobile viewports, tablets).

**Quick start:**

```bash
# Clean old results
npm run test:e2e:clean

# Run all E2E tests with live log streaming
npm run test:e2e:watch
```

Then open `e2e-results.log` in VS Code to watch progress in real-time.

**Other test commands:**

```bash
# Run specific browsers
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
npm run test:e2e:mobile

# Debug mode (headed, single browser)
npm run test:e2e:debug

# UI mode (interactive)
npm run test:e2e:ui

# View HTML report
npm run test:e2e:report
```

**Test infrastructure:**
- 396 total E2E tests (44 unique tests × 9 browser configs)
- 4 test suites: page load, carousel navigation, person modal, accessibility
- Configured with proper timeouts, retries, and cleanup
- Live log streaming for monitoring long test runs
- Comprehensive failure reporting with traces and screenshots

**Documentation:**
- [E2E Test Guide](E2E_TEST_GUIDE.md) - Comprehensive testing documentation
- [E2E Checklist](E2E_CHECKLIST.md) - Quick start guide
- [E2E Fixes TODO](E2E_FIXES_TODO.md) - Implementation notes and troubleshooting

## 📸 Adding Photos

### Group Photos

1. Add your group photos to `public/photos/`:
   - `staff-group.jpg` - Photo of staff members
   - `interns-group.jpg` - Photo of interns

2. Update the photo paths in `data/people.json` if needed

### Individual Photos

Add individual photos to `public/photos/individuals/` and reference them in the person's data:

```json
{
  "id": "person-name",
  "individualPhoto": "/photos/individuals/person-name.jpg",
  ...
}
```

## 🎯 Making Photos Interactive

To make group photos clickable, you need to add face coordinates for each person. Here's how:

### Step 1: Open the Photo

Open your group photo in an image editor or use an online tool to identify coordinates.

### Step 2: Get Coordinates

For each person's face, you need:
- `x`: Distance from left edge (as percentage, 0-100)
- `y`: Distance from top edge (as percentage, 0-100)
- `width`: Width of the face area (as percentage, 0-100)
- `height`: Height of the face area (as percentage, 0-100)

**Tip**: Use an online percentage calculator or:
```
x = (pixel_x / image_width) * 100
y = (pixel_y / image_height) * 100
width = (area_width / image_width) * 100
height = (area_height / image_height) * 100
```

### Step 3: Update people.json

Add the coordinates to the person's `photoLocations` array:

```json
{
  "id": "mary-hovater",
  "name": "Mary Hovater",
  "description": "Coolest office, best boss",
  "category": "staff",
  "individualPhoto": null,
  "photoLocations": [
    {
      "photoId": "staff-photo",
      "x": 25.5,
      "y": 30.2,
      "width": 8.5,
      "height": 15.0
    }
  ]
}
```

### Example Workflow

1. Open your photo in a tool like Photoshop, GIMP, or an online image mapper
2. Create a rectangle around a person's face
3. Note the coordinates and dimensions
4. Calculate percentages
5. Add to `people.json`
6. Test by hovering over the photo on your local dev server

### Helper Tool Suggestion

You can create a simple coordinate picker by:
1. Temporarily adding an `onClick` handler to the photo component
2. Logging `(event.nativeEvent.offsetX / event.currentTarget.width) * 100` for x
3. Logging `(event.nativeEvent.offsetY / event.currentTarget.height) * 100` for y

## 📝 Managing People Data

Edit `data/people.json` to add, remove, or update people:

```json
{
  "id": "unique-id",
  "name": "Full Name",
  "description": "Recognition or award",
  "category": "staff" | "interns",
  "individualPhoto": "/photos/individuals/name.jpg" or null,
  "photoLocations": [
    {
      "photoId": "staff-photo",
      "x": 25.0,
      "y": 30.0,
      "width": 8.0,
      "height": 12.0
    }
  ]
}
```

### Field Descriptions

- `id`: Unique identifier (kebab-case recommended)
- `name`: Person's full name
- `description`: What they're being recognized for
- `category`: Either "staff" or "interns"
- `individualPhoto`: Path to individual photo, or `null` if none
- `photoLocations`: Array of locations in group photos (can be empty)

## 🎨 Customization

### Colors

Edit `app/globals.css` to change the color scheme. Main colors used:
- Background: `#030712` (deep space blue)
- Accents: Blue (`#3B82F6`) and Purple (`#A855F7`)

### Animations

Animations are defined in `app/globals.css`:
- `fadeIn`: Modal entrance
- `scaleIn`: Card pop-in
- `float`: Rocket floating animation

### Components

- `PersonCard`: Individual person tiles
- `PersonGrid`: Grid layout for people
- `PersonModal`: Popup with person details
- `InteractiveGroupPhoto`: Clickable group photos
- `StarfieldBackground`: Animated stars
- `FloatingRocket`: Decorative rocket

## 🔮 Future Integration

This app is built with Next.js App Router and can easily be integrated into a larger Next.js application:

1. Copy the entire `app/nasa-recognition` route into your main app
2. Move components to your shared components directory
3. Update imports as needed
4. The page uses standard Next.js patterns for easy migration

## 📦 Project Structure

```
nasa-recognition/
├── app/
│   ├── globals.css          # Styles and animations
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page
├── components/
│   ├── PersonCard.tsx       # Individual person card
│   ├── PersonGrid.tsx       # Grid of people
│   ├── PersonModal.tsx      # Person detail modal
│   ├── InteractiveGroupPhoto.tsx  # Clickable group photo
│   ├── StarfieldBackground.tsx    # Animated stars
│   └── FloatingRocket.tsx   # Decorative rocket
├── data/
│   └── people.json          # People data
├── lib/
│   └── data.ts              # Data access functions
├── public/
│   └── photos/              # Photo storage
├── types/
│   └── index.ts             # TypeScript types
└── package.json
```

## 🤝 Contributing

This is a personal project, but feel free to fork and adapt for your own recognition needs!

## 📄 License

MIT - Feel free to use this for your own recognition pages

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
