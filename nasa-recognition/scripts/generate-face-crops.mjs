/**
 * Pre-generates small face-crop images for people who have no individual
 * photo, so the client never has to download and decode a full group photo
 * just to show one face (decoding a 4000px JPEG costs ~40MB of RAM — doing
 * that inside dozens of person cards is what crashed phones).
 *
 * For every photoLocation of every person without an individualPhoto this
 * bakes the exact region the old CSS crop displayed — including rotation —
 * into public/photos/crops/<personId>--<photoId>.jpg (max 640px edge), and
 * writes a manifest to lib/generated/faceCrops.json that lib/imageUtils.ts
 * consults at runtime.
 *
 * Run after changing data/people.json photo locations or group photos:
 *   npm run generate:crops
 * The outputs are committed, so the build does not depend on this script.
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'photos', 'crops');
const MANIFEST_PATH = path.join(ROOT, 'lib', 'generated', 'faceCrops.json');
const MAX_EDGE = 640;

const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'people.json'), 'utf8'));
const people = data.people ?? data;
const groupPhotos = data.groupPhotos ?? [];

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });

const metaCache = new Map();
async function photoMeta(imagePath) {
  if (!metaCache.has(imagePath)) {
    const file = path.join(ROOT, 'public', imagePath);
    metaCache.set(imagePath, { file, ...(await sharp(file).metadata()) });
  }
  return metaCache.get(imagePath);
}

/**
 * Reproduces the CSS crop: the source image rotated `rot` degrees clockwise
 * about the crop center, then the axis-aligned crop rect sampled around that
 * same center.
 */
async function bakeCrop(meta, loc) {
  const W = meta.width;
  const H = meta.height;
  const cw = Math.max(1, Math.round((loc.width / 100) * W));
  const ch = Math.max(1, Math.round((loc.height / 100) * H));
  const cx = (loc.x + loc.width / 2) / 100 * W;
  const cy = (loc.y + loc.height / 2) / 100 * H;
  const rot = loc.rotation || 0;

  // Pad the source just enough that a 2R patch centered on the crop center
  // is always in bounds (crop rects may poke past the photo edges).
  const R = Math.ceil(Math.hypot(cw, ch) / 2) + 2;
  const background = { r: 30, g: 41, b: 59 }; // slate-800, matches card bg
  const padLeft = Math.max(0, Math.ceil(R - cx));
  const padTop = Math.max(0, Math.ceil(R - cy));
  const padRight = Math.max(0, Math.ceil(cx + R - W));
  const padBottom = Math.max(0, Math.ceil(cy + R - H));
  const padded = await sharp(meta.file)
    .extend({ top: padTop, bottom: padBottom, left: padLeft, right: padRight, background })
    .extract({
      left: Math.round(cx - R + padLeft),
      top: Math.round(cy - R + padTop),
      width: 2 * R,
      height: 2 * R,
    })
    .toBuffer();

  let patch = padded;
  if (rot) {
    patch = await sharp(padded).rotate(rot, { background }).toBuffer();
  }

  const pMeta = await sharp(patch).metadata();
  const left = Math.max(0, Math.round(pMeta.width / 2 - cw / 2));
  const top = Math.max(0, Math.round(pMeta.height / 2 - ch / 2));
  let pipeline = sharp(patch).extract({
    left,
    top,
    width: Math.min(cw, pMeta.width - left),
    height: Math.min(ch, pMeta.height - top),
  });
  if (Math.max(cw, ch) > MAX_EDGE) {
    pipeline = pipeline.resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside' });
  }
  return pipeline.jpeg({ quality: 86, mozjpeg: true }).toBuffer();
}

const manifest = {};
let count = 0;
for (const person of people) {
  if (person.individualPhoto || !(person.photoLocations || []).length) continue;
  for (const loc of person.photoLocations) {
    const photo = groupPhotos.find(g => g.id === loc.photoId);
    if (!photo) continue;
    const meta = await photoMeta(photo.imagePath);
    const name = `${person.id}--${loc.photoId}.jpg`;
    const buf = await bakeCrop(meta, loc);
    fs.writeFileSync(path.join(OUT_DIR, name), buf);
    manifest[`${person.id}|${loc.photoId}`] = `/photos/crops/${name}`;
    count++;
  }
}

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
const totalKB = fs.readdirSync(OUT_DIR).reduce((s, f) => s + fs.statSync(path.join(OUT_DIR, f)).size, 0) / 1024;
console.log(`Generated ${count} crops (${Math.round(totalKB)} KB total) and ${path.relative(ROOT, MANIFEST_PATH)}`);
