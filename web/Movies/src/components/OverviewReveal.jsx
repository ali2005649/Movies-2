import { motion } from "framer-motion";

const reduceMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function OverviewReveal({ text, className = "" }) {
  const words = (text || "No overview available.").trim().split(/\s+/);

  if (reduceMotion) {
    return <p className={className}>{words.join(" ")}</p>;
  }

  return (
    <p className={`overview-reveal ${className}`}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="overview-reveal__word">
          <motion.span
            className="overview-reveal__inner"
            initial={{ y: "115%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              duration: 0.22,
              delay: 0.06 + Math.min(index, 36) * 0.008,
              ease: "easeOut",
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </p>
  );
}
