import { PresetPair } from '@/types/fly';

// High-fidelity SVG icons as data URLs for instant offline loading and razor-sharp rendering

const DUO_UNHINGED = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#58cc02" />
      <stop offset="100%" stop-color="#238200" />
    </linearGradient>
    <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff3366" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#cc0033" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)" />
  <!-- Feather crest -->
  <path d="M 180 130 C 220 80, 292 80, 332 130 C 370 140, 420 220, 400 320 C 380 410, 300 440, 256 440 C 212 440, 132 410, 112 320 C 92 220, 142 140, 180 130 Z" fill="#78c800" stroke="#469600" stroke-width="8" />
  <!-- Bloodshot Eyes -->
  <circle cx="190" cy="240" r="54" fill="#ffffff" stroke="#e0e0e0" stroke-width="4" />
  <circle cx="322" cy="240" r="54" fill="#ffffff" stroke="#e0e0e0" stroke-width="4" />
  <!-- Pupils unhinged -->
  <circle cx="204" cy="246" r="28" fill="#1b2a00" />
  <circle cx="308" cy="246" r="28" fill="#1b2a00" />
  <circle cx="210" cy="240" r="9" fill="#ffffff" />
  <circle cx="302" cy="240" r="9" fill="#ffffff" />
  <!-- Red veins -->
  <path d="M 150 220 Q 170 230 180 240 M 360 220 Q 340 230 330 240" stroke="#ff2244" stroke-width="3" fill="none" />
  <!-- Beak drooping / frantic -->
  <path d="M 230 270 Q 256 250 282 270 L 256 325 Z" fill="#ff9600" stroke="#d86e00" stroke-width="5" />
  <!-- Tear drop / sweat -->
  <path d="M 370 290 C 370 290, 390 320, 390 330 C 390 340, 380 350, 370 350 C 360 350, 350 340, 350 330 C 350 320, 370 290, 370 290 Z" fill="#00d8ff" opacity="0.85" />
</svg>
`)}`;

const DUO_CLASSIC = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgC" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#58cc02" />
      <stop offset="100%" stop-color="#46a302" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bgC)" />
  <!-- Symmetrical Happy Owl Face -->
  <circle cx="190" cy="240" r="62" fill="#ffffff" />
  <circle cx="322" cy="240" r="62" fill="#ffffff" />
  <circle cx="190" cy="240" r="28" fill="#4b4b4b" />
  <circle cx="322" cy="240" r="28" fill="#4b4b4b" />
  <circle cx="198" cy="232" r="10" fill="#ffffff" />
  <circle cx="330" cy="232" r="10" fill="#ffffff" />
  <!-- Orange Beak -->
  <polygon points="236,270 276,270 256,320" fill="#ff9600" />
</svg>
`)}`;

const FLIGHTY_RADAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgF" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050a14" />
      <stop offset="100%" stop-color="#020408" />
    </linearGradient>
    <linearGradient id="cyanSweep" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f0ff" />
      <stop offset="100%" stop-color="#0066ff" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bgF)" />
  <!-- Radar circles -->
  <circle cx="256" cy="256" r="180" fill="none" stroke="#00f0ff" stroke-width="2" opacity="0.2" />
  <circle cx="256" cy="256" r="120" fill="none" stroke="#00f0ff" stroke-width="2" opacity="0.35" />
  <circle cx="256" cy="256" r="60" fill="none" stroke="#00f0ff" stroke-width="3" opacity="0.5" />
  <!-- Crosshairs -->
  <line x1="76" y1="256" x2="436" y2="256" stroke="#00f0ff" stroke-width="2" opacity="0.2" />
  <line x1="256" y1="76" x2="256" y2="436" stroke="#00f0ff" stroke-width="2" opacity="0.2" />
  <!-- Sleek Glowing Jet Icon -->
  <path d="M 256 120 L 280 220 L 390 270 L 390 295 L 280 275 L 275 360 L 310 390 L 310 410 L 256 395 L 202 410 L 202 390 L 237 360 L 232 275 L 122 295 L 122 270 L 232 220 Z" fill="url(#cyanSweep)" filter="drop-shadow(0 0 16px rgba(0, 240, 255, 0.8))" />
</svg>
`)}`;

const FLIGHTY_MINIMAL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="112" fill="#1e293b" />
  <!-- Flat Grey Plane -->
  <path d="M 256 130 L 276 220 L 380 270 L 380 290 L 276 270 L 272 355 L 302 385 L 302 400 L 256 390 L 210 400 L 210 385 L 240 355 L 236 270 L 132 290 L 132 270 L 236 220 Z" fill="#94a3b8" />
</svg>
`)}`;

const LINEAR_NEON = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="linearBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#120e2e" />
      <stop offset="100%" stop-color="#080614" />
    </linearGradient>
    <linearGradient id="linearArc" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5e6ad2" />
      <stop offset="50%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#linearBg)" />
  <!-- Radiant Precision Geometric Curve -->
  <path d="M 140 350 C 140 220, 240 130, 360 130 C 370 130, 375 142, 368 149 C 260 210, 190 280, 150 365 C 144 372, 140 365, 140 350 Z" fill="url(#linearArc)" filter="drop-shadow(0 0 20px rgba(168, 85, 247, 0.7))" />
  <circle cx="360" cy="140" r="18" fill="#ffffff" filter="drop-shadow(0 0 10px #ffffff)" />
  <circle cx="150" cy="355" r="14" fill="#5e6ad2" />
</svg>
`)}`;

const NOTION_MONO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="112" fill="#ffffff" stroke="#e2e8f0" stroke-width="4" />
  <!-- Minimalist Black N Block -->
  <path d="M 150 140 L 220 140 L 310 310 L 310 140 L 362 140 L 362 372 L 292 372 L 202 202 L 202 372 L 150 372 Z" fill="#000000" />
</svg>
`)}`;

const TWITTER_BLUE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="112" fill="#1da1f2" />
  <!-- White Twitter Bird -->
  <path d="M 390 185 C 380 190, 368 193, 355 195 C 367 187, 376 175, 381 161 C 369 168, 356 173, 342 176 C 330 163, 314 156, 296 156 C 261 156, 233 184, 233 219 C 233 224, 234 229, 235 234 C 182 231, 136 206, 105 168 C 99 178, 96 190, 96 202 C 96 224, 107 243, 124 254 C 114 254, 104 251, 95 246 C 95 246, 95 247, 95 247 C 95 278, 117 303, 146 309 C 141 310, 135 311, 129 311 C 125 311, 121 311, 117 310 C 125 336, 149 354, 178 355 C 155 373, 127 383, 95 383 C 90 383, 84 383, 79 382 C 108 401, 143 412, 180 412 C 302 412, 368 311, 368 223 C 368 220, 368 217, 368 215 C 381 206, 392 195, 400 182 C 388 187, 375 191, 362 192 C 375 184, 385 172, 390 157 Z" fill="#ffffff" />
</svg>
`)}`;

const X_MONOLITH = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="112" fill="#000000" />
  <!-- Stark X Glyph -->
  <path d="M 334 136 L 378 136 L 282 245 L 395 394 L 306 394 L 237 303 L 157 394 L 113 394 L 216 276 L 108 136 L 199 136 L 261 219 Z M 319 368 L 343 368 L 186 160 L 160 160 Z" fill="#ffffff" />
</svg>
`)}`;

const TINDER_FIRE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="tinderBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fd297b" />
      <stop offset="50%" stop-color="#ff5864" />
      <stop offset="100%" stop-color="#ff655b" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#tinderBg)" />
  <path d="M 285 130 C 285 130, 240 180, 250 240 C 250 240, 220 210, 220 180 C 180 220, 150 270, 150 320 C 150 380, 195 425, 256 425 C 320 425, 362 380, 362 315 C 362 230, 285 130, 285 130 Z" fill="#ffffff" />
</svg>
`)}`;

const TINDER_CYAN = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="tinderCyanBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f2fe" />
      <stop offset="100%" stop-color="#4facfe" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#tinderCyanBg)" />
  <path d="M 285 130 C 285 130, 240 180, 250 240 C 250 240, 220 210, 220 180 C 180 220, 150 270, 150 320 C 150 380, 195 425, 256 425 C 320 425, 362 380, 362 315 C 362 230, 285 130, 285 130 Z" fill="#ffffff" filter="drop-shadow(0 0 12px rgba(255, 255, 255, 0.6))" />
</svg>
`)}`;

export const PRESET_PAIRS: PresetPair[] = [
  {
    id: 'duo-battle',
    title: 'The Unhinged Owl A/B Test',
    subtitle: 'Melted Desperation vs. Polite Corporate Owl',
    category: 'Gamification / Retention',
    nameA: 'Unhinged Crying Duo',
    nameB: 'Polite Classic Duo',
    iconAUrl: DUO_UNHINGED,
    iconBUrl: DUO_CLASSIC,
  },
  {
    id: 'flighty-radar',
    title: 'Aviation OLED Contrast',
    subtitle: 'Cyberpunk Radar Sweep vs. Flat Slate Vector',
    category: 'Travel / Utilities',
    nameA: 'Neon Radar Glow',
    nameB: 'Slate Minimal Jet',
    iconAUrl: FLIGHTY_RADAR,
    iconBUrl: FLIGHTY_MINIMAL,
  },
  {
    id: 'linear-notion',
    title: 'SaaS Productivity Wars',
    subtitle: 'Radiant Gradient Wave vs. Monolith Monochrome',
    category: 'B2B / Productivity',
    nameA: 'Linear Spectral Arc',
    nameB: 'Notion Minimal Mono',
    iconAUrl: LINEAR_NEON,
    iconBUrl: NOTION_MONO,
  },
  {
    id: 'twitter-x',
    title: 'The Historic Rebrand Match',
    subtitle: 'Cyan Sky Phototaxis vs. Stygian Monolith',
    category: 'Social Media',
    nameA: 'Sky Bird (Cyan)',
    nameB: 'Dark X (Monochrome)',
    iconAUrl: TWITTER_BLUE,
    iconBUrl: X_MONOLITH,
  },
  {
    id: 'tinder-flame',
    title: 'Dating App Spectral Shift',
    subtitle: 'Thermal Infrared Warmth vs. High-UV Phototaxis Pulse',
    category: 'Social / Dating',
    nameA: 'UV / Cyan Flame',
    nameB: 'Infrared Coral Flame',
    iconAUrl: TINDER_CYAN,
    iconBUrl: TINDER_FIRE,
  },
];
