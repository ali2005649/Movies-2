import { AnimatePresence, LayoutGroup } from "framer-motion";
import { Route, Routes, useLocation, useMatch } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuraLayer from "./components/AuraLayer";
import FilmGrain from "./components/FilmGrain";
import MagneticCursor from "./components/MagneticCursor";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { CanvasProvider } from "./context/CanvasContext";
import { CursorProvider } from "./context/CursorContext";
import { MovieOverlayProvider } from "./context/MovieOverlayContext";
import { ThemeProvider } from "./context/ThemeContext";
import Favorites from "./pages/Favorites";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MovieDetails from "./pages/MovieDetails";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

function CanvasRoutes() {
  const location = useLocation();
  const movieMatch = useMatch("/movie/:id");
  const background = location.state?.background;
  const overlay = Boolean(background && movieMatch);

  return (
    <MovieOverlayProvider value={overlay}>
      <LayoutGroup id="cinematic-canvas">
        <Routes location={background || location}>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <AnimatePresence initial={false}>
          {overlay ? (
            <MovieDetails
              key={movieMatch.params.id}
              overlayId={movieMatch.params.id}
            />
          ) : null}
        </AnimatePresence>
      </LayoutGroup>
    </MovieOverlayProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CanvasProvider>
          <CursorProvider>
            <div className="canvas-root">
              <AuraLayer />
              <div className="canvas-vignette" aria-hidden="true" />
              <FilmGrain />
              <MagneticCursor />

              <div className="canvas-stage">
                <Navbar />
                <main className="canvas-main">
                  <CanvasRoutes />
                </main>
              </div>

              <Toaster
                position="top-center"
                toastOptions={{
                  className:
                    "!bg-[#09090B]/90 !text-text-main !border !border-white/10 !backdrop-blur-xl !shadow-lg !z-[100]",
                  duration: 3500,
                  success: {
                    iconTheme: {
                      primary: "rgb(var(--color-primary))",
                      secondary: "#000000",
                    },
                  },
                }}
              />
            </div>
          </CursorProvider>
        </CanvasProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
