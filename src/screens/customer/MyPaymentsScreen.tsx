import React, { useCallback, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import PaymentCard from '../../components/PaymentCard';
import { fetchCustomerPayments } from '../../services/paymentService';
import { useAuthStore } from '../../store/authStore';
import { Payment } from '../../types';
import { COLORS } from '../../constants';
import { AccountStackParamList } from '../../navigation/types';

type Props = StackScreenProps<AccountStackParamList, 'MyPayments'>;

export default function MyPaymentsScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        if (!user) return;
        try {
          setIsLoading(true);
          const data = await fetchCustomerPayments(user.uid);
          if (mounted) setPayments(data);
        } catch (e: any) {
          if (mounted) setError(e?.message ?? 'Failed to load payments');
        } finally {
          if (mounted) setIsLoading(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }, [user]),
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text style={{ color: COLORS.error, textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Text style={{ color: COLORS.textMuted }}>No payments yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <PaymentCard
            payment={item}
            onPress={() =>
              navigation.navigate('PaymentDetail', { paymentId: item.id })
            }
          />
        )}
      />
    </View>
  );
}
