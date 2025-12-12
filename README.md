<div align="center">

# 🚀 NASA Internship Book of Faces

_This app is for me to remember all the people I met during my tiem at MSFC._

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)](https://typescriptlang.org/)


</div>

---

## ✨ Features

- **🌌 Starfield Background** - Keeping things space themed here
- **🚀 Flying SLS Rocket** - A fun little rocket in the background to keep things interesting
- **📸 Interactive Photos** - Click faces in group photos to learn more about the people
- **📱 Mobile Optimized** - Touch gestures, pinch-to-zoom, and responsive layouts (and still improving!)
- **🎯 EZ Setup** - Photo coordinate editor at `/setup` for collecting the coordinate data

## 🛠️ Setup Page

The setup page at `/setup` provides a visual tool for mapping face locations in group photos:

**Features:**
- Drag to create bounding boxes around faces
- Toggle existing rectangles visibility
- Mark preferred profile photos
- Export complete JSON with all coordinates
- Real-time preview of all mapped locations

**Usage:**
1. Navigate to `/setup`
2. Create rectangles around each person's face in the group photos
3. Select preferred profile photos by clicking the star icon
4. Click "Copy Complete JSON" to export
5. Update `data/people.json` with the generated output

## 🚀 Quick Start

```bash
cd nasa-recognition
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Serve production build
- `npm run validate-data` - Validate people.json
- `npm run og` - Generate an openGraph image

## 🎨 Customization

Look in `/lib/configs` to tweak things.

## 📁 Structure

```
nasa-recognition/
├── app/              # Pages and routes
├── components/       # React components
├── data/            # people.json database
├── lib/             # Utilities and config
└── public/          # Static assets
```

