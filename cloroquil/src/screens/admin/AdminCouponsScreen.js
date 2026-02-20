import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLORS, SPACING } from '../../config/theme';
import { formatBRL } from '../../utils/format';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function AdminCouponsScreen() {
  const [coupons, setCoupons] = useState([]);
  const [editing, setEditing] = useState(null);

  // Form fields
  const [code, setCode] = useState('');
  const [discountCents, setDiscountCents] = useState('');
  const [maxTotalUses, setMaxTotalUses] = useState('');
  const [maxUsesPerUser, setMaxUsesPerUser] = useState('1');
  const [restrictedToUid, setRestrictedToUid] = useState('');
  const [allowBelowZero, setAllowBelowZero] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      setCoupons(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  function startNew() {
    setEditing({});
    setCode('');
    setDiscountCents('');
    setMaxTotalUses('');
    setMaxUsesPerUser('1');
    setRestrictedToUid('');
    setAllowBelowZero(false);
  }

  function startEdit(coupon) {
    setEditing(coupon);
    setCode(coupon.code || '');
    setDiscountCents(String(coupon.discountCents || ''));
    setMaxTotalUses(coupon.maxTotalUses != null ? String(coupon.maxTotalUses) : '');
    setMaxUsesPerUser(String(coupon.maxUsesPerUser || 1));
    setRestrictedToUid(coupon.restrictedToUid || '');
    setAllowBelowZero(coupon.allowBelowZero || false);
  }

  async function handleSave() {
    if (!code.trim() || !discountCents) {
      Alert.alert('Erro', 'Código e desconto são obrigatórios.');
      return;
    }

    const discount = parseInt(discountCents, 10);
    const perUser = parseInt(maxUsesPerUser, 10);
    if (isNaN(discount) || discount <= 0 || isNaN(perUser) || perUser <= 0) {
      Alert.alert('Erro', 'Valores inválidos.');
      return;
    }

    setSaving(true);
    try {
      const data = {
        code: code.trim().toUpperCase(),
        discountCents: discount,
        active: editing.active !== false,
        maxUsesPerUser: perUser,
        restrictedToUid: restrictedToUid.trim() || null,
        allowBelowZero,
        updatedAt: serverTimestamp(),
      };

      if (maxTotalUses.trim()) {
        data.maxTotalUses = parseInt(maxTotalUses, 10);
      } else {
        data.maxTotalUses = null;
      }

      if (editing.id) {
        await updateDoc(doc(db, 'coupons', editing.id), data);
      } else {
        data.totalUsed = 0;
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, 'coupons'), data);
      }

      setEditing(null);
      Alert.alert('Sucesso', 'Cupom salvo!');
    } catch (err) {
      console.error('Save coupon error:', err);
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon) {
    try {
      await updateDoc(doc(db, 'coupons', coupon.id), {
        active: !coupon.active,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível alterar.');
    }
  }

  if (editing !== null) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.form}>
        <Text style={styles.title}>{editing.id ? 'Editar Cupom' : 'Novo Cupom'}</Text>

        <Input label="Código *" value={code} onChangeText={setCode} placeholder="EX: DESCONTO10" />
        <Input
          label="Desconto (centavos) *"
          value={discountCents}
          onChangeText={setDiscountCents}
          keyboardType="numeric"
          placeholder="1000 = R$ 10,00"
        />
        <Input
          label="Máximo de usos totais (vazio = ilimitado)"
          value={maxTotalUses}
          onChangeText={setMaxTotalUses}
          keyboardType="numeric"
        />
        <Input
          label="Máximo de usos por usuário *"
          value={maxUsesPerUser}
          onChangeText={setMaxUsesPerUser}
          keyboardType="numeric"
        />
        <Input
          label="UID do usuário (exclusivo, vazio = geral)"
          value={restrictedToUid}
          onChangeText={setRestrictedToUid}
          placeholder="Deixe vazio para cupom geral"
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Permitir total abaixo de zero?</Text>
          <Switch
            value={allowBelowZero}
            onValueChange={setAllowBelowZero}
            trackColor={{ false: COLORS.gray, true: COLORS.green }}
            thumbColor={COLORS.white}
          />
        </View>

        <Button title="Salvar" onPress={handleSave} loading={saving} />
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={() => setEditing(null)}
          style={{ marginTop: SPACING.sm }}
        />
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Button title="+ Novo Cupom" onPress={startNew} style={{ margin: SPACING.md }} />
      <FlatList
        data={coupons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.md }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.code}>{item.code}</Text>
            <Text style={styles.detail}>Desconto: {formatBRL(item.discountCents)}</Text>
            <Text style={styles.detail}>
              Usos: {item.totalUsed || 0}
              {item.maxTotalUses != null ? ` / ${item.maxTotalUses}` : ' (ilimitado)'}
            </Text>
            <Text style={styles.detail}>Por usuário: {item.maxUsesPerUser}</Text>
            <Text style={styles.detail}>
              Tipo: {item.restrictedToUid ? 'Exclusivo' : 'Geral'}
            </Text>
            <Text style={[styles.status, !item.active && styles.inactive]}>
              {item.active ? 'Ativo' : 'Inativo'}
            </Text>
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
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  switchLabel: {
    color: COLORS.white,
    fontSize: 14,
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  code: { color: COLORS.blueLight, fontSize: 18, fontWeight: '700' },
  detail: { color: COLORS.grayLight, fontSize: 13, marginTop: 2 },
  status: { color: COLORS.greenLight, fontSize: 13, marginTop: 4 },
  inactive: { color: COLORS.red },
  actions: { flexDirection: 'row', marginTop: SPACING.sm },
  actionBtn: { flex: 1, marginHorizontal: 4 },
});
