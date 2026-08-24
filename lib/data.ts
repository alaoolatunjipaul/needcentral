import {
  CATEGORY_IDS,
  SORT_OPTIONS,
  type Category,
  type CategoryId,
  type Product,
  type ProductQuery,
  type ProductQueryResult,
  type SortOption,
} from "@/types";

export const categories: Category[] = [
  { id: "audio", name: "Audio", tagline: "Headphones, speakers & earbuds" },
  { id: "mobile", name: "Mobile", tagline: "Smartphones for every budget" },
  { id: "computers", name: "Computers", tagline: "Laptops, keyboards & gear" },
  { id: "wearables", name: "Wearables", tagline: "Watches & fitness bands" },
  { id: "photography", name: "Photography", tagline: "Cameras, drones & film" },
  { id: "gaming", name: "Gaming", tagline: "Consoles, pads & headsets" },
  { id: "home-living", name: "Home & Living", tagline: "Furniture & small comforts" },
  { id: "fitness", name: "Fitness", tagline: "Train anywhere, anytime" },
];

const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

export const products: Product[] = [
  {
    id: "pulse-anc-headphones",
    name: "Pulse ANC Wireless Headphones",
    category: "audio",
    priceCents: 19900,
    compareAtPriceCents: 24900,
    image: "/images/products/pulse-anc-headphones.svg",
    description:
      "Flagship over-ear headphones with adaptive noise cancellation, 40-hour battery life and plush memory-foam cushions built for all-day listening.",
    rating: 4.7,
    reviewCount: 2314,
    stock: 32,
    featured: true,
  },
  {
    id: "nordic-over-ear-headphones",
    name: "Nordic Over-Ear Headphones",
    category: "audio",
    priceCents: 14900,
    image: "/images/products/nordic-over-ear-headphones.svg",
    description:
      "Minimal Scandinavian design meets warm, balanced sound. A lightweight aluminium frame with a detachable braided cable and intuitive on-ear controls.",
    rating: 4.3,
    reviewCount: 654,
    stock: 41,
  },
  {
    id: "resonate-desk-speaker",
    name: "Resonate Desk Speaker",
    category: "audio",
    priceCents: 8990,
    image: "/images/products/resonate-desk-speaker.svg",
    description:
      "A compact bookshelf speaker with room-filling stereo, tactile analog controls and dual inputs for your desk setup and turntable.",
    rating: 4.4,
    reviewCount: 512,
    stock: 27,
  },
  {
    id: "aria-true-wireless-earbuds",
    name: "Aria True Wireless Earbuds",
    category: "audio",
    priceCents: 7900,
    compareAtPriceCents: 9900,
    image: "/images/products/aria-true-wireless-earbuds.svg",
    description:
      "Feather-light earbuds with punchy bass, a wireless charging case and six hours of listening on a single charge.",
    rating: 4.5,
    reviewCount: 1897,
    stock: 58,
  },
  {
    id: "nova-x5-smartphone",
    name: "Nova X5 Smartphone",
    category: "mobile",
    priceCents: 64900,
    image: "/images/products/nova-x5-smartphone.svg",
    description:
      "A 6.4-inch OLED flagship with a 120 Hz display, versatile triple-camera system and two-day battery life in a slim aluminium body.",
    rating: 4.6,
    reviewCount: 1120,
    stock: 19,
  },
  {
    id: "nova-x5-pro-smartphone",
    name: "Nova X5 Pro Smartphone",
    category: "mobile",
    priceCents: 84900,
    compareAtPriceCents: 89900,
    image: "/images/products/nova-x5-pro-smartphone.svg",
    description:
      "Our most advanced phone yet: a titanium frame, periscope zoom lens, studio-grade video modes and 45 W fast charging.",
    rating: 4.8,
    reviewCount: 2301,
    stock: 11,
  },
  {
    id: "zenith-s23-smartphone",
    name: "Zenith S23 Smartphone",
    category: "mobile",
    priceCents: 59900,
    image: "/images/products/zenith-s23-smartphone.svg",
    description:
      "Big screen, small footprint. The Zenith S23 pairs a vibrant 6.1-inch display with five years of guaranteed software updates.",
    rating: 4.5,
    reviewCount: 980,
    stock: 24,
  },
  {
    id: "aerobook-14-laptop",
    name: "AeroBook 14 Laptop",
    category: "computers",
    priceCents: 119900,
    image: "/images/products/aerobook-14-laptop.svg",
    description:
      "A 14-inch pro laptop weighing just 1.2 kg, with a razor-sharp 3K display, 18-hour battery life and whisper-quiet cooling.",
    rating: 4.7,
    reviewCount: 764,
    stock: 14,
  },
  {
    id: "aerobook-air-laptop",
    name: "AeroBook Air Laptop",
    category: "computers",
    priceCents: 99900,
    compareAtPriceCents: 109900,
    image: "/images/products/aerobook-air-laptop.svg",
    description:
      "The everyday laptop, perfected: thin, light, blazingly fast and cool to the touch through marathon work sessions.",
    rating: 4.8,
    reviewCount: 1533,
    stock: 22,
    featured: true,
  },
  {
    id: "mechtype-rgb-keyboard",
    name: "MechType RGB Mechanical Keyboard",
    category: "computers",
    priceCents: 12900,
    compareAtPriceCents: 15900,
    image: "/images/products/mechtype-rgb-keyboard.svg",
    description:
      "Hot-swappable mechanical switches, per-key RGB lighting and a gasket-mounted plate for a typing feel you will not want to put down.",
    rating: 4.6,
    reviewCount: 2210,
    stock: 36,
  },
  {
    id: "voyager-commuter-backpack",
    name: "Voyager Commuter Backpack",
    category: "computers",
    priceCents: 7990,
    image: "/images/products/voyager-commuter-backpack.svg",
    description:
      "A water-resistant commuter backpack with a padded 16-inch laptop sleeve, luggage pass-through and a hidden RFID-safe pocket.",
    rating: 4.5,
    reviewCount: 432,
    stock: 48,
  },
  {
    id: "chrono-s-smartwatch",
    name: "Chrono S Smartwatch",
    category: "wearables",
    priceCents: 25900,
    compareAtPriceCents: 29900,
    image: "/images/products/chrono-s-smartwatch.svg",
    description:
      "Always-on LTPO display, ECG and blood-oxygen tracking, and a seven-day battery in a featherweight titanium case.",
    rating: 4.6,
    reviewCount: 1876,
    stock: 26,
    featured: true,
  },
  {
    id: "meridian-classic-watch",
    name: "Meridian Classic Watch",
    category: "wearables",
    priceCents: 17900,
    image: "/images/products/meridian-classic-watch.svg",
    description:
      "A timeless analog watch with a brushed steel case, sapphire crystal and an Italian leather strap that ages beautifully.",
    rating: 4.4,
    reviewCount: 388,
    stock: 17,
  },
  {
    id: "pulse-lite-band",
    name: "Pulse Lite Fitness Band",
    category: "wearables",
    priceCents: 9990,
    image: "/images/products/pulse-lite-band.svg",
    description:
      "Slim 24/7 activity tracking with sleep staging, smart notifications and two weeks of battery between charges.",
    rating: 4.1,
    reviewCount: 651,
    stock: 63,
  },
  {
    id: "optix-r7-mirrorless-camera",
    name: "Optix R7 Mirrorless Camera",
    category: "photography",
    priceCents: 149900,
    compareAtPriceCents: 169900,
    image: "/images/products/optix-r7-mirrorless-camera.svg",
    description:
      "A 33 MP full-frame sensor, eight stops of stabilisation and 30 fps burst shooting make the R7 a do-it-all hybrid camera.",
    rating: 4.9,
    reviewCount: 542,
    stock: 8,
    featured: true,
  },
  {
    id: "skyeye-4k-drone",
    name: "SkyEye 4K Drone",
    category: "photography",
    priceCents: 89900,
    image: "/images/products/skyeye-4k-drone.svg",
    description:
      "Cinematic 4K/60 footage from a foldable drone with tri-directional obstacle sensing and 34 minutes of flight time.",
    rating: 4.5,
    reviewCount: 318,
    stock: 12,
  },
  {
    id: "optix-35mm-film-camera",
    name: "Optix 35mm Film Camera",
    category: "photography",
    priceCents: 32900,
    image: "/images/products/optix-35mm-film-camera.svg",
    description:
      "A revived classic: a fully mechanical 35 mm film camera with a razor-sharp f/2 prime lens and a bulletproof metal body.",
    rating: 4.3,
    reviewCount: 207,
    stock: 9,
  },
  {
    id: "vantage-pro-controller",
    name: "Vantage Pro Controller",
    category: "gaming",
    priceCents: 6990,
    image: "/images/products/vantage-pro-controller.svg",
    description:
      "Tournament-grade wireless controller with hall-effect sticks, remappable back paddles and a 40-hour battery.",
    rating: 4.5,
    reviewCount: 1345,
    stock: 44,
  },
  {
    id: "nebula-gaming-headset",
    name: "Nebula Gaming Headset",
    category: "gaming",
    priceCents: 10900,
    image: "/images/products/nebula-gaming-headset.svg",
    description:
      "Immersive spatial audio, a broadcast-quality detachable microphone and memory-foam earcups for marathon sessions.",
    rating: 4.4,
    reviewCount: 720,
    stock: 4,
  },
  {
    id: "playgo-handheld-console",
    name: "PlayGo Handheld Console",
    category: "gaming",
    priceCents: 34900,
    image: "/images/products/playgo-handheld-console.svg",
    description:
      "Play your whole library anywhere on a 7-inch 90 Hz screen with console-class graphics and instant dock-to-TV support.",
    rating: 4.7,
    reviewCount: 2890,
    stock: 15,
    featured: true,
  },
  {
    id: "haven-three-seater-sofa",
    name: "Haven Three-Seater Sofa",
    category: "home-living",
    priceCents: 89900,
    compareAtPriceCents: 109900,
    image: "/images/products/haven-three-seater-sofa.svg",
    description:
      "Deep-seated comfort in stain-resistant bouclé, with a solid oak frame and removable, machine-washable covers.",
    rating: 4.6,
    reviewCount: 356,
    stock: 6,
    featured: true,
  },
  {
    id: "harbor-linen-armchair",
    name: "Harbor Linen Armchair",
    category: "home-living",
    priceCents: 32900,
    image: "/images/products/harbor-linen-armchair.svg",
    description:
      "A sculpted reading chair wrapped in breathable European linen, with a high back, wide arms and solid beech legs.",
    rating: 4.5,
    reviewCount: 198,
    stock: 10,
  },
  {
    id: "lumen-floor-lamp",
    name: "Lumen Arc Floor Lamp",
    category: "home-living",
    priceCents: 12900,
    image: "/images/products/lumen-floor-lamp.svg",
    description:
      "An arched steel floor lamp that floats warm, dimmable light exactly where you need it — no side table required.",
    rating: 4.3,
    reviewCount: 188,
    stock: 0,
  },
  {
    id: "brew-master-pour-over-set",
    name: "Brew Master Pour-Over Set",
    category: "home-living",
    priceCents: 4490,
    image: "/images/products/brew-master-pour-over-set.svg",
    description:
      "Everything for the perfect cup: a double-wall glass carafe, stainless dripper and precision gooseneck kettle.",
    rating: 4.8,
    reviewCount: 967,
    stock: 52,
    featured: true,
  },
  {
    id: "flexfit-training-sneakers",
    name: "FlexFit Training Sneakers",
    category: "fitness",
    priceCents: 11900,
    image: "/images/products/flexfit-training-sneakers.svg",
    description:
      "Stable enough for lifting, cushioned enough for intervals — with a breathable knit upper and a grippy rubber outsole.",
    rating: 4.5,
    reviewCount: 1240,
    stock: 38,
    featured: true,
  },
  {
    id: "ironcore-adjustable-dumbbells",
    name: "IronCore Adjustable Dumbbells",
    category: "fitness",
    priceCents: 15900,
    image: "/images/products/ironcore-adjustable-dumbbells.svg",
    description:
      "Each dumbbell adjusts from 2 to 20 kg with a single twist, replacing an entire rack in the footprint of a shoebox.",
    rating: 4.6,
    reviewCount: 533,
    stock: 21,
  },
  {
    id: "zenflow-yoga-mat",
    name: "ZenFlow Pro Yoga Mat",
    category: "fitness",
    priceCents: 3990,
    image: "/images/products/zenflow-yoga-mat.svg",
    description:
      "A 6 mm natural-rubber mat with alignment guides and a surface grip that improves as you sweat.",
    rating: 4.7,
    reviewCount: 1105,
    stock: 47,
  },
];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getFeaturedProducts(limit = 8): Product[] {
  return products.filter((p) => p.featured).slice(0, limit);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const sameCategory = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .sort((a, b) => b.rating - a.rating);
  const fillers = products
    .filter((p) => p.category !== product.category && p.featured)
    .sort((a, b) => b.rating - a.rating);
  return [...sameCategory, ...fillers].slice(0, limit);
}

export function getCategoryCounts(): Record<CategoryId | "all", number> {
  const counts = { all: products.length } as Record<CategoryId | "all", number>;
  for (const id of CATEGORY_IDS) counts[id] = 0;
  for (const product of products) counts[product.category] += 1;
  return counts;
}

function firstParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string {
  const value = searchParams[key];
  const single = Array.isArray(value) ? value[0] : value;
  return (single ?? "").trim();
}

export function parseProductQuery(
  searchParams: Record<string, string | string[] | undefined>
): ProductQuery {
  const rawCategory = firstParam(searchParams, "category");
  const rawSort = firstParam(searchParams, "sort") as SortOption;
  return {
    q: firstParam(searchParams, "q"),
    category: (CATEGORY_IDS as readonly string[]).includes(rawCategory)
      ? (rawCategory as CategoryId)
      : "all",
    sort: SORT_OPTIONS.includes(rawSort) ? rawSort : "featured",
  };
}

export function filterAndSortProducts(query: ProductQuery): ProductQueryResult {
  const needle = query.q.toLowerCase();
  const matched = products.filter((product) => {
    if (query.category !== "all" && product.category !== query.category) {
      return false;
    }
    if (!needle) return true;
    const haystack =
      `${product.name} ${product.description} ${categoryNameById.get(product.category) ?? ""}`.toLowerCase();
    return haystack.includes(needle);
  });

  const sorted = [...matched];
  switch (query.sort) {
    case "price-asc":
      sorted.sort((a, b) => a.priceCents - b.priceCents);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.priceCents - a.priceCents);
      break;
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }
  return { items: sorted, total: sorted.length };
}
