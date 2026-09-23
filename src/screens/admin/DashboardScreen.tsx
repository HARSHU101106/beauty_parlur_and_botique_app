import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, DataTable, Button, ActivityIndicator } from 'react-native-paper';
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  Timestamp,
} from 'firebase/firestore';
import { format } from 'date-fns';
import { db } from '../../services/firebase';
import { Booking, PreBooking, Payment } from '../../types';
import { COLORS } from '../../constants';

const STATUS_COLORS: Record<Booking['status'], string> = {
  pending: COLORS.warning,
  confirmed: COLORS.success,
  completed: COLORS.info,
  cancelled: COLORS.textMuted,
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function DashboardScreen() {
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [pendingPreOrders, setPendingPreOrders] = useState<PreBooking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time: today's bookings.
  useEffect(() => {
    const q = query(collection(db, 'bookings'), where('date', '==', today));
    const unsub = onSnapshot(q, (snap) => {
      setTodayBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking));
      setLoading(false);
    });
    return unsub;
  }, [today]);

  // Real-time: active pre-orders.
  useEffect(() => {
    const q = query(collection(db, 'preBookings'), where('status', '==', 'active'));
    const unsub = onSnapshot(q, (snap) => {
      setPendingPreOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PreBooking));
    });
    return unsub;
  }, []);

  // Real-time: all payments (for revenue + outstanding).
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'payments'), (snap) => {
      setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Payment));
    });
    return unsub;
  }, []);

  const summaryStats = useMemo(() => {
    const todayStart = startOfToday().getTime();

    const todaysRevenue = payments
      .filter((p) => (p.createdAt?.toMillis?.() ?? 0) >= todayStart)
      .reduce((sum, p) => sum + (p.paidAmount ?? 0), 0);

    const outstanding = payments
      .filter((p) => p.status === 'partial' || p.status === 'pending')
      .reduce((sum, p) => sum + (p.remainingAmount ?? 0), 0);

    return {
      todayBookings: todayBookings.length,
      activePreOrders: pendingPreOrders.length,
      todaysRevenue,
      outstanding,
    };
  }, [payments, todayBookings, pendingPreOrders]);

  const setStatus = async (bookingId: string, newStatus: Booking['status']) => {
    await updateDoc(doc(db, 'bookings', bookingId), { status: newStatus });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.admin} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: COLORS.admin, marginBottom: 12 }}>
        Dashboard
      </Text>

      {/* Summary cards */}
      <View className="flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
        <SummaryCard label="Today's Bookings" value={String(summaryStats.todayBookings)} />
        <SummaryCard label="Pre-orders Active" value={String(summaryStats.activePreOrders)} />
        <SummaryCard label="Today's Revenue" value={`₹${summaryStats.todaysRevenue}`} />
        <SummaryCard label="Outstanding" value={`₹${summaryStats.outstanding}`} />
      </View>

      {/* Today's bookings list */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginTop: 20, marginBottom: 8 }}>
        Today's Bookings
      </Text>

      <Card mode="outlined" style={{ borderColor: COLORS.border }}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Customer</DataTable.Title>
            <DataTable.Title>Service</DataTable.Title>
            <DataTable.Title>Time</DataTable.Title>
            <DataTable.Title>Status</DataTable.Title>
          </DataTable.Header>

          {todayBookings.length === 0 && (
            <DataTable.Row>
              <DataTable.Cell>
                <Text style={{ color: COLORS.textMuted }}>No bookings today.</Text>
              </DataTable.Cell>
            </DataTable.Row>
          )}

          {todayBookings.map((b) => (
            <View key={b.id}>
              <DataTable.Row>
                <DataTable.Cell>{b.customerName}</DataTable.Cell>
                <DataTable.Cell>{b.serviceName}</DataTable.Cell>
                <DataTable.Cell>{b.timeSlot}</DataTable.Cell>
                <DataTable.Cell>
                  <View
                    style={{
                      backgroundColor: STATUS_COLORS[b.status],
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </Text>
                  </View>
                </DataTable.Cell>
              </DataTable.Row>

              {/* Action buttons */}
              <View className="flex-row px-3 pb-3" style={{ gap: 8 }}>
                {b.status === 'pending' && (
                  <Button
                    mode="contained"
                    compact
                    buttonColor={COLORS.success}
                    onPress={() => setStatus(b.id, 'confirmed')}
                  >
                    Confirm
                  </Button>
                )}
                {b.status === 'confirmed' && (
                  <Button
                    mode="contained"
                    compact
                    buttonColor={COLORS.info}
                    onPress={() => setStatus(b.id, 'completed')}
                  >
                    Complete
                  </Button>
                )}
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <Button
                    mode="contained"
                    compact
                    buttonColor={COLORS.error}
                    onPress={() => setStatus(b.id, 'cancelled')}
                  >
                    Cancel
                  </Button>
                )}
              </View>
            </View>
          ))}
        </DataTable>
      </Card>
    </ScrollView>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ width: '50%', padding: 6 }}>
      <Card mode="contained" style={{ backgroundColor: COLORS.admin }}>
        <Card.Content>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>{value}</Text>
          <Text style={{ color: '#EDE3F5', fontSize: 12, marginTop: 2 }}>{label}</Text>
        </Card.Content>
      </Card>
    </View>
  );
}
