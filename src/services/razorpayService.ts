import { Platform } from 'react-native';
import Constants from 'expo-constants';

const RAZORPAY_KEY_ID =
  ((Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>)
    .razorpayKeyId ?? '';

export interface RazorpayOptions {
  amount: number; // in rupees
  name: string;
  description: string;
  prefillName?: string;
  prefillEmail?: string;
  prefillContact?: string;
}

export interface RazorpayResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

/**
 * Opens Razorpay Checkout.
 *
 * - Web: loads the Razorpay checkout.js script and opens the modal.
 * - Native: requires the `react-native-razorpay` module in a custom dev build.
 *   It is loaded lazily so the app still bundles in Expo Go (where the native
 *   module is unavailable) — in that case a clear error is returned.
 *
 * NOTE: For production you must create the order server-side (with your key
 * secret) and pass `order_id` here. The secret must never live in the app.
 */
export async function openRazorpayCheckout(
  options: RazorpayOptions,
): Promise<RazorpayResult> {
  if (!RAZORPAY_KEY_ID) {
    return { success: false, error: 'Razorpay key is not configured' };
  }

  const amountPaise = Math.round(options.amount * 100);

  if (Platform.OS === 'web') {
    return openWebCheckout(amountPaise, options);
  }
  return openNativeCheckout(amountPaise, options);
}

function openWebCheckout(
  amountPaise: number,
  options: RazorpayOptions,
): Promise<RazorpayResult> {
  return new Promise((resolve) => {
    const launch = () => {
      // @ts-ignore - Razorpay is injected by the checkout script
      const RazorpayCtor = (globalThis as any).Razorpay;
      if (!RazorpayCtor) {
        resolve({ success: false, error: 'Razorpay failed to load' });
        return;
      }
      const rzp = new RazorpayCtor({
        key: RAZORPAY_KEY_ID,
        amount: amountPaise,
        currency: 'INR',
        name: options.name,
        description: options.description,
        prefill: {
          name: options.prefillName,
          email: options.prefillEmail,
          contact: options.prefillContact,
        },
        handler: (response: { razorpay_payment_id: string }) =>
          resolve({ success: true, paymentId: response.razorpay_payment_id }),
        modal: {
          ondismiss: () =>
            resolve({ success: false, error: 'Payment cancelled' }),
        },
      });
      rzp.open();
    };

    // @ts-ignore
    if ((globalThis as any).Razorpay) {
      launch();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = launch;
    script.onerror = () =>
      resolve({ success: false, error: 'Could not load Razorpay' });
    document.body.appendChild(script);
  });
}

async function openNativeCheckout(
  amountPaise: number,
  options: RazorpayOptions,
): Promise<RazorpayResult> {
  try {
    // Lazy require so Expo Go (no native module) still bundles.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RazorpayCheckout = require('react-native-razorpay').default;
    const data = await RazorpayCheckout.open({
      key: RAZORPAY_KEY_ID,
      amount: amountPaise,
      currency: 'INR',
      name: options.name,
      description: options.description,
      prefill: {
        name: options.prefillName,
        email: options.prefillEmail,
        contact: options.prefillContact,
      },
    });
    return { success: true, paymentId: data.razorpay_payment_id };
  } catch (e: any) {
    if (e?.code === 'MODULE_NOT_FOUND') {
      return {
        success: false,
        error:
          'Razorpay native module not available. Build a custom dev client to test payments on device.',
      };
    }
    return { success: false, error: e?.description ?? 'Payment failed' };
  }
}
