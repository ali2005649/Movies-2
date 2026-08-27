import axios from 'axios';
import type { Movie } from '@/types/movie';

/** TMDB v3 base URL */
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/** Read from Expo public env (loaded from `.env`) */
const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY?.trim() ?? '';

const client = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 15000,
});

/** TMDB genre name → discover genre id (Home filters) */
export const TMDB_GENRE_IDS: Record<string, number> = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Drama: 18,
  Fantasy: 14,
  History: 36,
  Mystery: 9648,
  'Science Fiction': 878,
  Thriller: 53,
};

export type MovieFilters = {
  genre?: string | null;
  year?: string | null;
  rating?: string | null;
};

export type PaginatedMovies = {
  data: Movie[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

type TmdbMovieListItem = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
};

type TmdbPagedResponse = {
  page: number;
  total_pages: number;
  total_results: number;
  results: TmdbMovieListItem[];
};

type TmdbGenre = { id: number; name: string };

type TmdbVideo = {
  key: string;
  site: string;
  type: string;
  official?: boolean;
};

type TmdbMovieDetails = TmdbMovieListItem & {
  runtime: number | null;
  genres: TmdbGenre[];
  videos?: { results: TmdbVideo[] };
};

function assertApiKey() {
  if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_TMDB_API_KEY') {
    throw new Error(
      'Missing TMDB API key. Add EXPO_PUBLIC_TMDB_API_KEY to your .env file and restart Expo.'
    );
  }
}

function posterUrl(
  path: string | null | undefined,
  size: 'w342' | 'w500' | 'w780' = 'w500'
) {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/** Prefer official YouTube Trailer, then any Trailer, then any YouTube clip. */
function pickYoutubeTrailer(videos: TmdbVideo[] = []): {
  key?: string;
  url?: string;
} {
  const trailer =
    videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ||
    videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
    videos.find((v) => v.site === 'YouTube');

  if (!trailer?.key) return {};
  return {
    key: trailer.key,
    url: `https://www.youtube.com/watch?v=${trailer.key}`,
  };
}

function mapListMovie(item: TmdbMovieListItem): Movie {
  return {
    id: String(item.id),
    title: item.title,
    rating: Number(item.vote_average?.toFixed?.(1) ?? item.vote_average ?? 0),
    poster: posterUrl(item.poster_path),
    backdrop: posterUrl(item.backdrop_path, 'w780'),
    releaseDate: item.release_date ?? '',
    runtime: 0,
    genres: [],
    overview: item.overview ?? '',
  };
}

function mapDetails(item: TmdbMovieDetails): Movie {
  const yt = pickYoutubeTrailer(item.videos?.results);
  return {
    id: String(item.id),
    title: item.title,
    rating: Number(item.vote_average?.toFixed?.(1) ?? item.vote_average ?? 0),
    poster: posterUrl(item.poster_path),
    backdrop: posterUrl(item.backdrop_path, 'w780'),
    releaseDate: item.release_date ?? '',
    runtime: item.runtime ?? 0,
    genres: (item.genres ?? []).map((g) => g.name),
    overview: item.overview ?? '',
    youtubeTrailerKey: yt.key,
    youtubeTrailerUrl: yt.url,
  };
}

type ListParams = Record<string, string | number | boolean>;

async function fetchPagedMovies(
  path: string,
  extraParams: ListParams = {},
  errorLabel: string
): Promise<PaginatedMovies> {
  assertApiKey();

  try {
    const { data } = await client.get<TmdbPagedResponse>(path, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        include_adult: false,
        ...extraParams,
      },
    });

    return {
      data: data.results.map(mapListMovie),
      page: data.page,
      pageSize: data.results.length,
      total: data.total_results,
      hasMore: data.page < data.total_pages,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { status_message?: string } | undefined)
          ?.status_message || error.message;
      throw new Error(`${errorLabel}: ${message}`);
    }
    throw error;
  }
}

function hasActiveFilters(filters?: MovieFilters): boolean {
  return Boolean(
    (filters?.genre && filters.genre !== 'All genres') ||
      (filters?.year && filters.year !== 'All years') ||
      (filters?.rating && filters.rating !== 'Any rating')
  );
}

function discoverParams(filters: MovieFilters, page: number): ListParams {
  const params: ListParams = {
    page,
    sort_by: 'popularity.desc',
  };

  if (filters.genre && filters.genre !== 'All genres') {
    const genreId = TMDB_GENRE_IDS[filters.genre];
    if (genreId) params.with_genres = genreId;
  }
  if (filters.year && filters.year !== 'All years') {
    params.primary_release_year = Number(filters.year);
  }
  if (filters.rating && filters.rating !== 'Any rating') {
    const min = Number(String(filters.rating).replace('+', ''));
    if (Number.isFinite(min)) params['vote_average.gte'] = min;
  }

  return params;
}

/** Home “Now playing” strip — currently in theaters. */
export function fetchNowPlayingMovies(page = 1): Promise<PaginatedMovies> {
  return fetchPagedMovies(
    '/movie/now_playing',
    { page },
    'TMDB now-playing request failed'
  );
}

/** Home “All titles” grid — popular catalog, or discover when filters are on. */
export function fetchPopularMovies(
  page = 1,
  filters?: MovieFilters
): Promise<PaginatedMovies> {
  if (hasActiveFilters(filters) && filters) {
    return fetchPagedMovies(
      '/discover/movie',
      discoverParams(filters, page),
      'TMDB discover request failed'
    );
  }

  return fetchPagedMovies(
    '/movie/popular',
    { page },
    'TMDB popular request failed'
  );
}

/** Search idle “Trending Now” grid — this week’s trending titles. */
export function fetchWeeklyTrendingMovies(page = 1): Promise<PaginatedMovies> {
  return fetchPagedMovies(
    '/trending/movie/week',
    { page },
    'TMDB weekly trending request failed'
  );
}

/**
 * @deprecated Use fetchPopularMovies for Home, fetchWeeklyTrendingMovies for Search.
 * Kept so older imports keep working.
 */
export function fetchTrendingMovies(
  page = 1,
  filters?: MovieFilters
): Promise<PaginatedMovies> {
  return fetchPopularMovies(page, filters);
}

/**
 * Full movie details for the Details screen.
 * Includes videos via append_to_response so we can resolve a YouTube trailer key.
 * Equivalent to:
 *   GET /movie/{id}?api_key=...&append_to_response=videos
 */
export async function fetchMovieDetails(id: string | number): Promise<Movie> {
  try {
    assertApiKey();

    const { data } = await client.get<TmdbMovieDetails>(`/movie/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        append_to_response: 'videos',
      },
    });

    return mapDetails(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { status_message?: string } | undefined)
          ?.status_message || error.message;
      throw new Error(`TMDB details request failed: ${message}`);
    }
    throw error;
  }
}

/** Similar movies for the Details screen horizontal slider. */
export async function fetchSimilarMovies(
  id: string | number,
  page = 1
): Promise<Movie[]> {
  try {
    assertApiKey();

    const { data } = await client.get<TmdbPagedResponse>(`/movie/${id}/similar`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page,
      },
    });

    return data.results.map(mapListMovie);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { status_message?: string } | undefined)
          ?.status_message || error.message;
      throw new Error(`TMDB similar request failed: ${message}`);
    }
    throw error;
  }
}

/** Title search for the Search tab. */
export async function searchMovies(
  query: string,
  page = 1
): Promise<PaginatedMovies> {
  try {
    assertApiKey();

    const q = query.trim();
    if (!q) {
      return { data: [], page: 1, pageSize: 0, total: 0, hasMore: false };
    }

    const { data } = await client.get<TmdbPagedResponse>('/search/movie', {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        query: q,
        page,
        include_adult: false,
      },
    });

    return {
      data: data.results.map(mapListMovie),
      page: data.page,
      pageSize: data.results.length,
      total: data.total_results,
      hasMore: data.page < data.total_pages,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { status_message?: string } | undefined)
          ?.status_message || error.message;
      throw new Error(`TMDB search request failed: ${message}`);
    }
    throw error;
  }
}
