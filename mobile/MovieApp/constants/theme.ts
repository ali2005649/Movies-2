import { Platform, type ViewStyle } from 'react-native';

/**
 * Cinematic Glassmorphism tokens — kept in lockstep with the web app.
 */
export const COLORS = {
  background: '#09090B',
  card: 'rgba(255,255,255,0.05)',
  cardSolid: '#121214',
  primary: '#EAB308',
  primaryText: '#09090B',
  textWhite: '#FAFAFA',
  textMuted: '#A1A1AA',
  inputBg: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.10)',
  overlay: 'rgba(9, 9, 11, 0.62)',
  glass: 'rgba(255,255,255,0.05)',
  glassStrong: 'rgba(9, 9, 11, 0.55)',
  error: '#F87171',
  goldSoft: 'rgba(234, 179, 8, 0.14)',
} as const;

export const RADIUS = {
  card: 16,
  input: 12,
  pill: 999,
} as const;

const iosPoster: ViewStyle = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.48,
  shadowRadius: 20,
};

const iosGlow: ViewStyle = {
  shadowColor: '#EAB308',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.38,
  shadowRadius: 18,
};

const iosButton: ViewStyle = {
  shadowColor: '#EAB308',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.42,
  shadowRadius: 12,
};

export const SHADOWS = {
  poster: Platform.select<ViewStyle>({
    ios: iosPoster,
    android: { elevation: 12 },
    default: iosPoster,
  }) as ViewStyle,
  glow: Platform.select<ViewStyle>({
    ios: iosGlow,
    android: { elevation: 14 },
    default: iosGlow,
  }) as ViewStyle,
  button: Platform.select<ViewStyle>({
    ios: iosButton,
    android: { elevation: 8 },
    default: iosButton,
  }) as ViewStyle,
} as const;

export type ColorToken = keyof typeof COLORS;
