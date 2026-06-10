import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/admin/DashboardScreen';
import BookingsScreen from '../screens/admin/AdminBookingsScreen';
import PreOrdersScreen from '../screens/admin/AdminPreOrdersScreen';
import PaymentsScreen from '../screens/admin/AdminPaymentsScreen';
import ServicesScreen from '../screens/admin/ServicesScreen';
import ProductsScreen from '../screens/admin/ProductsScreen';
import CustomersScreen from '../screens/admin/CustomersScreen';
import { COLORS } from '../constants';
import { AdminDrawerParamList } from './types';

const Drawer = createDrawerNavigator<AdminDrawerParamList>();

const icon = (name: keyof typeof Ionicons.glyphMap) =>
  ({ color, size }: { color: string; size: number }) =>
    <Ionicons name={name} size={size} color={color} />;

export default function AdminDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerTintColor: COLORS.admin,
        drawerActiveTintColor: COLORS.admin,
        drawerInactiveTintColor: COLORS.text,
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ drawerIcon: icon('grid') }} />
      <Drawer.Screen name="Bookings" component={BookingsScreen} options={{ drawerIcon: icon('calendar') }} />
      <Drawer.Screen name="PreOrders" component={PreOrdersScreen} options={{ title: 'Pre-orders', drawerIcon: icon('time') }} />
      <Drawer.Screen name="Payments" component={PaymentsScreen} options={{ drawerIcon: icon('card') }} />
      <Drawer.Screen name="Services" component={ServicesScreen} options={{ drawerIcon: icon('cut') }} />
      <Drawer.Screen name="Products" component={ProductsScreen} options={{ drawerIcon: icon('bag') }} />
      <Drawer.Screen name="Customers" component={CustomersScreen} options={{ drawerIcon: icon('people') }} />
    </Drawer.Navigator>
  );
}
