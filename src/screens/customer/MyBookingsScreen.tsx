import React, { useCallback, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { fetchCustomerBookings } from '../../services/bookingService';
import { useAuthStore } from '../../store/authStore';
import { Booking } from '../../types';
import { COLORS } from '../../constants';
import { AccountStackParamList } from '../../navigation/types';

type Props = StackScreenProps<AccountStackParamList, 'MyBookings'>;

const STATUS_COLORS: Record<Booking['status'], string> = {
  pending: COLORS.warning,
  confirmed: COLORS.primary,
  completed: COLORS.success,
  cancelled: COLORS.error,
};

export default function MyBookingsScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        if (!user) return;
        try {
          setIsLoading(true);
          const data = await fetchCustomerBookings(user.uid);
          if (mounted) setBookings(data);
        } catch (e: any) {
          if (mounted) setError(e?.message ?? 'Failed to load bookings');
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
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Text style={{ color: COLORS.textMuted }}>No bookings yet.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const canReview = item.status === 'completed' && item.hasReview !== true;
          return (
            <View
              className="rounded-2xl p-4 mb-3"
              style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }}
            >
              <View className="flex-row justify-between items-center">
                <Text
                  numberOfLines={1}
                  style={{ fontWeight: 'bold', color: COLORS.text, flex: 1 }}
                >
                  {item.serviceName}
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
                <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                <Text style={{ color: COLORS.textMuted, fontSize: 13, marginLeft: 6 }}>
                  {item.date} · {item.timeSlot}
                </Text>
              </View>

              <View className="flex-row justify-between items-center mt-1">
                <Text style={{ color: COLORS.text, fontSize: 13 }}>₹{item.totalAmount}</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                  {item.paymentStatus.toUpperCase()}
                </Text>
              </View>

              {canReview && (
                <Button
                  mode="contained"
                  buttonColor={COLORS.primary}
                  icon="star"
                  style={{ marginTop: 12 }}
                  onPress={() =>
                    navigation.navigate('Feedback', {
                      bookingId: item.id,
                      serviceId: item.serviceId,
                      serviceName: item.serviceName,
                    })
                  }
                >
                  Leave a Review
                </Button>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}
