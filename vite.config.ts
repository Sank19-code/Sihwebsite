import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  // Honour a PORT assigned by the environment; falls back to Vite's default.
  server: process.env.PORT ? { port: Number(process.env.PORT), strictPort: true } : undefined,
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Keep the heavy WebGL stack in its own chunk so the shell paints fast.
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          motion: ['gsap', 'lenis'],
        },
      },
    },
  },
});
