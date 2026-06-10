import React, { useCallback, useState } from 'react';
import { View, ScrollView, FlatList, TouchableOpacity, Image } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { fetchActiveServices } from '../../services/serviceService';
import { fetchActiveProducts } from '../../services/productService';
import { Service, Product } from '../../types';
import { COLORS, SHADOWS } from '../../constants';
import GradientHeader from '../../components/GradientHeader';
import ServiceCard from '../../components/ServiceCard';
import ProductCard from '../../components/ProductCard';
import { KidsStackParamList } from '../../navigation/types';

type Props = StackScreenProps<KidsStackParamList, 'KidsHome'>;

export default function KidsScreen({ navigation }: Props) {
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
            fetchActiveServices('kids'),
            fetchActiveProducts('kids'),
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

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: COLORS.surface }}
      contentContainerStyle={{ paddingBottom: 28 }}
    >
      <GradientHeader colors="lavender">
        <View className="flex-row items-center justify-between">
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#EFE3FF', fontSize: 14 }}>Just for the little ones</Text>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold' }}>
              Kids Corner 🧸
            </Text>
            <Text style={{ color: '#EFE3FF', marginTop: 10, fontSize: 13 }}>
              Fun cuts, cute styles & adorable outfits for your champs.
            </Text>
          </View>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: 'rgba(255,255,255,0.22)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="happy" size={36} color="#fff" />
          </View>
        </View>
      </GradientHeader>

      {/* Playful highlight chips */}
      <View className="flex-row px-5" style={{ gap: 10, marginTop: -16 }}>
        <HighlightChip icon="cut" label="Kids Beauty" bg={COLORS.secondarySoft} color={COLORS.secondaryDark} />
        <HighlightChip icon="shirt" label="Kids Boutique" bg={COLORS.primarySoft} color={COLORS.primaryDark} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.secondary} style={{ marginTop: 48 }} />
      ) : (
        <>
          <SectionHeader title="Kids Beauty Services" emoji="✂️" />
          {services.length === 0 ? (
            <EmptyHint text="No kids services yet. Check back soon!" />
          ) : (
            <View className="flex-row flex-wrap px-2">
              {services.map((item) => (
                <View key={item.id} style={{ width: '50%' }}>
                  <ServiceCard
                    service={item}
                    onPress={() =>
                      navigation.navigate('ServiceDetail', { serviceId: item.id })
                    }
                  />
                </View>
              ))}
            </View>
          )}

          <SectionHeader title="Kids Boutique" emoji="🧦" />
          {products.length === 0 ? (
            <EmptyHint text="No kids products yet. Check back soon!" />
          ) : (
            <View className="flex-row flex-wrap px-2">
              {products.map((item) => (
                <View key={item.id} style={{ width: '50%' }}>
                  <ProductCard
                    product={item}
                    onPress={() =>
                      navigation.navigate('ProductDetail', { productId: item.id })
                    }
                  />
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function HighlightChip({
  icon,
  label,
  bg,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  bg: string;
  color: string;
}) {
  return (
    <View
      className="flex-1 flex-row items-center rounded-3xl px-4 py-3"
      style={[{ backgroundColor: COLORS.card }, SHADOWS.sm]}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={{ marginLeft: 10, fontWeight: '700', color: COLORS.text }}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title, emoji }: { title: string; emoji: string }) {
  return (
    <View className="px-5" style={{ marginTop: 22, marginBottom: 6 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.text }}>
        {emoji} {title}
      </Text>
    </View>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <Text style={{ color: COLORS.textMuted, paddingHorizontal: 20, paddingVertical: 12 }}>
      {text}
    </Text>
  );
}
