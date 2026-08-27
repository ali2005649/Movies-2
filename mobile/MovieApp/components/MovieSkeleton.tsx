import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 16;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_GAP * 3) / 2;

function ShimmerBox({ style }: { style?: object }) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, [shimmer]);

  const band = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-160, 160]) }],
  }));

  return (
    <View style={[styles.box, style]}>
      <Animated.View style={[styles.band, band]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.07)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

/** Grid skeleton for Home / Search loading states. */
export function MovieGridSkeleton({
  count = 6,
  cardWidth = CARD_WIDTH,
  posterHeight = 220,
  gap = CARD_GAP,
}: {
  count?: number;
  cardWidth?: number;
  posterHeight?: number;
  gap?: number;
}) {
  return (
    <View style={[styles.grid, { gap }]}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ width: cardWidth, marginBottom: gap }}>
          <ShimmerBox style={[styles.poster, { height: posterHeight }]} />
          <ShimmerBox style={styles.line} />
          <ShimmerBox style={styles.lineShort} />
        </View>
      ))}
    </View>
  );
}

/** Details screen skeleton while TMDB details load. */
export function DetailsSkeleton() {
  return (
    <View style={styles.detailsWrap}>
      <ShimmerBox style={styles.detailsPoster} />
      <ShimmerBox style={styles.titleLine} />
      <ShimmerBox style={styles.metaLine} />
      <View style={styles.genreRow}>
        <ShimmerBox style={styles.chip} />
        <ShimmerBox style={styles.chip} />
        <ShimmerBox style={styles.chip} />
      </View>
      <ShimmerBox style={styles.bodyLine} />
      <ShimmerBox style={styles.bodyLine} />
      <ShimmerBox style={[styles.bodyLine, { width: '70%' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  band: {
    ...StyleSheet.absoluteFillObject,
    width: 160,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  poster: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  line: {
    height: 12,
    borderRadius: 6,
    marginTop: 10,
    width: '90%',
  },
  lineShort: {
    height: 12,
    borderRadius: 6,
    marginTop: 8,
    width: '40%',
  },
  detailsWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  detailsPoster: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9 * 1.45,
    borderRadius: 16,
    marginBottom: 20,
  },
  titleLine: {
    alignSelf: 'stretch',
    height: 28,
    borderRadius: 8,
    marginBottom: 12,
  },
  metaLine: {
    alignSelf: 'stretch',
    height: 14,
    borderRadius: 7,
    width: '60%',
    marginBottom: 16,
  },
  genreRow: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  chip: {
    width: 72,
    height: 28,
    borderRadius: 14,
  },
  bodyLine: {
    alignSelf: 'stretch',
    height: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
});
