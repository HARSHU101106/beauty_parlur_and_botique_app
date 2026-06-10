import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { format } from 'date-fns';
import StarRating from './StarRating';
import { Feedback } from '../types';
import { COLORS } from '../constants';

interface Props {
  feedback: Feedback;
}

export default function FeedbackCard({ feedback }: Props) {
  const created = feedback.createdAt?.toDate
    ? format(feedback.createdAt.toDate(), 'dd MMM yyyy')
    : '';

  return (
    <View
      className="rounded-xl px-4 py-3 mb-3"
      style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }}
    >
      <View className="flex-row justify-between items-center mb-1">
        <Text style={{ fontWeight: 'bold', color: COLORS.text }}>
          {feedback.customerName}
        </Text>
        <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>{created}</Text>
      </View>
      <StarRating rating={feedback.rating} size={14} />
      {!!feedback.comment && (
        <Text className="mt-2" style={{ color: COLORS.text }}>
          {feedback.comment}
        </Text>
      )}
    </View>
  );
}
