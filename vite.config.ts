import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Crucial for Electron: use relative paths instead of absolute paths
  base: './',
  build: {
    outDir: 'dist',
  },
  define: {
    'process.env': {
      API_KEY: process.env.API_KEY || '',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || ''
    }
  }
});