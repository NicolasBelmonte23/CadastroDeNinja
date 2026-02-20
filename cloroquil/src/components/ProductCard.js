import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../config/theme';
import { formatBRL } from '../utils/format';

export default function ProductCard({ product, onPress, onAddToCart }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {product.photoUrl ? (
        <Image source={{ uri: product.photoUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>📦</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>{formatBRL(product.priceCents)}</Text>
      </View>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={(e) => {
          e.stopPropagation?.();
          onAddToCart(product);
        }}
      >
        <Text style={styles.addBtnText}>Adicionar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: '#2A2A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  info: {
    padding: SPACING.md,
  },
  name: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  price: {
    color: COLORS.greenLight,
    fontSize: 18,
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: COLORS.green,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15,
  },
});
