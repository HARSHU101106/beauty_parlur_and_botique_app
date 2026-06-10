import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image } from 'react-native';
import { Text, Button, ActivityIndicator, Snackbar, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import {
  fetchProductById,
  fetchActivePreBooking,
  createPreBooking,
} from '../../services/productService';
import { useAuthStore } from '../../store/authStore';
import { Product, PreBooking } from '../../types';
import { COLORS } from '../../constants';
import { BoutiqueStackParamList } from '../../navigation/types';

type Props = StackScreenProps<BoutiqueStackParamList, 'PreBook'>;

export default function PreBookScreen({ route, navigation }: Props) {
  const { productId } = route.params;
  const { user } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [existing, setExisting] = useState<PreBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const prod = await fetchProductById(productId);
        if (!prod) {
          setError('Product not found');
          return;
        }
        if (mounted) setProduct(prod);
        if (user) {
          const ex = await fetchActivePreBooking(user.uid, productId);
          if (mounted) setExisting(ex);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Failed to load product');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [productId, user]);

  const onConfirm = async () => {
    if (!user || !product) return;
    try {
      setReserving(true);
      await createPreBooking({
        customerId: user.uid,
        customerName: user.name,
        product,
      });
      setToast('Reserved! Collect in-store within 10 days.');
      setTimeout(() => navigation.goBack(), 1200);
    } catch (e: any) {
      setToast(e?.message ?? 'Could not reserve product');
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text style={{ color: COLORS.error, textAlign: 'center' }}>
          {error ?? 'Product not found'}
        </Text>
      </View>
    );
  }

  const inStock = product.stockCount > 0;

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 }}>
        <View className="flex-row">
          <Image
            source={{ uri: product.imageUrl }}
            style={{ width: 100, height: 100, borderRadius: 12 }}
            resizeMode="cover"
          />
          <View className="flex-1 ml-4 justify-center">
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.text }}>
              {product.name}
            </Text>
            <Text style={{ color: COLORS.primary, fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>
              ₹{product.price}
            </Text>
            <Text style={{ color: inStock ? COLORS.success : COLORS.error, marginTop: 2 }}>
              {inStock ? `${product.stockCount} in stock` : 'Out of stock'}
            </Text>
          </View>
        </View>

        <Divider style={{ marginVertical: 20 }} />

        {/* How it works */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 }}>
          How pre-booking works
        </Text>
        {[
          'Reserve this item online at no upfront cost.',
          'Visit the boutique within 10 days to collect it.',
          'Pay in-store when you collect (cash or UPI).',
          'Your reservation expires automatically after 10 days.',
        ].map((line, i) => (
          <View key={i} className="flex-row items-start mb-2">
            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
            <Text style={{ color: COLORS.text, marginLeft: 8, flex: 1 }}>{line}</Text>
          </View>
        ))}

        {existing && (
          <View
            className="rounded-xl p-3 mt-4"
            style={{ backgroundColor: '#FFF4E5', borderWidth: 1, borderColor: COLORS.warning }}
          >
            <Text style={{ color: COLORS.warning, fontWeight: '600' }}>
              You already have an active reservation for this product.
            </Text>
          </View>
        )}
      </ScrollView>

      <View
        className="px-5 py-4"
        style={{ borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: '#fff' }}
      >
        <Button
          mode="contained"
          buttonColor={COLORS.primary}
          loading={reserving}
          disabled={reserving || !!existing || !inStock}
          onPress={onConfirm}
          contentStyle={{ paddingVertical: 4 }}
        >
          {existing ? 'Already Reserved' : !inStock ? 'Out of Stock' : 'Confirm Pre-Booking'}
        </Button>
      </View>

      <Snackbar visible={!!toast} onDismiss={() => setToast(null)} duration={2500}>
        {toast ?? ''}
      </Snackbar>
    </View>
  );
}
