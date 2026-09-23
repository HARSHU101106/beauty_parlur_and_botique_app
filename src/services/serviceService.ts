import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Service, Feedback, Audience } from '../types';

/** Fetch all active services, optionally filtered by audience. */
export async function fetchActiveServices(audience?: Audience): Promise<Service[]> {
  const q = query(
    collection(db, 'services'),
    where('isActive', '==', true),
  );
  const snap = await getDocs(q);
  const list = snap.docs.map(
    (d) => ({ id: d.id, audience: 'women', ...d.data() }) as Service,
  );
  if (!audience) return list;
  return list.filter((s) => (s.audience ?? 'women') === audience);
}

/** Fetch a single service document by id. */
export async function fetchServiceById(id: string): Promise<Service | null> {
  const snap = await getDoc(doc(db, 'services', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Service;
}

/** Fetch the latest feedback for a service (most recent first). */
export async function fetchServiceFeedback(
  serviceId: string,
  max = 5,
): Promise<Feedback[]> {
  const q = query(
    collection(db, 'feedback'),
    where('serviceId', '==', serviceId),
  );
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Feedback);
  list.sort(
    (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
  );
  return list.slice(0, max);
}

/** Fetch all feedback for a service (used to compute the average rating). */
export async function fetchServiceRatingSummary(
  serviceId: string,
): Promise<{ average: number; count: number }> {
  const q = query(
    collection(db, 'feedback'),
    where('serviceId', '==', serviceId),
  );
  const snap = await getDocs(q);
  const count = snap.size;
  if (count === 0) return { average: 0, count: 0 };
  const total = snap.docs.reduce(
    (sum, d) => sum + (d.data().rating as number),
    0,
  );
  return { average: total / count, count };
}
