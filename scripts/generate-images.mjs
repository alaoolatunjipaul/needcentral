import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ICON_DIR = "node_modules/lucide-static/icons";
const OUT_DIR = "public/images/products";

const PALETTES = {
  audio: [
    ["#6366f1", "#8b5cf6"],
    ["#7c3aed", "#c026d3"],
  ],
  mobile: [
    ["#2563eb", "#06b6d4"],
    ["#0ea5e9", "#6366f1"],
  ],
  computers: [
    ["#334155", "#64748b"],
    ["#1e293b", "#475569"],
  ],
  wearables: [
    ["#059669", "#14b8a6"],
    ["#047857", "#65a30d"],
  ],
  photography: [
    ["#d97706", "#f59e0b"],
    ["#ea580c", "#f97316"],
  ],
  gaming: [
    ["#c026d3", "#8b5cf6"],
    ["#db2777", "#7c3aed"],
  ],
  "home-living": [
    ["#e11d48", "#fb923c"],
    ["#be123c", "#f97316"],
  ],
  fitness: [
    ["#16a34a", "#84cc16"],
    ["#15803d", "#4d7c0f"],
  ],
};

const PRODUCTS = [
  { slug: "pulse-anc-headphones", category: "audio", icon: "headphones" },
  { slug: "nordic-over-ear-headphones", category: "audio", icon: "book-headphones" },
  { slug: "resonate-desk-speaker", category: "audio", icon: "speaker" },
  { slug: "aria-true-wireless-earbuds", category: "audio", icon: "audio-lines" },
  { slug: "nova-x5-smartphone", category: "mobile", icon: "smartphone" },
  { slug: "nova-x5-pro-smartphone", category: "mobile", icon: "smartphone" },
  { slug: "zenith-s23-smartphone", category: "mobile", icon: "tablet-smartphone" },
  { slug: "aerobook-14-laptop", category: "computers", icon: "laptop" },
  { slug: "aerobook-air-laptop", category: "computers", icon: "laptop-minimal" },
  { slug: "mechtype-rgb-keyboard", category: "computers", icon: "keyboard" },
  { slug: "voyager-commuter-backpack", category: "computers", icon: "backpack" },
  { slug: "chrono-s-smartwatch", category: "wearables", icon: "watch" },
  { slug: "meridian-classic-watch", category: "wearables", icon: "clock" },
  { slug: "pulse-lite-band", category: "wearables", icon: "heart-pulse" },
  { slug: "optix-r7-mirrorless-camera", category: "photography", icon: "camera" },
  { slug: "skyeye-4k-drone", category: "photography", icon: "drone" },
  { slug: "optix-35mm-film-camera", category: "photography", icon: "aperture" },
  { slug: "vantage-pro-controller", category: "gaming", icon: "gamepad-2" },
  { slug: "nebula-gaming-headset", category: "gaming", icon: "headset" },
  { slug: "playgo-handheld-console", category: "gaming", icon: "gamepad" },
  { slug: "haven-three-seater-sofa", category: "home-living", icon: "sofa" },
  { slug: "harbor-linen-armchair", category: "home-living", icon: "armchair" },
  { slug: "lumen-floor-lamp", category: "home-living", icon: "lamp-floor" },
  { slug: "brew-master-pour-over-set", category: "home-living", icon: "coffee" },
  { slug: "flexfit-training-sneakers", category: "fitness", icon: "footprints" },
  { slug: "ironcore-adjustable-dumbbells", category: "fitness", icon: "dumbbell" },
  { slug: "zenflow-yoga-mat", category: "fitness", icon: "flower-2" },
];

const seen = new Map();
for (const p of PRODUCTS) {
  seen.set(p.category, (seen.get(p.category) ?? 0) - 1);
}

function innerMarkup(icon) {
  const file = join(ICON_DIR, `${icon}.svg`);
  if (!existsSync(file)) {
    throw new Error(`Unknown lucide icon "${icon}"`);
  }
  const svg = readFileSync(file, "utf8");
  const match = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  if (!match) throw new Error(`Cannot parse ${icon}.svg`);
  return match[1].replace(/<!--[\s\S]*?-->/g, "").trim();
}

function compose(product) {
  const variant = Math.abs(seen.get(product.category)) % 2;
  const [from, to] = PALETTES[product.category][variant];
  seen.set(product.category, seen.get(product.category) + 1);
  const glyph = `<g fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${innerMarkup(product.icon)}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>
<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffffff" stop-opacity="0.28"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
</defs>
<rect width="1000" height="1000" fill="url(#bg)"/>
<circle cx="810" cy="170" r="300" fill="url(#glow)"/>
<circle cx="140" cy="860" r="340" fill="#ffffff" opacity="0.05"/>
<circle cx="880" cy="820" r="180" fill="#ffffff" opacity="0.06"/>
<circle cx="120" cy="130" r="90" fill="#ffffff" opacity="0.07"/>
<g transform="translate(500 500) scale(15) translate(-12 -12)">${glyph}</g>
</svg>`;
}

mkdirSync(OUT_DIR, { recursive: true });
for (const product of PRODUCTS) {
  const outPath = join(OUT_DIR, `${product.slug}.svg`);
  writeFileSync(outPath, compose(product), "utf8");
}
console.log(`Generated ${PRODUCTS.length} product images in ${OUT_DIR}`);
