import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList } from 'react-native';
import {
  Text,
  Card,
  SegmentedButtons,
  ActivityIndicator,
  Dialog,
  Portal,
  Button,
  TextInput,
  Snackbar,
} from 'react-native-paper';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { recordInstalment } from '../../services/instalmentService';
import { Payment } from '../../types';
import { COLORS } from '../../constants';
import PaymentAdminCard from '../../components/PaymentAdminCard';

type TabKey = 'all' | 'partial' | 'paid';

export default function AdminPaymentsScreen() {
  const [tab, setTab] = useState<TabKey>('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const [cashTarget, setCashTarget] = useState<Payment | null>(null);
  const [cashAmount, setCashAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Real-time payments, newest first.
  useEffect(() => {
    const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Payment));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    if (tab === 'partial') return payments.filter((p) => p.status === 'partial' || p.status === 'pending');
    if (tab === 'paid') return payments.filter((p) => p.status === 'paid');
    return payments;
  }, [payments, tab]);

  const summary = useMemo(() => {
    const outstanding = payments
      .filter((p) => p.status === 'partial' || p.status === 'pending')
      .reduce((sum, p) => sum + (p.remainingAmount ?? 0), 0);
    const partialCount = payments.filter((p) => p.status === 'partial').length;
    return { outstanding, partialCount };
  }, [payments]);

  const openCashModal = (payment: Payment) => {
    const prefill = payment.instalmentAmount && payment.instalmentAmount > 0
      ? Math.min(payment.instalmentAmount, payment.remainingAmount)
      : payment.remainingAmount;
    setCashTarget(payment);
    setCashAmount(String(prefill));
  };

  const submitCash = async () => {
    if (!cashTarget) return;
    const amount = Number(cashAmount);
    if (!amount || amount <= 0 || amount > cashTarget.remainingAmount) {
      setToast('Enter a valid amount within the remaining balance.');
      return;
    }
    try {
      setProcessing(true);
      await recordInstalment(cashTarget.id, amount, `CASH-${Date.now()}`, 'cash');
      setToast('Cash payment recorded.');
      setCashTarget(null);
    } catch (e: any) {
      setToast(e?.message ?? 'Failed to record payment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.admin} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Summary banner */}
      <Card mode="contained" style={{ backgroundColor: COLORS.admin, margin: 16 }}>
        <Card.Content>
          <View className="flex-row justify-between">
            <View>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>
                ₹{summary.outstanding}
              </Text>
              <Text style={{ color: '#EDE3F5', fontSize: 12 }}>Total Outstanding</Text>
            </View>
            <View className="items-end">
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>
                {summary.partialCount}
              </Text>
              <Text style={{ color: '#EDE3F5', fontSize: 12 }}>Customers with partial</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Filter tabs */}
      <SegmentedButtons
        value={tab}
        onValueChange={(v) => setTab(v as TabKey)}
        style={{ marginHorizontal: 16, marginBottom: 8 }}
        buttons={[
          { value: 'all', label: 'All' },
          { value: 'partial', label: 'Partial' },
          { value: 'paid', label: 'Paid' },
        ]}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-16">
            <Text style={{ color: COLORS.textMuted }}>No payments here.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <PaymentAdminCard payment={item} onRecordCash={openCashModal} />
        )}
      />

      {/* Record cash modal */}
      <Portal>
        <Dialog visible={!!cashTarget} onDismiss={() => setCashTarget(null)}>
          <Dialog.Title>Record Cash Payment</Dialog.Title>
          <Dialog.Content>
            {cashTarget && (
              <>
                <Text style={{ color: COLORS.textMuted, marginBottom: 8 }}>
                  {cashTarget.customerName} · Remaining ₹{cashTarget.remainingAmount}
                </Text>
                <TextInput
                  mode="outlined"
                  label="Amount"
                  keyboardType="numeric"
                  value={cashAmount}
                  onChangeText={setCashAmount}
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.admin}
                />
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCashTarget(null)} disabled={processing}>
              Cancel
            </Button>
            <Button
              mode="contained"
              buttonColor={COLORS.admin}
              loading={processing}
              disabled={processing}
              onPress={submitCash}
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
