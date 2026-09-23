import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Booking } from '../types';

/**
 * Return the set of time slots already booked (non-cancelled) for a date.
 */
export async function fetchBookedSlots(date: string): Promise<Set<string>> {
  const q = query(collection(db, 'bookings'), where('date', '==', date));
  const snap = await getDocs(q);
  const taken = new Set<string>();
  snap.forEach((d) => {
    const data = d.data() as Booking;
    if (data.status !== 'cancelled') {
      taken.add(data.timeSlot);
    }
  });
  return taken;
}

/** Fetch all bookings for a customer, newest first. */
export async function fetchCustomerBookings(customerId: string): Promise<Booking[]> {
  const snap = await getDocs(
    query(collection(db, 'bookings'), where('customerId', '==', customerId)),
  );
  const bookings = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking);
  return bookings.sort(
    (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
  );
}

interface CreateBookingArgs {
  customerId: string;
  customerName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  totalAmount: number;
}

/** Create a pending, unpaid booking. Returns the new doc id. */
export async function createBooking(args: CreateBookingArgs): Promise<string> {
  const ref = await addDoc(collection(db, 'bookings'), {
    customerId: args.customerId,
    customerName: args.customerName,
    serviceId: args.serviceId,
    serviceName: args.serviceName,
    date: args.date,
    timeSlot: args.timeSlot,
    status: 'pending',
    totalAmount: args.totalAmount,
    paymentStatus: 'unpaid',
    createdAt: Timestamp.now(),
  });
  return ref.id;
}
