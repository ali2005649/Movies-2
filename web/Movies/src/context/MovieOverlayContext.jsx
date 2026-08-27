import { createContext, useContext } from "react";

const MovieOverlayContext = createContext(false);

export function MovieOverlayProvider({ value, children }) {
  return (
    <MovieOverlayContext.Provider value={value}>
      {children}
    </MovieOverlayContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useMovieOverlay() {
  return useContext(MovieOverlayContext);
}
