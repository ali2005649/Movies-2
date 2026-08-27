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

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signUp = useAuthStore((s) => s.signUp);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const validateLocally = (): boolean => {
    if (!username.trim() || !email.trim() || !password) {
      setFieldError('Please fill in all fields.');
      return false;
    }
    if (username.trim().length < 3) {
      setFieldError('Username must be at least 3 characters.');
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

  const handleSignUp = async () => {
    clearError();
    if (!validateLocally()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      await signUp({ username, email, password });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (err) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message =
        err instanceof Error ? err.message : 'Sign up failed. Please try again.';
      Alert.alert('Sign up failed', message);
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
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <Text style={styles.kicker}>Account</Text>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>
        Join to save favorites and sync your watchlist across sessions.
      </Text>

      <GlassInput
        left={
          <Ionicons name="person-outline" size={18} color={COLORS.textMuted} />
        }
        placeholder="Username"
        value={username}
        onChangeText={(v) => {
          clearError();
          setFieldError(null);
          setUsername(v);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="username"
        editable={!isLoading}
      />

      <View style={styles.fieldGap} />

      <GlassInput
        left={
          <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />
        }
        placeholder="Email"
        value={email}
        onChangeText={(v) => {
          clearError();
          setFieldError(null);
          setEmail(v);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
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
        placeholder={`Password (min ${authService.minPasswordLength} chars)`}
        value={password}
        onChangeText={(v) => {
          clearError();
          setFieldError(null);
          setPassword(v);
        }}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        textContentType="newPassword"
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
        title="Create account"
        onPress={handleSignUp}
        loading={isLoading}
        disabled={isLoading}
        style={styles.submit}
      />

      <Pressable
        style={styles.switchRow}
        onPress={() => router.replace('/login')}
        disabled={isLoading}
      >
        <Text style={styles.switchText}>Already have an account? </Text>
        <Text style={styles.switchLink}>Sign in</Text>
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
