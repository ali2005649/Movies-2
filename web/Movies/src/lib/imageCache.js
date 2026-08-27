import { posterUrl, POSTER_SIZES } from "./tmdb";

const loaded = new Set();
const queued = new Set();

function connectionIsConstrained() {
  if (typeof navigator === "undefined") return false;
  const connection = navigator.connection || navigator.mozConnection;
  if (!connection) return false;
  return (
    connection.saveData === true ||
    connection.effectiveType === "slow-2g" ||
    connection.effectiveType === "2g"
  );
}

export function isPosterLoaded(src) {
  return Boolean(src && loaded.has(src));
}

export function markPosterLoaded(src) {
  if (!src) return;
  loaded.add(src);
  queued.delete(src);
}

export function prefetchPosters(urls = []) {
  if (typeof window === "undefined" || !urls.length) return;

  for (const url of urls) {
    if (!url || loaded.has(url) || queued.has(url)) continue;
    queued.add(url);

    const probe = new Image();
    probe.referrerPolicy = "no-referrer";
    probe.decoding = "async";
    probe.onload = () => markPosterLoaded(url);
    probe.onerror = () => queued.delete(url);
    probe.src = url;
  }
}

export function prefetchMoviePosters(movies = []) {
  if (!movies.length) return;

  prefetchPosters(
    movies
      .slice(-20)
      .map((movie) => posterUrl(movie?.poster_path, POSTER_SIZES.lqip))
  );

  if (connectionIsConstrained()) return;

  prefetchPosters(
    [
      ...movies.slice(0, 6),
      ...movies.slice(-4),
    ].map((movie) => posterUrl(movie?.poster_path, POSTER_SIZES.card))
  );
}
