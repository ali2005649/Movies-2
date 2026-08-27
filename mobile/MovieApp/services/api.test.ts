/**
 * Unit tests for TMDB API service — axios is mocked so no real network calls run.
 */

jest.mock('axios', () => {
  const get = jest.fn();
  const client = { get };

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => client),
      isAxiosError: (error: unknown) =>
        Boolean(
          error &&
            typeof error === 'object' &&
            (error as { isAxiosError?: boolean }).isAxiosError
        ),
      __client: client,
    },
  };
});

process.env.EXPO_PUBLIC_TMDB_API_KEY = 'test-api-key';

import axios from 'axios';
import {
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchWeeklyTrendingMovies,
} from '@/services/api';

const mockGet = (
  axios as unknown as { __client: { get: jest.Mock } }
).__client.get;

const pagePayload = (overrides: Record<string, unknown> = {}) => ({
  data: {
    page: 1,
    total_pages: 3,
    total_results: 40,
    results: [
      {
        id: 550,
        title: 'Fight Club',
        overview: 'An insomniac office worker…',
        poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        backdrop_path: '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
        vote_average: 8.433,
        release_date: '1999-10-15',
        ...overrides,
      },
    ],
  },
});

describe('TMDB list endpoints', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('fetchNowPlayingMovies hits /movie/now_playing', async () => {
    mockGet.mockResolvedValueOnce(pagePayload({ title: 'The Batman' }));

    const result = await fetchNowPlayingMovies(1);

    expect(mockGet).toHaveBeenCalledWith(
      '/movie/now_playing',
      expect.objectContaining({
        params: expect.objectContaining({
          api_key: 'test-api-key',
          page: 1,
        }),
      })
    );
    expect(result.data[0].title).toBe('The Batman');
  });

  it('fetchPopularMovies hits /movie/popular and maps Movie models', async () => {
    mockGet.mockResolvedValueOnce(pagePayload());

    const result = await fetchPopularMovies(1);

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(
      '/movie/popular',
      expect.objectContaining({
        params: expect.objectContaining({
          api_key: 'test-api-key',
          page: 1,
          language: 'en-US',
          include_adult: false,
        }),
      })
    );

    expect(result.page).toBe(1);
    expect(result.hasMore).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: '550',
      title: 'Fight Club',
      rating: 8.4,
      poster:
        'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      overview: 'An insomniac office worker…',
    });
  });

  it('fetchPopularMovies uses /discover/movie when filters are applied', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        page: 1,
        total_pages: 1,
        total_results: 1,
        results: [
          {
            id: 11,
            title: 'Star Wars',
            overview: 'A long time ago…',
            poster_path: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
            backdrop_path: null,
            vote_average: 8.2,
            release_date: '1977-05-25',
          },
        ],
      },
    });

    await fetchPopularMovies(1, {
      genre: 'Science Fiction',
      year: 'All years',
      rating: 'Any rating',
    });

    expect(mockGet).toHaveBeenCalledWith(
      '/discover/movie',
      expect.objectContaining({
        params: expect.objectContaining({
          with_genres: 878,
          sort_by: 'popularity.desc',
        }),
      })
    );
  });

  it('fetchWeeklyTrendingMovies hits /trending/movie/week', async () => {
    mockGet.mockResolvedValueOnce(pagePayload({ title: 'Dune' }));

    const result = await fetchWeeklyTrendingMovies(1);

    expect(mockGet).toHaveBeenCalledWith(
      '/trending/movie/week',
      expect.objectContaining({
        params: expect.objectContaining({
          api_key: 'test-api-key',
          page: 1,
        }),
      })
    );
    expect(result.data[0].title).toBe('Dune');
  });
});
