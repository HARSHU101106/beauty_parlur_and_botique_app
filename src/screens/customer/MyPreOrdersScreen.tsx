import React, { useCallback, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { format } from 'date-fns';
import { fetchCustomerPreBookings } from '../../services/productService';
import { useAuthStore } from '../../store/authStore';
import { PreBooking } from '../../types';
import { COLORS } from '../../constants';
import { AccountStackParamList } from '../../navigation/types';

type Props = StackScreenProps<AccountStackParamList, 'MyPreOrders'>;

const STATUS_COLORS: Record<PreBooking['status'], string> = {
  active: COLORS.primary,
  collected: COLORS.success,
  expired: COLORS.error,
};

export default function MyPreOrdersScreen(_: Props) {
  const { user } = useAuthStore();
  const [preOrders, setPreOrders] = useState<PreBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        if (!user) return;
        try {
          setIsLoading(true);
          const data = await fetchCustomerPreBookings(user.uid);
          if (mounted) setPreOrders(data);
        } catch (e: any) {
          if (mounted) setError(e?.message ?? 'Failed to load pre-orders');
        } finally {
          if (mounted) setIsLoading(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }, [user]),
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text style={{ color: COLORS.error, textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={preOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Text style={{ color: COLORS.textMuted }}>No purchases yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            className="rounded-2xl p-4 mb-3"
            style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }}
          >
            <View className="flex-row justify-between items-center">
              <Text
                numberOfLines={1}
                style={{ fontWeight: 'bold', color: COLORS.text, flex: 1 }}
              >
                {item.productName}
              </Text>
              <View
                className="px-2 py-1 rounded-full ml-2"
                style={{ backgroundColor: STATUS_COLORS[item.status] }}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mt-2">
              <Ionicons name="cube-outline" size={14} color={COLORS.textMuted} />
              <Text style={{ color: COLORS.textMuted, fontSize: 13, marginLeft: 6 }}>
                Qty {item.quantity} · ₹{item.totalAmount}
              </Text>
            </View>

            <View className="flex-row items-center mt-1">
              <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
              <Text style={{ color: COLORS.textMuted, fontSize: 12, marginLeft: 6 }}>
                {item.createdAt?.toDate
                  ? `Reserved ${format(item.createdAt.toDate(), 'dd MMM yyyy')}`
                  : ''}
                {item.status === 'active' && item.expiresAt?.toDate
                  ? ` · Collect by ${format(item.expiresAt.toDate(), 'dd MMM yyyy')}`
                  : ''}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
