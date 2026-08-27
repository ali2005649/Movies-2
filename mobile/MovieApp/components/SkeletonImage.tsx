import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  type StyleProp,
  type ImageStyle,
  type ViewStyle,
  type ImageProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

type SkeletonImageProps = {
  /** Remote poster URL — empty / failed loads show a placeholder. */
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  sharedTransitionTag?: string;
  borderRadius?: number;
};

type SharedImageProps = ImageProps & { sharedTransitionTag?: string };
const AnimatedSharedImage = Animated.Image as unknown as React.ComponentType<
  SharedImageProps & { style?: StyleProp<ImageStyle> }
>;

/**
 * Network image with shimmer skeleton + graceful fallback placeholder.
 */
export default function SkeletonImage({
  uri,
  style,
  containerStyle,
  sharedTransitionTag,
  borderRadius = 0,
}: SkeletonImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const shimmer = useSharedValue(0);

  const hasUri = typeof uri === 'string' && uri.trim().length > 0;
  const showFallback = !hasUri || failed;

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [uri]);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, [shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(shimmer.value, [0, 1], [-180, 180]),
      },
    ],
  }));

  return (
    <View style={[styles.container, { borderRadius }, containerStyle, style]}>
      {/* Shimmer while fetching */}
      {!loaded && !showFallback && (
        <View style={[StyleSheet.absoluteFill, styles.skeleton, { borderRadius }]}>
          <Animated.View style={[styles.shimmerBand, shimmerStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.08)', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.gradient}
            />
          </Animated.View>
        </View>
      )}

      {/* Fallback when URL is missing or onError fires */}
      {showFallback ? (
        <View style={[styles.fallback, { borderRadius }]}>
          <Ionicons name="film-outline" size={36} color={COLORS.textMuted} />
          <Text style={styles.fallbackLabel}>No Poster</Text>
        </View>
      ) : (
        <AnimatedSharedImage
          source={{ uri: uri! }}
          style={[styles.image, { borderRadius }]}
          sharedTransitionTag={sharedTransitionTag}
          onLoadEnd={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            setLoaded(true);
          }}
          resizeMode="cover"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  skeleton: {
    backgroundColor: '#1E293B',
    overflow: 'hidden',
  },
  shimmerBand: {
    ...StyleSheet.absoluteFillObject,
    width: 180,
  },
  gradient: {
    flex: 1,
    width: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    gap: 8,
  },
  fallbackLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
