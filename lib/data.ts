import {
  CATEGORY_IDS,
  COLLECTION_IDS,
  SORT_OPTIONS,
  type Category,
  type CategoryId,
  type CollectionId,
  type Coupon,
  type DeliveryOption,
  type Product,
  type ProductQuery,
  type ProductQueryResult,
  type Promotion,
  type Question,
  type Review,
  type Seller,
  type SellerSummary,
  type SortOption,
} from "@/types";

export const categories: Category[] = [
  { id: "electronics", name: "Electronics", tagline: "Audio, cameras & gaming gear" },
  { id: "phones-accessories", name: "Phones & Accessories", tagline: "Smartphones, power & cases" },
  { id: "computers-tech", name: "Computers & Technology", tagline: "Laptops, keyboards & bags" },
  { id: "fashion", name: "Fashion", tagline: "Made-to-wear & everyday style" },
  { id: "beauty-personal-care", name: "Beauty & Personal Care", tagline: "Skincare, hair & natural care" },
  { id: "home-living", name: "Home & Living", tagline: "Furniture, decor & kitchen" },
  { id: "food-groceries", name: "Food & Groceries", tagline: "Pantry staples & treats" },
  { id: "health-wellness", name: "Health & Wellness", tagline: "Feel-good, every day" },
  { id: "baby-kids", name: "Baby & Kids", tagline: "Gentle essentials for little ones" },
  { id: "sports-fitness", name: "Sports & Fitness", tagline: "Train anywhere, anytime" },
  { id: "books-media", name: "Books & Media", tagline: "Stories, sound & print" },
  { id: "arts-crafts", name: "Arts & Crafts", tagline: "Handmade with intention" },
  { id: "jewelry-accessories", name: "Jewelry & Accessories", tagline: "Wearable statements" },
  { id: "automotive", name: "Automotive", tagline: "Upgrade every drive" },
  { id: "agriculture-farm", name: "Agriculture & Farm Products", tagline: "Straight from the farm" },
];

const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

export const sellers: Seller[] = [
  {
    id: "lagos-gadget-hub",
    name: "Lagos Gadget Hub",
    location: "Ikeja, Lagos, Nigeria",
    description:
      "Family-run tech retailer stocking genuine phones, laptops and accessories with warranty support.",
    joinedYear: 2024,
  },
  {
    id: "abeni-atelier",
    name: "Abení Atelier",
    location: "Yaba, Lagos, Nigeria",
    description:
      "Contemporary fashion house hand-dyeing Adire and tailoring ready-to-wear from Nigerian cotton.",
    joinedYear: 2025,
  },
  {
    id: "savannah-glow",
    name: "Savannah Glow Naturals",
    location: "Ibadan, Oyo, Nigeria",
    description:
      "Small-batch skincare made from raw shea, hibiscus and cold-pressed botanicals sourced from women-led co-operatives.",
    joinedYear: 2025,
  },
  {
    id: "kano-farms-collective",
    name: "Kano Farms Collective",
    location: "Kano, Kano State, Nigeria",
    description:
      "Co-operative of over 300 smallholder farmers shipping grains, spices and produce nationwide.",
    joinedYear: 2024,
  },
  {
    id: "accra-craftworks",
    name: "Accra Craftworks",
    location: "Accra, Greater Accra, Ghana",
    description:
      "Artisan collective crafting recycled-glass beads, black soap and heritage goods from West African materials.",
    joinedYear: 2025,
  },
  {
    id: "nok-home-studio",
    name: "Nók Home Studio",
    location: "Abuja, FCT, Nigeria",
    description:
      "Design studio working with woodcarvers and weavers across the Middle Belt on modern home pieces.",
    joinedYear: 2025,
  },
  {
    id: "maroko-books",
    name: "Maroko Books & Sound",
    location: "Lagos Island, Lagos, Nigeria",
    description:
      "Independent bookshop and record crate curating African writing, vinyl and print culture.",
    joinedYear: 2026,
  },
  {
    id: "klang-audio-labs",
    name: "Klang Audio Labs",
    location: "Kreuzberg, Berlin, Germany",
    description:
      "Independent audio engineering studio designing headphones and speakers for listeners worldwide.",
    joinedYear: 2024,
  },
  {
    id: "studio-marais",
    name: "Studio Marais",
    location: "Le Marais, Paris, France",
    description:
      "Parisian homeware studio crafting lighting and furniture with ateliers across Europe.",
    joinedYear: 2025,
  },
];

const sellerNameById = new Map(sellers.map((seller) => [seller.id, seller]));

export function getSellerById(id: string): Seller | undefined {
  return sellerNameById.get(id);
}

const NG = { country: "Nigeria", countryCode: "NG", madeInAfrica: true } as const;
const GH = { country: "Ghana", countryCode: "GH", madeInAfrica: true } as const;

export const products: Product[] = [
  {
    id: "pulse-anc-headphones",
    name: "Pulse ANC Wireless Headphones",
    category: "electronics",
    sellerId: "klang-audio-labs",
    priceCents: 18_500_000,
    compareAtPriceCents: 23_500_000,
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
    category: "electronics",
    sellerId: "klang-audio-labs",
    priceCents: 12_500_000,
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
    category: "electronics",
    sellerId: "klang-audio-labs",
    priceCents: 6_800_000,
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
    category: "electronics",
    sellerId: "lagos-gadget-hub",
    priceCents: 4_500_000,
    compareAtPriceCents: 5_800_000,
    image: "/images/products/aria-true-wireless-earbuds.svg",
    description:
      "Feather-light earbuds with punchy bass, a wireless charging case and six hours of listening on a single charge.",
    rating: 4.5,
    reviewCount: 1897,
    stock: 58,
  },
  {
    id: "shea-butter-balm-trio",
    name: "Raw Shea Butter Balm Trio",
    category: "beauty-personal-care",
    sellerId: "savannah-glow",
    origin: NG,
    priceCents: 1_850_000,
    compareAtPriceCents: 2_200_000,
    image: "/images/products/shea-butter-balm-trio.svg",
    description:
      "Three whipped balms — unscented, lavender and lemongrass — hand-churned from unrefined West African shea nuts and nothing else.",
    rating: 4.9,
    reviewCount: 1024,
    stock: 120,
    featured: true,
  },
  {
    id: "nova-x5-smartphone",
    name: "Nova X5 Smartphone",
    category: "phones-accessories",
    sellerId: "lagos-gadget-hub",
    priceCents: 98_500_000,
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
    category: "phones-accessories",
    sellerId: "lagos-gadget-hub",
    priceCents: 145_000_000,
    compareAtPriceCents: 159_000_000,
    image: "/images/products/nova-x5-pro-smartphone.svg",
    description:
      "Our most advanced phone yet: a titanium frame, periscope zoom lens, studio-grade video modes and 45 W fast charging.",
    rating: 4.8,
    reviewCount: 2301,
    stock: 11,
  },
  {
    id: "saharapower-20k-solar-power-bank",
    name: "SaharaPower 20K Solar Power Bank",
    category: "phones-accessories",
    sellerId: "lagos-gadget-hub",
    origin: NG,
    priceCents: 5_800_000,
    image: "/images/products/saharapower-20k-solar-power-bank.svg",
    description:
      "A 20,000 mAh power bank with a fold-out solar panel, torchlight and three fast-charge ports — built for Nigerian power realities.",
    rating: 4.6,
    reviewCount: 412,
    stock: 35,
    featured: true,
  },
  {
    id: "zenith-s23-smartphone",
    name: "Zenith S23 Smartphone",
    category: "phones-accessories",
    sellerId: "lagos-gadget-hub",
    priceCents: 72_000_000,
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
    category: "computers-tech",
    sellerId: "lagos-gadget-hub",
    priceCents: 185_000_000,
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
    category: "computers-tech",
    sellerId: "lagos-gadget-hub",
    priceCents: 155_000_000,
    compareAtPriceCents: 169_000_000,
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
    category: "computers-tech",
    sellerId: "lagos-gadget-hub",
    priceCents: 9_500_000,
    compareAtPriceCents: 11_500_000,
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
    category: "computers-tech",
    sellerId: "lagos-gadget-hub",
    priceCents: 5_200_000,
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
    category: "phones-accessories",
    sellerId: "lagos-gadget-hub",
    priceCents: 31_000_000,
    compareAtPriceCents: 36_500_000,
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
    category: "jewelry-accessories",
    sellerId: "lagos-gadget-hub",
    priceCents: 14_800_000,
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
    category: "health-wellness",
    sellerId: "lagos-gadget-hub",
    priceCents: 3_800_000,
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
    category: "electronics",
    sellerId: "lagos-gadget-hub",
    priceCents: 235_000_000,
    compareAtPriceCents: 265_000_000,
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
    category: "electronics",
    sellerId: "lagos-gadget-hub",
    priceCents: 129_000_000,
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
    category: "electronics",
    sellerId: "lagos-gadget-hub",
    priceCents: 39_500_000,
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
    category: "electronics",
    sellerId: "lagos-gadget-hub",
    priceCents: 7_800_000,
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
    category: "electronics",
    sellerId: "lagos-gadget-hub",
    priceCents: 6_200_000,
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
    category: "electronics",
    sellerId: "lagos-gadget-hub",
    priceCents: 52_000_000,
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
    sellerId: "nok-home-studio",
    priceCents: 115_000_000,
    compareAtPriceCents: 140_000_000,
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
    sellerId: "studio-marais",
    priceCents: 42_000_000,
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
    sellerId: "studio-marais",
    priceCents: 8_800_000,
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
    sellerId: "nok-home-studio",
    priceCents: 3_650_000,
    image: "/images/products/brew-master-pour-over-set.svg",
    description:
      "Everything for the perfect cup: a double-wall glass carafe, stainless dripper and precision gooseneck kettle.",
    rating: 4.8,
    reviewCount: 967,
    stock: 52,
    featured: true,
  },
  {
    id: "adire-indigo-throw-pillow",
    name: "Adire Indigo Throw Pillow",
    category: "home-living",
    sellerId: "abeni-atelier",
    origin: NG,
    priceCents: 2_300_000,
    image: "/images/products/adire-indigo-throw-pillow.svg",
    description:
      "Hand-dyed indigo cushion cover patterned with traditional Yorùbá tie-dye motifs, with a feather inner included.",
    rating: 4.7,
    reviewCount: 84,
    stock: 26,
  },
  {
    id: "flexfit-training-sneakers",
    name: "FlexFit Training Sneakers",
    category: "sports-fitness",
    sellerId: "lagos-gadget-hub",
    priceCents: 7_200_000,
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
    category: "sports-fitness",
    sellerId: "lagos-gadget-hub",
    priceCents: 11_800_000,
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
    category: "sports-fitness",
    sellerId: "lagos-gadget-hub",
    priceCents: 2_250_000,
    image: "/images/products/zenflow-yoga-mat.svg",
    description:
      "A 6 mm natural-rubber mat with alignment guides and a surface grip that improves as you sweat.",
    rating: 4.7,
    reviewCount: 1105,
    stock: 47,
  },
  {
    id: "moringa-superleaf-powder",
    name: "Moringa Superleaf Powder",
    category: "health-wellness",
    sellerId: "kano-farms-collective",
    origin: NG,
    priceCents: 1_350_000,
    image: "/images/products/moringa-superleaf-powder.svg",
    description:
      "Shade-dried moringa leaves milled into a fine, vivid green powder — stir into smoothies, tea or pap.",
    rating: 4.6,
    reviewCount: 226,
    stock: 70,
  },
  {
    id: "adire-indigo-shirt",
    name: "Adire Indigo Camp Shirt",
    category: "fashion",
    sellerId: "abeni-atelier",
    origin: NG,
    priceCents: 4_250_000,
    image: "/images/products/adire-indigo-shirt.svg",
    description:
      "Relaxed camp-collar shirt in hand-dyed Yorùbá Adire indigo cotton — each pattern is unique to the cloth it came from.",
    rating: 4.8,
    reviewCount: 156,
    stock: 24,
    featured: true,
  },
  {
    id: "ankara-wrap-dress",
    name: "Ankara Wrap Dress",
    category: "fashion",
    sellerId: "abeni-atelier",
    origin: NG,
    priceCents: 5_500_000,
    image: "/images/products/ankara-wrap-dress.svg",
    description:
      "A flattering midi wrap dress cut from bold Ankara wax print, tailored in Lagos with deep pockets and an adjustable tie.",
    rating: 4.7,
    reviewCount: 203,
    stock: 18,
  },
  {
    id: "aso-oke-woven-tote",
    name: "Aso-Oke Woven Tote",
    category: "fashion",
    sellerId: "abeni-atelier",
    origin: NG,
    priceCents: 6_700_000,
    image: "/images/products/aso-oke-woven-tote.svg",
    description:
      "Structured everyday tote handwoven on traditional looms, lined with suede and finished with leather handles.",
    rating: 4.9,
    reviewCount: 89,
    stock: 12,
  },
  {
    id: "african-black-soap-duo",
    name: "African Black Soap Duo",
    category: "beauty-personal-care",
    sellerId: "accra-craftworks",
    origin: GH,
    priceCents: 980_000,
    image: "/images/products/african-black-soap-duo.svg",
    description:
      "Two bars of traditional Alata Samina black soap, blended with plantain ash, cocoa pod and coconut oil for a gentle deep clean.",
    rating: 4.7,
    reviewCount: 867,
    stock: 200,
  },
  {
    id: "hibiscus-mint-hair-oil",
    name: "Hibiscus & Mint Hair Oil",
    category: "beauty-personal-care",
    sellerId: "savannah-glow",
    origin: NG,
    priceCents: 1_250_000,
    image: "/images/products/hibiscus-mint-hair-oil.svg",
    description:
      "A lightweight pre-wash oil infused with dried zobo petals and peppermint for a refreshed, nourished scalp.",
    rating: 4.6,
    reviewCount: 344,
    stock: 76,
  },
  {
    id: "jollof-spice-kit",
    name: "Jollof Celebration Spice Kit",
    category: "food-groceries",
    sellerId: "kano-farms-collective",
    origin: NG,
    priceCents: 1_590_000,
    image: "/images/products/jollof-spice-kit.svg",
    description:
      "Everything for legendary party rice: smoked paprika blend, curry powder, thyme, bay leaf and ground crayfish in refill tins.",
    rating: 4.8,
    reviewCount: 512,
    stock: 90,
    featured: true,
  },
  {
    id: "ofada-rice-5kg",
    name: "Ofada Rice, 5 kg",
    category: "food-groceries",
    sellerId: "kano-farms-collective",
    origin: NG,
    priceCents: 2_400_000,
    image: "/images/products/ofada-rice-5kg.svg",
    description:
      "Aromatic, unpolished native short-grain rice from Ogun State farms — the proper base for ayamase and stewed delights.",
    rating: 4.6,
    reviewCount: 278,
    stock: 60,
  },
  {
    id: "zobo-dried-hibiscus-1kg",
    name: "Zobo Dried Hibiscus Flowers, 1 kg",
    category: "agriculture-farm",
    sellerId: "kano-farms-collective",
    origin: NG,
    priceCents: 890_000,
    image: "/images/products/zobo-dried-hibiscus-1kg.svg",
    description:
      "Sun-dried deep-red hibiscus calyces, hand-sorted for brewing zobo, punch or hibiscus tea all year round.",
    rating: 4.7,
    reviewCount: 291,
    stock: 150,
  },
  {
    id: "plantain-flour-5kg",
    name: "Plantain Flour, 5 kg",
    category: "agriculture-farm",
    sellerId: "kano-farms-collective",
    origin: NG,
    priceCents: 1_950_000,
    image: "/images/products/plantain-flour-5kg.svg",
    description:
      "Stone-milled from fully ripe plantains for naturally sweet elubo dodo — smooth swallow, zero additives.",
    rating: 4.5,
    reviewCount: 187,
    stock: 80,
  },
  {
    id: "adire-baby-swaddle-set",
    name: "Adire Baby Swaddle Set",
    category: "baby-kids",
    sellerId: "abeni-atelier",
    origin: NG,
    priceCents: 2_650_000,
    image: "/images/products/adire-baby-swaddle-set.svg",
    description:
      "Two buttery-soft swaddles and a matching cap in gentle indigo Adire cotton, pre-washed for delicate newborn skin.",
    rating: 4.8,
    reviewCount: 97,
    stock: 30,
  },
  {
    id: "voices-of-lagos-hardcover",
    name: "Voices of Lagos — Hardcover Anthology",
    category: "books-media",
    sellerId: "maroko-books",
    origin: NG,
    priceCents: 1_450_000,
    image: "/images/products/voices-of-lagos-hardcover.svg",
    description:
      "Twenty-four short stories tracing one wild, beautiful day across Lagos — from Okokomaiko dawn to Lekki midnight.",
    rating: 4.7,
    reviewCount: 132,
    stock: 44,
  },
  {
    id: "afrobeats-rising-vinyl",
    name: "Afrobeats Rising — Limited Vinyl",
    category: "books-media",
    sellerId: "maroko-books",
    origin: NG,
    priceCents: 3_200_000,
    image: "/images/products/afrobeats-rising-vinyl.svg",
    description:
      "A pressed-on-vinyl snapshot of the new wave: twelve tracks from Lagos, Accra and Johannesburg studios. Numbered sleeve.",
    rating: 4.8,
    reviewCount: 210,
    stock: 25,
  },
  {
    id: "raffia-wall-art",
    name: "Raffia Weave Wall Art",
    category: "arts-crafts",
    sellerId: "nok-home-studio",
    origin: NG,
    priceCents: 8_500_000,
    image: "/images/products/raffia-wall-art.svg",
    description:
      "A statement woven panel in natural and charcoal raffia, mounted on reclaimed iroko — each piece signed by its weaver.",
    rating: 4.9,
    reviewCount: 64,
    stock: 8,
  },
  {
    id: "iroko-carved-serving-board",
    name: "Carved Iroko Serving Board",
    category: "arts-crafts",
    sellerId: "nok-home-studio",
    origin: NG,
    priceCents: 3_400_000,
    image: "/images/products/iroko-carved-serving-board.svg",
    description:
      "Food-safe serving board hand-carved from seasoned iroko hardwood with a subtle etched rim and hanging loop.",
    rating: 4.7,
    reviewCount: 118,
    stock: 22,
  },
  {
    id: "recycled-brass-earrings",
    name: "Recycled Brass Statement Earrings",
    category: "jewelry-accessories",
    sellerId: "accra-craftworks",
    origin: GH,
    priceCents: 2_950_000,
    image: "/images/products/recycled-brass-earrings.svg",
    description:
      "Lost-wax cast from reclaimed brass by Kumasi artisans — bold geometric drops that age into a warm golden patina.",
    rating: 4.8,
    reviewCount: 176,
    stock: 40,
    featured: true,
  },
  {
    id: "krobo-glass-bead-bracelet",
    name: "Krobo Glass Bead Bracelet",
    category: "jewelry-accessories",
    sellerId: "accra-craftworks",
    origin: GH,
    priceCents: 1_650_000,
    image: "/images/products/krobo-glass-bead-bracelet.svg",
    description:
      "Strung with recycled bottle-glass beads made in Krobo Odumase — stretch fit, water-friendly, endlessly stackable.",
    rating: 4.6,
    reviewCount: 143,
    stock: 55,
  },
  {
    id: "magnetic-dash-mount",
    name: "Magnetic Dash Mount Pro",
    category: "automotive",
    sellerId: "lagos-gadget-hub",
    priceCents: 1_150_000,
    image: "/images/products/magnetic-dash-mount.svg",
    description:
      "Low-profile magnetic phone mount with 12 strong N52 magnets, one-handed docking and a base that survives Third Mainland Bridge potholes.",
    rating: 4.4,
    reviewCount: 389,
    stock: 65,
  },
];

/** Curated cross-department collections. */
export const collections: Record<
  CollectionId,
  { id: CollectionId; name: string; tagline: string }
> = {
  "african-made": {
    id: "african-made",
    name: "Nigerian / African Made",
    tagline: "Designed, farmed or crafted on the continent",
  },
};

export const COLLECTION_LABEL: Record<CollectionId, string> = {
  "african-made": "Nigerian / African Made",
};

export const deliveryOptions: DeliveryOption[] = [
  {
    id: "standard",
    label: "Standard delivery",
    description: "Door delivery nationwide · free over ₦75,000",
    etaMinDays: 3,
    etaMaxDays: 5,
    priceCents: 250_000,
    freeThresholdCents: 7_500_000,
  },
  {
    id: "express",
    label: "Express delivery",
    description: "Next-day within Lagos · 48h nationwide",
    etaMinDays: 1,
    etaMaxDays: 2,
    priceCents: 550_000,
  },
  {
    id: "pickup",
    label: "Pickup station",
    description: "Collect from a NeedCentral pickup point near you",
    etaMinDays: 2,
    etaMaxDays: 3,
    priceCents: 120_000,
  },
];

export function getDeliveryOptions(): DeliveryOption[] {
  return deliveryOptions;
}

export function getDeliveryOptionById(
  id: DeliveryOption["id"]
): DeliveryOption | undefined {
  return deliveryOptions.find((option) => option.id === id);
}

/** Homepage promotional banner configuration. */
export const promotions: Promotion[] = [
  {
    id: "deal-of-the-week",
    badge: "Deal of the week",
    productId: "optix-r7-mirrorless-camera",
  },
];

/**
 * Demo coupons redeemable in the simulated cart/checkout flow. Codes are
 * matched case-insensitively; real validation arrives with the backend.
 */
export const coupons: Coupon[] = [
  {
    code: "WELCOME10",
    description: "10% off your first NeedCentral order",
    percentOff: 10,
  },
  {
    code: "NAIJA15",
    description: "15% off orders over ₦100,000",
    percentOff: 15,
    minSubtotalCents: 10_000_000,
  },
];

export function getCouponByCode(code: string): Coupon | undefined {
  const normalized = code.trim().toUpperCase();
  return coupons.find((coupon) => coupon.code === normalized);
}

export function getAllProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getFeaturedProducts(limit = 8): Product[] {
  return products.filter((p) => p.featured).slice(0, limit);
}

export function getTrendingProducts(limit = 8): Product[] {
  return [...products]
    .sort(
      (a, b) =>
        b.rating - a.rating || b.reviewCount - a.reviewCount
    )
    .slice(0, limit);
}

export function getAfricanMadeProducts(): Product[] {
  return products.filter((p) => p.origin?.madeInAfrica === true);
}

export function countAfricanMadeProducts(): number {
  return getAfricanMadeProducts().length;
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

export function getSellerProducts(sellerId: string): Product[] {
  return products.filter((product) => product.sellerId === sellerId);
}

/**
 * Aggregated storefront stats for every seller, ordered as defined in the
 * sellers array (Nigerian and African sellers first, then international).
 */
export function getSellerSummaries(): SellerSummary[] {
  return sellers.map((seller) => {
    const sellerProducts = getSellerProducts(seller.id);
    const reviewCount = sellerProducts.reduce(
      (sum, product) => sum + product.reviewCount,
      0
    );
    const avgRating = sellerProducts.length
      ? sellerProducts.reduce((sum, product) => sum + product.rating, 0) /
        sellerProducts.length
      : 0;
    return {
      seller,
      productCount: sellerProducts.length,
      avgRating,
      reviewCount,
      africanMadeCount: sellerProducts.filter(
        (product) => product.origin?.madeInAfrica
      ).length,
    };
  });
}

export function getSellerSummary(sellerId: string): SellerSummary | undefined {
  const seller = getSellerById(sellerId);
  if (!seller) return undefined;
  return getSellerSummaries().find((summary) => summary.seller.id === sellerId);
}

/**
 * Deterministic pseudo-random index from a string, so mock review selection
 * is stable between server render and client hydration.
 */
function stableHash(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

interface ReviewSeed {
  author: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

const REVIEW_SEEDS: ReviewSeed[] = [
  {
    author: "Chiamaka O.",
    location: "Lekki, Lagos",
    rating: 5,
    title: "Exactly as described",
    body: "Delivery to Lagos took just two days and the packaging was excellent. The quality genuinely surprised me for this price range.",
    createdAt: "2026-07-14T10:00:00.000Z",
    verifiedPurchase: true,
  },
  {
    author: "Tunde A.",
    location: "Ibadan, Oyo",
    rating: 4,
    title: "Very solid buy",
    body: "Ordered during the promo and it arrived ahead of schedule. Seller communicated at every step. Would buy again without thinking.",
    createdAt: "2026-06-28T09:30:00.000Z",
    verifiedPurchase: true,
  },
  {
    author: "Amara N.",
    location: "Wuse, Abuja",
    rating: 5,
    title: "Worth every naira",
    body: "I compared prices everywhere before settling here. Checkout was smooth and the item has been flawless in daily use.",
    createdAt: "2026-07-02T16:45:00.000Z",
    verifiedPurchase: true,
  },
  {
    author: "Femi O.",
    location: "London, United Kingdom",
    rating: 5,
    title: "Sent straight to my mum",
    body: "Shopped from abroad for family back home and everything went perfectly. This is how online shopping should feel.",
    createdAt: "2026-05-19T12:10:00.000Z",
    verifiedPurchase: true,
  },
  {
    author: "Zainab M.",
    location: "Kano",
    rating: 4,
    title: "Great quality, minor delay",
    body: "The product itself is lovely and well made. Dispatch took an extra day, but customer support kept me updated throughout.",
    createdAt: "2026-06-11T08:20:00.000Z",
    verifiedPurchase: true,
  },
  {
    author: "Sofia R.",
    location: "Lisbon, Portugal",
    rating: 5,
    title: "Curious visitor, happy customer",
    body: "Found this marketplace while looking for authentic African brands. Beautiful craftsmanship — my friends keep asking where it's from.",
    createdAt: "2026-07-21T14:05:00.000Z",
    verifiedPurchase: false,
  },
  {
    author: "Emeka U.",
    location: "Independence Layout, Enugu",
    rating: 4,
    title: "Does the job well",
    body: "Sturdy and exactly what was promised. Pickup station option saved me some money too — collected it the same week.",
    createdAt: "2026-06-05T17:30:00.000Z",
    verifiedPurchase: true,
  },
  {
    author: "Ngozi P.",
    location: "Port Harcourt, Rivers",
    rating: 5,
    title: "Repeat purchase",
    body: "Second time ordering this. Consistent quality both times, and the returns policy gives real peace of mind.",
    createdAt: "2026-07-30T11:50:00.000Z",
    verifiedPurchase: true,
  },
  {
    author: "Daniel K.",
    location: "Nairobi, Kenya",
    rating: 4,
    title: "Hope this ships East soon",
    body: "Bought this as a gift for family in Lagos and they loved it. Please expand to Kenya quickly — I want in on this.",
    createdAt: "2026-06-17T13:15:00.000Z",
    verifiedPurchase: false,
  },
  {
    author: "Halima S.",
    location: "Kaduna",
    rating: 5,
    title: "Beautiful finish",
    body: "You can tell care went into this. It arrived neatly wrapped with a thank-you note from the seller. Small things matter.",
    createdAt: "2026-08-02T09:00:00.000Z",
    verifiedPurchase: true,
  },
  {
    author: "Grace A.",
    location: "Takoradi, Ghana",
    rating: 5,
    title: "Ghana approves",
    body: "Our neighbours are doing something special with this platform. Smooth ordering, honest photos, fair prices.",
    createdAt: "2026-07-08T15:40:00.000Z",
    verifiedPurchase: true,
  },
  {
    author: "Tom W.",
    location: "Manchester, United Kingdom",
    rating: 4,
    title: "Impressive marketplace",
    body: "As someone shopping from Europe I found everything clear and trustworthy. Delivery estimate was accurate to the day.",
    createdAt: "2026-06-23T10:25:00.000Z",
    verifiedPurchase: true,
  },
  {
    author: "Ifeanyi C.",
    location: "Yaba, Lagos",
    rating: 5,
    title: "Fast and stress-free",
    body: "Placed the order at lunchtime and chose express delivery. It was at my door in Surulere before closing the next day.",
    createdAt: "2026-08-05T12:35:00.000Z",
    verifiedPurchase: true,
  },
  {
    author: "Blessing E.",
    location: "Benin City, Edo",
    rating: 4,
    title: "Good value",
    body: "Reasonable price, genuine article, polite dispatch rider. Honestly better experience than the big platforms.",
    createdAt: "2026-05-27T18:55:00.000Z",
    verifiedPurchase: true,
  },
  {
    author: "Yemi F.",
    location: "Toronto, Canada",
    rating: 5,
    title: "Diaspora favourite",
    body: "This is now my default for gifts back home. The African-made section especially is a treasure chest.",
    createdAt: "2026-07-18T20:15:00.000Z",
    verifiedPurchase: true,
  },
  {
    author: "Kwame B.",
    location: "Osu, Accra",
    rating: 5,
    title: "Quality speaks",
    body: "Even shipping across from Nigeria, everything arrived neat and on time. Proud to see West African trade working like this.",
    createdAt: "2026-06-09T09:45:00.000Z",
    verifiedPurchase: false,
  },
];

const REVIEW_POOL_SIZE = REVIEW_SEEDS.length;

/** Stable mock reviews for a product (no backend required). */
export function getReviewsForProduct(productId: string, count = 3): Review[] {
  const start = stableHash(productId);
  const reviews: Review[] = [];
  for (let index = 0; index < count; index += 1) {
    const seed = REVIEW_SEEDS[(start + index * 5) % REVIEW_POOL_SIZE];
    reviews.push({
      id: `${productId}-review-${index + 1}`,
      productId,
      author: seed.author,
      location: seed.location,
      rating: seed.rating,
      title: seed.title,
      body: seed.body,
      createdAt: seed.createdAt,
      verifiedPurchase: seed.verifiedPurchase,
    });
  }
  return reviews;
}

interface QASeed {
  author: string;
  question: string;
  createdAt: string;
  answer?: {
    author: string;
    body: string;
    createdAt: string;
  };
}

const QA_SEEDS: QASeed[] = [
  {
    author: "Chidinma E.",
    question: "Is this product available for pickup in Lagos?",
    createdAt: "2026-07-20T08:15:00.000Z",
    answer: {
      author: "Seller",
      body: "Yes, pickup is available at our Ikeja store. Select 'Pickup station' at checkout to see available locations and collect the same week.",
      createdAt: "2026-07-20T14:30:00.000Z",
    },
  },
  {
    author: "Olumide K.",
    question: "Does it come with a warranty?",
    createdAt: "2026-06-15T11:00:00.000Z",
    answer: {
      author: "Seller",
      body: "All electronics come with a 12-month manufacturer warranty. Keep your order confirmation email as proof of purchase for any warranty claims.",
      createdAt: "2026-06-15T16:45:00.000Z",
    },
  },
  {
    author: "Amina B.",
    question: "How long does delivery take to Abuja?",
    createdAt: "2026-07-05T09:30:00.000Z",
    answer: {
      author: "Seller",
      body: "Standard delivery to Abuja takes 3-5 business days. Express delivery gets it there in 1-2 business days. Both options are available at checkout.",
      createdAt: "2026-07-05T13:10:00.000Z",
    },
  },
  {
    author: "Kemi A.",
    question: "Can I return this if it doesn't meet my expectations?",
    createdAt: "2026-06-28T10:20:00.000Z",
    answer: {
      author: "Seller",
      body: "Absolutely. We offer a 30-day no-questions-asked return policy. Contact support through your order page and we will arrange a free return pickup.",
      createdAt: "2026-06-28T15:00:00.000Z",
    },
  },
  {
    author: "Tunde O.",
    question: "Is the colour exactly as shown in the photos?",
    createdAt: "2026-07-12T14:45:00.000Z",
    answer: {
      author: "Seller",
      body: "We photograph every product in natural light. Minor colour variation is possible depending on your screen settings, but we stand by the accuracy of our images.",
      createdAt: "2026-07-13T09:00:00.000Z",
    },
  },
  {
    author: "Ngozi I.",
    question: "Do you ship internationally?",
    createdAt: "2026-05-30T07:10:00.000Z",
    answer: {
      author: "Seller",
      body: "Yes, we ship to over 20 countries. International delivery times vary by destination — typically 7-14 business days. Duties and taxes are the buyer's responsibility.",
      createdAt: "2026-05-30T12:00:00.000Z",
    },
  },
  {
    author: "Bolaji M.",
    question: "What payment methods do you accept?",
    createdAt: "2026-06-20T16:30:00.000Z",
    answer: {
      author: "Seller",
      body: "We accept debit cards, bank transfers and USSD payments. All transactions are processed securely. Full payment details appear at checkout.",
      createdAt: "2026-06-21T08:15:00.000Z",
    },
  },
  {
    author: "Fatima S.",
    question: "Can I buy this as a gift and have it shipped to a different address?",
    createdAt: "2026-07-18T13:00:00.000Z",
    answer: {
      author: "Seller",
      body: "Of course. Enter the recipient's address in the shipping form at checkout. We do not include pricing information in the package.",
      createdAt: "2026-07-18T17:30:00.000Z",
    },
  },
  {
    author: "Emeka U.",
    question: "Is this product currently in stock?",
    createdAt: "2026-08-01T08:45:00.000Z",
    answer: {
      author: "Seller",
      body: "Stock levels update in real time. If the 'Add to cart' button is active, the item is available. Out-of-stock items show a clear label on the product page.",
      createdAt: "2026-08-01T11:20:00.000Z",
    },
  },
  {
    author: "Halima R.",
    question: "How do I track my order after placing it?",
    createdAt: "2026-07-25T10:00:00.000Z",
    answer: {
      author: "Seller",
      body: "Once your order is confirmed, visit /orders to see the current status and estimated delivery date. You will also receive email updates at each stage.",
      createdAt: "2026-07-25T14:40:00.000Z",
    },
  },
];

const QA_POOL_SIZE = QA_SEEDS.length;

/** Stable mock Q&A for a product (no backend required). */
export function getQandAForProduct(
  productId: string,
  count = 3
): Question[] {
  const start = stableHash(productId);
  const questions: Question[] = [];
  for (let index = 0; index < count; index += 1) {
    const seed = QA_SEEDS[(start + index * 7) % QA_POOL_SIZE];
    const question: Question = {
      id: `${productId}-qa-${index + 1}`,
      productId,
      author: seed.author,
      body: seed.question,
      createdAt: seed.createdAt,
      answers: seed.answer
        ? [
            {
              id: `${productId}-qa-${index + 1}-a1`,
              author: seed.answer.author,
              body: seed.answer.body,
              createdAt: seed.answer.createdAt,
            },
          ]
        : [],
    };
    questions.push(question);
  }
  return questions;
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
  const rawCollection = firstParam(searchParams, "collection");
  const rawSort = firstParam(searchParams, "sort") as SortOption;
  return {
    q: firstParam(searchParams, "q"),
    category: (CATEGORY_IDS as readonly string[]).includes(rawCategory)
      ? (rawCategory as CategoryId)
      : "all",
    collection: (COLLECTION_IDS as readonly string[]).includes(rawCollection)
      ? (rawCollection as CollectionId)
      : "all",
    sort: SORT_OPTIONS.includes(rawSort) ? rawSort : "featured",
  };
}

export function filterAndSortProducts(query: ProductQuery): ProductQueryResult {
  const needle = query.q.toLowerCase();
  const matched = products.filter((product) => {
    if (
      query.collection === "african-made" &&
      product.origin?.madeInAfrica !== true
    ) {
      return false;
    }
    if (query.category !== "all" && product.category !== query.category) {
      return false;
    }
    if (!needle) return true;
    const haystack =
      `${product.name} ${product.description} ${
        product.origin?.country ?? ""
      } ${categoryNameById.get(product.category) ?? ""}`.toLowerCase();
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
