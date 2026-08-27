import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaStar } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Skeleton } from "./Skeleton";

function StarPicker({ value, onChange, size = "text-2xl" }) {
  return (
    <div className={`flex gap-1 ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={star <= value ? "text-primary" : "text-text-muted/40"}
          aria-label={`Rate ${star} stars`}
        >
          <FaStar />
        </button>
      ))}
    </div>
  );
}

/** Table missing, not in schema cache, or blocked by incomplete setup. */
function isReviewsUnavailableError(error) {
  if (!error) return false;
  const code = String(error.code || "");
  const message = String(error.message || "").toLowerCase();
  const details = String(error.details || "").toLowerCase();
  const hint = String(error.hint || "").toLowerCase();
  const blob = `${message} ${details} ${hint}`;

  return (
    code === "42P01" || // undefined_table
    code === "PGRST205" || // table not in schema cache
    code === "PGRST204" || // column not found in schema cache
    blob.includes("could not find the table") ||
    blob.includes("does not exist") ||
    blob.includes("schema cache") ||
    blob.includes("relation") && blob.includes("reviews")
  );
}

async function fetchReviews(movieId) {
  return supabase
    .from("reviews")
    .select("id, user_id, movie_id, rating, comment, user_email, created_at")
    .eq("movie_id", String(movieId))
    .order("created_at", { ascending: false });
}

export default function ReviewSection({ movieId }) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingId, setExistingId] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchReviews(movieId).then(({ data, error }) => {
      if (cancelled) return;

      if (error) {
        if (isReviewsUnavailableError(error)) {
          // Missing table / schema — fail quietly so details still load.
          console.warn("[reviews] unavailable:", error.message || error);
          setUnavailable(true);
          setReviews([]);
        } else {
          console.error("[reviews] fetch failed:", error);
          toast.error("Could not load reviews");
          setUnavailable(false);
          setReviews([]);
        }
        setLoading(false);
        return;
      }

      setUnavailable(false);
      setReviews(data || []);
      if (user) {
        const mine = (data || []).find((r) => r.user_id === user.id);
        if (mine) {
          setExistingId(mine.id);
          setRating(mine.rating);
          setComment(mine.comment || "");
        } else {
          setExistingId(null);
          setRating(5);
          setComment("");
        }
      } else {
        setExistingId(null);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [movieId, user, reloadToken]);

  const average = useMemo(() => {
    if (!reviews.length) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to leave a review");
      return;
    }
    if (unavailable) {
      toast.error(
        "Reviews aren’t set up yet. Run supabase/schema.sql in the Supabase SQL Editor."
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        user_id: user.id,
        movie_id: String(movieId),
        rating,
        comment: comment.trim() || null,
        user_email: user.email,
      };

      const { error } = await supabase.from("reviews").upsert(payload, {
        onConflict: "user_id,movie_id",
      });

      if (error) {
        if (isReviewsUnavailableError(error)) {
          setUnavailable(true);
          throw new Error(
            "Reviews table is missing. Run supabase/schema.sql in Supabase."
          );
        }
        throw error;
      }
      toast.success(existingId ? "Review updated" : "Review posted");
      setLoading(true);
      setReloadToken((n) => n + 1);
    } catch (err) {
      toast.error(err.message || "Failed to save review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingId) return;
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", existingId);
      if (error) throw error;
      toast.success("Review deleted");
      setExistingId(null);
      setComment("");
      setRating(5);
      setLoading(true);
      setReloadToken((n) => n + 1);
    } catch (err) {
      toast.error(err.message || "Failed to delete review");
    }
  };

  return (
    <section className="mt-12 max-w-3xl">
      <div className="flex items-end justify-between gap-4 mb-6">
        <h3 className="text-2xl font-bold text-primary">Reviews</h3>
        {!unavailable && average && (
          <p className="text-text-muted text-sm">
            Avg <span className="text-primary font-bold">{average}</span> / 5 ·{" "}
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {unavailable ? (
        <div className="bg-surface border border-primary/25 rounded-2xl p-5 text-sm text-text-muted space-y-2">
          <p className="text-text-main font-semibold">Reviews aren’t connected yet</p>
          <p>
            Create the <code className="text-primary">reviews</code> table by running{" "}
            <code className="text-primary">supabase/schema.sql</code> in your Supabase
            SQL Editor, then refresh this page.
          </p>
        </div>
      ) : (
        <>
          {isAuthenticated ? (
            <form
              onSubmit={handleSubmit}
              className="bg-surface border border-text-muted/15 rounded-2xl p-5 mb-8 space-y-4"
            >
              <p className="text-sm text-text-muted">
                {existingId ? "Update your review" : "Leave a review"}
              </p>
              <StarPicker value={rating} onChange={setRating} />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share your thoughts (optional)"
                className="w-full bg-background text-text-main px-4 py-3 rounded-xl border border-text-muted/20 focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              />
              <div className="flex flex-wrap gap-3">
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                  className="bg-primary text-slate-900 font-bold px-5 py-2.5 rounded-xl disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : existingId
                      ? "Update review"
                      : "Post review"}
                </motion.button>
                {existingId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-red-500 font-semibold px-3 py-2"
                  >
                    Delete
                  </button>
                )}
              </div>
            </form>
          ) : (
            <p className="text-text-muted mb-8">
              <Link
                to="/login"
                className="text-primary hover:underline font-semibold"
              >
                Login
              </Link>{" "}
              to leave a rating and comment.
            </p>
          )}

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-text-muted">No reviews yet. Be the first!</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="bg-surface border border-text-muted/10 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-semibold text-text-main truncate">
                      {review.user_email || "Anonymous"}
                    </p>
                    <div className="flex items-center gap-1 text-primary text-sm">
                      <FaStar />
                      <span>{review.rating}/5</span>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-text-muted text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                  <p className="text-text-muted/60 text-xs mt-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
