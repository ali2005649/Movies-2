import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuthStore } from '@/store/authStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import { COLORS } from '@/constants/theme';

/**
 * Account management tab — sign in, view profile, sign out.
 */
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);
  const watchlistCount = useWatchlistStore((s) => s.movies.length);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          await logout();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerWrap, { paddingTop: insets.top + 12 }]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.headerFallback]} />
        )}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>
            {isAuthenticated ? 'Manage your account' : 'Sign in to sync your watchlist'}
          </Text>
        </Animated.View>
      </View>

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 110, paddingBottom: insets.bottom + 110 },
        ]}
      >
        {isAuthenticated && user ? (
          <Animated.View entering={FadeInDown.delay(80)} style={styles.card}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.name}>{user.displayName}</Text>
            <Text style={styles.username}>@{user.username}</Text>
            {user.email ? (
              <Text style={styles.meta}>{user.email}</Text>
            ) : null}

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{watchlistCount}</Text>
                <Text style={styles.statLabel}>Watchlist</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>Local</Text>
                <Text style={styles.statLabel}>Auth DB</Text>
              </View>
            </View>

            <Pressable
              style={[styles.logoutBtn, isLoading && styles.logoutDisabled]}
              onPress={handleLogout}
              disabled={isLoading}
            >
              <Text style={styles.logoutText}>
                {isLoading ? 'Signing out…' : 'Sign out'}
              </Text>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(80)} style={styles.card}>
            <View style={styles.avatarMuted}>
              <Ionicons name="person-outline" size={32} color={COLORS.textMuted} />
            </View>
            <Text style={styles.name}>Guest</Text>
            <Text style={styles.meta}>
              Sign in or create an account to manage your profile.
            </Text>
            <PrimaryButton
              title="Sign in"
              onPress={() => router.push('/login')}
              style={styles.loginBtn}
            />
            <Pressable
              style={styles.signupLink}
              onPress={() => router.push('/signup')}
            >
              <Text style={styles.signupLinkText}>Create an account</Text>
            </Pressable>
          </Animated.View>
        )}

        <View style={styles.menu}>
          <MenuRow
            icon="heart-outline"
            label="My Watchlist"
            onPress={() => router.navigate('/(tabs)/watchlist')}
          />
          <MenuRow
            icon="search-outline"
            label="Search movies"
            onPress={() => router.navigate('/(tabs)/search')}
          />
        </View>
      </View>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.menuRow}
      onPress={async () => {
        await Haptics.selectionAsync();
        onPress();
      }}
    >
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    overflow: 'hidden',
  },
  headerFallback: {
    backgroundColor: COLORS.overlay,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  title: {
    color: COLORS.textWhite,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 6,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: COLORS.glass,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.goldSoft,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarMuted: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  name: {
    color: COLORS.textWhite,
    fontSize: 22,
    fontWeight: '800',
  },
  username: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  meta: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 8,
    width: '100%',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },
  logoutBtn: {
    width: '100%',
    marginTop: 18,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.4)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '700',
  },
  loginBtn: {
    width: '100%',
    marginTop: 20,
  },
  signupLink: {
    marginTop: 14,
    padding: 6,
  },
  signupLinkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  menu: {
    marginTop: 16,
    backgroundColor: COLORS.glass,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: '600',
  },
});
