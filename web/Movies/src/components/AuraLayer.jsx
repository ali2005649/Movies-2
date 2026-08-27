import { AnimatePresence, motion } from "framer-motion";
import { useCanvas } from "../context/CanvasContext";

export default function AuraLayer() {
  const { aura } = useCanvas();
  const lit = Boolean(aura.poster);

  return (
    <div
      className={`canvas-aura${lit ? " is-lit" : ""}`}
      aria-hidden="true"
      style={{
        "--aura-a": aura.primary,
        "--aura-b": aura.secondary,
        "--aura-c": aura.tertiary,
        "--aura-x": `${aura.origin.x}%`,
        "--aura-y": `${aura.origin.y}%`,
        "--aura-intensity": aura.intensity,
      }}
    >
      <div className="canvas-aura__posters">
        <AnimatePresence>
          {aura.poster ? (
            <motion.div
              key={aura.poster}
              className="canvas-aura__poster"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 0.72, scale: 1.12 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              style={{ backgroundImage: `url("${aura.poster}")` }}
            />
          ) : null}
        </AnimatePresence>
      </div>
      <div className="canvas-aura__bloom canvas-aura__bloom--a" />
      <div className="canvas-aura__bloom canvas-aura__bloom--b" />
      <div className="canvas-aura__bloom canvas-aura__bloom--c" />
    </div>
  );
}
