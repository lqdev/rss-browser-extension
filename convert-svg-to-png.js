const sharp = require('sharp');
const fs = require('fs');

async function convertSvgToPng() {
  try {
    // Convert icon.svg to PNG files
    await sharp('icons/icon.svg')
      .resize(48, 48)
      .png()
      .toFile('icons/icon-48.png');
    console.log('Created icons/icon-48.png');

    await sharp('icons/icon.svg')
      .resize(128, 128)
      .png()
      .toFile('icons/icon-128.png');
    console.log('Created icons/icon-128.png');

    // Use 128px as the default icon.png
    fs.copyFileSync('icons/icon-128.png', 'icons/icon.png');
    console.log('Created icons/icon.png');

    // Convert icon-active.svg to PNG files
    await sharp('icons/icon-active.svg')
      .resize(48, 48)
      .png()
      .toFile('icons/icon-active-48.png');
    console.log('Created icons/icon-active-48.png');

    await sharp('icons/icon-active.svg')
      .resize(128, 128)
      .png()
      .toFile('icons/icon-active-128.png');
    console.log('Created icons/icon-active-128.png');

    // Use 128px as the default icon-active.png
    fs.copyFileSync('icons/icon-active-128.png', 'icons/icon-active.png');
    console.log('Created icons/icon-active.png');

    console.log('\nAll RSS badge icons generated successfully!');
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
    process.exit(1);
  }
}

convertSvgToPng();
