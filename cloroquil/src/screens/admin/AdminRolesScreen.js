import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING } from '../../config/theme';
import { formatPhone } from '../../utils/format';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function AdminRolesScreen() {
  const { isOwner } = useAuth();
  const [search, setSearch] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!search.trim()) return;
    setLoading(true);
    setFoundUser(null);

    try {
      const input = search.trim();
      let results = [];

      // Try searching by UID first
      const { getDoc } = await import('firebase/firestore');
      const userDoc = await getDoc(doc(db, 'users', input));
      if (userDoc.exists()) {
        results.push({ id: userDoc.id, ...userDoc.data() });
      }

      // Also try by phone
      if (results.length === 0) {
        let phoneSearch = input;
        if (!phoneSearch.startsWith('+')) {
          const digits = phoneSearch.replace(/\D/g, '');
          phoneSearch = digits.startsWith('55') ? '+' + digits : '+55' + digits;
        }
        const q = query(collection(db, 'users'), where('phoneE164', '==', phoneSearch));
        const snap = await getDocs(q);
        snap.docs.forEach((d) => results.push({ id: d.id, ...d.data() }));
      }

      if (results.length > 0) {
        setFoundUser(results[0]);
      } else {
        Alert.alert('Não encontrado', 'Nenhum usuário encontrado.');
      }
    } catch (err) {
      console.error('Search error:', err);
      Alert.alert('Erro', 'Erro ao buscar usuário.');
    } finally {
      setLoading(false);
    }
  }

  async function setRole(uid, role) {
    if (!isOwner) {
      Alert.alert('Erro', 'Apenas o OWNER pode alterar roles.');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', uid), {
        role,
        updatedAt: serverTimestamp(),
      });
      setFoundUser((prev) => (prev ? { ...prev, role } : null));
      Alert.alert('Sucesso', `Role alterada para ${role}`);
    } catch (err) {
      console.error('Set role error:', err);
      Alert.alert('Erro', 'Não foi possível alterar.');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Gerenciar Admins</Text>
      <Text style={styles.subtitle}>Somente o OWNER pode promover/rebaixar admins.</Text>

      <Input
        label="Buscar por UID ou celular"
        value={search}
        onChangeText={setSearch}
        placeholder="UID ou (51) 98507-9395"
      />
      <Button title="Buscar" onPress={handleSearch} loading={loading} />

      {foundUser && (
        <View style={styles.card}>
          <Text style={styles.name}>{foundUser.name || '(sem nome)'}</Text>
          <Text style={styles.phone}>{formatPhone(foundUser.phoneE164)}</Text>
          <Text style={styles.uid}>UID: {foundUser.id}</Text>
          <Text style={styles.role}>Role atual: {foundUser.role}</Text>

          {foundUser.role === 'USER' && (
            <Button
              title="Promover a ADMIN"
              onPress={() => setRole(foundUser.id, 'ADMIN')}
              style={{ marginTop: SPACING.md }}
            />
          )}
          {foundUser.role === 'ADMIN' && (
            <Button
              title="Rebaixar para USER"
              variant="danger"
              onPress={() => setRole(foundUser.id, 'USER')}
              style={{ marginTop: SPACING.md }}
            />
          )}
          {foundUser.role === 'OWNER' && (
            <Text style={styles.ownerNote}>O OWNER não pode ser rebaixado.</Text>
          )}
        </View>
      )}
    </ScrollView>
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
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: 13,
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 10,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  name: { color: COLORS.white, fontSize: 18, fontWeight: '600' },
  phone: { color: COLORS.grayLight, fontSize: 14, marginTop: 2 },
  uid: { color: COLORS.gray, fontSize: 12, marginTop: 2 },
  role: { color: COLORS.blueLight, fontSize: 15, fontWeight: '600', marginTop: SPACING.sm },
  ownerNote: { color: COLORS.gray, fontSize: 13, marginTop: SPACING.md, fontStyle: 'italic' },
});
