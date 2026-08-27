import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MovieCard from '@/components/MovieCard';
import { COLORS } from '@/constants/theme';
import type { Movie } from '@/types/movie';

const FEATURED_WIDTH = 132;
const FEATURED_POSTER = Math.round(FEATURED_WIDTH * 1.5);
const SNAP = FEATURED_WIDTH + 14;

type FeaturedMoviesRowProps = {
  movies: Movie[];
};

/**
 * Horizontal spotlight strip — snap-scrolling, no nested VirtualizedList.
 */
export default function FeaturedMoviesRow({ movies }: FeaturedMoviesRowProps) {
  if (!movies.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.kicker}>Featured</Text>
      <Text style={styles.title}>Now playing</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SNAP}
        snapToAlignment="start"
        disableIntervalMomentum
        bounces
        overScrollMode="never"
        contentContainerStyle={styles.list}
      >
        {movies.map((movie, index) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            index={index}
            cardWidth={FEATURED_WIDTH}
            posterHeight={FEATURED_POSTER}
            titleFontSize={13}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    color: COLORS.textWhite,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
  },
  list: {
    gap: 14,
    paddingRight: 8,
    paddingBottom: 12,
    paddingTop: 4,
  },
});
