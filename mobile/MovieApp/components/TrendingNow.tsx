import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MovieCard from '@/components/MovieCard';
import { MovieGridSkeleton } from '@/components/MovieSkeleton';
import { COLORS } from '@/constants/theme';
import type { GridMetrics } from '@/utils/responsive';
import type { Movie } from '@/types/movie';

type TrendingNowProps = {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  layout: GridMetrics;
};

/**
 * Netflix-style popular-movies grid for the empty Search screen.
 */
export default function TrendingNow({
  movies,
  loading,
  error,
  layout,
}: TrendingNowProps) {
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <View style={styles.headingLeft}>
          <Ionicons name="flame-outline" size={16} color={COLORS.primary} />
          <Text style={styles.kicker}>Popular Movies</Text>
        </View>
        <Text style={styles.title}>Trending Now</Text>
        <View style={styles.goldRule} />
      </View>

      {loading && movies.length === 0 ? (
        <MovieGridSkeleton
          count={layout.numColumns * 3}
          cardWidth={layout.cardWidth}
          posterHeight={layout.posterHeight}
          gap={layout.gap}
        />
      ) : error && movies.length === 0 ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <View style={[styles.grid, { gap: layout.gap }]}>
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              index={index % layout.numColumns}
              cardWidth={layout.cardWidth}
              posterHeight={layout.posterHeight}
              titleFontSize={layout.titleFontSize}
            />
          ))}
        </View>
      )}

      {loading && movies.length > 0 ? (
        <ActivityIndicator color={COLORS.primary} style={styles.spinner} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    paddingTop: 28,
    paddingBottom: 8,
  },
  heading: {
    marginBottom: 16,
  },
  headingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.textWhite,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  goldRule: {
    width: 72,
    height: 1,
    backgroundColor: COLORS.primary,
    marginTop: 10,
    opacity: 0.85,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  error: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  spinner: {
    marginTop: 16,
  },
});
