import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        shell: "rgb(var(--shell) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        "muted-surface": "rgb(var(--muted-surface) / <alpha-value>)",
        border: "rgb(var(--border))",
        felt: {
          950: "#07120f",
          900: "#0a1b17",
          800: "#102820",
        },
        gold: {
          400: "#f8d572",
          500: "#eab84f",
        },
      },
      boxShadow: {
        card: "0 18px 60px rgba(0, 0, 0, 0.28)",
        glow: "0 0 36px rgba(34, 211, 238, 0.26)",
      },
    },
  },
  plugins: [],
};

export default config;
