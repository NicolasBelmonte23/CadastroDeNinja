import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { COLORS, SPACING } from '../../config/theme';
import { formatBRL } from '../../utils/format';
import Button from '../../components/Button';

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const { addItem } = useCart();

  function handleAdd() {
    addItem(product);
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {product.photoUrl ? (
        <Image source={{ uri: product.photoUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>📦</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{formatBRL(product.priceCents)}</Text>

        {product.description ? (
          <Text style={styles.description}>{product.description}</Text>
        ) : null}

        <Button
          title="Adicionar ao carrinho"
          onPress={handleAdd}
          style={{ marginTop: SPACING.lg }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  scroll: {
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: '#2A2A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 64,
  },
  content: {
    padding: SPACING.lg,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.greenLight,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 15,
    color: COLORS.grayLight,
    lineHeight: 22,
  },
});
