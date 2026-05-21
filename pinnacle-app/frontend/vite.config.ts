import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base path: GitHub Pages serves at /Automotive-ODI-Demo/.
// Override with VITE_BASE=/ for local previews at root.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/Automotive-ODI-Demo/',
});
