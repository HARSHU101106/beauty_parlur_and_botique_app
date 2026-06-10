import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/customer/HomeScreen';
import NotificationScreen from '../screens/customer/NotificationScreen';
import ServiceListScreen from '../screens/customer/ServiceListScreen';
import ServiceDetailScreen from '../screens/customer/ServiceDetailScreen';
import BookingScreen from '../screens/customer/BookingScreen';
import ProductListScreen from '../screens/customer/ProductListScreen';
import ProductDetailScreen from '../screens/customer/ProductDetailScreen';
import PreBookScreen from '../screens/customer/PreBookScreen';
import KidsScreen from '../screens/customer/KidsScreen';
import AccountScreen from '../screens/customer/AccountScreen';
import MyBookingsScreen from '../screens/customer/MyBookingsScreen';
import MyPreOrdersScreen from '../screens/customer/MyPreOrdersScreen';
import MyPaymentsScreen from '../screens/customer/MyPaymentsScreen';
import PaymentDetailScreen from '../screens/customer/PaymentDetailScreen';
import FeedbackScreen from '../screens/customer/FeedbackScreen';
import FeedbackHistoryScreen from '../screens/customer/FeedbackHistoryScreen';
import { COLORS } from '../constants';
import {
  HomeStackParamList,
  BeautyStackParamList,
  BoutiqueStackParamList,
  KidsStackParamList,
  AccountStackParamList,
  CustomerTabParamList,
} from './types';

const HomeStackNav = createStackNavigator<HomeStackParamList>();
const BeautyStackNav = createStackNavigator<BeautyStackParamList>();
const BoutiqueStackNav = createStackNavigator<BoutiqueStackParamList>();
const KidsStackNav = createStackNavigator<KidsStackParamList>();
const AccountStackNav = createStackNavigator<AccountStackParamList>();
const Tab = createBottomTabNavigator<CustomerTabParamList>();

function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerTintColor: COLORS.primary }}>
      <HomeStackNav.Screen name="Home" component={HomeScreen} />
      <HomeStackNav.Screen name="Notifications" component={NotificationScreen} />
    </HomeStackNav.Navigator>
  );
}

function BeautyStack() {
  return (
    <BeautyStackNav.Navigator screenOptions={{ headerTintColor: COLORS.primary }}>
      <BeautyStackNav.Screen name="ServiceList" component={ServiceListScreen} options={{ title: 'Services' }} />
      <BeautyStackNav.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ title: 'Service Details' }} />
      <BeautyStackNav.Screen name="Booking" component={BookingScreen} options={{ title: 'Book Appointment' }} />
    </BeautyStackNav.Navigator>
  );
}

function BoutiqueStack() {
  return (
    <BoutiqueStackNav.Navigator screenOptions={{ headerTintColor: COLORS.primary }}>
      <BoutiqueStackNav.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Products' }} />
      <BoutiqueStackNav.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Details' }} />
      <BoutiqueStackNav.Screen name="PreBook" component={PreBookScreen} options={{ title: 'Pre-Book' }} />
    </BoutiqueStackNav.Navigator>
  );
}

function KidsStack() {
  return (
    <KidsStackNav.Navigator screenOptions={{ headerTintColor: COLORS.secondary }}>
      <KidsStackNav.Screen name="KidsHome" component={KidsScreen} options={{ title: 'Kids Corner' }} />
      <KidsStackNav.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ title: 'Service Details' }} />
      <KidsStackNav.Screen name="Booking" component={BookingScreen} options={{ title: 'Book Appointment' }} />
      <KidsStackNav.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Details' }} />
      <KidsStackNav.Screen name="PreBook" component={PreBookScreen} options={{ title: 'Pre-Book' }} />
    </KidsStackNav.Navigator>
  );
}

function AccountStack() {
  return (
    <AccountStackNav.Navigator screenOptions={{ headerTintColor: COLORS.primary }}>
      <AccountStackNav.Screen name="Account" component={AccountScreen} />
      <AccountStackNav.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'My Bookings' }} />
      <AccountStackNav.Screen name="MyPreOrders" component={MyPreOrdersScreen} options={{ title: 'My Purchases' }} />
      <AccountStackNav.Screen name="MyPayments" component={MyPaymentsScreen} options={{ title: 'My Payments' }} />
      <AccountStackNav.Screen name="PaymentDetail" component={PaymentDetailScreen} options={{ title: 'Payment Details' }} />
      <AccountStackNav.Screen name="Feedback" component={FeedbackScreen} options={{ title: 'Leave a Review' }} />
      <AccountStackNav.Screen name="FeedbackHistory" component={FeedbackHistoryScreen} options={{ title: 'My Feedback' }} />
    </AccountStackNav.Navigator>
  );
}

export default function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ color, size }) => {
          const map: Record<keyof CustomerTabParamList, keyof typeof Ionicons.glyphMap> = {
            HomeTab: 'home',
            BeautyTab: 'cut',
            BoutiqueTab: 'bag',
            KidsTab: 'happy',
            AccountTab: 'person',
          };
          return <Ionicons name={map[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="BeautyTab" component={BeautyStack} options={{ title: 'Beauty' }} />
      <Tab.Screen name="BoutiqueTab" component={BoutiqueStack} options={{ title: 'Boutique' }} />
      <Tab.Screen name="KidsTab" component={KidsStack} options={{ title: 'Kids' }} />
      <Tab.Screen name="AccountTab" component={AccountStack} options={{ title: 'Account' }} />
    </Tab.Navigator>
  );
}
