import React, { useCallback, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { fetchCustomerFeedback } from '../../services/feedbackService';
import { fetchActiveServices } from '../../services/serviceService';
import { useAuthStore } from '../../store/authStore';
import { Feedback } from '../../types';
import StarRating from '../../components/StarRating';
import { COLORS } from '../../constants';

export default function FeedbackHistoryScreen() {
  const { user } = useAuthStore();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [serviceNames, setServiceNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        if (!user) return;
        try {
          setLoading(true);
          const [fb, services] = await Promise.all([
            fetchCustomerFeedback(user.uid),
            fetchActiveServices(),
          ]);
          if (mounted) {
            setFeedback(fb);
            const map: Record<string, string> = {};
            services.forEach((s) => (map[s.id] = s.name));
            setServiceNames(map);
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
        data={feedback}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-24">
            <Ionicons name="chatbox-ellipses-outline" size={48} color={COLORS.textMuted} />
            <Text style={{ color: COLORS.textMuted, marginTop: 8 }}>
              You haven't left any reviews yet.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const created = item.createdAt?.toDate
            ? format(item.createdAt.toDate(), 'dd MMM yyyy')
            : '';
          return (
            <View
              className="rounded-2xl px-4 py-3 mb-3"
              style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }}
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text style={{ fontWeight: 'bold', color: COLORS.text }}>
                  {serviceNames[item.serviceId] ?? 'Service'}
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>{created}</Text>
              </View>
              <StarRating rating={item.rating} size={14} />
              {!!item.comment && (
                <Text className="mt-2" style={{ color: COLORS.text }}>
                  {item.comment}
                </Text>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}
