import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
  Timestamp,
} from 'firebase/firestore';
import Constants from 'expo-constants';
import { db } from './firebase';
import { Payment } from '../types';

export const MAX_INSTALMENTS = 4 as const;

const RAZORPAY_KEY_ID =
  process.env.RAZORPAY_KEY_ID ??
  ((Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>)
    .razorpayKeyId ??
  '';

export interface PaymentOptions {
  amount: number; // in rupees (this fn multiplies by 100 -> paise)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  referenceId: string; // bookingId or preBookingId
  referenceType: 'booking' | 'preBooking';
  onSuccess: (data: RazorpaySuccess) => void;
  onFailure: (error: unknown) => void;
}

export interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface RecordPaymentArgs {
  paymentId: string;
  amount: number; // in rupees
  referenceId: string;
  referenceType: 'booking' | 'preBooking';
  method: 'gpay' | 'cash' | 'razorpay';
}

/**
 * Open the Razorpay checkout sheet and resolve with the success payload.
 * Does NOT record anything in Firestore — callers decide how to record.
 */
export const openRazorpayCheckout = async (opts: {
  amount: number; // rupees
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
}): Promise<RazorpaySuccess> => {
  // Lazily load the native Razorpay module so the app can still run inside
  // Expo Go / web (where this native module is unavailable). It is only
  // required when a checkout is actually opened on a real device / dev build.
  let RazorpayCheckout: { open: (options: object) => Promise<unknown> };
  try {
    RazorpayCheckout = require('react-native-razorpay').default;
  } catch {
    throw new Error(
      'Razorpay is not available in this environment. Use a development build ' +
        'or a release build on a physical device to take payments.',
    );
  }

  const options = {
    description: opts.description,
    currency: 'INR',
    key: RAZORPAY_KEY_ID,
    amount: opts.amount * 100, // paise
    name: 'Beauty Parlour',
    prefill: {
      name: opts.customerName,
      email: opts.customerEmail,
      contact: opts.customerPhone,
    },
    theme: { color: '#D63B6E' },
    method: { upi: true }, // enables GPay
  };
  return (await RazorpayCheckout.open(options)) as RazorpaySuccess;
};

/**
 * Open the Razorpay checkout sheet, then record the payment on success.
 * UPI is enabled so Google Pay / PhonePe etc. appear as options.
 */
export const openRazorpay = async ({
  amount,
  customerName,
  customerEmail,
  customerPhone,
  description,
  referenceId,
  referenceType,
  onSuccess,
  onFailure,
}: PaymentOptions): Promise<void> => {
  try {
    const data = await openRazorpayCheckout({
      amount,
      customerName,
      customerEmail,
      customerPhone,
      description,
    });
    await recordPayment({
      paymentId: data.razorpay_payment_id,
      amount,
      referenceId,
      referenceType,
      method: 'razorpay',
    });
    onSuccess(data);
  } catch (error) {
    onFailure(error);
  }
};

/**
 * Record a (possibly partial) payment.
 *
 * - Finds an existing `payments` doc for the reference, or creates one.
 * - Appends an instalment, updates paid/remaining amounts and status.
 * - Updates the parent booking/preBooking `paymentStatus` accordingly.
 */
export const recordPayment = async ({
  paymentId,
  amount,
  referenceId,
  referenceType,
  method,
}: RecordPaymentArgs): Promise<void> => {
  const instalment = {
    amount,
    paidAt: Timestamp.now(),
    method,
    transactionId: paymentId,
  };

  // Find an existing payment record for this reference.
  const existingSnap = await getDocs(
    query(
      collection(db, 'payments'),
      where('referenceId', '==', referenceId),
      limit(1),
    ),
  );

  let totalAmount = amount;
  let paidAmount = amount;
  let paymentDocId: string;

  if (!existingSnap.empty) {
    const docSnap = existingSnap.docs[0];
    const data = docSnap.data() as Payment;
    totalAmount = data.totalAmount;
    paidAmount = (data.paidAmount ?? 0) + amount;
    const remainingAmount = Math.max(0, totalAmount - paidAmount);
    const status = remainingAmount <= 0 ? 'paid' : 'partial';

    paymentDocId = docSnap.id;
    await updateDoc(doc(db, 'payments', paymentDocId), {
      instalments: [...(data.instalments ?? []), instalment],
      paidAmount,
      remainingAmount,
      status,
    });
  } else {
    // No plan existed — create a fully/partly paid record.
    const remainingAmount = 0;
    const created = await addDoc(collection(db, 'payments'), {
      customerId: '',
      customerName: '',
      referenceType,
      referenceId,
      totalAmount,
      paidAmount,
      remainingAmount,
      instalments: [instalment],
      paymentMode: 'full',
      maxInstalments: MAX_INSTALMENTS,
      status: 'paid',
      dueDate: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
    paymentDocId = created.id;
  }

  // Reflect payment state on the parent document.
  const remaining = Math.max(0, totalAmount - paidAmount);
  const refPaymentStatus = remaining <= 0 ? 'paid' : 'partial';
  const parentCollection = referenceType === 'booking' ? 'bookings' : 'preBookings';
  const parentRef = doc(db, parentCollection, referenceId);
  const parentSnap = await getDoc(parentRef);
  if (parentSnap.exists()) {
    await updateDoc(parentRef, { paymentStatus: refPaymentStatus });
  }
};

interface CreatePaymentArgs {

  customerId: string;
  customerName: string;
  referenceType: 'booking' | 'preBooking';
  referenceId: string;
  totalAmount: number;
  /** Number of days from now until the balance is due. */
  dueInDays?: number;
}

/**
 * Create a full-payment record (single instalment covering the total).
 * Returns the new payment document id.
 */
export async function createFullPayment(args: CreatePaymentArgs): Promise<string> {
  const due = new Date();
  due.setDate(due.getDate() + (args.dueInDays ?? 0));

  const ref = await addDoc(collection(db, 'payments'), {
    customerId: args.customerId,
    customerName: args.customerName,
    referenceType: args.referenceType,
    referenceId: args.referenceId,
    totalAmount: args.totalAmount,
    paidAmount: 0,
    remainingAmount: args.totalAmount,
    instalments: [],
    paymentMode: 'full',
    maxInstalments: MAX_INSTALMENTS,
    status: 'pending',
    dueDate: Timestamp.fromDate(due),
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

/**
 * Create an instalment plan that splits the total into up to MAX_INSTALMENTS
 * equal parts. Returns the new payment id and the per-instalment amount.
 */
export async function createInstalmentPlan(
  args: CreatePaymentArgs & { instalmentCount?: number },
): Promise<{ paymentId: string; instalmentAmount: number }> {
  const count = Math.min(args.instalmentCount ?? MAX_INSTALMENTS, MAX_INSTALMENTS);
  const instalmentAmount = Math.ceil(args.totalAmount / count);

  const due = new Date();
  due.setDate(due.getDate() + (args.dueInDays ?? 30));

  const ref = await addDoc(collection(db, 'payments'), {
    customerId: args.customerId,
    customerName: args.customerName,
    referenceType: args.referenceType,
    referenceId: args.referenceId,
    totalAmount: args.totalAmount,
    paidAmount: 0,
    remainingAmount: args.totalAmount,
    instalments: [],
    paymentMode: 'instalment',
    maxInstalments: MAX_INSTALMENTS,
    numberOfInstalments: count,
    instalmentAmount,
    status: 'pending',
    dueDate: Timestamp.fromDate(due),
    createdAt: Timestamp.now(),
  });
  return { paymentId: ref.id, instalmentAmount };
}

/** Fetch all payments belonging to a customer, newest first. */
export async function fetchCustomerPayments(customerId: string): Promise<Payment[]> {
  const snap = await getDocs(
    query(collection(db, 'payments'), where('customerId', '==', customerId)),
  );
  const payments = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Payment);
  return payments.sort(
    (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
  );
}

/** Fetch a single payment by id. */
export async function fetchPaymentById(id: string): Promise<Payment | null> {
  const snap = await getDoc(doc(db, 'payments', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Payment;
}
