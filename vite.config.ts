import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['es2021', 'chrome105', 'safari15'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore internal circular dependencies inside third-party packages (e.g., pdf-lib)
        if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('node_modules')) {
          return;
        }
        // Enforce zero build/CSS warnings in CI quality gate
        if (process.env.CI) {
          throw new Error(`[CI Quality Gate Build Warning]: ${warning.message}`);
        }
        warn(warning);
      }
    }
  },
});
