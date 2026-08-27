import React from 'react';
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, RADIUS } from '@/constants/theme';

type GlassViewProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  /** Stronger navy fill — use for floating nav / tab chrome. */
  strong?: boolean;
};

/**
 * Frosted glass panel: blur on iOS, translucent fill everywhere.
 */
export default function GlassView({
  children,
  style,
  intensity = 42,
  strong = false,
}: GlassViewProps) {
  return (
    <View style={[styles.base, style]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={intensity}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: strong ? COLORS.glassStrong : COLORS.glass },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
