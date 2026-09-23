/**
 * Firestore seed script.
 *
 * Usage:
 *   1. Firebase Console -> Project Settings -> Service accounts ->
 *      "Generate new private key". Save the downloaded JSON as
 *      scripts/serviceAccountKey.json (already git-ignored).
 *   2. npm run seed
 *
 * This uses the Firebase Admin SDK, which bypasses Firestore security
 * rules, so it is safe to run even with locked-down rules.
 */
import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const keyPath = path.resolve(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
  console.error(
    '\n[seed] Missing scripts/serviceAccountKey.json\n' +
      'Download it from Firebase Console -> Project Settings -> Service accounts ' +
      '-> Generate new private key, and save it at scripts/serviceAccountKey.json\n',
  );
  process.exit(1);
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require(keyPath);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

interface SeedService {
  name: string;
  category: string;
  price: number;
  duration: number; // minutes
  description: string;
  imageUrl: string;
  isActive: boolean;
  audience?: 'women' | 'kids';
  [key: string]: unknown;
}

interface SeedProduct {
  name: string;
  category: string;
  price: number;
  stockCount: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
  audience?: 'women' | 'kids';
  [key: string]: unknown;
}

const services: SeedService[] = [
  {
    name: 'Full Face Facial',
    category: 'Facial',
    price: 800,
    duration: 60,
    description:
      'Deep cleansing facial that exfoliates, hydrates and revitalises your skin for a fresh, radiant glow.',
    imageUrl:
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400',
    isActive: true,
  },
  {
    name: 'Eyebrow Threading',
    category: 'Threading',
    price: 50,
    duration: 10,
    description:
      'Precise eyebrow shaping using traditional threading for clean, well-defined brows.',
    imageUrl:
      'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=400',
    isActive: true,
  },
  {
    name: 'Full Arms Waxing',
    category: 'Waxing',
    price: 300,
    duration: 30,
    description:
      'Smooth, hair-free arms with gentle wax that leaves skin soft and silky.',
    imageUrl:
      'https://images.unsplash.com/photo-1607008829749-c0f284a49841?w=400',
    isActive: true,
  },
  {
    name: 'Hair Spa Treatment',
    category: 'Hair',
    price: 1200,
    duration: 90,
    description:
      'Nourishing hair spa with deep conditioning and scalp massage to restore shine and strength.',
    imageUrl:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    isActive: true,
  },
  {
    name: 'Gel Manicure',
    category: 'Nails',
    price: 600,
    duration: 45,
    description:
      'Long-lasting gel manicure with cuticle care and a glossy, chip-resistant finish.',
    imageUrl:
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    isActive: true,
  },
  {
    name: 'Pedicure Deluxe',
    category: 'Nails',
    price: 700,
    duration: 50,
    description:
      'Relaxing deluxe pedicure with exfoliation, foot massage and polish for happy, healthy feet.',
    imageUrl:
      'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400',
    isActive: true,
  },
  {
    name: 'Bridal Package',
    category: 'Bridal',
    price: 8000,
    duration: 240,
    description:
      'Complete bridal makeover including makeup, hairstyling, draping and pre-bridal skin prep.',
    imageUrl:
      'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=400',
    isActive: true,
  },
  {
    name: 'Hair Straightening',
    category: 'Hair',
    price: 2500,
    duration: 180,
    description:
      'Professional keratin hair straightening for sleek, frizz-free and manageable hair.',
    imageUrl:
      'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400',
    isActive: true,
  },
];

const products: SeedProduct[] = [
  {
    name: 'Cotton Kurti - Blue',
    category: 'Kurti',
    price: 850,
    stockCount: 12,
    description:
      'Breathable blue cotton kurti with subtle prints, perfect for daily and casual wear.',
    imageUrl:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
    isActive: true,
  },
  {
    name: 'Silk Dupatta - Red',
    category: 'Dupatta',
    price: 650,
    stockCount: 8,
    description:
      'Elegant red silk dupatta with delicate border work to elevate any ethnic outfit.',
    imageUrl:
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400',
    isActive: true,
  },
  {
    name: 'Anarkali Suit - Green',
    category: 'Suits',
    price: 2400,
    stockCount: 6,
    description:
      'Flowy green Anarkali suit with embroidered yoke and matching dupatta for festive occasions.',
    imageUrl:
      'https://images.unsplash.com/photo-1610189025857-5c0d9cf59e0f?w=400',
    isActive: true,
  },
  {
    name: 'Embroidered Salwar Suit - Pink',
    category: 'Suits',
    price: 1950,
    stockCount: 9,
    description:
      'Classic pink salwar suit with thread embroidery, comfortable fit and rich detailing.',
    imageUrl:
      'https://images.unsplash.com/photo-1617059229048-25e2cc52cb7b?w=400',
    isActive: true,
  },
  {
    name: 'Rayon Kurti - Yellow',
    category: 'Kurtis',
    price: 720,
    stockCount: 15,
    description:
      'Bright yellow rayon kurti with a relaxed silhouette, ideal for office and outings.',
    imageUrl:
      'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400',
    isActive: true,
  },
  {
    name: 'Printed A-Line Kurti - Teal',
    category: 'Kurtis',
    price: 990,
    stockCount: 10,
    description:
      'Teal A-line kurti with all-over print and three-quarter sleeves for an effortless look.',
    imageUrl:
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
    isActive: true,
  },
  {
    name: 'Oxidised Jhumka Earrings',
    category: 'Accessories',
    price: 350,
    stockCount: 25,
    description:
      'Traditional oxidised silver-tone jhumka earrings that pair beautifully with ethnic wear.',
    imageUrl:
      'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=400',
    isActive: true,
  },
  {
    name: 'Beaded Potli Bag',
    category: 'Accessories',
    price: 480,
    stockCount: 14,
    description:
      'Handcrafted beaded potli bag with drawstring closure, a perfect festive accessory.',
    imageUrl:
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400',
    isActive: true,
  },
  {
    name: 'Kanjivaram Silk Saree - Maroon',
    category: 'Sarees',
    price: 5200,
    stockCount: 4,
    description:
      'Luxurious maroon Kanjivaram silk saree with golden zari border for grand celebrations.',
    imageUrl:
      'https://images.unsplash.com/photo-1610030469912-72f8eb6a2e30?w=400',
    isActive: true,
  },
  {
    name: 'Georgette Saree - Floral',
    category: 'Sarees',
    price: 1800,
    stockCount: 7,
    description:
      'Lightweight floral georgette saree with a soft drape, great for parties and gatherings.',
    imageUrl:
      'https://images.unsplash.com/photo-1610030469668-8e9f641aa9b0?w=400',
    isActive: true,
  },
];

const kidsServices: SeedService[] = [
  {
    name: 'Kids Haircut',
    category: 'Hair',
    price: 200,
    duration: 30,
    description:
      'Gentle, fun haircut for kids with cartoon-themed styling and a patient, friendly touch.',
    imageUrl:
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
    isActive: true,
    audience: 'kids',
  },
  {
    name: 'Kids Mehndi Art',
    category: 'Mehndi',
    price: 150,
    duration: 25,
    description:
      'Adorable little henna designs for kids — perfect for festivals and family functions.',
    imageUrl:
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400',
    isActive: true,
    audience: 'kids',
  },
  {
    name: 'Kids Party Makeup',
    category: 'Makeup',
    price: 400,
    duration: 40,
    description:
      'Sparkly, skin-safe party makeup with glitter and fun colours for birthdays and events.',
    imageUrl:
      'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400',
    isActive: true,
    audience: 'kids',
  },
  {
    name: 'Kids Nail Art',
    category: 'Nails',
    price: 250,
    duration: 30,
    description:
      'Cute, colourful nail art with stickers and kid-friendly polish that washes off easily.',
    imageUrl:
      'https://images.unsplash.com/photo-1632344004142-8a8b3f6d5f6a?w=400',
    isActive: true,
    audience: 'kids',
  },
];

const kidsProducts: SeedProduct[] = [
  {
    name: 'Kids Frock - Rainbow',
    category: 'Frocks',
    price: 750,
    stockCount: 18,
    description:
      'Bright rainbow frock in soft cotton, comfy and twirl-worthy for parties and play.',
    imageUrl:
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400',
    isActive: true,
    audience: 'kids',
  },
  {
    name: 'Boys Ethnic Kurta Set',
    category: 'Ethnic',
    price: 980,
    stockCount: 10,
    description:
      'Festive kurta-pyjama set for boys with a cheerful colour and easy, breathable fabric.',
    imageUrl:
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400',
    isActive: true,
    audience: 'kids',
  },
  {
    name: 'Kids Hair Clips Set',
    category: 'Accessories',
    price: 180,
    stockCount: 30,
    description:
      'Set of colourful flower and bow hair clips that add a playful touch to any look.',
    imageUrl:
      'https://images.unsplash.com/photo-1535682215715-c5c6a4a4f5e1?w=400',
    isActive: true,
    audience: 'kids',
  },
  {
    name: 'Kids Lehenga - Peach',
    category: 'Ethnic',
    price: 1450,
    stockCount: 7,
    description:
      'Pretty peach lehenga with light embroidery and a comfy fit for little celebration stars.',
    imageUrl:
      'https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=400',
    isActive: true,
    audience: 'kids',
  },
];

async function seedCollection<T extends Record<string, unknown>>(
  name: string,
  items: T[],
): Promise<void> {
  console.log(`\n[seed] Writing ${items.length} documents to "${name}"...`);
  for (const item of items) {
    const ref = await db.collection(name).add({
      audience: 'women',
      ...item,
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log(`  ✓ ${name}/${ref.id}  ->  ${item.name as string}`);
  }
}

async function main(): Promise<void> {
  await seedCollection('services', [...services, ...kidsServices]);
  await seedCollection('products', [...products, ...kidsProducts]);
  console.log('\n[seed] Done. Firestore seeded successfully.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
