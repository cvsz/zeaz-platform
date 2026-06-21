import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function buildProcessEnv(mode) {
  const env = loadEnv(mode, process.cwd(), '');
  return Object.fromEntries(
    Object.entries(env)
      .filter(([key]) => key.startsWith('REACT_APP_'))
      .map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)])
  );
}

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: buildProcessEnv(mode),
}));
