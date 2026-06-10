import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { Text, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import { addDays, format } from 'date-fns';
import { fetchServiceById } from '../../services/serviceService';
import {
  fetchBookedSlots,
  createBooking,
} from '../../services/bookingService';
import { createFullPayment } from '../../services/paymentService';
import { openRazorpayCheckout } from '../../services/razorpayService';
import { useAuthStore } from '../../store/authStore';
import { Service } from '../../types';
import { COLORS } from '../../constants';
import { BeautyStackParamList } from '../../navigation/types';

type Props = StackScreenProps<BeautyStackParamList, 'Booking'>;

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM',
];

function nextDays(count: number): Date[] {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => addDays(today, i));
}

export default function BookingScreen({ route, navigation }: Props) {
  const { serviceId } = route.params;
  const { user } = useAuthStore();

  const [service, setService] = useState<Service | null>(null);
  const [loadingService, setLoadingService] = useState(true);

  const days = useMemo(() => nextDays(14), []);
  const [selectedDate, setSelectedDate] = useState<string>(
    format(days[0], 'yyyy-MM-dd'),
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Load the service once.
  useEffect(() => {
    (async () => {
      try {
        setLoadingService(true);
        const svc = await fetchServiceById(serviceId);
        setService(svc);
      } finally {
        setLoadingService(false);
      }
    })();
  }, [serviceId]);

  // Load booked slots whenever the selected date changes.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingSlots(true);
        setSelectedSlot(null);
        const taken = await fetchBookedSlots(selectedDate);
        if (mounted) setBookedSlots(taken);
      } catch (e: any) {
        if (mounted) setToast(e?.message ?? 'Could not load slots');
      } finally {
        if (mounted) setLoadingSlots(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedDate]);

  const confirmBooking = async () => {
    if (!user || !service || !selectedSlot) return;
    try {
      setSubmitting(true);

      const payment = await openRazorpayCheckout({
        amount: service.price,
        name: 'BeautyApp',
        description: `${service.name} on ${selectedDate} at ${selectedSlot}`,
        prefillName: user.name,
        prefillEmail: user.email,
        prefillContact: user.phone,
      });

      // When Razorpay isn't configured (placeholder mode), fall back to a
      // "pay at the counter" booking instead of blocking the customer.
      const payAtCounter =
        !payment.success && /not configured/i.test(payment.error ?? '');
      if (!payment.success && !payAtCounter) {
        setToast(payment.error ?? 'Payment was not completed');
        return;
      }

      const bookingId = await createBooking({
        customerId: user.uid,
        customerName: user.name,
        serviceId: service.id,
        serviceName: service.name,
        date: selectedDate,
        timeSlot: selectedSlot,
        totalAmount: service.price,
      });

      await createFullPayment({
        customerId: user.uid,
        customerName: user.name,
        referenceType: 'booking',
        referenceId: bookingId,
        totalAmount: service.price,
      });

      setToast(
        payAtCounter ? 'Booking confirmed! Pay at the counter.' : 'Booking confirmed!',
      );
      setTimeout(() => navigation.popToTop(), 1200);
    } catch (e: any) {
      setToast(e?.message ?? 'Could not complete booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingService) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!service) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text style={{ color: COLORS.error }}>Service not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* STEP 1 — Date picker */}
        <Text className="px-5 pt-5 pb-2" style={styles.stepTitle}>
          1. Select a date
        </Text>
        <FlatList
          horizontal
          data={days}
          keyExtractor={(d) => format(d, 'yyyy-MM-dd')}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={({ item }) => {
            const value = format(item, 'yyyy-MM-dd');
            const active = value === selectedDate;
            return (
              <TouchableOpacity
                onPress={() => setSelectedDate(value)}
                className="items-center mr-2 px-3 py-3 rounded-2xl"
                style={{
                  minWidth: 64,
                  backgroundColor: active ? COLORS.primary : COLORS.surface,
                  borderWidth: 1,
                  borderColor: active ? COLORS.primary : COLORS.border,
                }}
              >
                <Text style={{ color: active ? '#fff' : COLORS.textMuted, fontSize: 12 }}>
                  {format(item, 'EEE')}
                </Text>
                <Text style={{ color: active ? '#fff' : COLORS.text, fontSize: 20, fontWeight: 'bold' }}>
                  {format(item, 'dd')}
                </Text>
                <Text style={{ color: active ? '#fff' : COLORS.textMuted, fontSize: 12 }}>
                  {format(item, 'MMM')}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* STEP 2 — Time slots */}
        <Text className="px-5 pt-6 pb-2" style={styles.stepTitle}>
          2. Choose a time slot
        </Text>
        {loadingSlots ? (
          <ActivityIndicator className="mt-4" color={COLORS.primary} />
        ) : (
          <View className="flex-row flex-wrap px-3">
            {TIME_SLOTS.map((slot) => {
              const unavailable = bookedSlots.has(slot);
              const active = slot === selectedSlot;
              return (
                <View key={slot} style={{ width: '33.33%', padding: 6 }}>
                  <TouchableOpacity
                    disabled={unavailable}
                    onPress={() => setSelectedSlot(slot)}
                    className="items-center py-3 rounded-xl"
                    style={{
                      backgroundColor: unavailable
                        ? COLORS.border
                        : active
                        ? COLORS.primary
                        : '#fff',
                      borderWidth: 1,
                      borderColor: unavailable ? COLORS.border : COLORS.primary,
                    }}
                  >
                    <Text
                      style={{
                        color: unavailable
                          ? COLORS.textMuted
                          : active
                          ? '#fff'
                          : COLORS.primary,
                        fontWeight: '600',
                        textDecorationLine: unavailable ? 'line-through' : 'none',
                      }}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* STEP 3 — Confirm & Pay */}
        <Text className="px-5 pt-6 pb-2" style={styles.stepTitle}>
          3. Confirm & pay
        </Text>
        <View
          className="mx-5 p-4 rounded-2xl"
          style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }}
        >
          <SummaryRow label="Service" value={service.name} />
          <SummaryRow label="Customer" value={user?.name ?? '-'} />
          <SummaryRow label="Date" value={selectedDate} />
          <SummaryRow label="Time" value={selectedSlot ?? 'Not selected'} />
          <View className="flex-row justify-between mt-2 pt-2" style={{ borderTopWidth: 1, borderTopColor: COLORS.border }}>
            <Text style={{ fontWeight: 'bold', color: COLORS.text }}>Total</Text>
            <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>₹{service.price}</Text>
          </View>
        </View>

        <View className="px-5 mt-5">
          <Button
            mode="contained"
            buttonColor={COLORS.primary}
            disabled={!selectedSlot || submitting}
            loading={submitting}
            onPress={() => confirmBooking()}
            contentStyle={{ paddingVertical: 4 }}
          >
            Pay Full Amount (₹{service.price})
          </Button>
        </View>
      </ScrollView>

      <Snackbar visible={!!toast} onDismiss={() => setToast(null)} duration={3500}>
        {toast ?? ''}
      </Snackbar>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-1">
      <Text style={{ color: COLORS.textMuted }}>{label}</Text>
      <Text style={{ color: COLORS.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  );
}

const styles = {
  stepTitle: { fontSize: 18, fontWeight: 'bold' as const, color: COLORS.text },
};
