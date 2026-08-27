import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AuthChrome from '@/components/AuthChrome';
import GlassInput from '@/components/GlassInput';
import PrimaryButton from '@/components/PrimaryButton';
import { COLORS } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const validateLocally = (): boolean => {
    if (!identifier.trim() || !password) {
      setFieldError('Please enter your username/email and password.');
      return false;
    }
    if (password.length < authService.minPasswordLength) {
      setFieldError(
        `Password must be at least ${authService.minPasswordLength} characters.`
      );
      return false;
    }
    setFieldError(null);
    return true;
  };

  const handleLogin = async () => {
    clearError();
    if (!validateLocally()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      await login({ identifier, password });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (err) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
      Alert.alert('Sign in failed', message);
    }
  };

  const displayError = fieldError || error;

  return (
    <AuthChrome paddingTop={insets.top + 12}>
      <Pressable
        style={styles.backButton}
        onPress={async () => {
          await Haptics.selectionAsync();
          router.back();
        }}
      >
        <Ionicons name="chevron-back" size={18} color={COLORS.textMuted} />
        <Text style={styles.backText}>Back to home</Text>
      </Pressable>

      <Text style={styles.kicker}>Account</Text>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>
        Enter your username or email and password to continue.
      </Text>

      <GlassInput
        left={
          <Ionicons name="person-outline" size={18} color={COLORS.textMuted} />
        }
        placeholder="Username or email"
        value={identifier}
        onChangeText={(v) => {
          clearError();
          setFieldError(null);
          setIdentifier(v);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="username"
        editable={!isLoading}
      />

      <View style={styles.fieldGap} />

      <GlassInput
        left={
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={COLORS.textMuted}
          />
        }
        placeholder="Password"
        value={password}
        onChangeText={(v) => {
          clearError();
          setFieldError(null);
          setPassword(v);
        }}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        textContentType="password"
        editable={!isLoading}
        right={
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={8}
            disabled={isLoading}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={COLORS.textMuted}
            />
          </Pressable>
        }
      />

      {displayError ? <Text style={styles.error}>{displayError}</Text> : null}

      <PrimaryButton
        title="Sign in"
        onPress={handleLogin}
        loading={isLoading}
        disabled={isLoading}
        style={styles.submit}
      />

      <Pressable
        style={styles.switchRow}
        onPress={() => router.replace('/signup')}
        disabled={isLoading}
      >
        <Text style={styles.switchText}>New here? </Text>
        <Text style={styles.switchLink}>Create an account</Text>
      </Pressable>
    </AuthChrome>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 2,
  },
  backText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: COLORS.textWhite,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  fieldGap: {
    height: 14,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: 12,
  },
  submit: {
    width: '100%',
    marginTop: 18,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  switchText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  switchLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
