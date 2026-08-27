/** Shared movie model used across Home, Search, Details, and Watchlist. */
export type Movie = {
  id: string;
  title: string;
  rating: number;
  poster: string;
  backdrop?: string;
  releaseDate: string;
  runtime: number;
  genres: string[];
  overview: string;
  /** YouTube video key from TMDB videos.results (site=YouTube, type=Trailer). */
  youtubeTrailerKey?: string;
  /** Full watch URL built from youtubeTrailerKey. */
  youtubeTrailerUrl?: string;
};
