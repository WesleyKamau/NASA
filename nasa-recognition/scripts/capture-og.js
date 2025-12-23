const puppeteer = require('puppeteer');
const path = require('path');
// const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to match OG image dimensions
  await page.setViewport({ width: 1200, height: 630 });
  
  console.log('🚀 Navigating to OG Generator...');
  try {
    // Try to connect to local dev server
    await page.goto('http://localhost:3000/og-generator?mode=capture', {
      waitUntil: 'networkidle0',
      timeout: 10000
    });
  } catch {
    console.error('❌ Could not connect to http://localhost:3000');
    console.error('Please ensure your Next.js dev server is running (npm run dev)');
    await browser.close();
    process.exit(1);
  }

  // Wait a moment for animations/fonts to settle
  await new Promise(r => setTimeout(r, 1000));

  const outputPath = path.join(process.cwd(), 'app', 'opengraph-image.png');
  
  // Take screenshot
  await page.screenshot({ 
    path: outputPath,
    omitBackground: false 
  });
  
  console.log(`✅ Open Graph image generated at: ${outputPath}`);
  
  await browser.close();
})();
