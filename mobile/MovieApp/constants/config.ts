/**
 * App-wide config.
 * Set EXPO_PUBLIC_TMDB_API_KEY in `.env` (or replace the placeholder below).
 */
export const CONFIG = {
  /** REST base URL for optional remote auth — empty = local AsyncStorage auth */
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? '',

  /** Loaded from `.env` → EXPO_PUBLIC_TMDB_API_KEY */
  tmdbApiKey: process.env.EXPO_PUBLIC_TMDB_API_KEY?.trim() || '',

  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  tmdbImageBase: 'https://image.tmdb.org/t/p',

  /** Artificial latency only used by local auth mock delays */
  mockLatencyMs: 700,
} as const;

/** Playable demo trailer + sample VTT (TMDB trailers are YouTube-only). */
export const DEMO_MEDIA = {
  trailerUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
  /** Inline WebVTT used by the advanced player subtitle engine */
  subtitlesVtt: `WEBVTT

00:00:00.400 --> 00:00:03.200
Welcome to the Movies trailer player

00:00:03.400 --> 00:00:07.000
Swipe left side ↑↓ for brightness

00:00:07.200 --> 00:00:11.000
Swipe right side ↑↓ for volume

00:00:11.200 --> 00:00:15.000
Tap CC to toggle these subtitles
`,
} as const;
