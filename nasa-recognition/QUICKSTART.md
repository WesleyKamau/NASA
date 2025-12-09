# Quick Start Guide

Welcome! Your NASA Recognition page is ready to customize. Here's what to do next:

## ✅ What's Already Done

- ✨ Modern Next.js app with TypeScript and Tailwind CSS
- 🎨 NASA-themed space background with animations
- 📋 All 27 people from your list are in the data
- 🎯 Interactive photo components ready to use
- 🛠️ Coordinate picker tool for easy photo mapping

## 🚀 Next Steps

### 1. View Your App (Now!)

The development server is already running! Open your browser to:
- **Main page**: http://localhost:3000
- **Setup tool**: http://localhost:3000/setup

You'll see:
- All 27 people in a beautiful grid with NASA theming
- Placeholder group photos (replace these with your actual photos)
- Animated starfield background
- Floating rocket animation

### 2. Add Your Photos

Replace the placeholder photos:

```
public/photos/
├── staff-group.jpg      ← Replace with your staff photo
└── interns-group.jpg    ← Replace with your interns photo
```

**Tips:**
- Use high-quality JPG or PNG files
- Recommended size: 1600x1000 or similar 16:10 aspect ratio
- Keep file sizes under 2MB for fast loading

### 3. Make Photos Interactive

Navigate to http://localhost:3000/setup and:

1. Click and drag rectangles around each person's face
2. Enter their name when prompted (must match the name in data/people.json)
3. Click "Copy JSON to Clipboard"
4. Update the person's entry in `data/people.json` with the coordinates

See `SETUP.md` for detailed instructions.

### 4. Add Individual Photos (Optional)

For people not in group photos:

1. Create folder: `public/photos/individuals/`
2. Add photos: `person-name.jpg`
3. Update `data/people.json`:
   ```json
   {
     "id": "person-id",
     "individualPhoto": "/photos/individuals/person-name.jpg",
     ...
   }
   ```

### 5. Customize Descriptions

Edit `data/people.json` to expand on the descriptions:

```json
{
  "id": "mary-hovater",
  "name": "Mary Hovater",
  "description": "Coolest office, best boss - Mary always had an open door and the most inspiring workspace. She taught me so much about leadership and made every day at NASA special.",
  ...
}
```

### 6. Adjust Categories

Currently all people are marked as "staff". If you have interns data:

1. Open `data/people.json`
2. Change `"category": "staff"` to `"category": "interns"` for applicable people

### 7. Customize Theme (Optional)

Edit `app/globals.css` to adjust:
- Background colors
- Animation speeds
- Accent colors

## 📁 Project Structure

```
nasa-recognition/
├── app/
│   ├── page.tsx           ← Main recognition page
│   ├── setup/page.tsx     ← Photo coordinate picker
│   └── globals.css        ← Styles and animations
├── components/            ← All UI components
├── data/
│   └── people.json        ← YOUR DATA - edit this!
├── public/
│   └── photos/            ← YOUR PHOTOS - add here!
└── types/                 ← TypeScript definitions
```

## 🎯 Current Status

You can see the app working RIGHT NOW at http://localhost:3000

What you'll see:
- ✅ 27 people in the grid
- ✅ Space-themed background with stars
- ✅ Floating rocket animation
- ✅ Click any person card to see their modal
- ⏳ Group photos (waiting for your real photos)
- ⏳ Photo coordinates (use /setup to add these)

## 🔧 Common Tasks

### Start Development Server
```bash
cd nasa-recognition
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Edit People Data
Open `data/people.json` in VS Code and modify as needed.

### Preview Changes
Just save your files - Next.js will hot-reload automatically!

## 📖 Documentation

- **README.md** - Complete documentation
- **SETUP.md** - Photo setup guide
- **This file** - Quick start guide

## 🎨 Demo Features

Try these now at http://localhost:3000:

1. **Click any person card** - See the modal with details
2. **Hover over cards** - See the hover effects
3. **Scroll the page** - Notice the smooth animations
4. **Visit /setup** - Try the coordinate picker tool
5. **Resize browser** - Test responsive design

## ❓ Questions?

- The app is fully functional and ready to customize
- All 27 people from your list are already loaded
- Just add your photos and map the coordinates
- Everything is set up for easy future integration into a larger Next.js app

## 🎉 You're All Set!

Your NASA recognition page is live and ready to personalize. The hard work is done - now just add your photos and enjoy!

Visit: **http://localhost:3000** 🚀
