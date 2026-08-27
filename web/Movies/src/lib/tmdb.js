const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const IMAGE_CDN = "https://image.tmdb.org/t/p";

export const POSTER_SIZES = {
  lqip: "w92",
  suggest: "w92",
  thumb: "w154",
  card: "w342",
  detail: "w500",
  large: "w780",
};

export const CARD_POSTER_SIZES =
  "(max-width: 480px) 46vw, (max-width: 768px) 46vw, (max-width: 1024px) 30vw, (max-width: 1280px) 22vw, 18vw";

async function tmdbFetch(path, params = {}, { signal } = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error("Failed to fetch data from TMDB");
  }
  return response.json();
}

export function fetchPopularMovies(page = 1) {
  return tmdbFetch("/movie/popular", { page });
}

export function searchMovies(query, page = 1, { signal } = {}) {
  return tmdbFetch(
    "/search/movie",
    { query, page, include_adult: false },
    { signal }
  );
}

export function discoverMovies({ page = 1, genre, year, minRating } = {}) {
  return tmdbFetch("/discover/movie", {
    page,
    sort_by: "popularity.desc",
    with_genres: genre || undefined,
    primary_release_year: year || undefined,
    "vote_average.gte": minRating || undefined,
    "vote_count.gte": minRating ? 50 : undefined,
  });
}

export function fetchMovieGenres() {
  return tmdbFetch("/genre/movie/list");
}

export function fetchMovieDetails(id) {
  return tmdbFetch(`/movie/${id}`, { append_to_response: "videos" });
}

export function getTrailerKey(movie) {
  const results = movie?.videos?.results || [];
  const trailer =
    results.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    results.find((v) => v.site === "YouTube");
  return trailer?.key || null;
}

export function posterUrl(path, size = POSTER_SIZES.detail) {
  if (path == null) return null;

  const value = String(path).trim();
  if (!value || value === "null" || value === "undefined") return null;

  if (/^https?:\/\//i.test(value)) return value;

  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${IMAGE_CDN}/${size}${normalized}`;
}

export function posterSrcSet(path, widths = [185, 342, 500]) {
  if (path == null) return undefined;
  const value = String(path).trim();
  if (!value || /^https?:\/\//i.test(value)) return undefined;

  return widths
    .map((width) => `${posterUrl(path, `w${width}`)} ${width}w`)
    .join(", ");
}

export function filterMoviesClient(movies, { genre, year, minRating } = {}) {
  return movies.filter((movie) => {
    if (genre && !(movie.genre_ids || []).includes(Number(genre))) {
      return false;
    }
    if (year) {
      const releaseYear = movie.release_date?.slice(0, 4);
      if (releaseYear !== String(year)) return false;
    }
    if (minRating && (movie.vote_average ?? 0) < Number(minRating)) {
      return false;
    }
    return true;
  });
}
