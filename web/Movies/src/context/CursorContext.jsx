import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const CursorContext = createContext(null);

export function CursorProvider({ children }) {
  const locks = useRef(0);
  const [suppressed, setSuppressed] = useState(false);

  const suppress = useCallback(() => {
    locks.current += 1;
    setSuppressed(true);
  }, []);

  const restore = useCallback(() => {
    locks.current = Math.max(0, locks.current - 1);
    if (locks.current === 0) setSuppressed(false);
  }, []);

  const reset = useCallback(() => {
    locks.current = 0;
    setSuppressed(false);
  }, []);

  const value = useMemo(
    () => ({
      suppressed,
      suppress,
      restore,
      reset,
      setSuppressed,
    }),
    [suppressed, suppress, restore, reset]
  );

  return (
    <CursorContext.Provider value={value}>{children}</CursorContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useCursor() {
  const ctx = useContext(CursorContext);
  if (!ctx) {
    throw new Error("useCursor must be used within CursorProvider");
  }
  return ctx;
}
