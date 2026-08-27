import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { useCursor } from "../context/CursorContext";

const YOUTUBE_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";

function youtubeEmbedSrc(videoId) {
  if (!videoId || typeof window === "undefined") return "";

  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    enablejsapi: "1",
    modestbranding: "1",
    playsinline: "1",
    origin: window.location.origin,
    widget_referrer: window.location.origin,
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export default function TrailerModal({ youtubeKey, title, open, onClose }) {
  const { suppress, reset } = useCursor();

  useEffect(() => {
    if (!open) {
      reset();
      return undefined;
    }

    suppress();

    return () => {
      reset();
    };
  }, [open, suppress, reset]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const embedSrc = useMemo(
    () => (open && youtubeKey ? youtubeEmbedSrc(youtubeKey) : ""),
    [open, youtubeKey]
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && youtubeKey && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 cursor-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} trailer`}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-12 right-0 text-white hover:text-primary transition-colors p-2"
              aria-label="Close trailer"
            >
              <FaTimes className="text-2xl" />
            </button>
            <div
              className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black"
              data-cursor-native
            >
              <iframe
                width="100%"
                height="100%"
                src={embedSrc}
                title={`${title} trailer`}
                allow={YOUTUBE_ALLOW}
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="h-full w-full cursor-auto"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
