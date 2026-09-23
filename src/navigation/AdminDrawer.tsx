import React from 'react';
import { Alert, Platform } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/admin/DashboardScreen';
import BookingsScreen from '../screens/admin/AdminBookingsScreen';
import PreOrdersScreen from '../screens/admin/AdminPreOrdersScreen';
import PaymentsScreen from '../screens/admin/AdminPaymentsScreen';
import ServicesScreen from '../screens/admin/ServicesScreen';
import ProductsScreen from '../screens/admin/ProductsScreen';
import CustomersScreen from '../screens/admin/CustomersScreen';
import { COLORS } from '../constants';
import { useAuthStore } from '../store/authStore';
import { AdminDrawerParamList } from './types';

const Drawer = createDrawerNavigator<AdminDrawerParamList>();

const icon = (name: keyof typeof Ionicons.glyphMap) =>
  ({ color, size }: { color: string; size: number }) =>
    <Ionicons name={name} size={size} color={color} />;

function AdminDrawerContent(props: DrawerContentComponentProps) {
  const logout = useAuthStore((s) => s.logout);

  const confirmLogout = () => {
    const doLogout = () => {
      logout().catch(() => {
        // RootNavigator listens to auth state and will swap stacks on success.
      });
    };

    // window.confirm works on web; Alert is used on native.
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm('Are you sure you want to log out?')) doLogout();
      return;
    }
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: doLogout },
    ]);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        labelStyle={{ color: COLORS.error }}
        icon={({ size }) => <Ionicons name="log-out-outline" size={size} color={COLORS.error} />}
        onPress={confirmLogout}
        style={{ marginTop: 'auto' }}
      />
    </DrawerContentScrollView>
  );
}

export default function AdminDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <AdminDrawerContent {...props} />}
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
