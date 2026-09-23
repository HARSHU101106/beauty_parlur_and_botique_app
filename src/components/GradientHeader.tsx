import React from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS, SHADOWS } from '../constants';

type GradientName = keyof typeof GRADIENTS;

interface Props {
  colors?: GradientName;
  style?: ViewStyle;
  rounded?: boolean;
  children: React.ReactNode;
}

// A soft, curved gradient banner used across the app for a cohesive, playful look.
export default function GradientHeader({
  colors = 'primary',
  style,
  rounded = true,
  children,
}: Props) {
  return (
    <LinearGradient
      colors={GRADIENTS[colors]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 28,
          borderBottomLeftRadius: rounded ? 28 : 0,
          borderBottomRightRadius: rounded ? 28 : 0,
        },
        SHADOWS.md,
        style,
      ]}
    >
      <View>{children}</View>
    </LinearGradient>
  );
}
