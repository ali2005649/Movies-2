import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { PosterPlaceholder } from "./SharedPoster";

export default function PosterModal({ src, title, open, onClose }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (open) setFailed(false);
  }, [open, src]);

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

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && src && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} poster`}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[110] flex h-11 w-11 items-center justify-center rounded-full bg-surface/90 text-text-main border border-text-muted/30 hover:bg-primary hover:text-slate-900 hover:border-primary transition-colors shadow-lg"
            aria-label="Close enlarged poster"
          >
            <FaTimes className="text-lg" />
          </button>

          {failed ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-[min(100%,18rem)]"
            >
              <PosterPlaceholder title={title} />
            </div>
          ) : (
            <motion.img
              src={src}
              alt={`${title} poster`}
              referrerPolicy="no-referrer"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              onError={() => setFailed(true)}
              className="max-h-[90vh] max-w-[min(100%,28rem)] sm:max-w-[min(100%,36rem)] w-auto rounded-xl shadow-2xl object-contain border border-white/10"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
