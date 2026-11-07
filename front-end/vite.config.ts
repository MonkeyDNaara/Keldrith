import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Dev only: the browser calls /api on the Vite port, Vite forwards to the back-end.
      // Same origin for the browser → no CORS setup needed in development.
      '/api': {
        target: 'http://localhost:5080',
        changeOrigin: true,
      },
    },
  },
  test: {
    // Pure logic (no DOM) → plain Node is enough and faster than a browser simulation.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
