import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

export const IDLE_AURA = {
  primary: "rgba(140, 28, 36, 0.28)",
  secondary: "rgba(48, 22, 92, 0.18)",
  tertiary: "rgba(18, 8, 28, 0.12)",
  origin: { x: 42, y: 28 },
  intensity: 0.55,
  poster: null,
  sourceId: null,
};

const CanvasContext = createContext(null);

export function CanvasProvider({ children }) {
  const [aura, setAuraState] = useState(IDLE_AURA);
  const leaveTimerRef = useRef(null);

  const setAura = useCallback((next) => {
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }

    setAuraState((prev) => {
      if (next?.refine && next.sourceId !== prev.sourceId) return prev;

      const rest = { ...(next || {}) };
      delete rest.refine;
      return {
        ...IDLE_AURA,
        ...prev,
        ...rest,
        origin: { ...IDLE_AURA.origin, ...prev.origin, ...rest.origin },
      };
    });
  }, []);

  const clearAura = useCallback(() => {
    if (leaveTimerRef.current) window.clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = window.setTimeout(() => {
      setAuraState(IDLE_AURA);
      leaveTimerRef.current = null;
    }, 40);
  }, []);

  const value = useMemo(
    () => ({ aura, setAura, clearAura, idleAura: IDLE_AURA }),
    [aura, setAura, clearAura]
  );

  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useCanvas() {
  const ctx = useContext(CanvasContext);
  if (!ctx) {
    throw new Error("useCanvas must be used within CanvasProvider");
  }
  return ctx;
}
