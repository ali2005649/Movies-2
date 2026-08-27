import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Modal,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import YoutubeIframe from 'react-native-youtube-iframe';
import SharedMoviePoster, { prefetchPoster } from '@/components/SharedMoviePoster';
import PrimaryButton from '@/components/PrimaryButton';
import SimilarMoviesRow from '@/components/SimilarMoviesRow';
import { DetailsSkeleton } from '@/components/MovieSkeleton';
import { fetchMovieDetails, fetchSimilarMovies } from '@/services/api';
import { useWatchlistStore } from '@/store/watchlistStore';
import { COLORS } from '@/constants/theme';
import type { Movie } from '@/types/movie';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POSTER_WIDTH = SCREEN_WIDTH * 0.9;
const POSTER_HEIGHT = POSTER_WIDTH * 1.45;
const PLAYER_WIDTH = SCREEN_WIDTH - 32;
const PLAYER_HEIGHT = Math.round((PLAYER_WIDTH * 9) / 16);

/**
 * Details — loads full TMDB movie + similar titles by route param `id`.
 * Shared element tag stays `poster-${movie.id}` (real TMDB id).
 * Trailers play in-app via react-native-youtube-iframe.
 */
export default function MovieDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const movieId = Array.isArray(id) ? id[0] : id;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTrailerVisible, setIsTrailerVisible] = useState(false);

  const isInWatchlist = useWatchlistStore((s) =>
    movie ? s.movies.some((m) => m.id === movie.id) : false
  );
  const toggleMovie = useWatchlistStore((s) => s.toggleMovie);

  const load = useCallback(async (targetId: string) => {
    setLoading(true);
    setSimilarLoading(true);
    setError(null);
    setIsTrailerVisible(false);
    setMovie(null);
    setSimilar([]);

    try {
      const details = await fetchMovieDetails(targetId);
      setMovie(details);
      // Prefetch full w500 poster URL for seamless shared transition
      prefetchPoster(details.poster);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load movie.');
      setLoading(false);
      setSimilarLoading(false);
      return;
    } finally {
      setLoading(false);
    }

    try {
      const related = await fetchSimilarMovies(targetId);
      setSimilar(related);
    } catch {
      setSimilar([]);
    } finally {
      setSimilarLoading(false);
    }
  }, []);

  useEffect(() => {
    if (movieId) void load(movieId);
  }, [movieId, load]);

  const handleToggleWatchlist = async () => {
    if (!movie) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleMovie(movie);
    await Haptics.notificationAsync(
      isInWatchlist
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success
    );
  };

  const openTrailer = async () => {
    if (!movie?.youtubeTrailerKey) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTrailerVisible(true);
  };

  const closeTrailer = async () => {
    await Haptics.selectionAsync();
    setIsTrailerVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          style={styles.iconButton}
          onPress={async () => {
            await Haptics.selectionAsync();
            router.back();
          }}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Pressable
          style={[styles.heartButton, isInWatchlist && styles.heartActive]}
          onPress={handleToggleWatchlist}
          hitSlop={8}
          disabled={!movie}
        >
          <Ionicons
            name={isInWatchlist ? 'heart' : 'heart-outline'}
            size={22}
            color={isInWatchlist ? COLORS.primary : COLORS.textMuted}
          />
        </Pressable>
      </View>

      {loading ? (
        <DetailsSkeleton />
      ) : error || !movie ? (
        <View style={styles.centered}>
          <Text style={styles.missing}>{error ?? 'Movie not found'}</Text>
          <Pressable onPress={() => movieId && void load(movieId)}>
            <Text style={styles.backLink}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.posterContainer}>
            <SharedMoviePoster
              movieId={movie.id}
              uri={movie.poster}
              style={styles.poster}
              borderRadius={16}
            />
          </View>

          <Animated.View
            entering={FadeInDown.delay(120).springify()}
            style={styles.details}
          >
            <Text style={styles.title}>{movie.title}</Text>

            <View style={styles.metaRow}>
              <Ionicons name="star" size={15} color={COLORS.primary} />
              <Text style={styles.metaText}>{movie.rating.toFixed(1)}</Text>
              {movie.releaseDate ? (
                <>
                  <Text style={styles.metaDivider}>|</Text>
                  <Text style={styles.metaText}>{movie.releaseDate}</Text>
                </>
              ) : null}
              {movie.runtime > 0 ? (
                <>
                  <Text style={styles.metaDivider}>|</Text>
                  <Text style={styles.metaText}>{movie.runtime} min</Text>
                </>
              ) : null}
            </View>

            <View style={styles.genres}>
              {movie.genres.map((genre) => (
                <View key={genre} style={styles.genreBadge}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Overview</Text>
            <Animated.Text entering={FadeIn.delay(200)} style={styles.overview}>
              {movie.overview || 'No overview available.'}
            </Animated.Text>

            {movie.youtubeTrailerKey ? (
              <PrimaryButton
                title="▶  Watch Trailer"
                onPress={openTrailer}
                style={styles.trailerButton}
              />
            ) : null}
          </Animated.View>

          <SimilarMoviesRow
            movies={similar}
            loading={similarLoading}
            currentId={movie.id}
          />
        </ScrollView>
      )}

      {/* In-app YouTube trailer — insets applied explicitly (Modal + translucent status bar) */}
      <Modal
        visible={isTrailerVisible}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={closeTrailer}
      >
        <StatusBar barStyle="light-content" backgroundColor="#000" translucent />
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalContent,
              {
                paddingTop: Math.max(insets.top, 16) + 4,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {movie?.title ?? 'Trailer'}
              </Text>
              <Pressable
                style={styles.closeButton}
                onPress={closeTrailer}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Close trailer"
              >
                <Ionicons name="close" size={22} color={COLORS.textWhite} />
              </Pressable>
            </View>

            <View style={styles.playerWrap}>
              {movie?.youtubeTrailerKey ? (
                <YoutubeIframe
                  height={PLAYER_HEIGHT}
                  width={PLAYER_WIDTH}
                  play
                  videoId={movie.youtubeTrailerKey}
                  webViewProps={{
                    allowsFullscreenVideo: true,
                    mediaPlaybackRequiresUserAction: false,
                  }}
                />
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  missing: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  backLink: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    zIndex: 10,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 2,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  heartButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.goldSoft,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  posterContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 16,
    backgroundColor: COLORS.background,
  },
  poster: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
  },
  details: {
    padding: 20,
  },
  title: {
    color: COLORS.textWhite,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
    flexWrap: 'wrap',
  },
  metaText: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 2,
  },
  metaDivider: {
    color: COLORS.textMuted,
    marginHorizontal: 8,
    fontSize: 14,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  genreBadge: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  genreText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  overview: {
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 28,
  },
  trailerButton: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 28,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  modalTitle: {
    flex: 1,
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
