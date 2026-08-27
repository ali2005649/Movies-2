import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import MovieCard from '@/components/MovieCard';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useWatchlistStore } from '@/store/watchlistStore';
import { COLORS } from '@/constants/theme';
import type { Movie } from '@/types/movie';

/**
 * Watchlist tab — mirrors the Zustand store in real time.
 */
export default function WatchlistScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const layout = useResponsiveLayout();
  const movies = useWatchlistStore((s) => s.movies);
  const clear = useWatchlistStore((s) => s.clear);

  const renderItem = ({ item, index }: { item: Movie; index: number }) => (
    <MovieCard
      movie={item}
      index={index % layout.numColumns}
      cardWidth={layout.cardWidth}
      posterHeight={layout.posterHeight}
      titleFontSize={layout.titleFontSize}
    />
  );

  const handleClear = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    clear();
  };

  return (
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
          <View style={styles.titleRow}>
            <Text style={[styles.title, { fontSize: layout.sectionTitleSize }]}>
              Watchlist
            </Text>
            {movies.length > 0 && (
              <Pressable onPress={handleClear} hitSlop={8}>
                <Text style={styles.clear}>Clear all</Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.subtitle}>
            {movies.length === 0
              ? 'Heart a movie on its details page to save it here.'
              : `${movies.length} saved movie${movies.length === 1 ? '' : 's'}`}
          </Text>
        </Animated.View>
      </View>

      <FlatList
        key={`watchlist-grid-${layout.numColumns}`}
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
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 110, paddingBottom: insets.bottom + 100 },
        ]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Your watchlist is empty</Text>
            <Text style={styles.emptySubtitle}>
              Browse Discover and tap ♡ on a film to keep it close.
            </Text>
            <Pressable
              style={styles.cta}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.navigate('/');
              }}
            >
              <Text style={styles.ctaText}>Explore movies</Text>
            </Pressable>
          </View>
        }
      />
    </View>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: COLORS.textWhite,
    fontWeight: '800',
  },
  clear: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 6,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  listContent: {
    flexGrow: 1,
  },
  row: {
    justifyContent: 'flex-start',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 72,
    paddingHorizontal: 28,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  cta: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaText: {
    color: COLORS.primaryText,
    fontWeight: '700',
    fontSize: 15,
  },
});
