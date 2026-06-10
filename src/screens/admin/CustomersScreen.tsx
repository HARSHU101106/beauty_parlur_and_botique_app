import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text, ActivityIndicator, Searchbar, Avatar, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { User } from '../../types';
import { COLORS } from '../../constants';

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'customer'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as User);
      list.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
      setCustomers(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term),
    );
  }, [customers, search]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.admin} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-4 pb-2">
        <Searchbar
          placeholder="Search customers"
          value={search}
          onChangeText={setSearch}
          style={{ backgroundColor: COLORS.surface }}
        />
        <Text style={{ color: COLORS.textMuted, marginTop: 8 }}>
          {filtered.length} customer{filtered.length === 1 ? '' : 's'}
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-24">
            <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
            <Text style={{ color: COLORS.textMuted, marginTop: 8 }}>No customers found.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12, backgroundColor: COLORS.surface }} mode="outlined">
            <Card.Content>
              <View className="flex-row items-center">
                <Avatar.Text
                  size={48}
                  label={initials(item.name ?? '?')}
                  style={{ backgroundColor: COLORS.admin }}
                  color="#fff"
                />
                <View className="flex-1 ml-4">
                  <Text style={{ fontWeight: 'bold', color: COLORS.text, fontSize: 16 }}>
                    {item.name}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="mail-outline" size={14} color={COLORS.textMuted} />
                    <Text style={{ color: COLORS.textMuted, marginLeft: 6, fontSize: 13 }}>
                      {item.email || '—'}
                    </Text>
                  </View>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="call-outline" size={14} color={COLORS.textMuted} />
                    <Text style={{ color: COLORS.textMuted, marginLeft: 6, fontSize: 13 }}>
                      {item.phone || '—'}
                    </Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}
