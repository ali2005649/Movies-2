import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCursor } from "../context/CursorContext";

const ringSpring = { stiffness: 900, damping: 44, mass: 0.12 };
const dotSpring = { stiffness: 1400, damping: 50, mass: 0.08 };
const snap = { duration: 0.1, ease: "easeOut" };

function canUseMagneticCursor() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(hover: hover)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function readCursorTarget(node) {
  if (!node || node.nodeType !== 1) {
    return { mode: "default", label: "" };
  }

  if (node.closest("[data-cursor-ignore]")) {
    return { mode: "default", label: "" };
  }

  if (node.closest("input, textarea, select, [contenteditable='true']")) {
    return { mode: "native", label: "" };
  }

  if (node.closest("iframe, [data-cursor-native]")) {
    return { mode: "native", label: "" };
  }

  const labeled = node.closest("[data-cursor]");
  if (labeled) {
    const mode = labeled.getAttribute("data-cursor") || "magnetic";
    const label =
      labeled.getAttribute("data-cursor-label") ||
      (mode === "play" ? "Play" : mode === "explore" ? "Explore" : "");
    return { mode, label };
  }

  if (node.closest("a, button, [role='button']")) {
    return { mode: "magnetic", label: "" };
  }

  return { mode: "default", label: "" };
}

export default function MagneticCursor() {
  const { suppressed } = useCursor();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState("default");
  const [label, setLabel] = useState("");
  const modeRef = useRef("default");
  const labelRef = useRef("");
  const visibleRef = useRef(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const x = useSpring(mouseX, ringSpring);
  const y = useSpring(mouseY, ringSpring);
  const dotX = useSpring(mouseX, dotSpring);
  const dotY = useSpring(mouseY, dotSpring);

  useEffect(() => {
    const update = () => setEnabled(canUseMagneticCursor());
    update();

    const fine = window.matchMedia("(pointer: fine)");
    const hover = window.matchMedia("(hover: hover)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    fine.addEventListener("change", update);
    hover.addEventListener("change", update);
    motion.addEventListener("change", update);

    return () => {
      fine.removeEventListener("change", update);
      hover.removeEventListener("change", update);
      motion.removeEventListener("change", update);
    };
  }, []);

  const active = enabled && !suppressed;
  const suppressedRef = useRef(suppressed);
  suppressedRef.current = suppressed;
  const wasSuppressedRef = useRef(false);

  useEffect(() => {
    if (suppressed) {
      wasSuppressedRef.current = true;
      visibleRef.current = false;
      setVisible(false);
      return undefined;
    }

    if (!wasSuppressedRef.current) return undefined;
    wasSuppressedRef.current = false;
    modeRef.current = "default";
    labelRef.current = "";
    setMode("default");
    setLabel("");
    visibleRef.current = true;
    setVisible(true);
    return undefined;
  }, [suppressed]);

  useEffect(() => {
    document.documentElement.classList.toggle("has-magnetic-cursor", active);
    return () => {
      document.documentElement.classList.remove("has-magnetic-cursor");
    };
  }, [active]);

  useEffect(() => {
    if (!enabled) return undefined;

    const onMove = (event) => {
      let nextX = event.clientX;
      let nextY = event.clientY;

      if (suppressedRef.current) {
        mouseX.set(nextX);
        mouseY.set(nextY);
        return;
      }

      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }

      const target = readCursorTarget(event.target);
      if (target.mode !== modeRef.current) {
        modeRef.current = target.mode;
        setMode(target.mode);
      }
      if (target.label !== labelRef.current) {
        labelRef.current = target.label;
        setLabel(target.label);
      }

      const magnet = event.target.closest?.(
        "a, button, [role='button'], [data-magnetic]"
      );
      const ignore = event.target.closest?.("[data-cursor-ignore]");
      const labeled = event.target.closest?.("[data-cursor]");

      if (magnet && !ignore && !labeled) {
        const rect = magnet.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - nextX;
        const dy = cy - nextY;
        const dist = Math.hypot(dx, dy);
        const radius = Math.max(rect.width, rect.height) * 0.5 + 24;
        if (dist < radius && dist > 0) {
          const strength = (1 - dist / radius) * 0.22;
          nextX += dx * strength;
          nextY += dy * strength;
        }
      }

      mouseX.set(nextX);
      mouseY.set(nextY);
    };

    const onLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };
    const onEnter = () => {
      visibleRef.current = true;
      setVisible(true);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    window.addEventListener("blur", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("blur", onLeave);
    };
  }, [enabled, mouseX, mouseY]);

  if (!enabled || typeof document === "undefined") return null;

  const expanded = mode === "explore" || mode === "play";
  const magnetic = mode === "magnetic";
  const hidden = !visible || mode === "native" || suppressed;
  const size = expanded ? 96 : magnetic ? 48 : 32;

  return createPortal(
    <>
      <motion.div
        className="magnetic-cursor pointer-events-none z-[9999]"
        style={{ x, y }}
        animate={{
          opacity: hidden ? 0 : 1,
          scale: hidden ? 0.4 : 1,
        }}
        transition={snap}
        aria-hidden="true"
      >
        <motion.div
          className={`magnetic-cursor__ring${expanded ? " is-expanded" : ""}${
            magnetic ? " is-magnetic" : ""
          }`}
          animate={{ width: size, height: size }}
          transition={snap}
        >
          {expanded ? (
            <span className="magnetic-cursor__label">{label}</span>
          ) : null}
        </motion.div>
      </motion.div>

      <motion.div
        className="magnetic-cursor magnetic-cursor--dot pointer-events-none z-[9999]"
        style={{ x: dotX, y: dotY }}
        animate={{
          opacity: hidden || expanded ? 0 : 1,
          scale: magnetic ? 0.55 : 1,
        }}
        transition={snap}
        aria-hidden="true"
      >
        <span className="magnetic-cursor__dot" />
      </motion.div>
    </>,
    document.body
  );
}
