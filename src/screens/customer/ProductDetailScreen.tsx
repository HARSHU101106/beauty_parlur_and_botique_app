import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image } from 'react-native';
import { Text, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import CountdownTimer from '../../components/CountdownTimer';
import {
  fetchProductById,
  fetchActivePreBooking,
  createPreBooking,
} from '../../services/productService';
import { createInstalmentPlan, MAX_INSTALMENTS } from '../../services/paymentService';
import { recordInstalment } from '../../services/instalmentService';
import { openRazorpayCheckout } from '../../services/razorpayService';
import { useAuthStore } from '../../store/authStore';
import { Product, PreBooking } from '../../types';
import { COLORS } from '../../constants';
import { BoutiqueStackParamList } from '../../navigation/types';

type Props = StackScreenProps<BoutiqueStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen({ route }: Props) {
  const { productId } = route.params;
  const { user } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [preBooking, setPreBooking] = useState<PreBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      const prod = await fetchProductById(productId);
      if (!prod) {
        setError('Product not found');
        return;
      }
      setProduct(prod);
      if (user) {
        const existing = await fetchActivePreBooking(user.uid, productId);
        setPreBooking(existing);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const onPreBook = async () => {
    if (!user || !product) return;
    try {
      setReserving(true);
      await createPreBooking({
        customerId: user.uid,
        customerName: user.name,
        product,
      });
      const existing = await fetchActivePreBooking(user.uid, product.id);
      setPreBooking(existing);
      setToast('Product reserved! Visit the shop within 10 days.');
    } catch (e: any) {
      setToast(e?.message ?? 'Could not reserve product');
    } finally {
      setReserving(false);
    }
  };

  const onBuyInstalments = async () => {
    if (!user || !product) return;
    try {
      setBuying(true);

      const firstInstalment = Math.ceil(product.price / MAX_INSTALMENTS);

      // Collect the first instalment up front.
      const result = await openRazorpayCheckout({
        amount: firstInstalment,
        name: 'BeautyApp Boutique',
        description: `First instalment for ${product.name}`,
        prefillName: user.name,
        prefillEmail: user.email,
        prefillContact: user.phone,
      });

      // If Razorpay isn't configured, let the customer pay the instalment at
      // the counter instead of blocking the purchase.
      const payAtCounter =
        !result.success && /not configured/i.test(result.error ?? '');
      if (!result.success && !payAtCounter) {
        setToast(result.error ?? 'Payment was not completed');
        return;
      }

      // Reserve the item (this also reduces stock atomically).
      const preBookingId = await createPreBooking({
        customerId: user.uid,
        customerName: user.name,
        product,
      });

      // Create the instalment plan and record the first payment against it.
      const { paymentId } = await createInstalmentPlan({
        customerId: user.uid,
        customerName: user.name,
        referenceType: 'preBooking',
        referenceId: preBookingId,
        totalAmount: product.price,
      });
      await recordInstalment(
        paymentId,
        firstInstalment,
        result.paymentId ?? `COUNTER-${Date.now()}`,
        payAtCounter ? 'cash' : 'razorpay',
      );

      const existing = await fetchActivePreBooking(user.uid, product.id);
      setPreBooking(existing);
      setToast(
        payAtCounter
          ? 'Reserved! Pay your instalments at the counter.'
          : 'First instalment paid! See My Payments to pay the rest.',
      );
    } catch (e: any) {
      setToast(e?.message ?? 'Could not complete purchase');
    } finally {
      setBuying(false);
    }
  };

  if (isLoading) {
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
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Image
          source={{ uri: product.imageUrl }}
          style={{ width: '100%', height: 260 }}
          resizeMode="cover"
        />

        <View className="px-5 pt-4">
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.text }}>
            {product.name}
          </Text>

          <View className="flex-row items-center justify-between mt-2">
            <Text style={{ fontSize: 22, color: COLORS.primary, fontWeight: 'bold' }}>
              ₹{product.price}
            </Text>
            <Text style={{ color: inStock ? COLORS.success : COLORS.error, fontWeight: '600' }}>
              {inStock ? `${product.stockCount} in stock` : 'Out of stock'}
            </Text>
          </View>

          <Text className="mt-2" style={{ color: COLORS.textMuted }}>
            Category: {product.category}
          </Text>

          <Text className="mt-6" style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.text }}>
            Description
          </Text>
          <Text className="mt-2" style={{ color: COLORS.text, lineHeight: 22 }}>
            {product.description}
          </Text>

          <View className="mt-6">
            {preBooking ? (
              <CountdownTimer expiresAt={preBooking.expiresAt} />
            ) : null}
          </View>
        </View>
      </ScrollView>

      <View
        className="px-5 py-3"
        style={{ borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: '#fff' }}
      >
        {preBooking ? (
          <Button mode="contained" disabled buttonColor={COLORS.border} textColor={COLORS.textMuted}>
            Already Reserved
          </Button>
        ) : (
          <>
            <Button
              mode="contained"
              buttonColor={COLORS.primary}
              loading={reserving}
              disabled={reserving || buying || !user || !inStock}
              onPress={onPreBook}
              contentStyle={{ paddingVertical: 4 }}
            >
              {inStock ? 'Pre-Book for 10 Days' : 'Out of Stock'}
            </Button>
            <Button
              mode="outlined"
              textColor={COLORS.primary}
              style={{ borderColor: COLORS.primary, marginTop: 10 }}
              loading={buying}
              disabled={reserving || buying || !user || !inStock}
              onPress={onBuyInstalments}
              contentStyle={{ paddingVertical: 4 }}
            >
              Buy in Instalments (₹{Math.ceil(product.price / MAX_INSTALMENTS)} × {MAX_INSTALMENTS})
            </Button>
          </>
        )}
      </View>

      <Snackbar
        visible={!!toast}
        onDismiss={() => setToast(null)}
        duration={4000}
      >
        {toast ?? ''}
      </Snackbar>
    </View>
  );
}
