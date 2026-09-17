import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Demo builds ship inside the Lieferuhr Pages site under /LieferUhr/fleet/.
const isDemoBuild = process.env.VITE_DEMO_MODE === 'true';

export default defineConfig(({ command }) => ({
  // Demo (Pages) nests under /LieferUhr/fleet/; production serves it at /fleet/.
  base: isDemoBuild ? '/LieferUhr/fleet/' : command === 'serve' ? '/' : '/fleet/',
  plugins: [react()],
  resolve: {
    alias: {
      '@lieferradar/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
}));
