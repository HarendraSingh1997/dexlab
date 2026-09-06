import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Single-copy guarantee: the invalid-hook-call crash comes from two
    // React instances (mixed npm/pnpm tree + split pre-bundled chunks).
    dedupe: ['react', 'react-dom'],
  },
})
