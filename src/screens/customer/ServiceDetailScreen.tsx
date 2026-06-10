import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import StarRating from '../../components/StarRating';
import FeedbackCard from '../../components/FeedbackCard';
import {
  fetchServiceById,
  fetchServiceFeedback,
  fetchServiceRatingSummary,
} from '../../services/serviceService';
import { Service, Feedback } from '../../types';
import { COLORS } from '../../constants';
import { BeautyStackParamList } from '../../navigation/types';

type Props = StackScreenProps<BeautyStackParamList, 'ServiceDetail'>;

export default function ServiceDetailScreen({ route, navigation }: Props) {
  const { serviceId } = route.params;
  const [service, setService] = useState<Service | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const [svc, fb, sum] = await Promise.all([
          fetchServiceById(serviceId),
          fetchServiceFeedback(serviceId, 5),
          fetchServiceRatingSummary(serviceId),
        ]);
        if (!mounted) return;
        if (!svc) {
          setError('Service not found');
          return;
        }
        setService(svc);
        setFeedback(fb);
        setSummary(sum);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Failed to load service');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [serviceId]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !service) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text style={{ color: COLORS.error, textAlign: 'center' }}>
          {error ?? 'Service not found'}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Image
          source={{ uri: service.imageUrl }}
          style={{ width: '100%', height: 220, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
          resizeMode="cover"
        />

        <View className="px-5 pt-4">
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.text }}>
            {service.name}
          </Text>

          <View className="flex-row items-center mt-2">
            <Text style={{ fontSize: 22, color: COLORS.primary, fontWeight: 'bold' }}>
              ₹{service.price}
            </Text>
            <Text className="ml-4" style={{ color: COLORS.textMuted }}>
              {service.duration} min
            </Text>
          </View>

          <View className="flex-row items-center mt-2">
            <StarRating rating={summary.average} allowHalf size={18} />
            <Text className="ml-2" style={{ color: COLORS.text, fontWeight: '600' }}>
              {summary.count > 0 ? summary.average.toFixed(1) : 'No ratings'}
            </Text>
            {summary.count > 0 && (
              <Text className="ml-2" style={{ color: COLORS.textMuted }}>
                · {summary.count} review{summary.count === 1 ? '' : 's'}
              </Text>
            )}
          </View>

          <Text className="mt-6" style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.text }}>
            About this service
          </Text>
          <Text className="mt-2" style={{ color: COLORS.text, lineHeight: 22 }}>
            {service.description}
          </Text>

          <Text className="mt-6 mb-3" style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.text }}>
            Reviews
          </Text>
          {feedback.length === 0 ? (
            <Text style={{ color: COLORS.textMuted }}>No reviews yet.</Text>
          ) : (
            feedback.map((fb) => <FeedbackCard key={fb.id} feedback={fb} />)
          )}
        </View>
      </ScrollView>

      <View
        className="px-5 py-3"
        style={{ borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: '#fff' }}
      >
        <Button
          mode="contained"
          buttonColor={COLORS.primary}
          onPress={() => navigation.navigate('Booking', { serviceId: service.id })}
          contentStyle={{ paddingVertical: 4 }}
        >
          Book Now
        </Button>
      </View>
    </View>
  );
}
