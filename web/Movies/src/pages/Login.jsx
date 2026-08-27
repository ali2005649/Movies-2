import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaArrowLeft, FaEnvelope, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const fieldClass =
  "glass-input w-full rounded-xl py-3 pl-10 pr-4 text-text-main placeholder:text-text-muted/70";

export default function Login({ defaultMode = "login" }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || "/";

  const [mode, setMode] = useState(defaultMode);
  const isSignup = mode === "signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  if (!authLoading && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setInfo("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setInfo("");

    const trimmedEmail = email.trim();

    if (isSignup) {
      if (password !== confirmPassword) {
        const message = "Passwords do not match.";
        setError(message);
        toast.error(message);
        return;
      }
      if (password.length < 6) {
        const message = "Password must be at least 6 characters.";
        setError(message);
        toast.error(message);
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { email: trimmedEmail },
          },
        });

        if (signUpError) throw signUpError;

        const alreadyRegistered =
          data.user?.identities && data.user.identities.length === 0;
        if (alreadyRegistered) {
          throw new Error("An account with this email already exists. Please sign in.");
        }

        if (data.session?.user) {
          toast.success("Account created. Welcome!");
          navigate(from, { replace: true });
          return;
        }

        const message =
          "Account created. Check your inbox to confirm your email, then sign in.";
        setMode("login");
        setConfirmPassword("");
        setError("");
        setInfo(message);
        toast.success(message);
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (signInError) throw signInError;
      if (!data.session?.user) {
        throw new Error("Could not start a session. Please try again.");
      }

      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err?.message === "Invalid login credentials"
          ? "Invalid email or password."
          : err?.message || (isSignup ? "Sign up failed" : "Login failed");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="canvas-page relative flex min-h-[calc(100dvh-5.5rem)] flex-col items-center justify-center overflow-hidden p-4">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-[38%] h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute left-[28%] top-[58%] h-48 w-48 rounded-full bg-white/[0.04] blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="glass relative w-full max-w-md rounded-2xl p-8 shadow-2xl shadow-black/40"
      >
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-text-muted transition-colors hover:text-primary"
        >
          <FaArrowLeft /> Back to home
        </Link>

        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
          Account
        </p>
        <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-text-main">
          {isSignup ? "Create account" : "Welcome back"}
        </h1>
        <p className="mb-6 text-text-muted">
          {isSignup
            ? "Enter your email and a password to register."
            : "Enter your email and password to continue."}
        </p>

        <div className="mb-6 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`rounded-lg py-2 text-sm font-bold transition-all duration-200 ${
              !isSignup
                ? "bg-primary text-zinc-950 shadow-glow-sm"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`rounded-lg py-2 text-sm font-bold transition-all duration-200 ${
              isSignup
                ? "bg-primary text-zinc-950 shadow-glow-sm"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 backdrop-blur-md"
            >
              {error}
            </p>
          ) : null}

          {info ? (
            <p
              role="status"
              className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary backdrop-blur-md"
            >
              {info}
            </p>
          ) : null}

          <div className="relative">
            <FaEnvelope className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={fieldClass}
            />
          </div>

          <div className="relative">
            <FaLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? "Password (min. 6 characters)" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={`${fieldClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((open) => !open)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-primary"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {isSignup ? (
            <div className="relative">
              <FaLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className={fieldClass}
              />
            </div>
          ) : null}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="mt-1 w-full rounded-xl bg-primary py-3 font-bold text-zinc-950 shadow-glow-sm transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading
              ? isSignup
                ? "Creating account..."
                : "Signing in..."
              : isSignup
                ? "Sign up"
                : "Sign in"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
