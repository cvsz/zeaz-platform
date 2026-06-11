import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#060A19",
          surface: "#0B132B",
          surface2: "#111C3B",
          cyan: "#00F0FF",
          violet: "#B026FF",
          green: "#00ff66",
          amber: "#ffb300",
          red: "#ff3366"
        }
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(to bottom right, #060A19, #0B132B)',
        'glass-gradient': 'linear-gradient(to bottom right, rgba(11, 19, 43, 0.7), rgba(6, 10, 25, 0.9))'
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'IBM Plex Sans', 'sans-serif'],
      }
    }
  },
  plugins: []
};

export default config;
