import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import * as crypto from 'crypto';

admin.initializeApp();
const db = admin.firestore();
const { Timestamp } = admin.firestore;

// Razorpay webhook secret (set with: firebase functions:secrets:set RAZORPAY_WEBHOOK_SECRET)
const RAZORPAY_WEBHOOK_SECRET = defineSecret('RAZORPAY_WEBHOOK_SECRET');

/**
 * FUNCTION 1: Expire pre-bookings daily at midnight IST.
 * Marks every active pre-booking whose `expiresAt` has passed as `expired`.
 */
export const expirePreBookings = onSchedule(
  { schedule: '0 0 * * *', timeZone: 'Asia/Kolkata' },
  async () => {
    const now = Timestamp.now();
    const snapshot = await db
      .collection('preBookings')
      .where('status', '==', 'active')
      .where('expiresAt', '<=', now)
      .get();

    const batch = db.batch();
    snapshot.forEach((doc) => {
      batch.update(doc.ref, { status: 'expired' });
    });
    await batch.commit();

    logger.info(`Expired ${snapshot.size} pre-bookings`);
  },
);

/**
 * FUNCTION 2: Booking reminder notification.
 * Runs hourly and notifies customers whose confirmed bookings are tomorrow.
 */
export const sendBookingReminder = onSchedule(
  { schedule: '0 * * * *', timeZone: 'Asia/Kolkata' },
  async () => {
    // Compute "tomorrow" in IST (Asia/Kolkata, UTC+5:30) regardless of the
    // runtime timezone, since booking `date` values are stored in IST.
    const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
    const istTomorrow = new Date(Date.now() + IST_OFFSET_MS + 24 * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr =
      `${istTomorrow.getUTCFullYear()}-` +
      `${pad(istTomorrow.getUTCMonth() + 1)}-` +
      `${pad(istTomorrow.getUTCDate())}`;

    const bookings = await db
      .collection('bookings')
      .where('date', '==', dateStr)
      .where('status', '==', 'confirmed')
      .get();

    let sent = 0;
    await Promise.all(
      bookings.docs.map(async (bookingDoc) => {
        const booking = bookingDoc.data();

        // Fetch the customer's FCM token from users/{uid}.fcmToken
        const userSnap = await db.collection('users').doc(booking.customerId).get();
        const userFcmToken = userSnap.get('fcmToken') as string | undefined;
        if (!userFcmToken) {
          return;
        }

        try {
          await admin.messaging().send({
            token: userFcmToken,
            notification: {
              title: 'Appointment Tomorrow!',
              body: `Your ${booking.serviceName} is at ${booking.timeSlot}`,
            },
          });
          sent += 1;
        } catch (err) {
          logger.warn(`Failed to send reminder for booking ${bookingDoc.id}`, err);
        }
      }),
    );

    logger.info(`Sent ${sent} booking reminders for ${dateStr}`);
  },
);

/**
 * FUNCTION 3: Razorpay webhook.
 * Verifies the signature, then on `payment.captured` marks the payment as paid
 * and updates the associated booking's paymentStatus.
 */
export const razorpayWebhook = onRequest(
  { secrets: [RAZORPAY_WEBHOOK_SECRET] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // Verify the Razorpay webhook signature using HMAC SHA256.
    const signature = req.headers['x-razorpay-signature'] as string | undefined;
    const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody ?? Buffer.from(JSON.stringify(req.body));

    const expected = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET.value())
      .update(rawBody)
      .digest('hex');

    if (!signature || expected.length !== signature.length ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
      logger.warn('Razorpay webhook signature verification failed');
      res.status(400).send('Invalid signature');
      return;
    }

    const event = req.body?.event as string | undefined;

    if (event === 'payment.captured') {
      const entity = req.body?.payload?.payment?.entity ?? {};
      const notes = entity.notes ?? {};
      const paymentId: string | undefined = notes.paymentId;
      const referenceId: string | undefined = notes.referenceId;
      const referenceType: string | undefined = notes.referenceType;

      try {
        if (paymentId) {
          const payRef = db.collection('payments').doc(paymentId);
          const paySnap = await payRef.get();
          if (paySnap.exists) {
            const total = (paySnap.get('totalAmount') as number) ?? 0;
            await payRef.update({
              status: 'paid',
              paidAmount: total,
              remainingAmount: 0,
            });
          }
        }

        if (referenceId) {
          const parentCollection = referenceType === 'preBooking' ? 'preBookings' : 'bookings';
          await db
            .collection(parentCollection)
            .doc(referenceId)
            .update({ paymentStatus: 'paid' });
        }

        logger.info(`Processed payment.captured for payment ${entity.id ?? ''}`);
      } catch (err) {
        logger.error('Error processing Razorpay webhook', err);
        res.status(500).send('Processing error');
        return;
      }
    }

    res.status(200).json({ status: 'ok' });
  },
);
