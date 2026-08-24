import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ICON_DIR = "node_modules/lucide-static/icons";
const OUT_DIR = "public/images/products";

const PALETTES = {
  electronics: [
    ["#6366f1", "#8b5cf6"],
    ["#7c3aed", "#c026d3"],
    ["#4f46e5", "#a855f7"],
  ],
  "phones-accessories": [
    ["#2563eb", "#06b6d4"],
    ["#0ea5e9", "#6366f1"],
  ],
  "computers-tech": [
    ["#334155", "#64748b"],
    ["#1e293b", "#475569"],
  ],
  "home-living": [
    ["#e11d48", "#fb923c"],
    ["#be123c", "#f97316"],
    ["#ea580c", "#fb7185"],
  ],
  "sports-fitness": [
    ["#16a34a", "#84cc16"],
    ["#15803d", "#4d7c0f"],
  ],
  fashion: [
    ["#c026d3", "#ec4899"],
    ["#db2777", "#f472b6"],
  ],
  "beauty-personal-care": [
    ["#f43f5e", "#fb7185"],
    ["#e11d48", "#f9a8d4"],
  ],
  "food-groceries": [
    ["#ea580c", "#f59e0b"],
    ["#dc2626", "#fb923c"],
  ],
  "health-wellness": [
    ["#10b981", "#14b8a6"],
    ["#059669", "#2dd4bf"],
  ],
  "baby-kids": [
    ["#0ea5e9", "#38bdf8"],
    ["#2563eb", "#60a5fa"],
  ],
  "books-media": [
    ["#ca8a04", "#eab308"],
    ["#a16207", "#facc15"],
  ],
  "arts-crafts": [
    ["#7c3aed", "#a78bfa"],
    ["#6d28d9", "#c4b5fd"],
  ],
  "jewelry-accessories": [
    ["#0d9488", "#34d399"],
    ["#0f766e", "#6ee7b7"],
  ],
  automotive: [
    ["#3f3f46", "#71717a"],
    ["#27272a", "#52525b"],
  ],
  "agriculture-farm": [
    ["#65a30d", "#22c55e"],
    ["#4d7c0f", "#16a34a"],
  ],
};

const PRODUCTS = [
  { slug: "pulse-anc-headphones", category: "electronics", icon: "headphones" },
  { slug: "nordic-over-ear-headphones", category: "electronics", icon: "book-headphones" },
  { slug: "resonate-desk-speaker", category: "electronics", icon: "speaker" },
  { slug: "aria-true-wireless-earbuds", category: "electronics", icon: "audio-lines" },
  { slug: "nova-x5-smartphone", category: "phones-accessories", icon: "smartphone" },
  { slug: "nova-x5-pro-smartphone", category: "phones-accessories", icon: "smartphone" },
  { slug: "zenith-s23-smartphone", category: "phones-accessories", icon: "tablet-smartphone" },
  { slug: "aerobook-14-laptop", category: "computers-tech", icon: "laptop" },
  { slug: "aerobook-air-laptop", category: "computers-tech", icon: "laptop-minimal" },
  { slug: "mechtype-rgb-keyboard", category: "computers-tech", icon: "keyboard" },
  { slug: "voyager-commuter-backpack", category: "computers-tech", icon: "backpack" },
  { slug: "chrono-s-smartwatch", category: "phones-accessories", icon: "watch" },
  { slug: "meridian-classic-watch", category: "jewelry-accessories", icon: "clock" },
  { slug: "pulse-lite-band", category: "health-wellness", icon: "heart-pulse" },
  { slug: "optix-r7-mirrorless-camera", category: "electronics", icon: "camera" },
  { slug: "skyeye-4k-drone", category: "electronics", icon: "drone" },
  { slug: "optix-35mm-film-camera", category: "electronics", icon: "aperture" },
  { slug: "vantage-pro-controller", category: "electronics", icon: "gamepad-2" },
  { slug: "nebula-gaming-headset", category: "electronics", icon: "headset" },
  { slug: "playgo-handheld-console", category: "electronics", icon: "gamepad" },
  { slug: "haven-three-seater-sofa", category: "home-living", icon: "sofa" },
  { slug: "harbor-linen-armchair", category: "home-living", icon: "armchair" },
  { slug: "lumen-floor-lamp", category: "home-living", icon: "lamp-floor" },
  { slug: "brew-master-pour-over-set", category: "home-living", icon: "coffee" },
  { slug: "flexfit-training-sneakers", category: "sports-fitness", icon: "footprints" },
  { slug: "ironcore-adjustable-dumbbells", category: "sports-fitness", icon: "dumbbell" },
  { slug: "zenflow-yoga-mat", category: "sports-fitness", icon: "flower-2" },
  { slug: "saharapower-20k-solar-power-bank", category: "phones-accessories", icon: "battery-charging" },
  { slug: "adire-indigo-shirt", category: "fashion", icon: "shirt" },
  { slug: "ankara-wrap-dress", category: "fashion", icon: "scissors" },
  { slug: "aso-oke-woven-tote", category: "fashion", icon: "shopping-bag" },
  { slug: "shea-butter-balm-trio", category: "beauty-personal-care", icon: "droplets" },
  { slug: "african-black-soap-duo", category: "beauty-personal-care", icon: "sparkles" },
  { slug: "hibiscus-mint-hair-oil", category: "beauty-personal-care", icon: "spray-can" },
  { slug: "jollof-spice-kit", category: "food-groceries", icon: "flame" },
  { slug: "ofada-rice-5kg", category: "food-groceries", icon: "wheat" },
  { slug: "adire-baby-swaddle-set", category: "baby-kids", icon: "baby" },
  { slug: "voices-of-lagos-hardcover", category: "books-media", icon: "book-open" },
  { slug: "afrobeats-rising-vinyl", category: "books-media", icon: "disc-3" },
  { slug: "raffia-wall-art", category: "arts-crafts", icon: "frame" },
  { slug: "iroko-carved-serving-board", category: "arts-crafts", icon: "utensils" },
  { slug: "recycled-brass-earrings", category: "jewelry-accessories", icon: "gem" },
  { slug: "krobo-glass-bead-bracelet", category: "jewelry-accessories", icon: "disc" },
  { slug: "magnetic-dash-mount", category: "automotive", icon: "car" },
  { slug: "zobo-dried-hibiscus-1kg", category: "agriculture-farm", icon: "flower-2" },
  { slug: "plantain-flour-5kg", category: "agriculture-farm", icon: "sprout" },
  { slug: "moringa-superleaf-powder", category: "health-wellness", icon: "leaf" },
  { slug: "adire-indigo-throw-pillow", category: "home-living", icon: "bed" },
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
