import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Beauty Parlour',
  slug: 'beauty-parlour-app',
  owner: 'harshini101106',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.beautyapp.app',
  },
  android: {
    package: 'com.beautyapp.app',
    versionCode: 1,
    googleServicesFile: './google-services.json',
    permissions: ['CAMERA', 'RECORD_AUDIO', 'READ_EXTERNAL_STORAGE'],
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-notifications',
    [
      'expo-image-picker',
      {
        photosPermission:
          'Allow Beauty Parlour to access your photos to upload product and service images.',
      },
    ],
  ],
  extra: {
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.FIREBASE_APP_ID,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
    googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
    googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    eas: {
      projectId: '5e7f79d3-bdd4-4eb0-a409-bf23b669036b',
    },
  },
});
