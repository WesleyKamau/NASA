import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  const filePath = path.join(process.cwd(), 'public', 'og-background.png');
  const imageBuffer = await fs.promises.readFile(filePath);
  const base64 = imageBuffer.toString('base64');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundImage: `url(data:image/png;base64,${base64})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    ),
    {
      ...size,
    }
  );
}
