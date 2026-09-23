import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

interface Props {
  rating: number;
  size?: number;
  /** Render half stars for fractional ratings (used in summaries). */
  allowHalf?: boolean;
}

/**
 * Row of 5 star icons reflecting `rating` (0-5).
 */
export default function StarRating({ rating, size = 16, allowHalf = false }: Props) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((i) => {
        let name: keyof typeof Ionicons.glyphMap = 'star-outline';
        if (rating >= i) {
          name = 'star';
        } else if (allowHalf && rating >= i - 0.5) {
          name = 'star-half';
        }
        return <Ionicons key={i} name={name} size={size} color={COLORS.primary} />;
      })}
    </View>
  );
}
