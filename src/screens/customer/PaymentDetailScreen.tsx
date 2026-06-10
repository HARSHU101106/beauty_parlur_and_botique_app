import React, { useCallback, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, ActivityIndicator, Snackbar, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { format } from 'date-fns';
import { fetchPaymentById } from '../../services/paymentService';
import { openRazorpayCheckout } from '../../services/razorpayService';
import { recordInstalment } from '../../services/instalmentService';
import { useAuthStore } from '../../store/authStore';
import { Payment } from '../../types';
import { COLORS } from '../../constants';
import { AccountStackParamList } from '../../navigation/types';

type Props = StackScreenProps<AccountStackParamList, 'PaymentDetail'>;

export default function PaymentDetailScreen({ route }: Props) {
  const { paymentId } = route.params;
  const { user } = useAuthStore();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchPaymentById(paymentId);
      if (!data) {
        setError('Payment not found');
        return;
      }
      setPayment(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load payment');
    } finally {
      setIsLoading(false);
    }
  }, [paymentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const pay = async (amount: number) => {
    if (!user || !payment) return;
    setPaying(true);
    try {
      const result = await openRazorpayCheckout({
        amount,
        name: 'BeautyApp',
        description: `Instalment for ${payment.referenceType} ${payment.referenceId}`,
        prefillName: user.name,
        prefillEmail: user.email,
        prefillContact: user.phone,
      });

      // If Razorpay isn't configured, fall back to paying at the counter
      // instead of blocking the customer.
      const payAtCounter =
        !result.success && /not configured/i.test(result.error ?? '');
      if (!result.success && !payAtCounter) {
        setToast(result.error ?? 'Payment was not completed');
        return;
      }

      await recordInstalment(
        payment.id,
        amount,
        result.paymentId ?? `COUNTER-${Date.now()}`,
        payAtCounter ? 'cash' : 'razorpay',
      );
      setToast(payAtCounter ? 'Recorded! Pay at the counter.' : 'Payment recorded!');
      await load();
    } catch (e: any) {
      setToast(e?.message ?? 'Payment was not completed');
    } finally {
      setPaying(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !payment) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text style={{ color: COLORS.error, textAlign: 'center' }}>
          {error ?? 'Payment not found'}
        </Text>
      </View>
    );
  }

  // Per-instalment amount: prefer the stored value, otherwise fall back to an
  // even split of the total across the allowed number of instalments. This keeps
  // older plans (created before instalmentAmount was stored) working too.
  const perInstalment =
    payment.instalmentAmount && payment.instalmentAmount > 0
      ? payment.instalmentAmount
      : Math.ceil(
          payment.totalAmount /
            (payment.numberOfInstalments || payment.maxInstalments || 1),
        );

  const nextInstalment = Math.min(perInstalment, payment.remainingAmount);

  const isPaid = payment.remainingAmount <= 0 || payment.status === 'paid';
  const showInstalmentBtn =
    payment.paymentMode === 'instalment' &&
    !isPaid &&
    nextInstalment < payment.remainingAmount;

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Breakdown header */}
        <View
          className="rounded-2xl p-4"
          style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }}
        >
          <Row label="Total" value={`₹${payment.totalAmount}`} bold />
          <Row label="Paid" value={`₹${payment.paidAmount}`} color={COLORS.success} />
          <Row label="Remaining" value={`₹${payment.remainingAmount}`} color={COLORS.error} />
          <Divider style={{ marginVertical: 8 }} />
          <Row
            label="Mode"
            value={payment.paymentMode === 'instalment' ? 'Instalments' : 'Full'}
          />
          {!!payment.dueDate?.toDate && (
            <Row label="Due date" value={format(payment.dueDate.toDate(), 'dd MMM yyyy')} />
          )}
        </View>

        {/* Instalment timeline */}
        <Text className="mt-6 mb-2" style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.text }}>
          Payment history
        </Text>
        {payment.instalments.length === 0 ? (
          <Text style={{ color: COLORS.textMuted }}>No instalments paid yet.</Text>
        ) : (
          payment.instalments.map((ins, idx) => (
            <View key={idx} className="flex-row mb-3">
              <View className="items-center mr-3">
                <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                {idx < payment.instalments.length - 1 && (
                  <View style={{ width: 2, flex: 1, backgroundColor: COLORS.border, marginTop: 2 }} />
                )}
              </View>
              <View
                className="flex-1 rounded-xl p-3"
                style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }}
              >
                <View className="flex-row justify-between">
                  <Text style={{ fontWeight: 'bold', color: COLORS.text }}>₹{ins.amount}</Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                    {ins.paidAt?.toDate ? format(ins.paidAt.toDate(), 'dd MMM yyyy') : ''}
                  </Text>
                </View>
                <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>
                  {ins.method.toUpperCase()}
                  {ins.transactionId ? ` · ${ins.transactionId}` : ''}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Pay actions */}
      {!isPaid && (
        <View
          className="px-4 py-3"
          style={{ borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: '#fff' }}
        >
          {showInstalmentBtn && (
            <Button
              mode="contained"
              buttonColor={COLORS.primary}
              loading={paying}
              disabled={paying}
              onPress={() => pay(nextInstalment)}
              contentStyle={{ paddingVertical: 4 }}
            >
              Pay Instalment (₹{nextInstalment})
            </Button>
          )}
          <Button
            mode={showInstalmentBtn ? 'outlined' : 'contained'}
            buttonColor={showInstalmentBtn ? '#fff' : COLORS.primary}
            textColor={showInstalmentBtn ? COLORS.primary : '#fff'}
            style={{ borderColor: COLORS.primary, marginTop: showInstalmentBtn ? 10 : 0 }}
            loading={paying}
            disabled={paying}
            onPress={() => pay(payment.remainingAmount)}
            contentStyle={{ paddingVertical: 4 }}
          >
            Pay Full Remaining (₹{payment.remainingAmount})
          </Button>
        </View>
      )}

      <Snackbar visible={!!toast} onDismiss={() => setToast(null)} duration={3500}>
        {toast ?? ''}
      </Snackbar>
    </View>
  );
}

function Row({
  label,
  value,
  bold,
  color,
}: {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
}) {
  return (
    <View className="flex-row justify-between py-1">
      <Text style={{ color: COLORS.textMuted }}>{label}</Text>
      <Text style={{ color: color ?? COLORS.text, fontWeight: bold ? 'bold' : '600' }}>
        {value}
      </Text>
    </View>
  );
}
