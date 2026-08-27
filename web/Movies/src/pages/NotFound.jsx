import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="canvas-page flex min-h-[calc(100dvh-5.5rem)] flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass max-w-md space-y-4 rounded-2xl px-8 py-10"
      >
        <p className="font-display text-7xl font-black text-primary drop-shadow-[0_0_24px_rgba(234,179,8,0.4)]">
          404
        </p>
        <h1 className="font-display text-3xl font-bold text-text-main">
          Page not found
        </h1>
        <p className="text-text-muted">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-xl bg-primary px-6 py-3 font-bold text-zinc-950 shadow-glow-sm transition-all hover:brightness-110"
        >
          Back to home
        </Link>
      </motion.div>
    </div>
  );
}
