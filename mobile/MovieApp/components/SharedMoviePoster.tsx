import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  type StyleProp,
  type ImageStyle,
} from 'react-native';
import { Image, type ImageProps } from 'expo-image';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

type SharedImageProps = ImageProps & {
  sharedTransitionTag?: string;
  style?: StyleProp<ImageStyle>;
};

/** Animated expo-image — cast so sharedTransitionTag is accepted by TS. */
const AnimatedExpoImage = Animated.createAnimatedComponent(
  Image
) as unknown as React.ComponentType<SharedImageProps>;

type SharedMoviePosterProps = {
  movieId: string;
  uri?: string | null;
  /** Must include explicit width/height so SET can morph layout correctly. */
  style: StyleProp<ImageStyle>;
  borderRadius?: number;
};

/**
 * Poster for Reanimated Shared Element Transition.
 * Uses only `sharedTransitionTag` — no custom SharedTransition config
 * (Expo Go crashes on SharedTransition.duration / springify).
 */
export default function SharedMoviePoster({
  movieId,
  uri,
  style,
  borderRadius = 0,
}: SharedMoviePosterProps) {
  const hasUri = typeof uri === 'string' && uri.trim().length > 0;
  const tag = `poster-${movieId}`;

  if (!hasUri) {
    return (
      <View style={[styles.fallback, { borderRadius }, style as object]}>
        <Ionicons name="film-outline" size={36} color={COLORS.textMuted} />
        <Text style={styles.fallbackLabel}>No Poster</Text>
      </View>
    );
  }

  return (
    <AnimatedExpoImage
      source={{ uri }}
      style={[{ borderRadius }, style]}
      sharedTransitionTag={tag}
      cachePolicy="memory-disk"
      recyclingKey={tag}
      contentFit="cover"
      transition={0}
      pointerEvents="none"
    />
  );
}

/** Warm the disk/memory cache so Details paints the same bitmap instantly. */
export function prefetchPoster(uri?: string | null) {
  if (uri) {
    void Image.prefetch(uri, 'memory-disk');
  }
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: COLORS.cardSolid,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  fallbackLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
