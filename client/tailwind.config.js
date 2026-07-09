/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ledger: {
          bg: "#F7F8FA",
          panel: "#FFFFFF",
          ink: "#1C2333",
          slate: "#5B6478",
          line: "#E4E7EC",
        },
        pulse: {
          up: "#1E7F5C",
          down: "#B3402A",
          accent: "#1E7F5C",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
