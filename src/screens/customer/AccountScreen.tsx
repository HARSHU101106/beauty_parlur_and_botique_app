import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Avatar, Divider, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { StackScreenProps } from '@react-navigation/stack';
import { auth } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../constants';
import { AccountStackParamList } from '../../navigation/types';

type Props = StackScreenProps<AccountStackParamList, 'Account'>;

interface RowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

function MenuRow({ icon, label, onPress }: RowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-4"
    >
      <Ionicons name={icon} size={22} color={COLORS.primary} />
      <Text style={{ flex: 1, marginLeft: 14, fontSize: 15, color: COLORS.text }}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

export default function AccountScreen({ navigation }: Props) {
  const { user, reset } = useAuthStore();
  const [signingOut, setSigningOut] = useState(false);

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    try {
      setSigningOut(true);
      await signOut(auth);
      // RootNavigator's onAuthStateChanged also calls reset(); do it here too
      // so the UI updates immediately.
      reset();
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Profile header */}
      <View className="items-center px-6 pt-8 pb-6">
        <Avatar.Text
          size={84}
          label={initials}
          style={{ backgroundColor: COLORS.primary }}
          color="#fff"
        />
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginTop: 12 }}>
          {user?.name ?? 'Guest'}
        </Text>
        {!!user?.email && (
          <Text style={{ color: COLORS.textMuted, marginTop: 2 }}>{user.email}</Text>
        )}
        {!!user?.phone && (
          <Text style={{ color: COLORS.textMuted, marginTop: 2 }}>{user.phone}</Text>
        )}
      </View>

      <Divider />

      {/* Menu */}
      <MenuRow icon="calendar-outline" label="My Bookings" onPress={() => navigation.navigate('MyBookings')} />
      <Divider />
      <MenuRow icon="card-outline" label="My Payments" onPress={() => navigation.navigate('MyPayments')} />
      <Divider />
      <MenuRow icon="star-outline" label="My Feedback" onPress={() => navigation.navigate('FeedbackHistory')} />
      <Divider />

      {/* Logout */}
      <View className="px-6 mt-8">
        <Button
          mode="outlined"
          icon="logout"
          textColor={COLORS.error}
          style={{ borderColor: COLORS.error }}
          loading={signingOut}
          disabled={signingOut}
          onPress={handleLogout}
        >
          Log Out
        </Button>
      </View>
    </ScrollView>
  );
}
