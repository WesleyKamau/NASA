# Open Graph Preview Image Generation

## New Method (Using Next.js Generator)

We have created a dedicated tool to generate the Open Graph image using the actual site components (Starfield, Rocket, Fonts).

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the Generator**:
   Navigate to [http://localhost:3000/og-generator](http://localhost:3000/og-generator)

3. **Customize**:
   - **Drag** the rocket to your desired position.
   - **Shift + Scroll** to rotate the rocket.
   - The console will log the exact coordinates.
   - **Update Defaults**: If you want to save this position permanently, update the default state in `app/og-generator/page.tsx`.

4. **Capture**:
   Run the capture script in a new terminal window:
   ```bash
   node scripts/capture-og.js
   ```
   
   This will automatically:
   - Launch a headless browser
   - Navigate to the generator page
   - Set the viewport to 1200x630
   - Save the screenshot to `public/og-preview.png`

## Why this method?
This ensures the Open Graph image perfectly matches the website's design, using the exact same React components, fonts, and styling (Tailwind CSS) as the production site.
