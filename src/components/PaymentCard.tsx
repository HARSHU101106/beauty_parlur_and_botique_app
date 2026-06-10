import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Payment } from '../types';
import { COLORS } from '../constants';

interface Props {
  payment: Payment;
  onPress: () => void;
}

const STATUS_COLORS: Record<Payment['status'], string> = {
  paid: COLORS.success,
  partial: COLORS.warning,
  pending: COLORS.error,
};

const STATUS_LABELS: Record<Payment['status'], string> = {
  paid: 'Paid',
  partial: 'Partial',
  pending: 'Pending',
};

export default function PaymentCard({ payment, onPress }: Props) {
  const ratio =
    payment.totalAmount > 0 ? payment.paidAmount / payment.totalAmount : 0;
  const pct = Math.min(100, Math.round(ratio * 100));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="rounded-2xl p-4 mb-3"
      style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }}
    >
      <View className="flex-row justify-between items-center">
        <Text numberOfLines={1} style={{ fontWeight: 'bold', color: COLORS.text, flex: 1 }}>
          {payment.referenceType === 'booking' ? 'Service Booking' : 'Product Pre-Booking'}
        </Text>
        <View
          className="px-2 py-1 rounded-full ml-2"
          style={{ backgroundColor: STATUS_COLORS[payment.status] }}
        >
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
            {STATUS_LABELS[payment.status]}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View
        className="mt-3 rounded-full overflow-hidden"
        style={{ height: 8, backgroundColor: COLORS.border }}
      >
        <View style={{ width: `${pct}%`, height: 8, backgroundColor: COLORS.primary }} />
      </View>

      <View className="flex-row justify-between mt-2">
        <Text style={{ color: COLORS.text, fontSize: 13 }}>
          Paid: ₹{payment.paidAmount}
        </Text>
        <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
          Remaining: ₹{payment.remainingAmount}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
