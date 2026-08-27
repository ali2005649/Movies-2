import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import MovieCard from '@/components/MovieCard';
import FeaturedMoviesRow from '@/components/FeaturedMoviesRow';
import GlassView from '@/components/GlassView';
import PrimaryButton from '@/components/PrimaryButton';
import FilterBottomSheet from '@/components/FilterBottomSheet';
import { MovieGridSkeleton } from '@/components/MovieSkeleton';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import {
  fetchNowPlayingMovies,
  fetchPopularMovies,
  type MovieFilters,
} from '@/services/api';
import { FILTER_OPTIONS } from '@/services/movieService';
import { useAuthStore } from '@/store/authStore';
import type { Movie } from '@/types/movie';

type ActiveSheet = 'genre' | 'year' | 'rating' | null;

type FilterChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  accessibilityLabel: string;
};

/** Equal-height glass chip — label + chevron centered as a pair. */
function FilterChip({
  label,
  active,
  onPress,
  accessibilityLabel,
}: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterButton,
        active && styles.filterActive,
        pressed && styles.filterPressed,
      ]}
    >
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[styles.filterText, active && styles.filterTextActive]}
      >
        {label}
      </Text>
      <View style={styles.filterChevronWrap} pointerEvents="none">
        <Ionicons
          name="chevron-down"
          size={12}
          color={active ? COLORS.primary : COLORS.textMuted}
        />
      </View>
    </Pressable>
  );
}

/** Base tab content height (icons + label) before safe-area inset. */
const TAB_BAR_CONTENT = 56;

/**
 * Home — cinematic glass header, featured strip, responsive TMDB grid.
 */
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const layout = useResponsiveLayout();

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0
  );
  const bottomPad = TAB_BAR_CONTENT + Math.max(insets.bottom, 8) + 24;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [genre, setGenre] = useState<string>('All genres');
  const [year, setYear] = useState<string>('All years');
  const [rating, setRating] = useState<string>('Any rating');
  const genreSheetRef = useRef<BottomSheetModal>(null);
  const yearSheetRef = useRef<BottomSheetModal>(null);
  const ratingSheetRef = useRef<BottomSheetModal>(null);

  const filters: MovieFilters = useMemo(
    () => ({ genre, year, rating }),
    [genre, year, rating]
  );

  const loadPage = useCallback(
    async (nextPage: number, replace: boolean) => {
      if (replace) {
        setInitialLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const result = await fetchPopularMovies(nextPage, filters);
        setMovies((prev) =>
          replace ? result.data : [...prev, ...result.data]
        );
        setPage(result.page);
        setHasMore(result.hasMore);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load movies.';
        if (replace) {
          setMovies([]);
          setError(message);
        }
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    void loadPage(1, true);
  }, [loadPage]);

  useEffect(() => {
    let cancelled = false;

    void fetchNowPlayingMovies(1)
      .then((result) => {
        if (!cancelled) setNowPlaying(result.data);
      })
      .catch(() => {
        if (!cancelled) setNowPlaying([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const openSheet = async (sheet: ActiveSheet) => {
    await Haptics.selectionAsync();
    genreSheetRef.current?.dismiss();
    yearSheetRef.current?.dismiss();
    ratingSheetRef.current?.dismiss();
    if (sheet === 'genre') genreSheetRef.current?.present();
    if (sheet === 'year') yearSheetRef.current?.present();
    if (sheet === 'rating') ratingSheetRef.current?.present();
  };

  const closeSheets = () => {
    genreSheetRef.current?.dismiss();
    yearSheetRef.current?.dismiss();
    ratingSheetRef.current?.dismiss();
  };

  const onEndReached = () => {
    if (!hasMore || loadingMore || initialLoading || error) return;
    void loadPage(page + 1, false);
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Movie; index: number }) => (
      <MovieCard
        movie={item}
        index={index % layout.numColumns}
        cardWidth={layout.cardWidth}
        posterHeight={layout.posterHeight}
        titleFontSize={layout.titleFontSize}
      />
    ),
    [layout.cardWidth, layout.posterHeight, layout.numColumns, layout.titleFontSize]
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.headerWrap,
          {
            paddingTop: topInset + 8,
            paddingHorizontal: layout.contentPadding,
          },
        ]}
      >
        <View style={[styles.headerShadow, SHADOWS.poster]}>
        <GlassView strong intensity={55}>
          <View
            style={[
              styles.header,
              { minHeight: layout.isTablet ? 56 : 52 },
            ]}
          >
            <Animated.Text
              entering={FadeIn.duration(500)}
              style={[styles.logo, layout.isTablet && styles.logoTablet]}
            >
              MOVIES
            </Animated.Text>

            {!isAuthenticated ? (
              <PrimaryButton
                title="Login"
                onPress={() => router.push('/login')}
                style={styles.loginButton}
              />
            ) : null}
          </View>
        </GlassView>
        </View>
      </View>

      <FlatList
        key={`home-grid-${layout.numColumns}`}
        style={styles.list}
        data={movies}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={layout.numColumns}
        columnWrapperStyle={[
          styles.row,
          {
            gap: layout.gap,
            marginBottom: layout.gap,
            paddingHorizontal: layout.contentPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPad },
          movies.length === 0 && styles.listEmptyGrow,
        ]}
        ListHeaderComponent={
          <View style={styles.discoverSection}>
            <View style={{ paddingHorizontal: layout.contentPadding }}>
              <Text style={styles.kicker}>Cinematic Collection</Text>
              <Text
                style={[
                  styles.sectionTitle,
                  { fontSize: layout.sectionTitleSize },
                ]}
              >
                Discover Movies
              </Text>
              <View style={styles.goldRule} />
            </View>

            <View
              collapsable={false}
              style={[
                styles.filtersWrap,
                { marginHorizontal: layout.contentPadding },
              ]}
            >
              <GlassView style={styles.filtersGlass}>
                <ScrollView
                  horizontal
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  bounces={false}
                  overScrollMode="never"
                  style={styles.filtersScroll}
                  contentContainerStyle={styles.filtersRow}
                >
                  <FilterChip
                    label={genre}
                    active={genre !== 'All genres'}
                    onPress={() => openSheet('genre')}
                    accessibilityLabel={`Genre filter, ${genre}`}
                  />
                  <FilterChip
                    label={year}
                    active={year !== 'All years'}
                    onPress={() => openSheet('year')}
                    accessibilityLabel={`Year filter, ${year}`}
                  />
                  <FilterChip
                    label={rating}
                    active={rating !== 'Any rating'}
                    onPress={() => openSheet('rating')}
                    accessibilityLabel={`Rating filter, ${rating}`}
                  />
                </ScrollView>
              </GlassView>
            </View>

            {nowPlaying.length > 0 ? (
              <View style={{ paddingHorizontal: layout.contentPadding }}>
                <FeaturedMoviesRow movies={nowPlaying} />
              </View>
            ) : null}

            {!initialLoading && movies.length > 0 ? (
              <Text
                style={[
                  styles.catalogLabel,
                  { paddingHorizontal: layout.contentPadding },
                ]}
              >
                All titles
              </Text>
            ) : null}
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.footerText}>Loading more…</Text>
            </View>
          ) : !hasMore && movies.length > 0 ? (
            <Text style={styles.endText}>You’re all caught up</Text>
          ) : null
        }
        ListEmptyComponent={
          initialLoading ? (
            <View style={{ paddingHorizontal: layout.contentPadding }}>
              <MovieGridSkeleton
                count={layout.numColumns * 3}
                cardWidth={layout.cardWidth}
                posterHeight={layout.posterHeight}
                gap={layout.gap}
              />
            </View>
          ) : (
            <View style={styles.empty}>
              <GlassView style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  {error ?? 'No movies match these filters'}
                </Text>
                {error ? (
                  <Pressable
                    style={styles.retry}
                    onPress={() => void loadPage(1, true)}
                  >
                    <Text style={styles.retryText}>Retry</Text>
                  </Pressable>
                ) : null}
              </GlassView>
            </View>
          )
        }
      />

      <FilterBottomSheet
        ref={genreSheetRef}
        title="Select genre"
        options={FILTER_OPTIONS.genres}
        selected={genre}
        onSelect={(value) => {
          setGenre(value);
          closeSheets();
        }}
      />
      <FilterBottomSheet
        ref={yearSheetRef}
        title="Select year"
        options={FILTER_OPTIONS.years}
        selected={year}
        onSelect={(value) => {
          setYear(value);
          closeSheets();
        }}
      />
      <FilterBottomSheet
        ref={ratingSheetRef}
        title="Minimum rating"
        options={FILTER_OPTIONS.ratings}
        selected={rating}
        onSelect={(value) => {
          setRating(value);
          closeSheets();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerWrap: {
    zIndex: 10,
    paddingBottom: 10,
  },
  headerShadow: {
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.cardSolid,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  logo: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  logoTablet: {
    fontSize: 24,
    letterSpacing: 1.4,
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.pill,
    minHeight: 36,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 4,
    flexGrow: 1,
  },
  listEmptyGrow: {
    flexGrow: 1,
  },
  discoverSection: {
    paddingTop: 4,
    paddingBottom: 16,
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sectionTitle: {
    color: COLORS.textWhite,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  goldRule: {
    width: 96,
    height: 1,
    backgroundColor: COLORS.primary,
    marginTop: 10,
    marginBottom: 16,
    opacity: 0.85,
  },
  filtersWrap: {
    alignSelf: 'stretch',
    overflow: 'hidden',
    marginBottom: 22,
  },
  filtersGlass: {
    width: '100%',
    alignSelf: 'stretch',
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filtersRow: {
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  filterButton: {
    flexGrow: 1,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 108,
    minHeight: 42,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
  },
  filterActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.goldSoft,
  },
  filterPressed: {
    opacity: 0.88,
  },
  filterText: {
    flexShrink: 1,
    color: COLORS.textWhite,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  filterTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  filterChevronWrap: {
    width: 14,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  catalogLabel: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 14,
  },
  row: {
    justifyContent: 'flex-start',
  },
  empty: {
    paddingVertical: 32,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyCard: {
    width: '100%',
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retry: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.primary,
    ...SHADOWS.button,
  },
  retryText: {
    color: COLORS.primaryText,
    fontWeight: '700',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  endText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 13,
    paddingVertical: 18,
  },
});
