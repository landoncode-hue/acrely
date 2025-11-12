const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '../apps/web/public/favicon.png');
const output = path.join(__dirname, '../apps/web/public/favicon.ico');

async function convertToIco() {
  try {
    // Generate multiple sizes for ICO
    const sizes = [16, 32, 48];
    const buffers = await Promise.all(
      sizes.map(size =>
        sharp(source)
          .resize(size, size)
          .toFormat('png')
          .toBuffer()
      )
    );

    // For now, just use the 32x32 version
    // Full ICO support requires additional library
    await sharp(source)
      .resize(32, 32)
      .toFormat('png')
      .toFile(output.replace('.ico', '-temp.png'));

    console.log('✅ Favicon PNG generated at apps/web/public/');
    console.log('');
    console.log('⚠️  For full .ico support, use one of these options:');
    console.log('   1. Online converter: https://favicon.io/favicon-converter/');
    console.log('   2. Install png-to-ico: pnpm add -D png-to-ico');
    console.log('');
    console.log('Or rename favicon.png to favicon.ico for basic browser support');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

convertToIco();
