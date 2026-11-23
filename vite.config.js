import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vercel auto-detects Vite: build command `npm run build`, output directory `dist`.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: false },
  build: {
    chunkSizeWarningLimit: 700,
  },
});
