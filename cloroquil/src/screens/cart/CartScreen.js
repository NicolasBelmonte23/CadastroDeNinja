import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { COLORS, SPACING } from '../../config/theme';
import { formatBRL } from '../../utils/format';
import Button from '../../components/Button';

export default function CartScreen({ navigation }) {
  const { items, incrementQty, decrementQty, removeItem, subtotalCents } = useCart();

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
        <Button
          title="Ver produtos"
          onPress={() => navigation.navigate('ProductsTab')}
          style={{ marginTop: SPACING.lg }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              {item.photoUrl ? (
                <Image source={{ uri: item.photoUrl }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Text>📦</Text>
                </View>
              )}
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.price}>
                  {formatBRL(item.priceCents)} × {item.qty} ={' '}
                  {formatBRL(item.priceCents * item.qty)}
                </Text>
              </View>
            </View>
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.ctrlBtn}
                onPress={() => decrementQty(item.productId)}
              >
                <Text style={styles.ctrlText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qty}>{item.qty}</Text>
              <TouchableOpacity
                style={styles.ctrlBtn}
                onPress={() => incrementQty(item.productId)}
              >
                <Text style={styles.ctrlText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ctrlBtn, styles.removeBtn]}
                onPress={() => removeItem(item.productId)}
              >
                <Text style={styles.ctrlText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.subtotal}>Subtotal: {formatBRL(subtotalCents)}</Text>
        <Button title="Ir para o Checkout" onPress={() => navigation.navigate('Checkout')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 18,
  },
  list: {
    padding: SPACING.md,
    paddingBottom: 10,
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
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: SPACING.md,
    resizeMode: 'cover',
  },
  thumbPlaceholder: {
    backgroundColor: '#2A2A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  price: {
    color: COLORS.greenLight,
    fontSize: 14,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctrlBtn: {
    backgroundColor: COLORS.blue,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  removeBtn: {
    backgroundColor: COLORS.red,
    marginLeft: 12,
  },
  ctrlText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  qty: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
    minWidth: 24,
    textAlign: 'center',
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#2A2A4A',
  },
  subtotal: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
});
