import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isLight, setIsLight] = useState(() => {
    if (typeof window === "undefined") return false;
    const light = localStorage.getItem("theme") === "light";
    document.documentElement.classList.toggle("light-theme", light);
    return light;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("light-theme", isLight);
    localStorage.setItem("theme", isLight ? "light" : "dark");
  }, [isLight]);

  const value = useMemo(
    () => ({
      isLight,
      toggleTheme: () => setIsLight((prev) => !prev),
      setIsLight,
    }),
    [isLight]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
