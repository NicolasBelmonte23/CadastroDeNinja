import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { COLORS, SPACING } from '../../config/theme';
import { formatBRL } from '../../utils/format';
import { sendOrderViaWhatsApp } from '../../utils/whatsapp';
import { validateCoupon, redeemCoupon, fetchMyCoupons } from '../../utils/couponService';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function CheckoutScreen({ navigation }) {
  const { user, profile, refreshProfile } = useAuth();
  const { items, subtotalCents, clearCart } = useCart();

  // Address fields (prefilled from profile)
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [city, setCity] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState(null); // 'pix' | 'dinheiro' | 'cartao'

  // Observations
  const [observations, setObservations] = useState('');

  // Coupon
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [myCoupons, setMyCoupons] = useState([]);
  const [showMyCoupons, setShowMyCoupons] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (profile) {
      setStreet(profile.address?.street || '');
      setNumber(profile.address?.number || '');
      setNeighborhood(profile.address?.neighborhood || '');
      setComplement(profile.address?.complement || '');
      setCity(profile.address?.city || '');
    }
  }, [profile]);

  // Calculate totals
  const discountCents = appliedCoupon ? appliedCoupon.discountCents : 0;
  let totalCents = subtotalCents - discountCents;
  if (!appliedCoupon?.allowBelowZero && totalCents < 0) {
    totalCents = 0;
  }

  async function handleApplyCouponCode() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const result = await validateCoupon(couponCode, user.uid);
    setCouponLoading(false);

    if (result.valid) {
      setAppliedCoupon(result.coupon);
      setShowCodeInput(false);
      Alert.alert('Cupom aplicado!', `Desconto de ${formatBRL(result.coupon.discountCents)}`);
    } else {
      Alert.alert('Erro', result.error);
    }
  }

  async function handleLoadMyCoupons() {
    setCouponLoading(true);
    const coupons = await fetchMyCoupons(user.uid);
    setMyCoupons(coupons);
    setCouponLoading(false);
    setShowMyCoupons(true);
  }

  async function handleSelectMyCoupon(coupon) {
    setCouponLoading(true);
    const result = await validateCoupon(coupon.code, user.uid);
    setCouponLoading(false);

    if (result.valid) {
      setAppliedCoupon(result.coupon);
      setShowMyCoupons(false);
      Alert.alert('Cupom aplicado!', `Desconto de ${formatBRL(result.coupon.discountCents)}`);
    } else {
      Alert.alert('Erro', result.error);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponCode('');
  }

  async function handleSendOrder() {
    // Validations
    if (!street.trim() || !number.trim() || !neighborhood.trim() || !city.trim()) {
      Alert.alert('Erro', 'Preencha o endereço completo.');
      return;
    }
    if (!paymentMethod) {
      Alert.alert('Erro', 'Selecione a forma de pagamento.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Erro', 'O carrinho está vazio.');
      return;
    }

    setSending(true);

    // If coupon applied, redeem it via transaction
    if (appliedCoupon) {
      const redeemResult = await redeemCoupon(appliedCoupon.id, user.uid);
      if (!redeemResult.success) {
        setSending(false);
        Alert.alert('Erro no cupom', redeemResult.error);
        setAppliedCoupon(null);
        return;
      }
    }

    // Update address in profile if changed
    try {
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, {
        address: {
          street: street.trim(),
          number: number.trim(),
          neighborhood: neighborhood.trim(),
          complement: complement.trim(),
          city: city.trim(),
        },
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Could not update address:', err);
    }

    // Send via WhatsApp
    const sent = await sendOrderViaWhatsApp({
      customerName: profile?.name || '',
      customerPhone: profile?.phoneE164 || '',
      address: {
        street: street.trim(),
        number: number.trim(),
        neighborhood: neighborhood.trim(),
        complement: complement.trim(),
        city: city.trim(),
      },
      items,
      subtotalCents,
      coupon: appliedCoupon,
      discountCents,
      totalCents,
      paymentMethod,
      observations: observations.trim(),
    });

    setSending(false);

    if (sent) {
      clearCart();
      navigation.popToTop();
    } else {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp. Verifique se está instalado.');
    }
  }

  const paymentOptions = [
    { key: 'pix', label: 'Pix (online)' },
    { key: 'dinheiro', label: 'Dinheiro na entrega' },
    { key: 'cartao', label: 'Cartão na entrega' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Checkout</Text>

        {/* Address */}
        <Text style={styles.section}>Endereço de entrega</Text>
        <Input label="Rua *" value={street} onChangeText={setStreet} />
        <Input label="Número *" value={number} onChangeText={setNumber} keyboardType="numeric" />
        <Input label="Bairro *" value={neighborhood} onChangeText={setNeighborhood} />
        <Input label="Complemento" value={complement} onChangeText={setComplement} />
        <Input label="Cidade *" value={city} onChangeText={setCity} />

        {/* Observations */}
        <Input
          label="Observações (opcional)"
          value={observations}
          onChangeText={setObservations}
          multiline
          placeholder="Instruções especiais..."
        />

        {/* Payment Method */}
        <Text style={styles.section}>Forma de pagamento *</Text>
        {paymentOptions.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.paymentOption,
              paymentMethod === opt.key && styles.paymentSelected,
            ]}
            onPress={() => setPaymentMethod(opt.key)}
          >
            <Text
              style={[
                styles.paymentText,
                paymentMethod === opt.key && styles.paymentTextSelected,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Coupon Section */}
        <Text style={styles.section}>Cupom de desconto</Text>
        {appliedCoupon ? (
          <View style={styles.couponApplied}>
            <Text style={styles.couponAppliedText}>
              ✅ {appliedCoupon.code} — Desconto {formatBRL(appliedCoupon.discountCents)}
            </Text>
            <TouchableOpacity onPress={removeCoupon}>
              <Text style={styles.removeCoupon}>Remover</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Button
              title="Ver meus cupons"
              variant="secondary"
              onPress={handleLoadMyCoupons}
              loading={couponLoading && !showCodeInput}
            />
            <TouchableOpacity
              style={styles.codeLink}
              onPress={() => setShowCodeInput(!showCodeInput)}
            >
              <Text style={styles.codeLinkText}>Tenho um código</Text>
            </TouchableOpacity>
            {showCodeInput && (
              <View style={styles.codeRow}>
                <Input
                  value={couponCode}
                  onChangeText={setCouponCode}
                  placeholder="Digite o código"
                  style={{ flex: 1, marginBottom: 0, marginRight: SPACING.sm }}
                />
                <Button
                  title="Aplicar"
                  onPress={handleApplyCouponCode}
                  loading={couponLoading}
                />
              </View>
            )}
          </View>
        )}

        {/* Order Summary */}
        <Text style={styles.section}>Resumo do pedido</Text>
        {items.map((item) => (
          <View key={item.productId} style={styles.summaryRow}>
            <Text style={styles.summaryItem}>
              {item.qty}x {item.name}
            </Text>
            <Text style={styles.summaryPrice}>{formatBRL(item.priceCents * item.qty)}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryPrice}>{formatBRL(subtotalCents)}</Text>
        </View>
        {appliedCoupon && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: COLORS.greenLight }]}>
              Desconto ({appliedCoupon.code})
            </Text>
            <Text style={[styles.summaryPrice, { color: COLORS.greenLight }]}>
              -{formatBRL(discountCents)}
            </Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>{formatBRL(totalCents)}</Text>
        </View>

        <Button
          title="Enviar pedido no WhatsApp"
          onPress={handleSendOrder}
          loading={sending}
          style={{ marginTop: SPACING.lg, backgroundColor: COLORS.green }}
        />
      </ScrollView>

      {/* My Coupons Modal */}
      <Modal visible={showMyCoupons} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Meus Cupons</Text>
            {myCoupons.length === 0 ? (
              <Text style={styles.modalEmpty}>Nenhum cupom exclusivo disponível.</Text>
            ) : (
              <FlatList
                data={myCoupons}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.couponItem}
                    onPress={() => handleSelectMyCoupon(item)}
                  >
                    <Text style={styles.couponItemCode}>{item.code}</Text>
                    <Text style={styles.couponItemDiscount}>
                      -{formatBRL(item.discountCents)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <Button
              title="Fechar"
              variant="secondary"
              onPress={() => setShowMyCoupons(false)}
              style={{ marginTop: SPACING.md }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  section: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.blueLight,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  paymentOption: {
    backgroundColor: COLORS.darkGray,
    padding: 14,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  paymentSelected: {
    borderColor: COLORS.blue,
    backgroundColor: '#1A2744',
  },
  paymentText: {
    color: COLORS.gray,
    fontSize: 15,
  },
  paymentTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  couponApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1B3A1B',
    padding: SPACING.md,
    borderRadius: 8,
  },
  couponAppliedText: {
    color: COLORS.greenLight,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  removeCoupon: {
    color: COLORS.red,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  codeLink: {
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  codeLinkText: {
    color: COLORS.blueLight,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  summaryItem: {
    color: COLORS.grayLight,
    fontSize: 14,
    flex: 1,
  },
  summaryPrice: {
    color: COLORS.grayLight,
    fontSize: 14,
  },
  summaryLabel: {
    color: COLORS.white,
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A4A',
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  totalPrice: {
    color: COLORS.greenLight,
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: SPACING.lg,
    maxHeight: '60%',
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  modalEmpty: {
    color: COLORS.gray,
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  couponItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A4A',
  },
  couponItemCode: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  couponItemDiscount: {
    color: COLORS.greenLight,
    fontSize: 16,
    fontWeight: '600',
  },
});
