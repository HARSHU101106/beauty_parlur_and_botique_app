import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Service } from '../types';
import { COLORS, SHADOWS } from '../constants';

interface Props {
  service: Service;
  onPress: () => void;
}

export default function ServiceCard({ service, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-1 m-2 rounded-3xl overflow-hidden"
      style={[{ backgroundColor: COLORS.card }, SHADOWS.sm]}
    >
      <Image
        source={{ uri: service.imageUrl }}
        style={{ width: '100%', height: 140 }}
        resizeMode="cover"
      />
      <View className="px-3 py-3">
        <Text numberOfLines={1} style={{ fontWeight: 'bold', color: COLORS.text }}>
          {service.name}
        </Text>
        <View className="flex-row items-center justify-between mt-2">
          <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: COLORS.primarySoft }}
          >
            <Text style={{ color: COLORS.primaryDark, fontWeight: '700', fontSize: 13 }}>
              ₹{service.price}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
            <Text style={{ color: COLORS.textMuted, fontSize: 12, marginLeft: 3 }}>
              {service.duration} min
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
