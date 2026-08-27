import { create } from 'zustand';
import type { Movie } from '@/types/movie';

type WatchlistState = {
  /** Movies the user has hearted — keyed insertion order preserved via array. */
  movies: Movie[];
  isInWatchlist: (id: string) => boolean;
  toggleMovie: (movie: Movie) => void;
  removeMovie: (id: string) => void;
  clear: () => void;
};

/**
 * Global watchlist store (Zustand).
 * Any screen can subscribe; the Watchlist tab updates instantly on toggle.
 */
export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  movies: [],

  isInWatchlist: (id) => get().movies.some((m) => m.id === id),

  toggleMovie: (movie) =>
    set((state) => {
      const exists = state.movies.some((m) => m.id === movie.id);
      return {
        movies: exists
          ? state.movies.filter((m) => m.id !== movie.id)
          : [...state.movies, movie],
      };
    }),

  removeMovie: (id) =>
    set((state) => ({
      movies: state.movies.filter((m) => m.id !== id),
    })),

  clear: () => set({ movies: [] }),
}));
