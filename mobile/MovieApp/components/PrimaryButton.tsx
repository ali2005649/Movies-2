import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
  /** Shows a spinner and blocks further presses. */
  loading?: boolean;
  disabled?: boolean;
};

/** Gold CTA with a premium drop shadow. */
export default function PrimaryButton({
  title,
  onPress,
  style,
  haptic = true,
  loading = false,
  disabled = false,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  const handlePress = async () => {
    if (isDisabled) return;
    if (haptic) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress?.();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        SHADOWS.button,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.primaryText} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.input,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
});
