/**
 * Replace all parlour (women) services with the salon's printed catalog.
 *
 * - Deletes every existing service whose audience is NOT 'kids'
 *   (i.e. the women / parlour services). Kids services are left untouched.
 * - Inserts the exact services & prices from the Gomu's Beauty Care menu.
 *
 * Usage:  npm run replace-services
 * (requires scripts/serviceAccountKey.json, same as the seed script)
 */
import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const keyPath = path.resolve(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
  console.error(
    '\n[replace] Missing scripts/serviceAccountKey.json\n' +
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
  audience: 'women' | 'kids';
}

const FACIAL_IMG =
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400';
const SKIN_IMG =
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400';
const THREADING_IMG =
  'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=400';
const NAILS_IMG =
  'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400';
const HAIR_IMG =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400';
const MEHNDI_IMG =
  'https://images.unsplash.com/photo-1595433562696-a8b1e3a3d3a4?w=400';
const WAXING_IMG =
  'https://images.unsplash.com/photo-1607008829749-c0f284a49841?w=400';
const MAKEUP_IMG =
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400';

// Exact services & prices from the printed Gomu's Beauty Care menu.
const services: SeedService[] = [
  { name: 'Normal Facial', category: 'Facial', price: 400, duration: 45, description: 'Refreshing normal facial that cleanses and revitalises your skin.', imageUrl: FACIAL_IMG, isActive: true, audience: 'women' },
  { name: 'Fruit Facial', category: 'Facial', price: 400, duration: 45, description: 'Nourishing fruit facial for a natural, healthy glow.', imageUrl: FACIAL_IMG, isActive: true, audience: 'women' },
  { name: 'Ayurvedic Facial', category: 'Facial', price: 500, duration: 60, description: 'Herbal ayurvedic facial that soothes and rejuvenates the skin.', imageUrl: FACIAL_IMG, isActive: true, audience: 'women' },
  { name: 'Pearl Facial', category: 'Facial', price: 600, duration: 60, description: 'Pearl facial for brightening and an even-toned, radiant complexion.', imageUrl: FACIAL_IMG, isActive: true, audience: 'women' },
  { name: 'Diamond Facial', category: 'Facial', price: 650, duration: 60, description: 'Luxurious diamond facial for instant shine and smooth skin.', imageUrl: FACIAL_IMG, isActive: true, audience: 'women' },
  { name: 'Whitening Facial', category: 'Facial', price: 700, duration: 60, description: 'Skin whitening facial that lightens and brightens your complexion.', imageUrl: FACIAL_IMG, isActive: true, audience: 'women' },
  { name: 'Skin Tightening Facial', category: 'Facial', price: 650, duration: 60, description: 'Firming facial that tightens and tones for youthful-looking skin.', imageUrl: FACIAL_IMG, isActive: true, audience: 'women' },
  { name: 'Golden Facial', category: 'Facial', price: 1200, duration: 75, description: 'Premium 24k gold facial for a luxurious, glowing finish.', imageUrl: FACIAL_IMG, isActive: true, audience: 'women' },
  { name: 'Bleach, D-Tan', category: 'Skin Care', price: 300, duration: 30, description: 'Bleach and de-tan treatment to remove tan and even skin tone.', imageUrl: SKIN_IMG, isActive: true, audience: 'women' },
  { name: 'Under Eye Protection', category: 'Skin Care', price: 300, duration: 30, description: 'Targeted under-eye treatment to reduce dark circles and puffiness.', imageUrl: SKIN_IMG, isActive: true, audience: 'women' },
  { name: 'Eyebrow Threading', category: 'Threading', price: 40, duration: 10, description: 'Precise eyebrow shaping with traditional threading.', imageUrl: THREADING_IMG, isActive: true, audience: 'women' },
  { name: 'Upper Lip, Lower Lip Hair Removal', category: 'Threading', price: 60, duration: 10, description: 'Gentle upper and lower lip hair removal for a clean finish.', imageUrl: THREADING_IMG, isActive: true, audience: 'women' },
  { name: 'Pedicure, Manicure', category: 'Nails', price: 500, duration: 60, description: 'Relaxing pedicure and manicure with cleansing, exfoliation and polish.', imageUrl: NAILS_IMG, isActive: true, audience: 'women' },
  { name: 'Normal Haircut', category: 'Hair', price: 150, duration: 30, description: 'Classic haircut and styling tailored to your look.', imageUrl: HAIR_IMG, isActive: true, audience: 'women' },
  { name: 'Mehandi', category: 'Mehndi', price: 500, duration: 60, description: 'Beautiful mehandi designs (starting price; varies with design).', imageUrl: MEHNDI_IMG, isActive: true, audience: 'women' },
  { name: 'Hair Colouring', category: 'Hair', price: 250, duration: 60, description: 'Hair colouring to add vibrant shades and shine (starting price).', imageUrl: HAIR_IMG, isActive: true, audience: 'women' },
  { name: 'Waxing', category: 'Waxing', price: 250, duration: 30, description: 'Smooth, hair-free skin with gentle waxing.', imageUrl: WAXING_IMG, isActive: true, audience: 'women' },
  { name: 'Makeup', category: 'Makeup', price: 1500, duration: 90, description: 'Professional makeup for any occasion (starting price; varies with look).', imageUrl: MAKEUP_IMG, isActive: true, audience: 'women' },
];

async function deleteWomenServices(): Promise<number> {
  const snap = await db.collection('services').get();
  let deleted = 0;
  // Firestore allows up to 500 ops per batch.
  let batch = db.batch();
  let ops = 0;
  for (const docSnap of snap.docs) {
    const audience = (docSnap.data().audience as string) ?? 'women';
    if (audience === 'kids') continue; // keep kids services
    batch.delete(docSnap.ref);
    deleted += 1;
    ops += 1;
    if (ops === 500) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }
  if (ops > 0) await batch.commit();
  return deleted;
}

async function main(): Promise<void> {
  console.log('\n[replace] Deleting existing parlour (women) services...');
  const deleted = await deleteWomenServices();
  console.log(`  ✓ Deleted ${deleted} old service(s).`);

  console.log(`\n[replace] Adding ${services.length} services from the menu...`);
  for (const item of services) {
    const ref = await db.collection('services').add({
      ...item,
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log(`  ✓ services/${ref.id}  ->  ${item.name}  (₹${item.price})`);
  }

  console.log('\n[replace] Done. Parlour services replaced successfully.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[replace] Failed:', err);
  process.exit(1);
});
