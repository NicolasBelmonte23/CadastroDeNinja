import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLORS, SPACING } from '../../config/theme';
import { formatPhone } from '../../utils/format';
import Button from '../../components/Button';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  async function toggleBlock(user) {
    try {
      await updateDoc(doc(db, 'users', user.id), {
        blocked: !user.blocked,
      });
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível alterar.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciar Usuários</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.md }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name || '(sem nome)'}</Text>
            <Text style={styles.phone}>{formatPhone(item.phoneE164)}</Text>
            <Text style={styles.role}>Role: {item.role}</Text>
            <Text style={[styles.status, item.blocked && styles.blocked]}>
              {item.blocked ? '🚫 Bloqueado' : '✅ Ativo'}
            </Text>
            <Button
              title={item.blocked ? 'Desbloquear' : 'Bloquear'}
              variant={item.blocked ? 'secondary' : 'danger'}
              onPress={() => toggleBlock(item)}
              style={{ marginTop: SPACING.sm }}
            />
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  name: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  phone: { color: COLORS.grayLight, fontSize: 14, marginTop: 2 },
  role: { color: COLORS.blueLight, fontSize: 13, marginTop: 2 },
  status: { color: COLORS.greenLight, fontSize: 13, marginTop: 4 },
  blocked: { color: COLORS.red },
});
