import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING } from '../../config/theme';
import Button from '../../components/Button';

export default function AdminPanelScreen({ navigation }) {
  const { isOwner } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Painel Admin</Text>

      <Button
        title="Gerenciar Produtos"
        onPress={() => navigation.navigate('AdminProducts')}
        style={styles.btn}
      />

      <Button
        title="Gerenciar Cupons"
        onPress={() => navigation.navigate('AdminCoupons')}
        style={styles.btn}
      />

      <Button
        title="Gerenciar Usuários"
        onPress={() => navigation.navigate('AdminUsers')}
        style={styles.btn}
      />

      {isOwner && (
        <Button
          title="Gerenciar Admins"
          variant="secondary"
          onPress={() => navigation.navigate('AdminRoles')}
          style={styles.btn}
        />
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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xl,
  },
  btn: {
    marginBottom: SPACING.md,
  },
});
