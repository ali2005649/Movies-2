import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import SharedMoviePoster, { prefetchPoster } from '@/components/SharedMoviePoster';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import type { Movie } from '@/types/movie';

const CARD_WIDTH = 120;
const CARD_GAP = 14;
const SNAP = CARD_WIDTH + CARD_GAP;

type SimilarMoviesRowProps = {
  movies: Movie[];
  loading?: boolean;
  /** Avoid navigating to the movie currently open */
  currentId?: string;
};

/**
 * Horizontal "Similar Movies" slider — snap-scrolling glass posters.
 */
export default function SimilarMoviesRow({
  movies,
  loading,
  currentId,
}: SimilarMoviesRowProps) {
  const router = useRouter();
  const data = movies.filter((m) => m.id !== currentId);

  useEffect(() => {
    movies
      .filter((m) => m.id !== currentId)
      .slice(0, 8)
      .forEach((m) => prefetchPoster(m.poster));
  }, [movies, currentId]);

  if (loading) {
    return (
      <View style={styles.section} testID="similar-movies-section">
        <Text style={styles.title}>Similar Movies</Text>
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 12 }} />
      </View>
    );
  }

  if (!data.length) return null;

  return (
    <View style={styles.section} testID="similar-movies-section">
      <Text style={styles.kicker}>More like this</Text>
      <Text style={styles.title}>Similar Movies</Text>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SNAP}
        snapToAlignment="start"
        disableIntervalMomentum
        bounces
        overScrollMode="never"
        nestedScrollEnabled
        initialNumToRender={5}
        windowSize={7}
        maxToRenderPerBatch={5}
        removeClippedSubviews={Platform.OS === 'android'}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, SHADOWS.poster]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              prefetchPoster(item.poster);
              router.push({ pathname: '/details', params: { id: item.id } });
            }}
          >
            <SharedMoviePoster
              movieId={item.id}
              uri={item.poster}
              style={styles.poster}
              borderRadius={RADIUS.card}
            />
            <Text style={styles.name} numberOfLines={2}>
              {item.title}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    paddingBottom: 8,
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  title: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.cardSolid,
  },
  poster: {
    width: CARD_WIDTH,
    height: 180,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  name: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    lineHeight: 16,
  },
});
