import React, { useCallback, useMemo, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { fetchCustomerBookings } from '../../services/bookingService';
import { fetchActivePreBookings } from '../../services/productService';
import { useAuthStore } from '../../store/authStore';
import { Booking, PreBooking } from '../../types';
import { COLORS } from '../../constants';

interface NotificationItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  body: string;
  time: number; // sort key (ms)
}

export default function NotificationScreen() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [preBookings, setPreBookings] = useState<PreBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        if (!user) return;
        try {
          setLoading(true);
          const [b, p] = await Promise.all([
            fetchCustomerBookings(user.uid),
            fetchActivePreBookings(user.uid),
          ]);
          if (mounted) {
            setBookings(b);
            setPreBookings(p);
          }
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }, [user]),
  );

  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];

    bookings.forEach((b) => {
      const created = b.createdAt?.toMillis?.() ?? 0;
      if (b.status === 'confirmed') {
        items.push({
          id: `b-conf-${b.id}`,
          icon: 'checkmark-circle',
          color: COLORS.success,
          title: 'Booking confirmed',
          body: `${b.serviceName} on ${b.date} at ${b.timeSlot}`,
          time: created,
        });
      } else if (b.status === 'cancelled') {
        items.push({
          id: `b-canc-${b.id}`,
          icon: 'close-circle',
          color: COLORS.error,
          title: 'Booking cancelled',
          body: `${b.serviceName} on ${b.date}`,
          time: created,
        });
      } else if (b.status === 'completed' && b.hasReview !== true) {
        items.push({
          id: `b-rev-${b.id}`,
          icon: 'star',
          color: COLORS.warning,
          title: 'Leave a review',
          body: `How was your ${b.serviceName}? Tap My Bookings to review.`,
          time: created,
        });
      } else {
        items.push({
          id: `b-pend-${b.id}`,
          icon: 'time',
          color: COLORS.primary,
          title: 'Booking pending',
          body: `${b.serviceName} on ${b.date} at ${b.timeSlot}`,
          time: created,
        });
      }
    });

    preBookings.forEach((p) => {
      const expires = p.expiresAt?.toMillis?.() ?? 0;
      const daysLeft = Math.max(0, Math.ceil((expires - Date.now()) / (24 * 60 * 60 * 1000)));
      items.push({
        id: `p-${p.id}`,
        icon: 'bag-check',
        color: daysLeft <= 3 ? COLORS.warning : COLORS.primary,
        title: 'Pre-order reserved',
        body: `${p.productName} — collect within ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`,
        time: p.createdAt?.toMillis?.() ?? 0,
      });
    });

    return items.sort((a, b) => b.time - a.time);
  }, [bookings, preBookings]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-24">
            <Ionicons name="notifications-off-outline" size={48} color={COLORS.textMuted} />
            <Text style={{ color: COLORS.textMuted, marginTop: 8 }}>
              No notifications yet.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            className="flex-row items-start rounded-2xl p-4 mb-3"
            style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }}
          >
            <Ionicons name={item.icon} size={22} color={item.color} />
            <View className="flex-1 ml-3">
              <Text style={{ fontWeight: 'bold', color: COLORS.text }}>{item.title}</Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 2 }}>
                {item.body}
              </Text>
              {item.time > 0 && (
                <Text style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 4 }}>
                  {format(new Date(item.time), 'dd MMM yyyy, hh:mm a')}
                </Text>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}
