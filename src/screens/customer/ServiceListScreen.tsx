import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import ServiceCard from '../../components/ServiceCard';
import { fetchActiveServices } from '../../services/serviceService';
import { Service } from '../../types';
import { COLORS } from '../../constants';
import { BeautyStackParamList } from '../../navigation/types';

type Props = StackScreenProps<BeautyStackParamList, 'ServiceList'>;

const CATEGORIES = ['All', 'Facial', 'Threading', 'Waxing', 'Hair', 'Nails', 'Bridal'];

export default function ServiceListScreen({ navigation }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchActiveServices('women');
        if (mounted) setServices(data);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Failed to load services');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return services;
    return services.filter((s) => s.category === selectedCategory);
  }, [services, selectedCategory]);

  return (
    <View className="flex-1 bg-white">
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
        >
          {CATEGORIES.map((cat) => {
            const active = cat === selectedCategory;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className="px-4 py-2 mr-2 rounded-full"
                style={{
                  backgroundColor: active ? COLORS.primary : COLORS.surface,
                  borderWidth: 1,
                  borderColor: active ? COLORS.primary : COLORS.border,
                }}
              >
                <Text style={{ color: active ? '#fff' : COLORS.text, fontWeight: '600' }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{ color: COLORS.error, textAlign: 'center' }}>{error}</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{ color: COLORS.textMuted }}>No services in this category.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 8, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onPress={() =>
                navigation.navigate('ServiceDetail', { serviceId: item.id })
              }
            />
          )}
        />
      )}
    </View>
  );
}
