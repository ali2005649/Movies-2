import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { COLORS, RADIUS } from '@/constants/theme';

type GlassInputProps = TextInputProps & {
  left?: React.ReactNode;
  right?: React.ReactNode;
};

/** Frosted text field with gold focus ring — used on Auth and Search. */
export default function GlassInput({
  left,
  right,
  style,
  onFocus,
  onBlur,
  ...rest
}: GlassInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrap, focused && styles.focused]}>
      {left}
      <TextInput
        {...rest}
        style={[styles.input, style]}
        placeholderTextColor={COLORS.textMuted}
        selectionColor={COLORS.primary}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
      />
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.input,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  focused: {
    borderColor: 'rgba(234, 179, 8, 0.55)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  input: {
    flex: 1,
    color: COLORS.textWhite,
    height: 50,
    fontSize: 16,
  },
});
