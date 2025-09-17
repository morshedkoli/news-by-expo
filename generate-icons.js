// Icon generation script for News Hut app
// This script helps generate the required icon sizes from the SVG logo

const fs = require('fs');
const path = require('path');

// Required icon sizes for Expo apps
const iconSizes = {
  'icon.png': 1024,           // Main app icon (1024x1024)
  'adaptive-icon.png': 1024,  // Android adaptive icon (1024x1024)
  'favicon.png': 48,          // Web favicon (48x48)
  'splash-icon.png': 1024,    // Splash screen icon (1024x1024)
};

console.log('📱 News Hut Icon Generation Guide');
console.log('=====================================');
console.log('');
console.log('To generate the required app icons from logo.svg:');
console.log('');
console.log('1. Online SVG to PNG Converter (Recommended):');
console.log('   - Visit: https://convertio.co/svg-png/');
console.log('   - Upload: assets/logo.svg');
console.log('   - Generate the following sizes:');
console.log('');

Object.entries(iconSizes).forEach(([filename, size]) => {
  console.log(`   • ${filename}: ${size}x${size}px`);
});

console.log('');
console.log('2. Using Figma/Adobe Illustrator:');
console.log('   - Import logo.svg');
console.log('   - Export as PNG in the sizes listed above');
console.log('');
console.log('3. Using ImageMagick (if installed):');
console.log('   - Run these commands in the assets folder:');
console.log('');

Object.entries(iconSizes).forEach(([filename, size]) => {
  console.log(`   magick logo.svg -resize ${size}x${size} ${filename}`);
});

console.log('');
console.log('4. Replace the generated files in the assets/ folder');
console.log('');
console.log('Current SVG logo location: assets/logo.svg');
console.log('Target files to replace:');
Object.keys(iconSizes).forEach(filename => {
  console.log(`   - assets/${filename}`);
});
