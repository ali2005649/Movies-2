import { useCallback, useRef } from "react";
import { useCanvas } from "../context/CanvasContext";
import {
  fallbackPalette,
  getCachedPalette,
  originFromNode,
  samplePosterSrc,
} from "../lib/extractPosterPalette";

export function usePosterAura() {
  const { setAura, clearAura } = useCanvas();
  const imgRef = useRef(null);

  const activate = useCallback(
    (id, posterSrc, node) => {
      const origin = originFromNode(node || imgRef.current);
      const cached = getCachedPalette(posterSrc);
      const palette = cached || fallbackPalette();

      setAura({
        ...palette,
        poster: posterSrc || null,
        origin,
        intensity: cached ? 0.94 : 0.72,
        sourceId: id,
      });

      if (!posterSrc || cached) return;

      samplePosterSrc(posterSrc).then((sampled) => {
        setAura({
          ...sampled,
          poster: posterSrc,
          origin,
          intensity: 0.94,
          sourceId: id,
          refine: true,
        });
      });
    },
    [setAura]
  );

  const warm = useCallback((src) => {
    if (src) samplePosterSrc(src);
  }, []);

  return { imgRef, activate, deactivate: clearAura, warm };
}
