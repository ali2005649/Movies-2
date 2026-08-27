import {
  fetchPopularMovies,
  fetchMovieDetails as fetchDetails,
  fetchSimilarMovies as fetchSimilar,
  searchMovies as searchTmdb,
  type MovieFilters,
  type PaginatedMovies,
} from '@/services/api';
import type { Movie } from '@/types/movie';

export type { MovieFilters, PaginatedMovies };

/** Home “All titles” feed — popular catalog with pagination + optional filters. */
export async function fetchMoviesPage(
  page: number,
  filters?: MovieFilters
): Promise<PaginatedMovies> {
  return fetchPopularMovies(page, filters);
}

export async function fetchMovieDetails(id: string): Promise<Movie> {
  return fetchDetails(id);
}

export async function fetchSimilarMovies(id: string): Promise<Movie[]> {
  return fetchSimilar(id);
}

export async function searchMovies(
  query: string,
  page = 1
): Promise<PaginatedMovies> {
  return searchTmdb(query, page);
}

export const FILTER_OPTIONS = {
  genres: [
    'All genres',
    'Action',
    'Adventure',
    'Animation',
    'Comedy',
    'Crime',
    'Drama',
    'Fantasy',
    'History',
    'Mystery',
    'Science Fiction',
    'Thriller',
  ],
  years: [
    'All years',
    '2026',
    '2025',
    '2024',
    '2023',
    '2022',
    '2021',
    '2020',
    '2019',
    '2018',
    '2017',
    '2016',
    '2015',
  ],
  ratings: ['Any rating', '8+', '7+', '6+', '5+'],
} as const;
