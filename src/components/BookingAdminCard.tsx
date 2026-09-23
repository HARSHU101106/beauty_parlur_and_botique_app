import React from 'react';
import { View } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../types';
import { COLORS } from '../constants';

interface Props {
  booking: Booking;
  onSetStatus: (bookingId: string, status: Booking['status']) => void;
}

const STATUS_COLORS: Record<Booking['status'], string> = {
  pending: COLORS.warning,
  confirmed: COLORS.success,
  completed: COLORS.info,
  cancelled: COLORS.textMuted,
};

const PAYMENT_COLORS: Record<Booking['paymentStatus'], string> = {
  unpaid: COLORS.error,
  partial: COLORS.warning,
  paid: COLORS.success,
};

export default function BookingAdminCard({ booking, onSetStatus }: Props) {
  return (
    <Card mode="outlined" style={{ borderColor: COLORS.border, marginBottom: 12 }}>
      <Card.Content>
        <View className="flex-row justify-between items-center">
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text, flex: 1 }} numberOfLines={1}>
            {booking.customerName}
          </Text>
          <View
            style={{
              backgroundColor: STATUS_COLORS[booking.status],
              paddingHorizontal: 10,
              paddingVertical: 3,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mt-2">
          <Ionicons name="cut-outline" size={14} color={COLORS.textMuted} />
          <Text style={{ color: COLORS.text, fontSize: 13, marginLeft: 6 }}>
            {booking.serviceName}
          </Text>
        </View>

        <View className="flex-row items-center mt-1">
          <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
          <Text style={{ color: COLORS.textMuted, fontSize: 13, marginLeft: 6 }}>
            {booking.date} · {booking.timeSlot}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mt-1">
          <Text style={{ color: COLORS.text, fontSize: 13 }}>₹{booking.totalAmount}</Text>
          <View
            style={{
              backgroundColor: PAYMENT_COLORS[booking.paymentStatus],
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
              {booking.paymentStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View className="flex-row mt-3" style={{ gap: 8 }}>
          {booking.status === 'pending' && (
            <Button
              mode="contained"
              compact
              buttonColor={COLORS.success}
              onPress={() => onSetStatus(booking.id, 'confirmed')}
            >
              Confirm
            </Button>
          )}
          {booking.status === 'confirmed' && (
            <Button
              mode="contained"
              compact
              buttonColor={COLORS.info}
              onPress={() => onSetStatus(booking.id, 'completed')}
            >
              Complete
            </Button>
          )}
          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <Button
              mode="contained"
              compact
              buttonColor={COLORS.error}
              onPress={() => onSetStatus(booking.id, 'cancelled')}
            >
              Cancel
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}
