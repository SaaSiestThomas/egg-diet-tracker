const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ASSETS_DIR = path.join(__dirname, '..', 'ios', 'App', 'App', 'Assets.xcassets');
const ICON_DIR = path.join(ASSETS_DIR, 'AppIcon.appiconset');
const SPLASH_DIR = path.join(ASSETS_DIR, 'Splash.imageset');

// Egg-themed warm gradient app icon as SVG
function createIconSvg(size) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD93D"/>
      <stop offset="50%" style="stop-color:#F5A623"/>
      <stop offset="100%" style="stop-color:#E8941A"/>
    </linearGradient>
    <radialGradient id="yolk" cx="50%" cy="45%" r="25%">
      <stop offset="0%" style="stop-color:#FFE066"/>
      <stop offset="100%" style="stop-color:#F5A623"/>
    </radialGradient>
    <radialGradient id="shine" cx="35%" cy="30%" r="30%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.4)"/>
      <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="15" flood-color="rgba(139,109,75,0.3)"/>
    </filter>
    <filter id="innerShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="rgba(139,109,75,0.15)"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1024" rx="0" fill="url(#bg)"/>

  <!-- Subtle radial glow -->
  <circle cx="512" cy="460" r="420" fill="rgba(255,255,255,0.08)"/>

  <!-- Egg white (outer) -->
  <ellipse cx="512" cy="480" rx="260" ry="310" fill="#FFFDF5" filter="url(#shadow)"/>

  <!-- Egg white highlight -->
  <ellipse cx="470" cy="400" rx="160" ry="180" fill="rgba(255,255,255,0.4)"/>

  <!-- Yolk -->
  <circle cx="512" cy="500" r="145" fill="url(#yolk)" filter="url(#innerShadow)"/>

  <!-- Yolk highlight -->
  <ellipse cx="480" cy="465" rx="55" ry="45" fill="rgba(255,255,255,0.35)"/>

  <!-- Small shine dot on yolk -->
  <circle cx="460" cy="450" r="18" fill="rgba(255,255,255,0.5)"/>

  <!-- Cute face on yolk - eyes -->
  <circle cx="478" cy="500" r="14" fill="#4A3728"/>
  <circle cx="546" cy="500" r="14" fill="#4A3728"/>

  <!-- Eye highlights -->
  <circle cx="483" cy="494" r="5" fill="white"/>
  <circle cx="551" cy="494" r="5" fill="white"/>

  <!-- Happy smile -->
  <path d="M 488 528 Q 512 555 536 528" stroke="#4A3728" stroke-width="6" fill="none" stroke-linecap="round"/>

  <!-- Rosy cheeks -->
  <ellipse cx="455" cy="525" rx="18" ry="12" fill="rgba(255,107,107,0.3)"/>
  <ellipse cx="569" cy="525" rx="18" ry="12" fill="rgba(255,107,107,0.3)"/>

  <!-- Small sparkles around egg -->
  <text x="280" y="280" font-size="60" fill="rgba(255,255,255,0.7)">&#x2728;</text>
  <text x="700" y="320" font-size="45" fill="rgba(255,255,255,0.5)">&#x2B50;</text>
  <text x="720" y="680" font-size="50" fill="rgba(255,255,255,0.4)">&#x2728;</text>
  <text x="250" y="700" font-size="40" fill="rgba(255,255,255,0.35)">&#x1F31F;</text>

  <!-- Top text "EGG" -->
  <text x="512" y="220" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="800" font-size="88" fill="#4A3728" opacity="0.85">EGG</text>

  <!-- Bottom text "DIET" -->
  <text x="512" y="830" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="800" font-size="72" fill="#4A3728" opacity="0.7">DIET</text>
</svg>`);
}

// Splash screen SVG
function createSplashSvg(size) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 2732 2732">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFF8E7"/>
      <stop offset="50%" style="stop-color:#FFFDF5"/>
      <stop offset="100%" style="stop-color:#FFF3CD"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="40%">
      <stop offset="0%" style="stop-color:rgba(245,166,35,0.1)"/>
      <stop offset="100%" style="stop-color:rgba(245,166,35,0)"/>
    </radialGradient>
    <radialGradient id="yolk" cx="50%" cy="45%" r="25%">
      <stop offset="0%" style="stop-color:#FFE066"/>
      <stop offset="100%" style="stop-color:#F5A623"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="rgba(139,109,75,0.2)"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="2732" height="2732" fill="url(#bg)"/>

  <!-- Warm glow -->
  <circle cx="1366" cy="1200" r="800" fill="url(#glow)"/>

  <!-- Egg white -->
  <ellipse cx="1366" cy="1250" rx="220" ry="260" fill="#FFFDF5" stroke="rgba(245,166,35,0.15)" stroke-width="3" filter="url(#shadow)"/>

  <!-- Yolk -->
  <circle cx="1366" cy="1270" r="120" fill="url(#yolk)"/>

  <!-- Yolk highlight -->
  <ellipse cx="1340" cy="1240" rx="42" ry="35" fill="rgba(255,255,255,0.35)"/>
  <circle cx="1325" cy="1228" r="14" fill="rgba(255,255,255,0.5)"/>

  <!-- Cute face -->
  <circle cx="1336" cy="1270" r="11" fill="#4A3728"/>
  <circle cx="1396" cy="1270" r="11" fill="#4A3728"/>
  <circle cx="1340" cy="1265" r="4" fill="white"/>
  <circle cx="1400" cy="1265" r="4" fill="white"/>
  <path d="M 1348 1295 Q 1366 1318 1384 1295" stroke="#4A3728" stroke-width="5" fill="none" stroke-linecap="round"/>

  <!-- Title -->
  <text x="1366" y="1550" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="800" font-size="72" fill="#E8941A">Egg Diet Tracker</text>

  <!-- Subtitle -->
  <text x="1366" y="1610" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="36" fill="#7A6555">15 days of egg-cellent progress</text>
</svg>`);
}

async function generate() {
  console.log('Generating app icon...');

  // Generate 1024x1024 icon
  const iconPath = path.join(ICON_DIR, 'AppIcon-512@2x.png');
  await sharp(createIconSvg(1024))
    .resize(1024, 1024)
    .png()
    .toFile(iconPath);
  console.log('  -> AppIcon-512@2x.png (1024x1024)');

  // Update Contents.json for the icon
  const iconContents = {
    images: [
      {
        filename: "AppIcon-512@2x.png",
        idiom: "universal",
        platform: "ios",
        size: "1024x1024"
      }
    ],
    info: { version: 1, author: "xcode" }
  };
  fs.writeFileSync(path.join(ICON_DIR, 'Contents.json'), JSON.stringify(iconContents, null, 2));

  console.log('Generating splash screen...');

  // Generate splash at 2732x2732 (largest iPad size, will be scaled down)
  const splashSvg = createSplashSvg(2732);

  const splashFiles = [
    'splash-2732x2732.png',
    'splash-2732x2732-1.png',
    'splash-2732x2732-2.png',
  ];

  for (const file of splashFiles) {
    const splashPath = path.join(SPLASH_DIR, file);
    await sharp(splashSvg)
      .resize(2732, 2732)
      .png()
      .toFile(splashPath);
    console.log(`  -> ${file}`);
  }

  console.log('\nAll assets generated!');
  console.log('Icon:', iconPath);
  console.log('Splash:', SPLASH_DIR);
}

generate().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
