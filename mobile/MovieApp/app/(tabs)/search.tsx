import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Platform,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { searchMovies, fetchWeeklyTrendingMovies } from '@/services/api';
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from '@/services/searchHistory';
import MovieCard from '@/components/MovieCard';
import RecentSearches from '@/components/RecentSearches';
import TrendingNow from '@/components/TrendingNow';
import { MovieGridSkeleton } from '@/components/MovieSkeleton';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { COLORS } from '@/constants/theme';
import type { Movie } from '@/types/movie';

const SEARCH_DEBOUNCE_MS = 500;

/**
 * Search — debounced TMDB queries, recent history, and auto keyboard dismiss.
 */
export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recents, setRecents] = useState<string[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState<string | null>(null);

  const trimmed = query.trim();
  const showIdle = !trimmed;

  useEffect(() => {
    void getRecentSearches().then(setRecents);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setTrendingLoading(true);
    setTrendingError(null);

    void fetchWeeklyTrendingMovies(1)
      .then((page) => {
        if (cancelled) return;
        setTrending(page.data.slice(0, 12));
      })
      .catch((err) => {
        if (cancelled) return;
        setTrending([]);
        setTrendingError(
          err instanceof Error ? err.message : 'Could not load trending movies.'
        );
      })
      .finally(() => {
        if (!cancelled) setTrendingLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!trimmed) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const page = await searchMovies(trimmed, 1);
        setResults(page.data);
        setError(null);
      } catch (err) {
        setResults([]);
        setError(err instanceof Error ? err.message : 'Search failed.');
      } finally {
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [trimmed]);

  const persistSearch = useCallback(async (value: string) => {
    const next = await addRecentSearch(value);
    setRecents(next);
  }, []);

  const submitSearch = useCallback(
    (value: string) => {
      const next = value.trim();
      if (!next) return;
      setQuery(next);
      void persistSearch(next);
      Keyboard.dismiss();
    },
    [persistSearch]
  );

  const handleRemoveRecent = useCallback(async (value: string) => {
    const next = await removeRecentSearch(value);
    setRecents(next);
  }, []);

  const handleClearAll = useCallback(async () => {
    await clearRecentSearches();
    setRecents([]);
  }, []);

  const renderItem = ({ item, index }: { item: Movie; index: number }) => (
    <MovieCard
      movie={item}
      index={index % layout.numColumns}
      cardWidth={layout.cardWidth}
      posterHeight={layout.posterHeight}
      titleFontSize={layout.titleFontSize}
    />
  );

  const headerOffset = insets.top + 118;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={[styles.headerWrap, { paddingTop: insets.top + 12 }]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.headerFallback]} />
          )}

          <Animated.View
            entering={FadeInDown.duration(400)}
            style={[styles.header, { paddingHorizontal: layout.contentPadding }]}
          >
            <Text style={[styles.title, { fontSize: layout.sectionTitleSize }]}>
              Search
            </Text>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={COLORS.primary} />
              <TextInput
                style={styles.input}
                placeholder="Search movies…"
                placeholderTextColor={COLORS.textMuted}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => submitSearch(query)}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                clearButtonMode="while-editing"
                blurOnSubmit
              />
              {query.length > 0 && Platform.OS !== 'ios' && (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={COLORS.textMuted}
                  />
                </Pressable>
              )}
            </View>
          </Animated.View>
        </View>

        <FlatList
          key={`search-grid-${layout.numColumns}`}
          style={styles.list}
          data={showIdle ? [] : results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={layout.numColumns}
          columnWrapperStyle={
            showIdle
              ? undefined
              : [
                  styles.row,
                  {
                    gap: layout.gap,
                    marginBottom: layout.gap,
                    paddingHorizontal: layout.contentPadding,
                  },
                ]
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={Keyboard.dismiss}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: headerOffset,
              paddingBottom: insets.bottom + 100,
              paddingHorizontal: showIdle ? layout.contentPadding : 0,
            },
          ]}
          ListEmptyComponent={
            loading ? (
              <View style={{ paddingHorizontal: layout.contentPadding }}>
                <MovieGridSkeleton
                  count={layout.numColumns * 3}
                  cardWidth={layout.cardWidth}
                  posterHeight={layout.posterHeight}
                  gap={layout.gap}
                />
              </View>
            ) : showIdle ? (
              <View>
                {recents.length > 0 ? (
                  <RecentSearches
                    items={recents}
                    onSelect={submitSearch}
                    onRemove={handleRemoveRecent}
                    onClearAll={handleClearAll}
                  />
                ) : null}
                <TrendingNow
                  movies={trending}
                  loading={trendingLoading}
                  error={trendingError}
                  layout={layout}
                />
              </View>
            ) : (
              <Pressable style={styles.empty} onPress={Keyboard.dismiss}>
                <Ionicons name="film-outline" size={48} color={COLORS.border} />
                <Text style={styles.emptyTitle}>
                  {error ? 'Search error' : 'No matches'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {error ?? 'Try another title.'}
                </Text>
              </Pressable>
            )
          }
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    flex: 1,
  },
  headerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    overflow: 'hidden',
  },
  headerFallback: {
    backgroundColor: COLORS.overlay,
  },
  header: {
    paddingBottom: 14,
  },
  title: {
    color: COLORS.textWhite,
    fontWeight: '800',
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  input: {
    flex: 1,
    color: COLORS.textWhite,
    fontSize: 16,
    height: '100%',
  },
  listContent: {
    flexGrow: 1,
  },
  row: {
    justifyContent: 'flex-start',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 64,
    gap: 8,
  },
  emptyTitle: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
