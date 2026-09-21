import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Pump/pump3/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
