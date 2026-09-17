import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Demo builds ship inside the Lieferuhr Pages site under /lieferradar/fleet/.
const isDemoBuild = process.env.VITE_DEMO_MODE === 'true';

export default defineConfig({
  base: isDemoBuild ? '/lieferradar/fleet/' : '/',
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
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
