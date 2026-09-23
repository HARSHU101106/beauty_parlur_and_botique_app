import React from 'react';
import { TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS, SHADOWS } from '../constants';

type GradientName = keyof typeof GRADIENTS;

interface Props {
  label: string;
  onPress: () => void;
  colors?: GradientName;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Playful pill-shaped gradient button for primary calls-to-action.
export default function GradientButton({
  label,
  onPress,
  colors = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[{ opacity: isDisabled ? 0.6 : 1 }, style]}
    >
      <LinearGradient
        colors={GRADIENTS[colors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 15,
            paddingHorizontal: 24,
            borderRadius: 999,
          },
          SHADOWS.md,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            {icon && (
              <Ionicons
                name={icon}
                size={18}
                color="#fff"
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              {label}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
