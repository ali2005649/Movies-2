import React from 'react';
import { render, screen } from '@testing-library/react-native';
import MovieCard from '@/components/MovieCard';
import type { Movie } from '@/types/movie';

jest.mock('@/components/SharedMoviePoster', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ movieId }: { movieId: string }) =>
      React.createElement(View, { testID: `poster-${movieId}` }),
    prefetchPoster: jest.fn(),
  };
});

const mockMovie: Movie = {
  id: '27205',
  title: 'Inception',
  rating: 8.4,
  poster: 'https://image.tmdb.org/t/p/w500/inception.jpg',
  releaseDate: '2010-07-16',
  runtime: 148,
  genres: ['Action', 'Science Fiction'],
  overview: 'A thief who steals corporate secrets through dream-sharing.',
};

describe('MovieCard', () => {
  // @testing-library/react-native v14 — render() is async
  it('renders the movie title', async () => {
    await render(
      <MovieCard
        movie={mockMovie}
        cardWidth={160}
        posterHeight={240}
        titleFontSize={14}
      />
    );

    expect(screen.getByText('Inception')).toBeTruthy();
  });

  it('renders the formatted rating', async () => {
    await render(
      <MovieCard movie={mockMovie} cardWidth={160} posterHeight={240} />
    );

    expect(screen.getByText('8.4')).toBeTruthy();
  });

  it('exposes a movie-card testID for E2E taps', async () => {
    await render(
      <MovieCard movie={mockMovie} cardWidth={160} posterHeight={240} />
    );

    expect(screen.getByTestId('movie-card')).toBeTruthy();
  });
});
