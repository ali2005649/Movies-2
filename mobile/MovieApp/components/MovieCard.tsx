import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SharedMoviePoster, { prefetchPoster } from '@/components/SharedMoviePoster';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import type { Movie } from '@/types/movie';

type MovieCardProps = {
  movie: Movie;
  index?: number;
  /** Computed card width from responsive grid metrics. */
  cardWidth: number;
  /** Poster height matched to cardWidth (2:3 ratio). */
  posterHeight: number;
  titleFontSize?: number;
};

/**
 * Glass movie card — frosted chrome, 16px radius, gold lift on press.
 */
export default function MovieCard({
  movie,
  index = 0,
  cardWidth,
  posterHeight,
  titleFontSize = 14,
}: MovieCardProps) {
  const router = useRouter();
  const scale = useSharedValue(1);

  useEffect(() => {
    prefetchPoster(movie.poster);
  }, [movie.poster]);

  const lift = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const openDetails = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    prefetchPoster(movie.poster);
    router.push({ pathname: '/details', params: { id: movie.id } });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 60)
        .springify()
        .damping(16)
        .stiffness(120)}
      style={[styles.wrapper, SHADOWS.poster, { width: cardWidth }, lift]}
    >
      <Pressable
        style={styles.card}
        onPress={openDetails}
        onPressIn={() => {
          scale.value = withSpring(1.04, { damping: 16, stiffness: 220 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 16, stiffness: 220 });
        }}
        testID="movie-card"
        accessibilityLabel={`Movie ${movie.title}`}
      >
        <View style={styles.posterWrap}>
          <SharedMoviePoster
            movieId={movie.id}
            uri={movie.poster}
            style={{ width: '100%', height: posterHeight }}
            borderRadius={0}
          />
        </View>

        <View style={styles.info}>
          <Text
            style={[styles.title, { fontSize: titleFontSize }]}
            numberOfLines={1}
          >
            {movie.title}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={COLORS.primary} />
            <Text style={styles.rating}>{movie.rating.toFixed(1)}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.cardSolid,
  },
  card: {
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  posterWrap: {
    overflow: 'hidden',
    backgroundColor: COLORS.cardSolid,
  },
  info: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  title: {
    color: COLORS.textWhite,
    fontWeight: '700',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
