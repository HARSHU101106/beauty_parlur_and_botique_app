/**
 * Root navigation param list. Extend as more navigators/screens are added.
 */
import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  CustomerTabs: undefined;
  AdminDrawer: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Notifications: undefined;
};

export type BeautyStackParamList = {
  ServiceList: undefined;
  ServiceDetail: { serviceId: string };
  Booking: { serviceId: string };
};

export type BoutiqueStackParamList = {
  ProductList: undefined;
  ProductDetail: { productId: string };
  PreBook: { productId: string };
};

export type KidsStackParamList = {
  KidsHome: undefined;
  ServiceDetail: { serviceId: string };
  Booking: { serviceId: string };
  ProductDetail: { productId: string };
  PreBook: { productId: string };
};

export type AccountStackParamList = {
  Account: undefined;
  MyBookings: undefined;
  MyPayments: undefined;
  PaymentDetail: { paymentId: string };
  Feedback: { bookingId: string; serviceId: string; serviceName: string };
  FeedbackHistory: undefined;
};

export type CustomerTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList> | undefined;
  BeautyTab: NavigatorScreenParams<BeautyStackParamList> | undefined;
  BoutiqueTab: NavigatorScreenParams<BoutiqueStackParamList> | undefined;
  KidsTab: NavigatorScreenParams<KidsStackParamList> | undefined;
  AccountTab: NavigatorScreenParams<AccountStackParamList> | undefined;
};

export type AdminDrawerParamList = {
  Dashboard: undefined;
  Bookings: undefined;
  PreOrders: undefined;
  Payments: undefined;
  Services: undefined;
  Products: undefined;
  Customers: undefined;
};

