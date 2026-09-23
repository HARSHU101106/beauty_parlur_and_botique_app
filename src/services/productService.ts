import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  runTransaction,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, PreBooking, Audience } from '../types';

/** Fetch all active products, optionally filtered by audience. */
export async function fetchActiveProducts(audience?: Audience): Promise<Product[]> {
  const q = query(collection(db, 'products'), where('isActive', '==', true));
  const snap = await getDocs(q);
  const list = snap.docs.map(
    (d) => ({ id: d.id, audience: 'women', ...d.data() }) as Product,
  );
  if (!audience) return list;
  return list.filter((p) => (p.audience ?? 'women') === audience);
}

/** Fetch a single product by id. */
export async function fetchProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

/**
 * Return the customer's existing active pre-booking for a product, if any.
 */
export async function fetchActivePreBooking(
  customerId: string,
  productId: string,
): Promise<PreBooking | null> {  const q = query(
    collection(db, 'preBookings'),
    where('customerId', '==', customerId),
    where('productId', '==', productId),
    where('status', '==', 'active'),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as PreBooking;
}

/** Fetch all active pre-bookings for a customer, soonest expiry first. */
export async function fetchActivePreBookings(
  customerId: string,
): Promise<PreBooking[]> {
  const q = query(
    collection(db, 'preBookings'),
    where('customerId', '==', customerId),
    where('status', '==', 'active'),
  );
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PreBooking);
  return list.sort(
    (a, b) => (a.expiresAt?.toMillis?.() ?? 0) - (b.expiresAt?.toMillis?.() ?? 0),
  );
}

/**
 * Fetch ALL pre-bookings (purchase history) for a customer, regardless of
 * status, newest first.
 */
export async function fetchCustomerPreBookings(
  customerId: string,
): Promise<PreBooking[]> {
  const q = query(
    collection(db, 'preBookings'),
    where('customerId', '==', customerId),
  );
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PreBooking);
  return list.sort(
    (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
  );
}

interface CreatePreBookingArgs {
  customerId: string;
  customerName: string;
  product: Product;
}

/** Create a 10-day pre-booking for a product. Returns the new doc id. */
export async function createPreBooking({
  customerId,
  customerName,
  product,
}: CreatePreBookingArgs): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 10);

  const preRef = doc(collection(db, 'preBookings'));

  // Reserve one unit and create the pre-booking atomically so stock can never
  // go negative if two customers reserve the last item at the same time.
  await runTransaction(db, async (tx) => {
    const prodRef = doc(db, 'products', product.id);
    const prodSnap = await tx.get(prodRef);
    if (!prodSnap.exists()) {
      throw new Error('Product not found');
    }
    const stock = (prodSnap.data().stockCount as number) ?? 0;
    if (stock <= 0) {
      throw new Error('Product is out of stock');
    }
    tx.update(prodRef, { stockCount: stock - 1 });
    tx.set(preRef, {
      customerId,
      customerName,
      productId: product.id,
      productName: product.name,
      quantity: 1,
      totalAmount: product.price,
      status: 'active',
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: Timestamp.now(),
    });
  });

  return preRef.id;
}
