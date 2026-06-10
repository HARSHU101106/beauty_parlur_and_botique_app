import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Card, Text, Button, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Payment } from '../types';
import { COLORS } from '../constants';

interface Props {
  payment: Payment;
  onRecordCash: (payment: Payment) => void;
}

export default function PaymentAdminCard({ payment, onRecordCash }: Props) {
  const [expanded, setExpanded] = useState(false);

  const pct = useMemo(() => {
    if (payment.totalAmount <= 0) return 0;
    return Math.min(100, Math.round((payment.paidAmount / payment.totalAmount) * 100));
  }, [payment]);

  const hasPending = payment.remainingAmount > 0 && payment.status !== 'paid';

  return (
    <Card mode="outlined" style={{ borderColor: COLORS.border, marginBottom: 12 }}>
      <Card.Content>
        <View className="flex-row justify-between items-center">
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text, flex: 1 }} numberOfLines={1}>
            {payment.customerName}
          </Text>
          <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
            {payment.referenceType === 'booking' ? 'Service' : 'Product'}
          </Text>
        </View>

        {/* Amounts */}
        <View className="flex-row justify-between mt-2">
          <Text style={{ color: COLORS.text, fontSize: 13 }}>
            Total: ₹{payment.totalAmount}
          </Text>
          <Text style={{ color: COLORS.success, fontSize: 13 }}>
            Paid: ₹{payment.paidAmount}
          </Text>
          <Text style={{ color: COLORS.error, fontSize: 13 }}>
            Due: ₹{payment.remainingAmount}
          </Text>
        </View>

        {/* Progress bar */}
        <View
          className="mt-2 rounded-full overflow-hidden"
          style={{ height: 8, backgroundColor: COLORS.border }}
        >
          <View style={{ width: `${pct}%`, height: 8, backgroundColor: COLORS.success }} />
        </View>

        {/* Expand toggle */}
        <View className="flex-row items-center justify-between mt-1">
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color:
                payment.status === 'paid'
                  ? COLORS.success
                  : payment.status === 'partial'
                  ? COLORS.warning
                  : COLORS.error,
            }}
          >
            {payment.status.toUpperCase()}
          </Text>
          <Button
            mode="text"
            textColor={COLORS.admin}
            compact
            onPress={() => setExpanded((e) => !e)}
            icon={expanded ? 'chevron-up' : 'chevron-down'}
          >
            {expanded ? 'Hide' : 'Details'}
          </Button>
        </View>

        {/* Expanded instalment timeline */}
        {expanded && (
          <View className="mt-1">
            <Divider style={{ marginBottom: 8 }} />
            {payment.instalments.length === 0 ? (
              <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                No instalments paid yet.
              </Text>
            ) : (
              payment.instalments.map((ins, idx) => (
                <View key={idx} className="flex-row mb-2">
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                  <View className="flex-1 ml-2">
                    <View className="flex-row justify-between">
                      <Text style={{ fontWeight: 'bold', color: COLORS.text, fontSize: 13 }}>
                        ₹{ins.amount}
                      </Text>
                      <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                        {ins.paidAt?.toDate ? format(ins.paidAt.toDate(), 'dd MMM yyyy') : ''}
                      </Text>
                    </View>
                    <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                      {ins.method.toUpperCase()}
                      {ins.transactionId ? ` · ${ins.transactionId}` : ''}
                    </Text>
                  </View>
                </View>
              ))
            )}

            {hasPending && (
              <Button
                mode="contained"
                buttonColor={COLORS.admin}
                icon="cash"
                style={{ marginTop: 6 }}
                onPress={() => onRecordCash(payment)}
              >
                Record Cash Payment
              </Button>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}
