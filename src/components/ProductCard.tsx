import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Product } from '../types';
import { COLORS, SHADOWS } from '../constants';

interface Props {
  product: Product;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: Props) {
  const inStock = product.stockCount > 0;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-1 m-2 rounded-3xl overflow-hidden"
      style={[{ backgroundColor: COLORS.card }, SHADOWS.sm]}
    >
      <View>
        <Image
          source={{ uri: product.imageUrl }}
          style={{ width: '100%', height: 160 }}
          resizeMode="cover"
        />
        <View
          className="absolute top-2 right-2 px-2 py-1 rounded-full"
          style={{ backgroundColor: inStock ? COLORS.accentMint : COLORS.error }}
        >
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
            {inStock ? `In Stock` : 'Out of Stock'}
          </Text>
        </View>
      </View>
      <View className="px-3 py-3">
        <Text numberOfLines={1} style={{ fontWeight: 'bold', color: COLORS.text }}>
          {product.name}
        </Text>
        <View
          className="self-start mt-2 px-2 py-1 rounded-full"
          style={{ backgroundColor: COLORS.primarySoft }}
        >
          <Text style={{ color: COLORS.primaryDark, fontWeight: '700', fontSize: 13 }}>
            ₹{product.price}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
