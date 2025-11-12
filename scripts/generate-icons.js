#!/usr/bin/env node
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Source logo path (you'll need to provide this)
const SOURCE_LOGO = process.argv[2] || path.join(__dirname, '../source-logo.png');

if (!fs.existsSync(SOURCE_LOGO)) {
  console.error('❌ Source logo not found:', SOURCE_LOGO);
  console.log('\nUsage: node scripts/generate-icons.js <path-to-logo.png>');
  console.log('Example: node scripts/generate-icons.js ~/Downloads/acrely-logo.png');
  process.exit(1);
}

const MOBILE_ASSETS = path.join(__dirname, '../apps/mobile/assets');
const WEB_PUBLIC = path.join(__dirname, '../apps/web/public');
const WEB_BRAND = path.join(__dirname, '../apps/web/public/brand');

// Icon configurations
const icons = [
  // Mobile icons
  { size: 1024, output: path.join(MOBILE_ASSETS, 'icon.png'), name: 'Mobile App Icon' },
  { size: 1024, output: path.join(MOBILE_ASSETS, 'adaptive-icon.png'), name: 'Android Adaptive Icon', transparent: true },
  { size: 1024, output: path.join(MOBILE_ASSETS, 'splash.png'), name: 'Splash Icon' },
  { size: 512, output: path.join(MOBILE_ASSETS, 'logo.png'), name: 'Mobile Logo', transparent: true },
  
  // Web PWA icons
  { size: 48, output: path.join(WEB_PUBLIC, 'icon-48x48.png'), name: 'Web Icon 48x48' },
  { size: 192, output: path.join(WEB_PUBLIC, 'icon-192x192.png'), name: 'Web Icon 192x192' },
  { size: 512, output: path.join(WEB_PUBLIC, 'icon-512x512.png'), name: 'Web Icon 512x512' },
  { size: 180, output: path.join(WEB_PUBLIC, 'apple-touch-icon.png'), name: 'Apple Touch Icon' },
  
  // Web brand logos
  { size: 512, output: path.join(WEB_BRAND, 'logo.png'), name: 'Web Brand Logo', transparent: true },
  { size: 256, output: path.join(WEB_BRAND, 'logo-sm.png'), name: 'Web Brand Logo Small', transparent: true },
];

async function generateIcons() {
  console.log('🎨 Generating icons from:', SOURCE_LOGO);
  console.log('');

  // Ensure directories exist
  [MOBILE_ASSETS, WEB_PUBLIC, WEB_BRAND].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  for (const icon of icons) {
    try {
      let pipeline = sharp(SOURCE_LOGO).resize(icon.size, icon.size, {
        fit: 'contain',
        background: icon.transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 213, g: 74, b: 29, alpha: 1 }
      });

      await pipeline.png().toFile(icon.output);
      console.log(`✅ ${icon.name}: ${path.basename(icon.output)} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${icon.name}:`, error.message);
    }
  }

  // Generate favicon.ico (16x16 and 32x32 combined)
  try {
    await sharp(SOURCE_LOGO)
      .resize(32, 32, { fit: 'contain', background: { r: 213, g: 74, b: 29, alpha: 1 } })
      .png()
      .toFile(path.join(WEB_PUBLIC, 'favicon.png'));
    
    console.log(`✅ Favicon: favicon.png (32x32)`);
    console.log('');
    console.log('⚠️  Note: Convert favicon.png to favicon.ico manually or use an online converter');
    console.log('   Recommended: https://favicon.io/favicon-converter/');
  } catch (error) {
    console.error('❌ Failed to generate favicon:', error.message);
  }

  console.log('');
  console.log('✨ Icon generation complete!');
  console.log('');
  console.log('📋 Generated files:');
  console.log('   Mobile: apps/mobile/assets/');
  console.log('   Web:    apps/web/public/');
  console.log('   Brand:  apps/web/public/brand/');
}

generateIcons().catch(console.error);
