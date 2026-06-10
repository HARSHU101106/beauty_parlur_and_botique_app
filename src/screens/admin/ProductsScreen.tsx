import React, { useEffect, useState } from 'react';
import { View, FlatList, ScrollView, Image } from 'react-native';
import {
  Text,
  ActivityIndicator,
  FAB,
  Card,
  IconButton,
  Switch,
  Portal,
  Dialog,
  TextInput,
  Button,
  Snackbar,
  SegmentedButtons,
} from 'react-native-paper';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { pickAndUploadImage } from '../../services/storageService';
import { Product, Audience } from '../../types';
import { COLORS } from '../../constants';

interface FormState {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  stockCount: string;
  audience: Audience;
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  price: '',
  category: '',
  imageUrl: '',
  stockCount: '',
  audience: 'women',
};

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
      list.sort((a, b) => a.name.localeCompare(b.name));
      setProducts(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogVisible(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      category: p.category,
      imageUrl: p.imageUrl,
      stockCount: String(p.stockCount),
      audience: p.audience ?? 'women',
    });
    setDialogVisible(true);
  };

  const onSave = async () => {
    if (!form.name.trim() || !form.price.trim()) {
      setToast('Name and price are required');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      category: form.category.trim(),
      imageUrl: form.imageUrl.trim(),
      stockCount: Number(form.stockCount) || 0,
      audience: form.audience,
    };
    try {
      if (editing) {
        await updateDoc(doc(db, 'products', editing.id), payload);
        setToast('Product updated');
      } else {
        await addDoc(collection(db, 'products'), { ...payload, isActive: true });
        setToast('Product added');
      }
      setDialogVisible(false);
    } catch (e: any) {
      setToast(e?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onPickImage = async () => {
    setUploading(true);
    try {
      const url = await pickAndUploadImage('products');
      if (url) {
        setForm((f) => ({ ...f, imageUrl: url }));
        setToast('Image uploaded');
      }
    } catch (e: any) {
      setToast(e?.message ?? 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (p: Product) => {
    try {
      await updateDoc(doc(db, 'products', p.id), { isActive: !p.isActive });
    } catch (e: any) {
      setToast(e?.message ?? 'Update failed');
    }
  };

  const adjustStock = async (p: Product, delta: number) => {
    const next = Math.max(0, p.stockCount + delta);
    try {
      await updateDoc(doc(db, 'products', p.id), { stockCount: next });
    } catch (e: any) {
      setToast(e?.message ?? 'Update failed');
    }
  };

  const onDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, 'products', confirmDelete.id));
      setToast('Product deleted');
    } catch (e: any) {
      setToast(e?.message ?? 'Delete failed');
    } finally {
      setConfirmDelete(null);
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
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        ListEmptyComponent={
          <Text style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: 48 }}>
            No products yet. Tap + to add one.
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12, backgroundColor: COLORS.surface }} mode="outlined">
            <Card.Title
              title={item.name}
              titleStyle={{ fontWeight: 'bold', color: COLORS.text }}
              subtitle={`₹${item.price} · ${(item.audience ?? 'women') === 'kids' ? 'Kids' : 'Women'} · ${item.category || 'General'}`}
              right={() => (
                <View className="flex-row items-center pr-2">
                  <Switch
                    value={item.isActive}
                    onValueChange={() => toggleActive(item)}
                    color={COLORS.admin}
                  />
                  <IconButton icon="pencil" iconColor={COLORS.admin} onPress={() => openEdit(item)} />
                  <IconButton icon="delete" iconColor={COLORS.error} onPress={() => setConfirmDelete(item)} />
                </View>
              )}
            />
            <Card.Content>
              <View className="flex-row items-center justify-between">
                <Text style={{ color: item.stockCount > 0 ? COLORS.success : COLORS.error }}>
                  {item.stockCount > 0 ? `${item.stockCount} in stock` : 'Out of stock'}
                </Text>
                <View className="flex-row items-center">
                  <IconButton
                    icon="minus-circle-outline"
                    iconColor={COLORS.admin}
                    size={22}
                    onPress={() => adjustStock(item, -1)}
                  />
                  <Text style={{ minWidth: 24, textAlign: 'center', color: COLORS.text }}>
                    {item.stockCount}
                  </Text>
                  <IconButton
                    icon="plus-circle-outline"
                    iconColor={COLORS.admin}
                    size={22}
                    onPress={() => adjustStock(item, 1)}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      />

      <FAB
        icon="plus"
        color="#fff"
        style={{ position: 'absolute', right: 16, bottom: 16, backgroundColor: COLORS.admin }}
        onPress={openCreate}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{editing ? 'Edit Product' : 'Add Product'}</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
              <TextInput
                label="Name"
                value={form.name}
                onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
                mode="outlined"
                style={{ marginBottom: 10 }}
                activeOutlineColor={COLORS.admin}
              />
              <Text style={{ color: COLORS.textMuted, marginBottom: 6 }}>Audience</Text>
              <SegmentedButtons
                value={form.audience}
                onValueChange={(v) => setForm((f) => ({ ...f, audience: v as Audience }))}
                buttons={[
                  { value: 'women', label: 'Women', icon: 'flower' },
                  { value: 'kids', label: 'Kids', icon: 'teddy-bear' },
                ]}
                style={{ marginBottom: 10 }}
              />
              <TextInput
                label="Description"
                value={form.description}
                onChangeText={(t) => setForm((f) => ({ ...f, description: t }))}
                mode="outlined"
                multiline
                style={{ marginBottom: 10 }}
                activeOutlineColor={COLORS.admin}
              />
              <TextInput
                label="Price (₹)"
                value={form.price}
                onChangeText={(t) => setForm((f) => ({ ...f, price: t }))}
                mode="outlined"
                keyboardType="numeric"
                style={{ marginBottom: 10 }}
                activeOutlineColor={COLORS.admin}
              />
              <TextInput
                label="Category"
                value={form.category}
                onChangeText={(t) => setForm((f) => ({ ...f, category: t }))}
                mode="outlined"
                style={{ marginBottom: 10 }}
                activeOutlineColor={COLORS.admin}
              />
              <TextInput
                label="Stock count"
                value={form.stockCount}
                onChangeText={(t) => setForm((f) => ({ ...f, stockCount: t }))}
                mode="outlined"
                keyboardType="numeric"
                style={{ marginBottom: 10 }}
                activeOutlineColor={COLORS.admin}
              />
              <Button
                mode="outlined"
                icon="image-plus"
                onPress={onPickImage}
                loading={uploading}
                disabled={uploading}
                textColor={COLORS.admin}
                style={{ marginBottom: 10, borderColor: COLORS.admin }}
              >
                {uploading ? 'Uploading…' : 'Upload Image'}
              </Button>
              {form.imageUrl ? (
                <Image
                  source={{ uri: form.imageUrl }}
                  style={{
                    width: '100%',
                    height: 160,
                    borderRadius: 8,
                    marginBottom: 10,
                    backgroundColor: COLORS.border,
                  }}
                  resizeMode="cover"
                />
              ) : null}
              <TextInput
                label="Image URL"
                value={form.imageUrl}
                onChangeText={(t) => setForm((f) => ({ ...f, imageUrl: t }))}
                mode="outlined"
                style={{ marginBottom: 4 }}
                activeOutlineColor={COLORS.admin}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} textColor={COLORS.textMuted}>
              Cancel
            </Button>
            <Button onPress={onSave} loading={saving} disabled={saving} textColor={COLORS.admin}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={!!confirmDelete} onDismiss={() => setConfirmDelete(null)}>
          <Dialog.Title>Delete product?</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete "{confirmDelete?.name}"?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDelete(null)} textColor={COLORS.textMuted}>
              Cancel
            </Button>
            <Button onPress={onDelete} textColor={COLORS.error}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!toast} onDismiss={() => setToast(null)} duration={2500}>
        {toast ?? ''}
      </Snackbar>
    </View>
  );
}
