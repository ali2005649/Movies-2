/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--bg-main) / <alpha-value>)",
        surface: "rgb(var(--bg-surface) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "text-main": "rgb(var(--text-main) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Syne", "Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        editorial: ['"Cormorant Garamond"', "Georgia", "serif"],
      },
      boxShadow: {
        glow: "0 16px 48px -8px rgba(234, 179, 8, 0.32)",
        "glow-sm": "0 8px 28px -6px rgba(234, 179, 8, 0.28)",
      },
    },
  },
  plugins: [],
};
