const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ICON_DIR = path.join(__dirname, '..', 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');
const VARIANTS_DIR = path.join(__dirname, '..', 'icon-variants');

function createIcon() {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <!-- Top-to-bottom gradient: lighter orange at top, deeper at bottom -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFA44F"/>
      <stop offset="40%" style="stop-color:#F58A30"/>
      <stop offset="100%" style="stop-color:#E0601E"/>
    </linearGradient>

    <!-- Shadow behind egg - visible and grounding -->
    <filter id="eggShadow" x="-20%" y="-15%" width="140%" height="145%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="35" result="blur"/>
      <feOffset dx="0" dy="22" result="offsetBlur"/>
      <feFlood flood-color="rgba(0,0,0,0.35)" result="color"/>
      <feComposite in="color" in2="offsetBlur" operator="in" result="shadow"/>
      <feMerge>
        <feMergeNode in="shadow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Yolk gradient for depth -->
    <radialGradient id="yolkOuter" cx="50%" cy="46%" r="50%">
      <stop offset="0%" style="stop-color:#FFE066"/>
      <stop offset="60%" style="stop-color:#FFCF33"/>
      <stop offset="100%" style="stop-color:#F0A318"/>
    </radialGradient>

    <radialGradient id="yolkInner" cx="48%" cy="44%" r="48%">
      <stop offset="0%" style="stop-color:#FFD84A"/>
      <stop offset="100%" style="stop-color:#F5A623"/>
    </radialGradient>

    <!-- Subtle inner shadow on egg white -->
    <filter id="innerGlow" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur"/>
      <feOffset dx="0" dy="4" result="offsetBlur"/>
      <feFlood flood-color="rgba(200,170,130,0.12)" result="color"/>
      <feComposite in="color" in2="offsetBlur" operator="in" result="shadow"/>
      <feMerge>
        <feMergeNode in="SourceGraphic"/>
        <feMergeNode in="shadow"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#bg)"/>

  <!-- Very subtle noise/texture via circles -->
  <circle cx="200" cy="180" r="280" fill="rgba(255,255,255,0.03)"/>
  <circle cx="820" cy="850" r="250" fill="rgba(0,0,0,0.03)"/>

  <!-- Egg white - perfectly centered -->
  <ellipse cx="512" cy="512" rx="275" ry="330" fill="#FFFEF8" filter="url(#eggShadow)"/>

  <!-- Subtle edge definition on egg -->
  <ellipse cx="512" cy="512" rx="273" ry="328" fill="none" stroke="rgba(220,200,170,0.15)" stroke-width="2"/>

  <!-- Egg white highlight (top-left area for 3D feel) -->
  <ellipse cx="440" cy="400" rx="150" ry="170" fill="rgba(255,255,255,0.5)"/>

  <!-- Yolk - outer ring -->
  <circle cx="512" cy="530" r="152" fill="url(#yolkOuter)"/>

  <!-- Yolk - inner -->
  <circle cx="512" cy="528" r="135" fill="url(#yolkInner)"/>

  <!-- Yolk highlight - large soft -->
  <ellipse cx="475" cy="488" rx="55" ry="45" fill="rgba(255,255,255,0.28)"/>

  <!-- Yolk highlight - small sharp -->
  <circle cx="456" cy="472" r="20" fill="rgba(255,255,255,0.45)"/>

  <!-- Tiny secondary highlight -->
  <circle cx="440" cy="460" r="8" fill="rgba(255,255,255,0.55)"/>
</svg>`);
}

async function generate() {
  console.log('Generating final icon...');

  // Save to icon-variants for preview
  if (!fs.existsSync(VARIANTS_DIR)) fs.mkdirSync(VARIANTS_DIR);
  const previewPath = path.join(VARIANTS_DIR, 'icon-FINAL.png');
  await sharp(createIcon())
    .resize(1024, 1024)
    .png()
    .toFile(previewPath);
  console.log('  -> icon-FINAL.png (1024x1024) in icon-variants/');

  // Also generate a 60x60 preview to verify sharpness at home screen size
  const smallPath = path.join(VARIANTS_DIR, 'icon-FINAL-60px.png');
  await sharp(createIcon())
    .resize(60, 60, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toFile(smallPath);
  console.log('  -> icon-FINAL-60px.png (60x60) in icon-variants/');

  // Copy to actual iOS asset location
  const appIconPath = path.join(ICON_DIR, 'AppIcon-512@2x.png');
  await sharp(createIcon())
    .resize(1024, 1024)
    .png()
    .toFile(appIconPath);
  console.log('  -> AppIcon-512@2x.png (1024x1024) in iOS assets');

  console.log('\nDone! Icon updated in both icon-variants/ and iOS assets.');
}

generate().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
