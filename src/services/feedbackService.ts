import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Feedback } from '../types';

/** Returns true if the customer has already reviewed the given service. */
export async function hasReviewedService(
  customerId: string,
  serviceId: string,
): Promise<boolean> {
  const snap = await getDocs(
    query(
      collection(db, 'feedback'),
      where('customerId', '==', customerId),
      where('serviceId', '==', serviceId),
      limit(1),
    ),
  );
  return !snap.empty;
}

interface SubmitFeedbackArgs {
  customerId: string;
  customerName: string;
  serviceId: string;
  bookingId: string;
  rating: number;
  comment: string;
}

/**
 * Add a feedback document and mark the related booking as reviewed.
 */
export async function submitFeedback({
  customerId,
  customerName,
  serviceId,
  bookingId,
  rating,
  comment,
}: SubmitFeedbackArgs): Promise<void> {
  await addDoc(collection(db, 'feedback'), {
    customerId,
    customerName,
    serviceId,
    bookingId,
    rating,
    comment,
    createdAt: Timestamp.now(),
  });

  await updateDoc(doc(db, 'bookings', bookingId), { hasReview: true });
}

/** Fetch all feedback submitted by a customer, newest first. */
export async function fetchCustomerFeedback(
  customerId: string,
): Promise<Feedback[]> {
  const snap = await getDocs(
    query(collection(db, 'feedback'), where('customerId', '==', customerId)),
  );
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Feedback);
  return list.sort(
    (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
  );
}
