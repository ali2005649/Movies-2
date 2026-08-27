import { forwardRef, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FaStar,
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaPlay,
} from "react-icons/fa";
import OverviewReveal from "../components/OverviewReveal";
import ReviewSection from "../components/ReviewSection";
import SharedPoster from "../components/SharedPoster";
import TrailerModal from "../components/TrailerModal";
import PosterModal from "../components/PosterModal";
import { MovieDetailsSkeleton } from "../components/Skeleton";
import { useAuth } from "../context/AuthContext";
import { usePosterAura } from "../hooks/usePosterAura";
import { supabase } from "../lib/supabase";
import { fetchMovieDetails, getTrailerKey, posterUrl, POSTER_SIZES } from "../lib/tmdb";

const MovieDetails = forwardRef(function MovieDetails({ overlayId } = {}, ref) {
  const params = useParams();
  const id = overlayId ?? params.id;
  const location = useLocation();
  const navigate = useNavigate();
  const isOverlay = Boolean(overlayId || location.state?.background);
  const preview =
    location.state?.preview && String(location.state.preview.id) === String(id)
      ? location.state.preview
      : null;

  const { user, isAuthenticated } = useAuth();
  const { imgRef, activate, deactivate, warm } = usePosterAura();
  const [movie, setMovie] = useState(preview);
  const [loading, setLoading] = useState(!preview);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const snap =
      location.state?.preview && String(location.state.preview.id) === String(id)
        ? location.state.preview
        : null;

    if (snap) {
      setMovie(snap);
      setLoading(false);
    } else {
      setMovie(null);
      setLoading(true);
    }
    setError(null);

    const load = async () => {
      try {
        const data = await fetchMovieDetails(id);
        if (cancelled) return;
        setMovie(data);
      } catch (err) {
        if (cancelled) return;
        if (!snap) {
          setError(err.message);
          toast.error(err.message || "Failed to load movie");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, location.key]);

  useEffect(() => {
    if (!user || !id) return undefined;

    let cancelled = false;
    supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("movie_id", String(id))
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsFavorite(Boolean(data));
      });

    return () => {
      cancelled = true;
    };
  }, [user, id]);

  useEffect(() => {
    if (!movie) return undefined;
    const src = posterUrl(movie.poster_path, POSTER_SIZES.detail);
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth) {
      warm(src, movie.id);
      activate(movie.id, src, img);
    }
    return () => deactivate();
  }, [movie, activate, deactivate, warm]);

  useEffect(() => {
    if (!isOverlay) return undefined;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [isOverlay]);

  const toggleFavorite = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Please login first to add movies to your favorites!");
      return;
    }
    if (!movie) return;

    setFavLoading(true);
    try {
      if (isFavorite) {
        const { error: delError } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("movie_id", String(id));
        if (delError) throw delError;
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        const { error: insertError } = await supabase.from("favorites").insert([
          {
            user_id: user.id,
            movie_id: String(id),
            movie_title: movie.title,
            movie_poster: movie.poster_path,
          },
        ]);
        if (insertError) throw insertError;
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (err) {
      toast.error(err.message || "Could not update favorites");
    } finally {
      setFavLoading(false);
    }
  }, [id, isAuthenticated, isFavorite, movie, user]);

  const handleBack = (e) => {
    if (!isOverlay) return;
    e.preventDefault();
    navigate(-1);
  };

  if (loading && !movie) {
    return (
      <div className="canvas-page">
        <MovieDetailsSkeleton />
      </div>
    );
  }

  if ((error || !movie) && !loading) {
    return (
      <div className="canvas-page flex min-h-[calc(100dvh-4.5rem)] flex-col items-center justify-center gap-4 p-8">
        <p className="text-red-500 text-xl text-center">
          {error || "Movie not found"}
        </p>
        <Link to="/" className="text-primary hover:underline font-semibold">
          Back to home
        </Link>
      </div>
    );
  }

  const trailerKey = getTrailerKey(movie);
  const image = posterUrl(movie.poster_path, POSTER_SIZES.detail);
  const largeImage = posterUrl(movie.poster_path, POSTER_SIZES.large);
  const placeholder = posterUrl(movie.poster_path, POSTER_SIZES.lqip);
  const detailsReady = Boolean(movie.overview || movie.genres);

  const body = (
    <div className="relative z-10 canvas-page pointer-events-auto px-5 py-6 sm:p-6 md:p-8 text-text-main">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="max-w-7xl mx-auto mb-5 md:mb-6"
      >
        <Link
          to="/"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-primary hover:brightness-110 transition-all text-lg"
        >
          <FaArrowLeft /> Back to Movies
        </Link>
      </motion.div>

      <div className="movie-hero max-w-7xl mx-auto">
        <p className="movie-hero-title" aria-hidden="true">
          {movie.title}
        </p>

        <div className="movie-hero-stage">
          <div className="movie-hero-poster">
            <div className="group relative">
              <SharedPoster
                id={movie.id}
                src={image}
                alt={movie.title}
                title={movie.title}
                placeholderSrc={placeholder}
                imgRef={imgRef}
                loading="eager"
                fetchPriority="high"
                width={500}
                height={750}
                className="w-full aspect-[2/3] shadow-2xl"
                onLoad={(e) => {
                  warm(image, movie.id);
                  activate(movie.id, image, e.currentTarget);
                }}
              />
              {image ? (
                <button
                  type="button"
                  data-cursor="play"
                  onClick={() => setPosterOpen(true)}
                  className="absolute inset-0 rounded-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`Enlarge ${movie.title} poster`}
                />
              ) : null}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="movie-hero-copy"
          >
            <div className="movie-hero-kicker">
              <h1 className="movie-hero-heading">{movie.title}</h1>
              <motion.button
                type="button"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.1 }}
                onClick={toggleFavorite}
                disabled={favLoading}
                className={`p-3 rounded-full text-xl transition-colors duration-100 shadow-lg shrink-0 ${
                  user && isFavorite
                    ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                    : "bg-surface text-text-muted hover:bg-background border border-text-muted/20"
                }`}
                title={
                  user && isFavorite
                    ? "Remove from Favorites"
                    : "Add to Favorites"
                }
              >
                {user && isFavorite ? <FaHeart /> : <FaRegHeart />}
              </motion.button>
            </div>

            <div className="movie-hero-meta">
              <span className="flex items-center gap-1 text-primary font-bold">
                <FaStar />{" "}
                {movie.vote_average != null
                  ? movie.vote_average.toFixed(1)
                  : "N/A"}
              </span>
              {movie.release_date ? (
                <>
                  <span className="text-text-muted/40">|</span>
                  <span className="text-text-muted">{movie.release_date}</span>
                </>
              ) : null}
              {movie.runtime ? (
                <>
                  <span className="text-text-muted/40">|</span>
                  <span className="text-text-muted">{movie.runtime} min</span>
                </>
              ) : null}
            </div>

            {detailsReady ? (
              <>
                {movie.genres?.length ? (
                  <div className="movie-hero-genres">
                    {movie.genres.map((g) => (
                      <span
                        key={g.id}
                        className="bg-surface/80 px-3 py-1 rounded-full text-xs font-semibold border border-text-muted/20"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="movie-hero-overview">
                  <h2 className="font-display text-xs tracking-[0.22em] uppercase text-primary mb-2">
                    Overview
                  </h2>
                  <OverviewReveal
                    text={movie.overview || "No overview available."}
                    className="text-text-muted text-base leading-relaxed max-w-2xl"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="h-8 w-2/3 skeleton-shimmer rounded-lg" />
                <div className="h-24 w-full skeleton-shimmer rounded-xl" />
              </div>
            )}

            {trailerKey && (
              <div className="movie-hero-actions">
                <motion.button
                  type="button"
                  data-cursor="play"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                  onClick={() => setTrailerOpen(true)}
                  className="inline-flex items-center gap-3 self-start bg-primary text-slate-900 font-bold px-5 py-2.5 rounded-xl shadow-lg"
                >
                  <FaPlay /> Watch Trailer
                </motion.button>
              </div>
            )}

            <ReviewSection movieId={id} />
          </motion.div>
        </div>
      </div>

      <TrailerModal
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        youtubeKey={trailerKey}
        title={movie.title}
      />

      <PosterModal
        open={posterOpen}
        onClose={() => setPosterOpen(false)}
        src={largeImage}
        title={movie.title}
      />
    </div>
  );

  if (!isOverlay) {
    return body;
  }

  return createPortal(
    <motion.section
      ref={ref}
      className="fixed inset-0 z-50 h-screen w-screen overflow-y-auto bg-black pointer-events-auto"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      aria-modal="true"
      role="dialog"
      aria-label={movie.title}
    >
      <button
        type="button"
        className="fixed inset-0 z-0 h-full w-full bg-black"
        onClick={handleBack}
        aria-label="Close movie details"
        data-cursor-ignore
      />
      <div
        className="relative z-10 mx-auto min-h-full w-full max-w-7xl pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {body}
      </div>
    </motion.section>,
    document.body
  );
});

MovieDetails.displayName = "MovieDetails";

export default MovieDetails;
