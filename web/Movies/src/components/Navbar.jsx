import { useEffect, useId, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FaSearch, FaStar, FaUser } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";
import { posterUrl, searchMovies, POSTER_SIZES } from "../lib/tmdb";
import { isPosterLoaded, markPosterLoaded } from "../lib/imageCache";
import { movieLocationState } from "../lib/movieNav";
import ThemeToggle from "./ThemeToggle";

function SuggestPoster({ src, title }) {
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(() => isPosterLoaded(src));

  useEffect(() => {
    setFailed(false);
    setReady(isPosterLoaded(src));
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className="flex h-12 w-9 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-gradient-to-br from-zinc-800 to-black px-0.5 text-center"
        aria-hidden="true"
      >
        <span className="line-clamp-3 text-center font-editorial text-[8px] italic leading-tight text-text-main/80">
          {title || "—"}
        </span>
      </div>
    );
  }

  return (
    <span className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-zinc-900">
      {!ready ? (
        <span className="skeleton-shimmer absolute inset-0" aria-hidden="true" />
      ) : null}
      <img
        src={src}
        alt=""
        width={36}
        height={48}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        onLoad={() => {
          markPosterLoaded(src);
          setReady(true);
        }}
        className={`relative z-[1] h-12 w-9 object-cover transition-opacity duration-200 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
}

function formatEmailLabel(email = "") {
  const [local] = email.split("@");
  if (!local) return email;
  return local.length > 18 ? `${local.slice(0, 16)}…` : local;
}

const navLinkClass = ({ isActive }) =>
  [
    "relative px-2.5 py-1.5 text-sm font-semibold rounded-lg transition-colors duration-200",
    isActive
      ? "text-primary bg-primary/15"
      : "text-text-muted hover:text-text-main hover:bg-white/[0.06]",
  ].join(" ");

export default function Navbar() {
  const { session, logout, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const listboxId = useId();
  const containerRef = useRef(null);
  const isTypingRef = useRef(false);

  const urlQuery = searchParams.get("q") || "";
  const [input, setInput] = useState(urlQuery);
  const debouncedQuery = useDebounce(input, 400);

  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Pull URL → input only when the user isn't actively typing (back/forward, etc.)
  useEffect(() => {
    if (isTypingRef.current) return;
    if (location.pathname !== "/") return;

    const timer = window.setTimeout(() => {
      if (!isTypingRef.current) {
        setInput(urlQuery);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [location.pathname, urlQuery]);

  // Push debounced input → URL (never resets the controlled input value)
  useEffect(() => {
    const nextQuery = debouncedQuery.trim();
    const current = searchParams.get("q") || "";

    if (location.pathname === "/" && nextQuery === current) return;

    // On other pages, only navigate home when the user is actively searching
    if (location.pathname !== "/") {
      if (!isTypingRef.current || !nextQuery) return;
    }

    const next = new URLSearchParams(
      location.pathname === "/" ? searchParams : undefined
    );
    if (nextQuery) next.set("q", nextQuery);
    else next.delete("q");

    const search = next.toString() ? `?${next}` : "";
    navigate(
      { pathname: "/", search },
      { replace: location.pathname === "/" }
    );
  }, [debouncedQuery, location.pathname, navigate, searchParams]);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      setSuggestLoading(false);
      setActiveIndex(-1);
      return undefined;
    }

    const controller = new AbortController();
    setSuggestLoading(true);

    searchMovies(q, 1, { signal: controller.signal })
      .then((data) => {
        setSuggestions((data.results || []).slice(0, 8));
        setActiveIndex(-1);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setSuggestions([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setSuggestLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const goToMovie = (movie) => {
    isTypingRef.current = false;
    setOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    setInput("");
    navigate(`/movie/${movie.id}`, {
      state: movieLocationState(movie, location),
    });
  };

  const submitSearch = () => {
    isTypingRef.current = false;
    const q = input.trim();
    setOpen(false);
    setActiveIndex(-1);
    const next = new URLSearchParams(
      location.pathname === "/" ? searchParams : undefined
    );
    if (q) next.set("q", q);
    else next.delete("q");
    navigate({ pathname: "/", search: next.toString() ? `?${next}` : "" });
  };

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        submitSearch();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        goToMovie(suggestions[activeIndex]);
      } else {
        submitSearch();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Logout failed");
    }
  };

  const showDropdown =
    open && input.trim().length >= 2 && (suggestLoading || suggestions.length > 0);

  const email = session?.user?.email || "";

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sticky top-0 z-50 px-3 pt-3 pb-2 md:px-6 md:pt-4 md:pb-3"
    >
      <nav className="relative mx-auto max-w-7xl">
        <div
          className="glass-nav pointer-events-none absolute inset-0 rounded-2xl"
          aria-hidden="true"
        />
        <div className="relative z-10 flex h-16 items-center gap-3 px-3 sm:px-5 md:gap-4">
          {/* Brand */}
          <Link
            to="/"
            className="font-display shrink-0 text-primary text-xl sm:text-2xl font-extrabold tracking-[0.18em] drop-shadow-[0_0_18px_rgba(234,179,8,0.35)] hover:brightness-110 transition-[filter] duration-200"
          >
            Movies
          </Link>

          {/* Search */}
          <div
            ref={containerRef}
            className="relative z-50 mx-1 min-w-0 max-w-2xl flex-1 sm:mx-2 md:mx-4"
          >
            <label className="relative block">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/80 pointer-events-none text-sm" />
              <input
                type="search"
                placeholder="Search movies..."
                value={input}
                onChange={(e) => {
                  isTypingRef.current = true;
                  setInput(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => {
                  isTypingRef.current = true;
                  setOpen(true);
                }}
                onBlur={() => {
                  // Allow URL sync again shortly after leaving the field
                  window.setTimeout(() => {
                    isTypingRef.current = false;
                  }, 150);
                }}
                onKeyDown={handleKeyDown}
                role="combobox"
                aria-expanded={showDropdown}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={
                  activeIndex >= 0
                    ? `${listboxId}-option-${activeIndex}`
                    : undefined
                }
                className="search-input glass-input peer h-10 w-full rounded-full pl-10 pr-3 text-sm text-text-main placeholder:text-text-muted/70"
                aria-label="Search movies"
                autoComplete="off"
              />
            </label>

            <AnimatePresence>
              {showDropdown && (
                <motion.ul
                  id={listboxId}
                  role="listbox"
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.14 }}
                  className="sleek-scroll absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-[#09090B]/90 text-text-main shadow-2xl shadow-black/50 backdrop-blur-xl"
                >
                  {suggestLoading && suggestions.length === 0 ? (
                    <li className="px-4 py-3.5 text-sm text-text-muted">
                      Searching…
                    </li>
                  ) : (
                    suggestions.map((movie, index) => {
                      const image = posterUrl(movie.poster_path, POSTER_SIZES.suggest);
                      const active = index === activeIndex;
                      return (
                        <li
                          key={movie.id}
                          role="option"
                          aria-selected={active}
                          className={
                            index !== suggestions.length - 1
                              ? "border-b border-white/10"
                              : ""
                          }
                        >
                          <button
                            type="button"
                            id={`${listboxId}-option-${index}`}
                            aria-selected={active}
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseLeave={() =>
                              setActiveIndex((current) =>
                                current === index ? -1 : current
                              )
                            }
                            onClick={() => goToMovie(movie)}
                            className={[
                              "suggest-item w-full flex items-center gap-3 px-3.5 py-2.5 text-left cursor-pointer",
                              "transition-colors duration-150 ease-out",
                              "hover:bg-primary/20 hover:text-text-main",
                              "focus-visible:outline-none focus-visible:bg-primary/20",
                              active ? "is-active bg-primary/25" : "bg-transparent",
                            ].join(" ")}
                          >
                            <SuggestPoster src={image} title={movie.title} />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm text-text-main truncate">
                                {movie.title}
                              </p>
                              <p className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
                                <span>
                                  {movie.release_date?.slice(0, 4) || "—"}
                                </span>
                                <span className="inline-flex items-center gap-1 text-primary">
                                  <FaStar className="text-[10px]" />
                                  {movie.vote_average
                                    ? movie.vote_average.toFixed(1)
                                    : "N/A"}
                                </span>
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })
                  )}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <div className="mx-1.5 h-5 w-px bg-white/15" aria-hidden />
                <NavLink to="/favorites" className={navLinkClass}>
                  Favorites
                </NavLink>
                <NavLink to="/profile" className={navLinkClass}>
                  Profile
                </NavLink>

                <Link
                  to="/profile"
                  title={email}
                  className="ml-1 mr-1 hidden max-w-[11rem] items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-text-muted backdrop-blur-md transition-colors hover:border-white/20 hover:text-text-main lg:inline-flex"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs">
                    <FaUser />
                  </span>
                  <span className="text-xs font-medium truncate">
                    {formatEmailLabel(email)}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-0.5 rounded-full border border-red-500/40 bg-red-500/10 px-3.5 py-1.5 text-sm font-bold text-red-400 backdrop-blur-md transition-colors duration-200 hover:border-red-500 hover:bg-red-500 hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="text-sm font-semibold text-text-muted hover:text-primary px-2.5 py-1.5"
                >
                  Sign up
                </Link>
                <Link
                  to="/login"
                  className="ml-1 inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-bold text-zinc-950 shadow-glow-sm transition-[filter] duration-200 hover:brightness-110"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-primary backdrop-blur-md"
                aria-label="Profile"
                title={email}
              >
                <FaUser className="text-sm" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-sm font-bold text-primary px-2 py-1.5"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile secondary nav */}
        {isAuthenticated && (
          <div className="flex md:hidden items-center justify-between gap-2 px-3 pb-3 -mt-1 sm:px-5">
            <div className="flex items-center gap-1">
              <NavLink to="/favorites" className={navLinkClass}>
                Favorites
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-bold px-3 py-1.5 rounded-full border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </motion.header>
  );
}
