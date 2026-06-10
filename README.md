# Beauty Parlour & Boutique App

A full-stack mobile application for managing beauty parlour services and boutique product sales. The app is built with **Expo + React Native + TypeScript** and uses **Firebase** for backend services, storage, authentication, notifications, and serverless automation.

## Features

### Customer features
- Browse beauty services and boutique products
- View service and product details
- Book appointments
- Create pre-bookings / pre-orders
- Track bookings, payments, and pre-orders
- Submit feedback and view feedback history
- Receive notifications and booking reminders
- Manage account details
- Dedicated kids section

### Admin features
- Admin dashboard
- Manage services
- Manage products
- View and manage customer bookings
- View and manage pre-orders
- Monitor payments
- View customer records

### Authentication features
- Sign up and log in
- Forgot password flow
- Optional Google sign-in support

### Backend / automation features
- Firebase Cloud Functions for scheduled and webhook-based tasks
- Daily expiry of outdated pre-bookings
- Hourly booking reminder notifications
- Razorpay webhook handling for payment capture updates

## Tech stack

### Frontend
- Expo 56
- React Native
- TypeScript
- React Navigation
- NativeWind + Tailwind CSS
- React Native Paper
- Zustand

### Backend & integrations
- Firebase Authentication
- Cloud Firestore
- Firebase Cloud Storage
- Firebase Cloud Functions
- Expo Notifications
- Razorpay payments
- Google OAuth (optional)

## Project structure

```text
.
├── App.tsx
├── app.config.ts
├── functions/              # Firebase Cloud Functions
├── scripts/                # Utility scripts for seeding and admin setup
├── src/
│   ├── components/         # Reusable UI components
│   ├── constants/          # App constants
│   ├── navigation/         # Navigation setup
│   ├── screens/
│   │   ├── admin/          # Admin screens
│   │   ├── auth/           # Authentication screens
│   │   └── customer/       # Customer screens
│   ├── services/           # Firebase, booking, payment, product and notification services
│   ├── store/              # Zustand state management
│   ├── types/              # Type definitions
│   └── utils/              # Utility helpers
├── assets/                 # Static assets and icons
├── firestore.rules
├── storage.rules
└── firebase.json
```

## Main screens

### Customer screens
- `HomeScreen`
- `ServiceListScreen`
- `ServiceDetailScreen`
- `ProductListScreen`
- `ProductDetailScreen`
- `BookingScreen`
- `MyBookingsScreen`
- `MyPaymentsScreen`
- `PaymentDetailScreen`
- `PreBookScreen`
- `MyPreOrdersScreen`
- `FeedbackScreen`
- `FeedbackHistoryScreen`
- `NotificationScreen`
- `AccountScreen`
- `KidsScreen`

### Admin screens
- `DashboardScreen`
- `ServicesScreen`
- `ProductsScreen`
- `AdminBookingsScreen`
- `AdminPreOrdersScreen`
- `AdminPaymentsScreen`
- `CustomersScreen`

### Auth screens
- `LoginScreen`
- `SignupScreen`
- `ForgotPasswordScreen`

## Prerequisites

Before running the project, make sure you have:
- Node.js installed
- npm installed
- Expo CLI / Expo tooling
- A Firebase project
- A Razorpay account if you want to test live payment flows

## Installation

1. Clone the repository:

```bash
git clone https://github.com/HARSHU101106/beauty_parlur_and_botique_app.git
cd beauty_parlur_and_botique_app
```

2. Install dependencies:

```bash
npm install
```

3. Install Cloud Functions dependencies:

```bash
cd functions
npm install
cd ..
```

4. Create your environment file:

```bash
cp .env.example .env
```

5. Fill in the required values in `.env`.

## Environment variables

The app reads configuration from `.env` through `app.config.ts`.

Required / supported variables:

```env
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
RAZORPAY_KEY_ID=
GOOGLE_WEB_CLIENT_ID=
GOOGLE_ANDROID_CLIENT_ID=
GOOGLE_IOS_CLIENT_ID=
```

## Running the app

Start the Expo development server:

```bash
npm start
```

Platform-specific commands:

```bash
npm run android
npm run ios
npm run web
```

## Utility scripts

The project includes helper scripts:

```bash
npm run seed               # Seed Firestore data
npm run replace-services   # Replace parlour services data
npm run set-admin          # Set admin user privileges
```

## Firebase Cloud Functions

Inside the `functions` folder, the project includes serverless functions for:
- Expiring old pre-bookings on a schedule
- Sending booking reminder notifications every hour
- Processing Razorpay payment webhook events

Useful commands:

```bash
cd functions
npm run build
npm run serve
npm run shell
npm run deploy
npm run logs
```

## Firebase configuration files

This repository includes:
- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`
- `.firebaserc`

These help configure hosting/emulators, Firestore, indexes, and storage rules.

## Payments

The app integrates Razorpay for payment handling. If `RAZORPAY_KEY_ID` is left empty, the app is designed to remain in placeholder mode rather than crash.

## Notes

- `google-services.json` is optional and only used when present locally.
- The app uses Firebase JS SDK configuration from environment variables.
- Cloud Functions use Node.js 20.
- Expo Notifications and Expo Image Picker are configured as plugins.

## License

This project is licensed under the terms of the included `LICENSE` file.
