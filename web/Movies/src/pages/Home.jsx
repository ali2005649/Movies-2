import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import MovieCard from "../components/MovieCard";
import MovieFilters from "../components/MovieFilters";
import { MovieGridSkeleton, MovieCardSkeleton } from "../components/Skeleton";
import { gridVariants } from "../components/motionVariants";
import { useMovieOverlay } from "../context/MovieOverlayContext";
import { useInfiniteMovies } from "../hooks/useInfiniteMovies";
import { fetchMovieGenres } from "../lib/tmdb";
import { prefetchMoviePosters } from "../lib/imageCache";

export default function Home() {
  const overlay = useMovieOverlay();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const genre = searchParams.get("genre") || "";
  const year = searchParams.get("year") || "";
  const minRating = searchParams.get("rating") || "";

  const [genres, setGenres] = useState([]);
  const sentinelRef = useRef(null);

  const { movies, loading, loadingMore, error, hasMore, loadMore } =
    useInfiniteMovies({ query, genre, year, minRating });

  useEffect(() => {
    prefetchMoviePosters(movies);
  }, [movies]);

  useEffect(() => {
    fetchMovieGenres()
      .then((data) => setGenres(data.genres || []))
      .catch(() => setGenres([]));
  }, []);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "240px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, loading, hasMore]);

  const updateFilters = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      const paramKey = key === "minRating" ? "rating" : key;
      if (value) next.set(paramKey, value);
      else next.delete(paramKey);
    });
    setSearchParams(next, { replace: true });
  };

  const isSearch = Boolean(query.trim());
  const title = isSearch ? `Results for “${query.trim()}”` : "Discover Movies";

  return (
    <div
      className={`canvas-page px-4 py-8 md:px-8 md:py-10 ${overlay ? "pointer-events-none" : ""}`}
      aria-hidden={overlay}
      inert={overlay || undefined}
    >
      <div className="mx-auto mb-10 max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="space-y-3"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
            {isSearch ? "Search" : "Cinematic Collection"}
          </p>
          <h1 className="page-results-heading font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-text-main md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-primary to-transparent" />
        </motion.div>

        <MovieFilters
          genres={genres}
          genre={genre}
          year={year}
          minRating={minRating}
          onChange={updateFilters}
        />
      </div>

      <div className="mx-auto max-w-7xl">
        {loading ? (
          <MovieGridSkeleton />
        ) : error && movies.length === 0 ? (
          <div className="glass mx-auto mt-16 max-w-lg rounded-2xl px-6 py-10 text-center text-lg text-red-400">
            {error}
          </div>
        ) : movies.length === 0 ? (
          <div className="glass mx-auto mt-16 max-w-lg rounded-2xl px-6 py-10 text-center text-lg text-text-muted">
            No movies found. Try adjusting search or filters.
          </div>
        ) : (
          <>
            <motion.div
              variants={gridVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-5 overflow-visible md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5"
            >
              {movies.map((movie, index) => (
                <MovieCard
                  key={`${movie.id}-${movie.release_date || ""}`}
                  movie={movie}
                  priority={index < 4}
                />
              ))}
            </motion.div>

            {loadingMore && (
              <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <MovieCardSkeleton key={`more-${i}`} />
                ))}
              </div>
            )}

            <div ref={sentinelRef} className="mt-8 h-10" aria-hidden="true" />

            {!hasMore && (
              <p className="pb-8 text-center text-sm text-text-muted">
                You’ve reached the end.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
