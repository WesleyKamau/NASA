import fs from 'fs';
import path from 'path';

export const contentType = 'image/png';

export default async function Image() {
  const filePath = path.join(process.cwd(), 'app', 'opengraph-image.png');
  const imageBuffer = await fs.promises.readFile(filePath);

  return new Response(imageBuffer, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
}
