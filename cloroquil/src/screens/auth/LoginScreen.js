import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { COLORS, SPACING } from '../../config/theme';
import { APP_NAME } from '../../config/constants';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmResult, setConfirmResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('phone'); // 'phone' | 'code'

  // For web recaptcha (mobile uses Firebase's built-in reCAPTCHA)
  const recaptchaRef = useRef(null);

  function formatPhoneE164(input) {
    let digits = input.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = digits.slice(1);
    if (!digits.startsWith('55')) digits = '55' + digits;
    return '+' + digits;
  }

  async function handleSendCode() {
    if (!phone.trim()) {
      Alert.alert('Erro', 'Digite seu número de celular.');
      return;
    }

    setLoading(true);
    try {
      const phoneE164 = formatPhoneE164(phone);

      // On web, we need RecaptchaVerifier; on native, Firebase SDK handles it
      if (Platform.OS === 'web') {
        if (!recaptchaRef.current) {
          recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
          });
        }
        const result = await signInWithPhoneNumber(auth, phoneE164, recaptchaRef.current);
        setConfirmResult(result);
      } else {
        // For React Native, Firebase Phone Auth is handled differently
        // In production, use expo-firebase-recaptcha or react-native-firebase
        // For now, we set up the flow structure
        const result = await signInWithPhoneNumber(auth, phoneE164);
        setConfirmResult(result);
      }

      setStep('code');
      Alert.alert('Código enviado', `Um SMS foi enviado para ${phoneE164}`);
    } catch (err) {
      console.error('Send code error:', err);
      Alert.alert('Erro', 'Não foi possível enviar o SMS. Verifique o número e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    if (!code.trim() || code.length < 6) {
      Alert.alert('Erro', 'Digite o código de 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      await confirmResult.confirm(code);
      // Auth state change will be handled by AuthContext
    } catch (err) {
      console.error('Verify code error:', err);
      Alert.alert('Erro', 'Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>{APP_NAME}</Text>
          <Text style={styles.subtitle}>Produtos de Limpeza</Text>
        </View>

        {step === 'phone' ? (
          <View style={styles.form}>
            <Text style={styles.instruction}>
              Digite seu número de celular para entrar:
            </Text>
            <Input
              label="Celular (com DDD)"
              value={phone}
              onChangeText={setPhone}
              placeholder="(51) 98507-9395"
              keyboardType="phone-pad"
            />
            <Button title="Enviar código SMS" onPress={handleSendCode} loading={loading} />
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.instruction}>
              Digite o código de 6 dígitos enviado por SMS:
            </Text>
            <Input
              label="Código SMS"
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              keyboardType="number-pad"
            />
            <Button title="Verificar" onPress={handleVerifyCode} loading={loading} />
            <Button
              title="Reenviar código"
              variant="secondary"
              onPress={() => setStep('phone')}
              style={{ marginTop: SPACING.sm }}
            />
          </View>
        )}

        {Platform.OS === 'web' && <View nativeID="recaptcha-container" />}
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.blueLight,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.greenLight,
    marginTop: SPACING.xs,
  },
  form: {
    width: '100%',
  },
  instruction: {
    color: COLORS.white,
    fontSize: 15,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
});
