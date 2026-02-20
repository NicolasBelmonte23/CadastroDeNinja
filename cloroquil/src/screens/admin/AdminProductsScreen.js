import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../../config/firebase';
import { COLORS, SPACING } from '../../config/theme';
import { formatBRL } from '../../utils/format';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function AdminProductsScreen() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [priceCents, setPriceCents] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  function startEdit(product) {
    setEditing(product);
    setName(product.name || '');
    setPriceCents(String(product.priceCents || ''));
    setDescription(product.description || '');
    setImageUri(product.photoUrl || null);
  }

  function startNew() {
    setEditing({});
    setName('');
    setPriceCents('');
    setDescription('');
    setImageUri(null);
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function uploadImage(uri, productId) {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `products/${productId}_${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  }

  async function handleSave() {
    if (!name.trim() || !priceCents) {
      Alert.alert('Erro', 'Nome e preço são obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      const price = parseInt(priceCents, 10);
      if (isNaN(price) || price <= 0) {
        Alert.alert('Erro', 'Preço inválido (use valor em centavos, ex: 1500 = R$15,00).');
        setSaving(false);
        return;
      }

      let photoUrl = editing.photoUrl || null;

      // Upload image if local uri
      if (imageUri && !imageUri.startsWith('http')) {
        const productId = editing.id || 'new_' + Date.now();
        const url = await uploadImage(imageUri, productId);
        if (url) photoUrl = url;
      }

      const data = {
        name: name.trim(),
        priceCents: price,
        description: description.trim(),
        photoUrl,
        active: editing.active !== false,
        updatedAt: serverTimestamp(),
      };

      if (editing.id) {
        await updateDoc(doc(db, 'products', editing.id), data);
      } else {
        await addDoc(collection(db, 'products'), data);
      }

      setEditing(null);
      Alert.alert('Sucesso', 'Produto salvo!');
    } catch (err) {
      console.error('Save product error:', err);
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(product) {
    try {
      await updateDoc(doc(db, 'products', product.id), {
        active: !product.active,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível alterar.');
    }
  }

  if (editing !== null) {
    return (
      <View style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.title}>{editing.id ? 'Editar Produto' : 'Novo Produto'}</Text>

          {imageUri ? (
            <TouchableOpacity onPress={pickImage}>
              <Image source={{ uri: imageUri }} style={styles.preview} />
            </TouchableOpacity>
          ) : (
            <Button title="Selecionar foto" variant="secondary" onPress={pickImage} />
          )}

          <Input label="Nome *" value={name} onChangeText={setName} />
          <Input
            label="Preço (centavos) *"
            value={priceCents}
            onChangeText={setPriceCents}
            keyboardType="numeric"
            placeholder="1500 = R$ 15,00"
          />
          <Input
            label="Descrição"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Button title="Salvar" onPress={handleSave} loading={saving} />
          <Button
            title="Cancelar"
            variant="secondary"
            onPress={cancelEdit}
            style={{ marginTop: SPACING.sm }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button title="+ Novo Produto" onPress={startNew} style={{ margin: SPACING.md }} />
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.md }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              {item.photoUrl ? (
                <Image source={{ uri: item.photoUrl }} style={styles.thumb} />
              ) : null}
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{formatBRL(item.priceCents)}</Text>
                <Text style={[styles.status, !item.active && styles.inactive]}>
                  {item.active ? 'Ativo' : 'Inativo'}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <Button title="Editar" onPress={() => startEdit(item)} style={styles.actionBtn} />
              <Button
                title={item.active ? 'Desativar' : 'Ativar'}
                variant={item.active ? 'danger' : 'secondary'}
                onPress={() => toggleActive(item)}
                style={styles.actionBtn}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  form: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: SPACING.md,
    resizeMode: 'cover',
  },
  card: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: SPACING.md,
    resizeMode: 'cover',
  },
  info: { flex: 1 },
  name: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  price: { color: COLORS.greenLight, fontSize: 14 },
  status: { color: COLORS.greenLight, fontSize: 12, marginTop: 2 },
  inactive: { color: COLORS.red },
  actions: { flexDirection: 'row' },
  actionBtn: { flex: 1, marginHorizontal: 4 },
});
