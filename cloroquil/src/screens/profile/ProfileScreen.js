import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING } from '../../config/theme';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function ProfileScreen({ navigation }) {
  const { user, profile, isAdmin, isOwner, refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setStreet(profile.address?.street || '');
      setNumber(profile.address?.number || '');
      setNeighborhood(profile.address?.neighborhood || '');
      setComplement(profile.address?.complement || '');
      setCity(profile.address?.city || '');
    }
  }, [profile]);

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
      Alert.alert('Sucesso', 'Perfil atualizado!');
    } catch (err) {
      console.error('Save profile error:', err);
      Alert.alert('Erro', 'Não foi possível salvar o perfil.');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Meu Perfil</Text>

        <Input
          label="Celular"
          value={profile?.phoneE164 || ''}
          editable={false}
        />

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

        <Button title="Salvar" onPress={handleSave} loading={saving} />

        {(isAdmin || isOwner) && (
          <Button
            title="Painel Admin"
            variant="secondary"
            onPress={() => navigation.navigate('AdminPanel')}
            style={{ marginTop: SPACING.md }}
          />
        )}

        <Button
          title="Sair"
          variant="danger"
          onPress={handleLogout}
          style={{ marginTop: SPACING.md }}
        />
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
});
