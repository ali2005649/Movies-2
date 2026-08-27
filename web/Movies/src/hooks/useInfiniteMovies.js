import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  discoverMovies,
  filterMoviesClient,
  searchMovies,
} from "../lib/tmdb";

export function useInfiniteMovies({
  query = "",
  genre = "",
  year = "",
  minRating = "",
}) {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const inFlightRef = useRef(false);

  const loadPage = useCallback(
    async (pageNum, { append } = { append: false }) => {
      const id = ++requestId.current;
      inFlightRef.current = true;
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        let results = [];
        let totalPages = 1;

        if (query.trim()) {
          const data = await searchMovies(query.trim(), pageNum);
          results = filterMoviesClient(data.results || [], {
            genre,
            year,
            minRating,
          });
          totalPages = data.total_pages || 1;
        } else {
          const data = await discoverMovies({
            page: pageNum,
            genre,
            year,
            minRating,
          });
          results = data.results || [];
          totalPages = data.total_pages || 1;
        }

        if (id !== requestId.current) return;

        setMovies((prev) => (append ? [...prev, ...results] : results));
        const more = pageNum < Math.min(totalPages, 500);
        setHasMore(more);
        hasMoreRef.current = more;
        setPage(pageNum);
        pageRef.current = pageNum;
        setError(null);
      } catch (err) {
        if (id !== requestId.current) return;
        setError(err.message);
        toast.error(err.message || "Failed to load movies");
      } finally {
        if (id === requestId.current) {
          inFlightRef.current = false;
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [query, genre, year, minRating]
  );

  useEffect(() => {
    pageRef.current = 1;
    hasMoreRef.current = true;
    const timer = window.setTimeout(() => {
      loadPage(1, { append: false });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (inFlightRef.current || !hasMoreRef.current) return;
    loadPage(pageRef.current + 1, { append: true });
  }, [loadPage]);

  return { movies, loading, loadingMore, error, hasMore, loadMore, page };
}
