import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList } from 'react-native';
import {
  Text,
  Card,
  Button,
  SegmentedButtons,
  ActivityIndicator,
  Dialog,
  Portal,
  Snackbar,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { recordPayment } from '../../services/paymentService';
import { PreBooking } from '../../types';
import { COLORS } from '../../constants';

type TabKey = 'active' | 'expiring' | 'expired';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

function daysRemaining(p: PreBooking): number {
  const ms = (p.expiresAt?.toMillis?.() ?? 0) - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export default function AdminPreOrdersScreen() {
  const [tab, setTab] = useState<TabKey>('active');
  const [activeOrders, setActiveOrders] = useState<PreBooking[]>([]);
  const [expiredOrders, setExpiredOrders] = useState<PreBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<PreBooking | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Real-time active pre-bookings.
  useEffect(() => {
    const q = query(collection(db, 'preBookings'), where('status', '==', 'active'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PreBooking);
      list.sort(
        (a, b) => (a.expiresAt?.toMillis?.() ?? 0) - (b.expiresAt?.toMillis?.() ?? 0),
      );
      setActiveOrders(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Real-time expired pre-bookings.
  useEffect(() => {
    const q = query(collection(db, 'preBookings'), where('status', '==', 'expired'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PreBooking);
      list.sort(
        (a, b) => (b.expiresAt?.toMillis?.() ?? 0) - (a.expiresAt?.toMillis?.() ?? 0),
      );
      setExpiredOrders(list);
    });
    return unsub;
  }, []);

  const data = useMemo(() => {
    if (tab === 'expired') return expiredOrders;
    if (tab === 'expiring') {
      const threshold = Date.now() + THREE_DAYS_MS;
      return activeOrders.filter((p) => (p.expiresAt?.toMillis?.() ?? 0) < threshold);
    }
    return activeOrders;
  }, [tab, activeOrders, expiredOrders]);

  const markCollected = async (order: PreBooking) => {
    try {
      setProcessing(true);
      // Mark the pre-booking as collected.
      await updateDoc(doc(db, 'preBookings', order.id), { status: 'collected' });
      // Record the cash transaction against this pre-booking.
      await recordPayment({
        paymentId: `cash-${Date.now()}`,
        amount: order.totalAmount,
        referenceId: order.id,
        referenceType: 'preBooking',
        method: 'cash',
      });
      setToast('Marked as collected and payment recorded.');
    } catch (e: any) {
      setToast(e?.message ?? 'Failed to mark collected');
    } finally {
      setProcessing(false);
      setConfirming(null);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <SegmentedButtons
        value={tab}
        onValueChange={(v) => setTab(v as TabKey)}
        style={{ margin: 16 }}
        buttons={[
          { value: 'active', label: 'Active' },
          { value: 'expiring', label: 'Expiring Soon' },
          { value: 'expired', label: 'Expired' },
        ]}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.admin} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-16">
              <Text style={{ color: COLORS.textMuted }}>No pre-orders here.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const remaining = daysRemaining(item);
            const isExpired = item.status === 'expired';
            return (
              <Card mode="outlined" style={{ borderColor: COLORS.border, marginBottom: 12 }}>
                <Card.Content>
                  <View className="flex-row justify-between items-center">
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text, flex: 1 }} numberOfLines={1}>
                      {item.customerName}
                    </Text>
                    <Text style={{ color: COLORS.admin, fontWeight: 'bold' }}>
                      ₹{item.totalAmount}
                    </Text>
                  </View>

                  <View className="flex-row items-center mt-2">
                    <Ionicons name="bag-outline" size={14} color={COLORS.textMuted} />
                    <Text style={{ color: COLORS.text, fontSize: 13, marginLeft: 6 }}>
                      {item.productName} × {item.quantity}
                    </Text>
                  </View>

                  <View className="flex-row items-center mt-1">
                    <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                    <Text
                      style={{
                        color: isExpired ? COLORS.error : remaining <= 3 ? COLORS.warning : COLORS.textMuted,
                        fontSize: 13,
                        marginLeft: 6,
                      }}
                    >
                      {isExpired ? 'Expired' : `${remaining} day${remaining === 1 ? '' : 's'} remaining`}
                    </Text>
                  </View>

                  {!isExpired && (
                    <Button
                      mode="contained"
                      buttonColor={COLORS.admin}
                      style={{ marginTop: 12 }}
                      icon="check"
                      onPress={() => setConfirming(item)}
                    >
                      Mark Collected
                    </Button>
                  )}
                </Card.Content>
              </Card>
            );
          }}
        />
      )}

      {/* Confirmation dialog */}
      <Portal>
        <Dialog visible={!!confirming} onDismiss={() => setConfirming(null)}>
          <Dialog.Title>Confirm Collection</Dialog.Title>
          <Dialog.Content>
            {confirming && (
              <Text>
                Confirm that customer {confirming.customerName} has collected{' '}
                {confirming.productName} and paid ₹{confirming.totalAmount}?
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirming(null)} disabled={processing}>
              Cancel
            </Button>
            <Button
              mode="contained"
              buttonColor={COLORS.admin}
              loading={processing}
              disabled={processing}
              onPress={() => confirming && markCollected(confirming)}
            >
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!toast} onDismiss={() => setToast(null)} duration={3000}>
        {toast ?? ''}
      </Snackbar>
    </View>
  );
}
