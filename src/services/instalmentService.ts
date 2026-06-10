import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Payment, Instalment } from '../types';

/**
 * Record a single instalment payment against an existing plan and update the
 * paid/remaining totals and status. Also updates the linked booking/preBooking
 * payment status.
 */
export const recordInstalment = async (
  paymentId: string,
  amount: number,
  transactionId: string,
  method: Instalment['method'] = 'razorpay',
): Promise<void> => {
  const paymentRef = doc(db, 'payments', paymentId);
  const snap = await getDoc(paymentRef);
  if (!snap.exists()) {
    throw new Error('Payment plan not found');
  }
  const payment = snap.data() as Payment;

  const newInstalment: Instalment = {
    amount,
    paidAt: Timestamp.now(),
    method,
    transactionId,
  };
  const newPaidAmount = payment.paidAmount + amount;
  const newRemaining = Math.max(0, payment.totalAmount - newPaidAmount);
  const status = newRemaining === 0 ? 'paid' : 'partial';

  await updateDoc(paymentRef, {
    paidAmount: newPaidAmount,
    remainingAmount: newRemaining,
    instalments: arrayUnion(newInstalment),
    status,
  });

  // Reflect status on the parent booking / preBooking document.
  const parentCollection =
    payment.referenceType === 'booking' ? 'bookings' : 'preBookings';
  const parentRef = doc(db, parentCollection, payment.referenceId);
  const parentSnap = await getDoc(parentRef);
  if (parentSnap.exists()) {
    await updateDoc(parentRef, { paymentStatus: status });
  }
};
