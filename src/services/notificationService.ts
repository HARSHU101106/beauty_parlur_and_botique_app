import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { doc, updateDoc } from 'firebase/firestore';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { db } from './firebase';

// Show notifications while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permission, get the Expo push token, and save it to the
 * user's Firestore document. Returns the token, or undefined when unavailable
 * (e.g. running on a simulator/emulator or permission denied).
 *
 * Call after login: `await registerForPushNotifications(currentUser.uid)`.
 */
export const registerForPushNotifications = async (
  userId: string,
): Promise<string | undefined> => {
  if (!Device.isDevice) return; // must be a real device

  // Android requires a notification channel.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') return;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  const token = (
    await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    )
  ).data;

  // Save to Firestore.
  await updateDoc(doc(db, 'users', userId), { fcmToken: token });
  return token;
};

/**
 * Listen for taps on notifications and route to the relevant screen.
 * Pass a navigation object (or any handler) and call the returned cleanup fn.
 *
 * Usage in App.tsx:
 *   const sub = addNotificationResponseListener((type) => {
 *     if (type === 'booking') navigation.navigate('MyBookings');
 *     if (type === 'payment') navigation.navigate('MyPayments');
 *   });
 *   return () => sub.remove();
 */
export const addNotificationResponseListener = (
  onNavigate: (type: string | undefined) => void,
): Notifications.Subscription => {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as {
      type?: string;
    };
    onNavigate(data?.type);
  });
};
