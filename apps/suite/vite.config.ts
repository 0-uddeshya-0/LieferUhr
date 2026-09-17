import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Demo builds ship inside the LieferUhr Pages site under /LieferUhr/suite/.
const isDemoBuild = process.env.VITE_DEMO_MODE === 'true';

export default defineConfig(({ command }) => ({
  base: isDemoBuild ? '/LieferUhr/suite/' : command === 'serve' ? '/' : '/suite/',
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
}));
