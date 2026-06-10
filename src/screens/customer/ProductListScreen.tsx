import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, Searchbar } from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import ProductCard from '../../components/ProductCard';
import { fetchActiveProducts } from '../../services/productService';
import { Product } from '../../types';
import { COLORS } from '../../constants';
import { BoutiqueStackParamList } from '../../navigation/types';

type Props = StackScreenProps<BoutiqueStackParamList, 'ProductList'>;

export default function ProductListScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchActiveProducts('women');
        if (mounted) setProducts(data);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Failed to load products');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <View className="flex-1 bg-white">
      <View className="px-3 pt-3">
        <Searchbar
          placeholder="Search products"
          value={searchQuery}
          onChangeText={setSearchQuery}
          iconColor={COLORS.primary}
          style={{ backgroundColor: COLORS.surface }}
        />
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
        >
          {categories.map((cat) => {
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
          <Text style={{ color: COLORS.textMuted }}>No products found.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 8, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() =>
                navigation.navigate('ProductDetail', { productId: item.id })
              }
            />
          )}
        />
      )}
    </View>
  );
}
