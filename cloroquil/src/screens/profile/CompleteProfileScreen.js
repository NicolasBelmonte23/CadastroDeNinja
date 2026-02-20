import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING } from '../../config/theme';
import { APP_NAME } from '../../config/constants';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function CompleteProfileScreen() {
  const { user, refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || !street.trim() || !number.trim() || !neighborhood.trim() || !city.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, {
        name: name.trim(),
        address: {
          street: street.trim(),
          number: number.trim(),
          neighborhood: neighborhood.trim(),
          complement: complement.trim(),
          city: city.trim(),
        },
        updatedAt: serverTimestamp(),
      });
      await refreshProfile();
    } catch (err) {
      console.error('Complete profile error:', err);
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.logo}>{APP_NAME}</Text>
        <Text style={styles.title}>Complete seu perfil</Text>
        <Text style={styles.subtitle}>
          Precisamos dos seus dados de entrega para finalizar pedidos.
        </Text>

        <Input label="Nome *" value={name} onChangeText={setName} placeholder="Seu nome" />
        <Input label="Rua *" value={street} onChangeText={setStreet} placeholder="Rua" />
        <Input
          label="Número *"
          value={number}
          onChangeText={setNumber}
          placeholder="Número"
          keyboardType="numeric"
        />
        <Input
          label="Bairro *"
          value={neighborhood}
          onChangeText={setNeighborhood}
          placeholder="Bairro"
        />
        <Input
          label="Complemento"
          value={complement}
          onChangeText={setComplement}
          placeholder="Apto, bloco... (opcional)"
        />
        <Input label="Cidade *" value={city} onChangeText={setCity} placeholder="Cidade" />

        <Button title="Salvar e continuar" onPress={handleSave} loading={saving} />
      </ScrollView>
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
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.blueLight,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
});
