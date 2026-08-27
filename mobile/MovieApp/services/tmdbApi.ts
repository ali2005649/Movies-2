/**
 * Backward-compatible re-exports.
 * Prefer importing from `@/services/api` going forward.
 */
export {
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchWeeklyTrendingMovies,
  fetchTrendingMovies,
  fetchMovieDetails,
  fetchSimilarMovies,
  searchMovies,
  TMDB_GENRE_IDS,
  type MovieFilters,
  type PaginatedMovies,
} from '@/services/api';

import {
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchWeeklyTrendingMovies,
  fetchMovieDetails,
  fetchSimilarMovies,
  searchMovies,
} from '@/services/api';

/** Legacy object-style API used by older imports. */
export const tmdbApi = {
  fetchNowPlaying: fetchNowPlayingMovies,
  fetchPopular: fetchPopularMovies,
  fetchWeeklyTrending: fetchWeeklyTrendingMovies,
  fetchMovieDetails,
  fetchSimilar: fetchSimilarMovies,
  searchMovies,
};
