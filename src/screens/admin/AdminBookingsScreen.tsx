import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Text, Searchbar, ActivityIndicator } from 'react-native-paper';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { addDays, format } from 'date-fns';
import { db } from '../../services/firebase';
import { Booking } from '../../types';
import { COLORS } from '../../constants';
import BookingAdminCard from '../../components/BookingAdminCard';

const DAY_COUNT = 14;

/** Convert a "hh:mm AM/PM" slot to minutes-since-midnight for sorting. */
function slotToMinutes(slot: string): number {
  const m = slot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return 0;
  let hour = parseInt(m[1], 10) % 12;
  const minute = parseInt(m[2], 10);
  if (/PM/i.test(m[3])) hour += 12;
  return hour * 60 + minute;
}

export default function AdminBookingsScreen() {
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: DAY_COUNT }, (_, i) => addDays(today, i));
  }, []);

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time bookings for the selected date.
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'bookings'), where('date', '==', selectedDate));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking);
      list.sort((a, b) => slotToMinutes(a.timeSlot) - slotToMinutes(b.timeSlot));
      setBookings(list);
      setLoading(false);
    });
    return unsub;
  }, [selectedDate]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return bookings;
    return bookings.filter((b) => b.customerName.toLowerCase().includes(term));
  }, [bookings, search]);

  const setStatus = async (bookingId: string, status: Booking['status']) => {
    await updateDoc(doc(db, 'bookings', bookingId), { status });
  };

  return (
    <View className="flex-1 bg-white">
      {/* Date picker strip */}
      <FlatList
        horizontal
        data={days}
        keyExtractor={(d) => format(d, 'yyyy-MM-dd')}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
        style={{ flexGrow: 0 }}
        renderItem={({ item }) => {
          const value = format(item, 'yyyy-MM-dd');
          const active = value === selectedDate;
          return (
            <TouchableOpacity
              onPress={() => setSelectedDate(value)}
              className="items-center mr-2 px-3 py-3 rounded-2xl"
              style={{
                minWidth: 60,
                backgroundColor: active ? COLORS.admin : COLORS.surface,
                borderWidth: 1,
                borderColor: active ? COLORS.admin : COLORS.border,
              }}
            >
              <Text style={{ color: active ? '#fff' : COLORS.textMuted, fontSize: 12 }}>
                {format(item, 'EEE')}
              </Text>
              <Text style={{ color: active ? '#fff' : COLORS.text, fontSize: 18, fontWeight: 'bold' }}>
                {format(item, 'dd')}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Search */}
      <Searchbar
        placeholder="Search by customer name"
        value={search}
        onChangeText={setSearch}
        style={{ marginHorizontal: 16, marginBottom: 8 }}
        iconColor={COLORS.admin}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.admin} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 4 }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-16">
              <Text style={{ color: COLORS.textMuted }}>No bookings for this date.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <BookingAdminCard booking={item} onSetStatus={setStatus} />
          )}
        />
      )}
    </View>
  );
}
