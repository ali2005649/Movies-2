import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaHeartBroken } from "react-icons/fa";
import MovieCard from "../components/MovieCard";
import { MovieGridSkeleton } from "../components/Skeleton";
import { useAuth } from "../context/AuthContext";
import { useMovieOverlay } from "../context/MovieOverlayContext";
import { prefetchMoviePosters } from "../lib/imageCache";
import { supabase } from "../lib/supabase";

const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export default function Favorites() {
  const overlay = useMovieOverlay();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Could not load favorites");
        setFavorites([]);
      } else {
        setFavorites(data || []);
        prefetchMoviePosters(
          (data || []).map((fav) => ({
            poster_path: fav.movie_poster,
          }))
        );
      }
      setLoading(false);
    };

    fetchFavorites();
  }, [user]);

  if (loading) {
    return (
      <div className="canvas-page px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
            Library
          </p>
          <h1 className="mb-8 font-display text-3xl font-extrabold tracking-tight text-text-main md:text-4xl">
            My Favorites
          </h1>
          <MovieGridSkeleton count={5} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`canvas-page px-4 py-8 md:px-8 md:py-10 ${overlay ? "pointer-events-none" : ""}`}
      aria-hidden={overlay}
      inert={overlay || undefined}
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-3"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
            Library
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-main md:text-4xl">
            My Favorites
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-primary to-transparent" />
        </motion.div>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass mx-auto mt-16 flex max-w-lg flex-col items-center justify-center gap-4 rounded-2xl px-6 py-12 text-text-muted"
          >
            <FaHeartBroken className="text-6xl text-text-muted/40" />
            <p className="text-2xl text-text-main">Your favorites list is empty.</p>
            <Link to="/" className="mt-2 font-semibold text-primary hover:text-primary/80">
              Go back to add some movies!
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-5 overflow-visible md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5"
          >
            {favorites.map((fav, index) => (
              <MovieCard
                key={fav.id}
                movie={{
                  id: fav.movie_id,
                  title: fav.movie_title,
                  poster_path: fav.movie_poster,
                  vote_average: fav.vote_average,
                }}
                priority={index < 4}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
