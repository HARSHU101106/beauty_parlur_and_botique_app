import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Timestamp } from 'firebase/firestore';
import { COLORS } from '../constants';

interface Props {
  expiresAt: Timestamp;
}

interface Remaining {
  totalMs: number;
  days: number;
  hours: number;
}

function getRemaining(expiry: Date): Remaining {
  const totalMs = Math.max(0, expiry.getTime() - Date.now());
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { totalMs, days, hours };
}

/**
 * Shows "X days Y hours remaining" for an active pre-booking.
 * Banner color: green > 5 days, amber 2-5 days, red < 2 days.
 * Refreshes every minute.
 */
export default function CountdownTimer({ expiresAt }: Props) {
  const expiryDate = expiresAt.toDate();
  const [remaining, setRemaining] = useState<Remaining>(() => getRemaining(expiryDate));

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(getRemaining(expiryDate));
    }, 60 * 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const expired = remaining.totalMs <= 0;

  let bg = COLORS.success;
  if (expired) {
    bg = COLORS.error;
  } else if (remaining.days < 2) {
    bg = COLORS.error;
  } else if (remaining.days <= 5) {
    bg = COLORS.warning;
  }

  return (
    <View
      className="flex-row items-center px-4 py-3 rounded-xl"
      style={{ backgroundColor: bg }}
    >
      <Ionicons name="time-outline" size={20} color="#fff" />
      <Text className="ml-2" style={{ color: '#fff', fontWeight: '700' }}>
        {expired
          ? 'Reservation expired'
          : `${remaining.days} day${remaining.days === 1 ? '' : 's'} ${remaining.hours} hour${
              remaining.hours === 1 ? '' : 's'
            } remaining`}
      </Text>
    </View>
  );
}
