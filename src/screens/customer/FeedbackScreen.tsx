import React, { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { hasReviewedService, submitFeedback } from '../../services/feedbackService';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../constants';
import { AccountStackParamList } from '../../navigation/types';

type Props = StackScreenProps<AccountStackParamList, 'Feedback'>;

const MIN_COMMENT_LENGTH = 20;

export default function FeedbackScreen({ route, navigation }: Props) {
  const { bookingId, serviceId, serviceName } = route.params;
  const { user } = useAuthStore();

  const [isChecking, setIsChecking] = useState(true);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        if (!user) return;
        try {
          setIsChecking(true);
          const reviewed = await hasReviewedService(user.uid, serviceId);
          if (mounted) setAlreadyReviewed(reviewed);
        } finally {
          if (mounted) setIsChecking(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }, [user, serviceId]),
  );

  const commentValid = comment.trim().length >= MIN_COMMENT_LENGTH;
  const canSubmit = rating > 0 && commentValid && !submitting;

  const onSubmit = async () => {
    if (!user || !canSubmit) return;
    try {
      setSubmitting(true);
      await submitFeedback({
        customerId: user.uid,
        customerName: user.name,
        serviceId,
        bookingId,
        rating,
        comment: comment.trim(),
      });
      setToast('Thanks for your review!');
      setTimeout(() => navigation.goBack(), 1200);
    } catch (e: any) {
      setToast(e?.message ?? 'Could not submit review');
      setSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (alreadyReviewed) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Ionicons name="checkmark-circle-outline" size={64} color={COLORS.success} />
        <Text className="mt-4 text-center" style={{ fontSize: 16, color: COLORS.text }}>
          You already reviewed this service.
        </Text>
        <Button
          mode="outlined"
          textColor={COLORS.primary}
          style={{ borderColor: COLORS.primary, marginTop: 20 }}
          onPress={() => navigation.goBack()}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: COLORS.text }}>
          {serviceName}
        </Text>
        <Text className="mt-1" style={{ color: COLORS.textMuted }}>
          Rate your experience
        </Text>

        {/* Star selector */}
        <View className="flex-row mt-5 mb-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setRating(i)}
              activeOpacity={0.7}
              className="mr-2"
            >
              <Ionicons
                name={rating >= i ? 'star' : 'star-outline'}
                size={40}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Comment */}
        <TextInput
          mode="outlined"
          label="Your review"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={5}
          style={{ marginTop: 16, minHeight: 120 }}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
        />
        <Text
          className="mt-1"
          style={{
            fontSize: 12,
            color: commentValid ? COLORS.textMuted : COLORS.error,
          }}
        >
          {comment.trim().length}/{MIN_COMMENT_LENGTH} characters minimum
        </Text>

        <Button
          mode="contained"
          buttonColor={COLORS.primary}
          loading={submitting}
          disabled={!canSubmit}
          onPress={onSubmit}
          style={{ marginTop: 24 }}
          contentStyle={{ paddingVertical: 4 }}
        >
          Submit Review
        </Button>
      </ScrollView>

      <Snackbar visible={!!toast} onDismiss={() => setToast(null)} duration={2500}>
        {toast ?? ''}
      </Snackbar>
    </View>
  );
}
