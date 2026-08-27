import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import SharedPoster from "./SharedPoster";
import { usePosterAura } from "../hooks/usePosterAura";
import { movieLocationState } from "../lib/movieNav";
import { posterUrl, posterSrcSet, CARD_POSTER_SIZES, POSTER_SIZES } from "../lib/tmdb";
import { cardVariants } from "./motionVariants";

export default function MovieCard({ movie, priority = false }) {
  const location = useLocation();
  const image = posterUrl(movie.poster_path, POSTER_SIZES.card);
  const srcSet = posterSrcSet(movie.poster_path);
  const placeholder = posterUrl(movie.poster_path, POSTER_SIZES.lqip);
  const { imgRef, activate, deactivate, warm } = usePosterAura();

  const lightUp = (node) => {
    activate(movie.id, image, node);
  };

  return (
    <motion.div
      variants={cardVariants}
      className="movie-card h-full"
      onPointerEnter={(e) => lightUp(e.currentTarget)}
      onPointerLeave={deactivate}
    >
      <div className="movie-card__frame h-full transform-gpu transition-transform duration-300 ease-out hover:scale-105 motion-reduce:transform-none motion-reduce:hover:scale-100">
        <Link
          to={`/movie/${movie.id}`}
          state={movieLocationState(movie, location)}
          className="group relative z-[1] flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-text-main shadow-lg shadow-black/30 backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-glow"
          onFocus={(e) => lightUp(e.currentTarget)}
          onBlur={deactivate}
        >
          <div data-cursor="explore" className="relative overflow-hidden pointer-events-auto">
            <SharedPoster
              id={movie.id}
              src={image}
              srcSet={srcSet}
              sizes={CARD_POSTER_SIZES}
              placeholderSrc={placeholder}
              alt={movie.title}
              title={movie.title}
              imgRef={imgRef}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "low"}
              width={342}
              height={513}
              className="w-full aspect-[2/3] pointer-events-none"
              onLoad={() => warm(image, movie.id)}
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden="true"
            />
          </div>
          <div className="flex flex-grow flex-col justify-between gap-2 border-t border-white/10 bg-white/[0.03] p-4">
            <h2
              className="line-clamp-1 font-semibold tracking-tight text-text-main"
              title={movie.title}
            >
              {movie.title}
            </h2>
            <div className="flex items-center gap-2 font-bold text-primary">
              <FaStar className="drop-shadow-[0_0_8px_rgba(234,179,8,0.65)]" />
              <span>
                {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
