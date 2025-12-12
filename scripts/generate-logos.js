/**
 * Script to generate PNG, JPG, and ICO files from SVG logos
 * Requires: npm install sharp to-ico
 * 
 * Run with: node scripts/generate-logos.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp not found. Install with: npm install sharp');
  process.exit(1);
}

// Check if to-ico is available
let toIco;
try {
  toIco = require('to-ico');
} catch (e) {
  console.log('to-ico not found. Install with: npm install to-ico');
  process.exit(1);
}

const publicDir = path.join(__dirname, '../public');

// Sizes to generate from icon
const iconSizes = [
  { name: '16x16', size: 16 },
  { name: '32x32', size: 32 },
  { name: '48x48', size: 48 },
  { name: '64x64', size: 64 },
  { name: '96x96', size: 96 },
  { name: '128x128', size: 128 },
  { name: '180x180', size: 180 },
  { name: '192x192', size: 192 },
  { name: '256x256', size: 256 },
  { name: '512x512', size: 512 },
  { name: '1024x1024', size: 1024 },
];

// Special sizes from full logo
const specialSizes = [
  { name: '120x160', size: { width: 120, height: 160 } },
  { name: '160x48', size: { width: 160, height: 48 } },
  { name: '280x80', size: { width: 280, height: 80 } },
  { name: '1200x630', size: { width: 1200, height: 630 } }, // Open Graph
];

// JPG sizes for Open Graph
const jpgSizes = [
  { name: '1024x1024', size: { width: 1024, height: 1024 } },
  { name: '1200x630', size: { width: 1200, height: 630 } },
  { name: '160x48', size: { width: 160, height: 48 } },
  { name: '256x256', size: { width: 256, height: 256 } },
  { name: '280x80', size: { width: 280, height: 80 } },
  { name: '512x512', size: { width: 512, height: 512 } },
];

async function generateLogos() {
  const logoIconPath = path.join(publicDir, 'logo-icon.svg');
  const logoPath = path.join(publicDir, 'logo.svg');
  const logoSmallPath = path.join(publicDir, 'logo-small.svg');

  if (!fs.existsSync(logoIconPath)) {
    console.error('logo-icon.svg not found!');
    return;
  }

  if (!fs.existsSync(logoPath)) {
    console.error('logo.svg not found!');
    return;
  }

  console.log('Generating PNG logos from SVG...');

  // Generate icon sizes from logo-icon.svg
  for (const { name, size } of iconSizes) {
    try {
      const outputPath = path.join(publicDir, `logo-${name}.png`);
      await sharp(logoIconPath)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated logo-${name}.png`);
    } catch (error) {
      console.error(`✗ Failed to generate logo-${name}.png:`, error.message);
    }
  }

  // Generate special sizes from full logo
  for (const { name, size } of specialSizes) {
    try {
      const outputPath = path.join(publicDir, `logo-${name}.png`);
      // Use logo-small.svg for horizontal formats, logo.svg for others
      const sourcePath = (name === '160x48' || name === '280x80') ? logoSmallPath : logoPath;
      await sharp(sourcePath)
        .resize(size.width, size.height, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated logo-${name}.png`);
    } catch (error) {
      console.error(`✗ Failed to generate logo-${name}.png:`, error.message);
    }
  }

  // Generate JPG versions for Open Graph
  for (const { name, size } of jpgSizes) {
    try {
      const outputPath = path.join(publicDir, `logo-${name}.jpg`);
      const sourcePath = (name === '160x48' || name === '280x80') ? logoSmallPath : logoPath;
      await sharp(sourcePath)
        .resize(size.width, size.height, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .jpeg({ quality: 90 })
        .toFile(outputPath);
      console.log(`✓ Generated logo-${name}.jpg`);
    } catch (error) {
      console.error(`✗ Failed to generate logo-${name}.jpg:`, error.message);
    }
  }

  // Generate monochrome version
  try {
    const monochromePath = path.join(publicDir, 'logo-monochrome.png');
    await sharp(logoPath)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .greyscale()
      .png()
      .toFile(monochromePath);
    console.log('✓ Generated logo-monochrome.png');
  } catch (error) {
    console.error('✗ Failed to generate logo-monochrome.png:', error.message);
  }

  // Generate favicon.ico (multi-size ICO)
  try {
    const icoSizes = [16, 32, 48];
    const icoImages = await Promise.all(
      icoSizes.map(s => 
        sharp(logoIconPath)
          .resize(s, s, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .png()
          .toBuffer()
      )
    );

    // Create proper ICO file with multiple sizes
    const icoBuffer = await toIco(icoImages);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
    
    console.log('✓ Generated favicon.ico (multi-size ICO)');
  } catch (error) {
    console.error('✗ Failed to generate favicon.ico:', error.message);
    // Fallback to PNG if ICO generation fails
    try {
      await sharp(logoIconPath)
        .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toFile(path.join(publicDir, 'favicon.ico'));
      console.log('  Fallback: Generated favicon.ico as PNG');
    } catch (fallbackError) {
      console.error('  Fallback also failed:', fallbackError.message);
    }
  }

  console.log('\n✅ Logo generation complete!');
  console.log('\nGenerated files:');
  iconSizes.forEach(({ name }) => {
    console.log(`  - logo-${name}.png`);
  });
  specialSizes.forEach(({ name }) => {
    console.log(`  - logo-${name}.png`);
  });
  jpgSizes.forEach(({ name }) => {
    console.log(`  - logo-${name}.jpg`);
  });
  console.log('  - logo-monochrome.png');
  console.log('  - favicon.ico');
}

generateLogos().catch(console.error);

