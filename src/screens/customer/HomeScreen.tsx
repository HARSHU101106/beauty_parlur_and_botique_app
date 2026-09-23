import React, { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { CompositeScreenProps } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { fetchActiveServices } from '../../services/serviceService';
import { fetchActiveProducts } from '../../services/productService';
import { useAuthStore } from '../../store/authStore';
import { Service, Product } from '../../types';
import { COLORS, SHADOWS } from '../../constants';
import GradientHeader from '../../components/GradientHeader';
import { HomeStackParamList, CustomerTabParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  StackScreenProps<HomeStackParamList, 'Home'>,
  BottomTabScreenProps<CustomerTabParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          const [s, p] = await Promise.all([
            fetchActiveServices(),
            fetchActiveProducts(),
          ]);
          if (mounted) {
            setServices(s);
            setProducts(p);
          }
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }, []),
  );

  const firstName = (user?.name ?? 'there').split(' ')[0];

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: COLORS.surface }}
      contentContainerStyle={{ paddingBottom: 28 }}
    >
      {/* Gradient header banner */}
      <GradientHeader colors="primary">
        <View className="flex-row justify-between items-center">
          <View>
            <Text style={{ color: '#FFE3EF', fontSize: 14 }}>Welcome back,</Text>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold' }}>
              {firstName} 👋
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(255,255,255,0.22)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={{ color: '#FFE3EF', marginTop: 14, fontSize: 14 }}>
          ✨ Pamper yourself today with our beauty & boutique picks.
        </Text>
      </GradientHeader>

      {/* Quick actions */}
      <View className="flex-row px-5" style={{ gap: 12, marginTop: -18 }}>
        <CategoryCard
          icon="cut"
          label="Book Beauty"
          gradientColor={COLORS.primary}
          bg={COLORS.primarySoft}
          onPress={() => navigation.navigate('BeautyTab')}
        />
        <CategoryCard
          icon="bag-handle"
          label="Shop Boutique"
          gradientColor={COLORS.secondary}
          bg={COLORS.secondarySoft}
          onPress={() => navigation.navigate('BoutiqueTab')}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Popular services */}
          <SectionHeader
            title="Popular Services"
            onSeeAll={() => navigation.navigate('BeautyTab')}
          />
          <FlatList
            horizontal
            data={services.slice(0, 6)}
            keyExtractor={(s) => s.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
            ListEmptyComponent={<EmptyHint text="No services yet." />}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('BeautyTab')}
                className="mr-3 rounded-3xl overflow-hidden"
                style={[{ width: 158, backgroundColor: COLORS.card }, SHADOWS.sm]}
              >
                <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: 104 }} resizeMode="cover" />
                <View className="px-3 py-2">
                  <Text numberOfLines={1} style={{ fontWeight: 'bold', color: COLORS.text }}>
                    {item.name}
                  </Text>
                  <Text style={{ color: COLORS.primary, fontWeight: 'bold', marginTop: 2 }}>
                    ₹{item.price}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />

          {/* Featured products */}
          <SectionHeader
            title="Featured Products"
            onSeeAll={() => navigation.navigate('BoutiqueTab')}
          />
          <FlatList
            horizontal
            data={products.slice(0, 6)}
            keyExtractor={(p) => p.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
            ListEmptyComponent={<EmptyHint text="No products yet." />}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('BoutiqueTab')}
                className="mr-3 rounded-3xl overflow-hidden"
                style={[{ width: 158, backgroundColor: COLORS.card }, SHADOWS.sm]}
              >
                <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: 104 }} resizeMode="cover" />
                <View className="px-3 py-2">
                  <Text numberOfLines={1} style={{ fontWeight: 'bold', color: COLORS.text }}>
                    {item.name}
                  </Text>
                  <Text style={{ color: COLORS.primary, fontWeight: 'bold', marginTop: 2 }}>
                    ₹{item.price}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </ScrollView>
  );
}

function CategoryCard({
  icon,
  label,
  gradientColor,
  bg,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  gradientColor: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-1 rounded-3xl p-4 items-center"
      style={[{ backgroundColor: COLORS.card }, SHADOWS.md]}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={26} color={gradientColor} />
      </View>
      <Text style={{ marginTop: 10, fontWeight: '700', color: COLORS.text }}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  return (
    <View className="flex-row justify-between items-center px-5 mt-7 mb-3">
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.text }}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={{ color: COLORS.primary, fontWeight: '700' }}>See all</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <Text style={{ color: COLORS.textMuted, paddingHorizontal: 20 }}>{text}</Text>;
}
