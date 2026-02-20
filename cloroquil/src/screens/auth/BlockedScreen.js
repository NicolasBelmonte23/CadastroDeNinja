import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { COLORS, SPACING } from '../../config/theme';
import { APP_NAME } from '../../config/constants';
import Button from '../../components/Button';

export default function BlockedScreen() {
  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>{APP_NAME}</Text>
      <Text style={styles.icon}>🚫</Text>
      <Text style={styles.title}>Acesso Bloqueado</Text>
      <Text style={styles.message}>
        Sua conta foi bloqueada. Você não pode usar o aplicativo no momento.
      </Text>
      <Button
        title="Sair"
        variant="secondary"
        onPress={handleLogout}
        style={{ marginTop: SPACING.lg }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.blueLight,
    letterSpacing: 2,
    marginBottom: SPACING.lg,
  },
  icon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.red,
    marginBottom: SPACING.md,
  },
  message: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
});
