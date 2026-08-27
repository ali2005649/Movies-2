import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassView from '@/components/GlassView';
import { COLORS } from '@/constants/theme';

type AuthChromeProps = {
  children: React.ReactNode;
  paddingTop: number;
};

/** Centered glass auth panel over a gold cinematic bloom. */
export default function AuthChrome({ children, paddingTop }: AuthChromeProps) {
  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['rgba(234,179,8,0.22)', 'transparent']}
          style={styles.bloom}
        />
        <View style={styles.haze} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <GlassView style={styles.card} intensity={50}>
          {children}
        </GlassView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bloom: {
    position: 'absolute',
    top: '28%',
    left: '50%',
    marginLeft: -140,
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: 'hidden',
  },
  haze: {
    position: 'absolute',
    left: '18%',
    top: '52%',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    padding: 28,
  },
});
